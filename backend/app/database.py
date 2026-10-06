from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.config import settings
from app.models.user import User
from app.models.journal import JournalEntry


client = AsyncIOMotorClient(settings.mongodb_url)


async def init_database():
    database = client[settings.database_name]

    await init_beanie(
        database=database,
        document_models=[
            User,
            JournalEntry,
        ],
    )