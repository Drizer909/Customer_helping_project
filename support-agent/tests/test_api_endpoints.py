from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


async def test_health_check(client):
    assert (await client.get("/health")).json() == {"status": "ok"}


@pytest.mark.parametrize("name,content,status", [
    ("guide.md", b"hello", 200), ("guide.txt", b"", 422),
    ("guide.md", bytes([255]), 422), ("guide.md", b"x" * (1024**2 + 1), 413),
    ("../guide.md", b"hello", 422),
])
async def test_upload(client, name, content, status):
    with patch("app.main.ingest_pipeline.ingest_file", new_callable=AsyncMock) as ingest:
        response = await client.post("/api/v1/knowledge/ingest", files={"file": (name, content)})
        assert response.status_code == status
        if status == 200:
            ingest.assert_awaited_once_with(name, "hello", name)
        else:
            ingest.assert_not_awaited()


async def test_ticket_filters(client):
    pool = MagicMock()
    conn = AsyncMock()
    pool.acquire.return_value.__aenter__.return_value = conn
    conn.fetch.return_value = []
    with patch("app.main.db.get_pool", new_callable=AsyncMock, return_value=pool):
        response = await client.get("/api/v1/dashboard/recent-tickets", params={
            "search": " refund ", "status": "escalated", "limit": 26, "offset": 25
        })
        assert response.json() == []
        assert conn.fetch.await_args.args[1:] == (26, 25, "escalated", "refund")


async def test_support_escalates_when_provider_unavailable(client):
    from app.rag_engine import FallbackLLMClient, rag_engine

    pool = MagicMock()
    conn = AsyncMock()
    conn.transaction = MagicMock()
    conn.fetchval.side_effect = [7, 12]
    pool.acquire.return_value.__aenter__.return_value = conn
    docs = [{"title": "Refunds", "content": "Contact support."}]
    with patch("app.main.db.get_pool", return_value=pool), \
         patch.object(rag_engine, "search_knowledge_base", return_value=docs), \
         patch.object(rag_engine, "llm_client", FallbackLLMClient()):
        response = await client.post("/api/v1/support", json={
            "email": "customer@example.com", "query": "Can I get a refund?"
        })
    assert response.status_code == 200
    assert response.json()["status"] == "escalated"
    assert response.json()["confidence_score"] == 0
    conn.transaction.assert_called_once()
    assert conn.execute.await_args.args[1] == 12
