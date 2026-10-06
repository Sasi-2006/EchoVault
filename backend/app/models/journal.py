from datetime import datetime, timezone
from typing import List

from beanie import Document
from pydantic import Field


class JournalEntry(Document):
    user_id: str

    title: str = Field(
        default="Untitled thought",
        max_length=200
    )

    content: str

    mood: str = "😊"

    tags: List[str] = []

    favorite: bool = False

    embedding: list[float] = []

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "journal_entries"