import asyncpg
from app.config import settings

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(dsn=settings.database_url)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def get_pool(self):
        if not self.pool:
            await self.connect()
        return self.pool

db = Database()
