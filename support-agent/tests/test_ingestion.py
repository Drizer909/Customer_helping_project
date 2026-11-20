import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.ingest_pipeline import IngestPipeline

@pytest.mark.asyncio
async def test_ingest_file():
    with patch('app.ingest_pipeline.rag_engine') as mock_rag, \
         patch('app.ingest_pipeline.db.get_pool') as mock_db_pool:
        
        mock_rag.generate_embedding.return_value = [0.1, 0.2, 0.3]
        
        mock_db_pool.return_value = MagicMock()
        mock_conn = AsyncMock()
        mock_db_pool.return_value.acquire.return_value.__aenter__.return_value = mock_conn
        
        pipeline = IngestPipeline()
        await pipeline.ingest_file("test.md", "content", "Test Title")
        
        # Verify embedding generation
        mock_rag.generate_embedding.assert_called_once_with("content")
        
        # Verify DB insertion
        assert mock_conn.execute.called
