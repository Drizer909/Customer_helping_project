import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    database_url: str = "postgresql://postgres:password@localhost:5432/support_agent_db"
    chroma_persist_dir: str = "./chroma_db"
    embedding_model: str = "BAAI/bge-small-en"
    gemini_model: str = "gemini-1.5-pro"
    max_context_docs: int = 3
    
    class Config:
        env_file = ".env"

settings = Settings()
