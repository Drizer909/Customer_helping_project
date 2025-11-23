import pytest
from unittest.mock import MagicMock, patch
from app.rag_engine import RAGEngine

@pytest.fixture
def mock_rag_engine():
    with patch('app.rag_engine.chromadb.PersistentClient'), \
         patch('app.rag_engine.TextEmbedding'), \
         patch('app.rag_engine.genai.GenerativeModel'):
        engine = RAGEngine()
        return engine

def test_build_prompt(mock_rag_engine):
    query = "Test query"
    context_docs = [
        {"title": "Doc 1", "content": "Content 1"},
        {"title": "Doc 2", "content": "Content 2"}
    ]
    prompt = mock_rag_engine.build_prompt(query, context_docs)
    assert "User Query: Test query" in prompt
    assert "Document: Doc 1" in prompt
    assert "Content: Content 1" in prompt
