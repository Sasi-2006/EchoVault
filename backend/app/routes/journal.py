from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.models.journal import JournalEntry
from app.models.user import User
from app.schemas.journal import (
    JournalCreate,
    JournalResponse,
    JournalUpdate,
)
from app.utils.auth import get_current_user
from app.utils.embeddings import generate_embedding

router = APIRouter(
    prefix="/api/journal",
    tags=["Journal"],
)


def journal_response(
    entry: JournalEntry,
) -> JournalResponse:

    return JournalResponse(
        id=str(entry.id),
        title=entry.title,
        content=entry.content,
        mood=entry.mood,
        tags=entry.tags,
        favorite=entry.favorite,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


@router.post(
    "",
    response_model=JournalResponse,
)
async def create_entry(
    data: JournalCreate,
    current_user: User = Depends(get_current_user),
):

    text_for_embedding = f"{data.title}\n{data.content}"

    embedding = await generate_embedding(text_for_embedding)

    entry = JournalEntry(
        user_id=str(current_user.id),
        title=data.title,
        content=data.content,
        mood=data.mood,
        tags=data.tags,
        favorite=False,
        embedding=embedding,
    )

    await entry.insert()

    return journal_response(entry)


@router.get(
    "",
    response_model=list[JournalResponse],
)
async def get_entries(
    current_user: User = Depends(get_current_user),
):

    entries = await JournalEntry.find(
        JournalEntry.user_id == str(current_user.id)
    ).sort(
        -JournalEntry.created_at
    ).to_list()

    return [
        journal_response(entry)
        for entry in entries
    ]


@router.get(
    "/{entry_id}",
    response_model=JournalResponse,
)
async def get_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user),
):

    entry = await JournalEntry.get(entry_id)

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found.",
        )

    if entry.user_id != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="You cannot access this journal entry.",
        )

    return journal_response(entry)


@router.put(
    "/{entry_id}",
    response_model=JournalResponse,
)
async def update_entry(
    entry_id: str,
    data: JournalUpdate,
    current_user: User = Depends(get_current_user),
):

    entry = await JournalEntry.get(entry_id)

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found.",
        )

    if entry.user_id != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="You cannot modify this journal entry.",
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(entry, field, value)

    entry.updated_at = datetime.now(timezone.utc)

    await entry.save()

    return journal_response(entry)


@router.delete(
    "/{entry_id}"
)
async def delete_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user),
):

    entry = await JournalEntry.get(entry_id)

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found.",
        )

    if entry.user_id != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="You cannot delete this journal entry.",
        )

    await entry.delete()

    return {
        "message": "Journal entry deleted successfully."
    }