import asyncpg
from app.config import settings

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        import asyncio
        for i in range(10):
            try:
                self.pool = await asyncpg.create_pool(dsn=settings.database_url)
                return
            except Exception:
                await asyncio.sleep(1)
        try:
            self.pool = await asyncpg.create_pool(dsn=settings.database_url)
        except Exception as e:
            print(f"Warning: Database connection pending or failed: {e}")

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def get_pool(self):
        if not self.pool:
            await self.connect()
        return self.pool

db = Database()
