from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.models.user import User
from app.utils.auth import get_current_user
from app.utils.embeddings import generate_embedding
from app.config import settings
from app.database import client


router = APIRouter(
    prefix="/api/search",
    tags=["Search"],
)


class SemanticSearchRequest(BaseModel):
    query: str


@router.post("/semantic")
async def semantic_search(
    data: SemanticSearchRequest,
    current_user: User = Depends(get_current_user),
):
    # Ignore empty queries
    if not data.query.strip():
        return []

    # --------------------------------------------------
    # 1. Generate embedding for the user's search query
    # --------------------------------------------------

    query_embedding = await generate_embedding(data.query)

    # --------------------------------------------------
    # 2. Get MongoDB collection
    # --------------------------------------------------

    database = client[settings.database_name]
    collection = database["journal_entries"]

    # --------------------------------------------------
    # 3. Perform MongoDB Atlas Vector Search
    # --------------------------------------------------

    pipeline = [
        {
            "$vectorSearch": {
                "index": "journal_vector_index",
                "path": "embedding",
                "queryVector": query_embedding,

                # Number of candidates MongoDB considers
                "numCandidates": 100,

                # Number of final results
                "limit": 10,

                # IMPORTANT:
                # Only search the current user's journal entries
                "filter": {
                    "user_id": {
                        "$eq": str(current_user.id)
                    }
                },
            }
        },
        {
            "$project": {
                "_id": 1,
                "title": 1,
                "content": 1,
                "mood": 1,
                "tags": 1,
                "favorite": 1,
                "created_at": 1,

                # Return MongoDB's vector similarity score
                "similarity": {
                    "$meta": "vectorSearchScore"
                },
            }
        },
    ]

    # --------------------------------------------------
    # 4. Execute the vector search
    # --------------------------------------------------

    cursor = collection.aggregate(pipeline)

    results = []

    async for entry in cursor:
        results.append(
            {
                "id": str(entry["_id"]),
                "title": entry.get("title", "Untitled thought"),
                "content": entry.get("content", ""),
                "mood": entry.get("mood", "😊"),
                "tags": entry.get("tags", []),
                "favorite": entry.get("favorite", False),
                "created_at": entry.get("created_at"),
                "similarity": round(
                    entry.get("similarity", 0),
                    4,
                ),
            }
        )

    return results


@router.post("/backfill")
async def backfill_embeddings(
    current_user: User = Depends(get_current_user),
):
    database = client[settings.database_name]
    collection = database["journal_entries"]

    entries = await collection.find(
        {
            "user_id": str(current_user.id),
        }
    ).to_list(length=None)

    updated_count = 0

    for entry in entries:

        # Skip entries that already have embeddings
        if entry.get("embedding"):
            continue

        text_for_embedding = (
            f"{entry.get('title', '')}\n"
            f"{entry.get('content', '')}"
        )

        embedding = await generate_embedding(
            text_for_embedding
        )

        await collection.update_one(
            {
                "_id": entry["_id"],
            },
            {
                "$set": {
                    "embedding": embedding,
                }
            },
        )

        updated_count += 1

    return {
        "message": "Embedding backfill completed.",
        "updated_count": updated_count,
    }