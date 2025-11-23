import os
import uuid
from app.rag_engine import rag_engine
from app.database import db
from app.config import settings

class IngestPipeline:
    async def ingest_file(self, file_path: str, content: str, title: str):
        # 1. Generate Embedding
        embedding = rag_engine.generate_embedding(content)
        embedding_id = str(uuid.uuid4())

        # 2. Store in ChromaDB
        rag_engine.collection.add(
            documents=[content],
            metadatas=[{"title": title, "file_path": file_path}],
            ids=[embedding_id],
            embeddings=[embedding]
        )

        # 3. Store in PostgreSQL
        pool = await db.get_pool()
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO knowledge_base (doc_title, content, embedding_id, file_path)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (doc_title) 
                DO UPDATE SET content = $2, embedding_id = $3, last_updated = CURRENT_TIMESTAMP
            """, title, content, embedding_id, file_path)
            
    async def ingest_directory(self, directory_path: str):
        for filename in os.listdir(directory_path):
            if filename.endswith(".md"):
                file_path = os.path.join(directory_path, filename)
                with open(file_path, "r") as f:
                    content = f.read()
                
                # Use filename as title for simplicity, or parse first header
                title = filename.replace(".md", "").replace("_", " ").title()
                await self.ingest_file(file_path, content, title)
                print(f"Ingested: {title}")

ingest_pipeline = IngestPipeline()
