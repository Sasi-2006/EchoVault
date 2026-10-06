from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class JournalCreate(BaseModel):
    title: str = Field(
        default="Untitled thought",
        max_length=200
    )

    content: str

    mood: str = "😊"

    tags: List[str] = []


class JournalUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    mood: str | None = None
    tags: List[str] | None = None
    favorite: bool | None = None


class JournalResponse(BaseModel):
    id: str
    title: str
    content: str
    mood: str
    tags: List[str]
    favorite: bool
    created_at: datetime
    updated_at: datetime