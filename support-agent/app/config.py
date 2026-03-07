from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ai_provider: str = "anthropic"
    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-haiku-4.5"
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-1.5-pro"
    database_url: str = "postgresql://postgres:password@localhost:5432/support_agent_db"
    chroma_persist_dir: str = "./chroma_db"
    embedding_model: str = "BAAI/bge-small-en"
    max_context_docs: int = 3
    
    class Config:
        env_file = ".env"

settings = Settings()
