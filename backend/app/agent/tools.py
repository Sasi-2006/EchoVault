from datetime import datetime, timezone, timedelta

from langchain_core.tools import tool

from app.config import settings
from app.database import client
from app.utils.embeddings import generate_embedding


# ============================================================
# 1. SEARCH JOURNAL MEMORIES
# ============================================================

async def search_memories(
    question: str,
    user_id: str,
    limit: int = 5,
):
    """
    Search the authenticated user's private journal
    using MongoDB Atlas Vector Search.
    """

    question = question.strip()

    if not question:
        return []

    # --------------------------------------------------------
    # Generate embedding for the question
    # --------------------------------------------------------

    query_embedding = await generate_embedding(question)

    # --------------------------------------------------------
    # Connect to journal collection
    # --------------------------------------------------------

    database = client[settings.database_name]

    collection = database["journal_entries"]

    # --------------------------------------------------------
    # MongoDB Atlas Vector Search
    # --------------------------------------------------------

    pipeline = [
        {
            "$vectorSearch": {
                "index": "journal_vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 100,
                "limit": limit,
                "filter": {
                    "user_id": {
                        "$eq": user_id
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
                "created_at": 1,
                "updated_at": 1,
                "similarity": {
                    "$meta": "vectorSearchScore"
                },
            }
        },
    ]

    # --------------------------------------------------------
    # Execute search
    # --------------------------------------------------------

    cursor = collection.aggregate(pipeline)

    memories = []

    async for entry in cursor:

        memories.append(
            {
                "id": str(entry["_id"]),

                "title": entry.get(
                    "title",
                    "Untitled thought",
                ),

                "content": entry.get(
                    "content",
                    "",
                ),

                "mood": entry.get(
                    "mood",
                    "😊",
                ),

                "tags": entry.get(
                    "tags",
                    [],
                ),

                "created_at": entry.get(
                    "created_at"
                ),

                "updated_at": entry.get(
                    "updated_at"
                ),

                "similarity": round(
                    entry.get(
                        "similarity",
                        0,
                    ),
                    4,
                ),
            }
        )

    return memories


# ============================================================
# 2. GET LATEST JOURNAL ENTRIES
# ============================================================

async def get_latest_entries(
    user_id: str,
    limit: int = 10,
):
    """
    Get the latest journal entries belonging
    to the authenticated user.

    This does NOT restrict entries by date.

    Example:

    If the user asks:

        "What did I write recently?"

    this returns the latest entries even if
    the most recent entry was several weeks ago.
    """

    database = client[settings.database_name]

    collection = database["journal_entries"]

    # --------------------------------------------------------
    # Find latest entries for this user
    # --------------------------------------------------------

    cursor = (
        collection
        .find(
            {
                "user_id": user_id,
            }
        )
        .sort(
            "created_at",
            -1,
        )
        .limit(limit)
    )

    entries = []

    async for entry in cursor:

        entries.append(
            {
                "id": str(entry["_id"]),

                "title": entry.get(
                    "title",
                    "Untitled thought",
                ),

                "content": entry.get(
                    "content",
                    "",
                ),

                "mood": entry.get(
                    "mood",
                    "😊",
                ),

                "tags": entry.get(
                    "tags",
                    [],
                ),

                "created_at": entry.get(
                    "created_at"
                ),

                "updated_at": entry.get(
                    "updated_at"
                ),
            }
        )

    return entries


# ============================================================
# 3. GET RECENT ENTRIES BY DATE RANGE
# ============================================================

async def get_recent_entries(
    user_id: str,
    days: int = 7,
    limit: int = 10,
):
    """
    Get journal entries from the last N days.

    Example:

        days=7

    means entries created during the
    previous 7 days.
    """

    database = client[settings.database_name]

    collection = database["journal_entries"]

    # --------------------------------------------------------
    # Calculate cutoff date
    # --------------------------------------------------------

    cutoff_date = (
        datetime.now(timezone.utc)
        - timedelta(days=days)
    )

    # --------------------------------------------------------
    # Find entries
    # --------------------------------------------------------

    cursor = (
        collection
        .find(
            {
                "user_id": user_id,

                "created_at": {
                    "$gte": cutoff_date,
                },
            }
        )
        .sort(
            "created_at",
            -1,
        )
        .limit(limit)
    )

    entries = []

    async for entry in cursor:

        entries.append(
            {
                "id": str(entry["_id"]),

                "title": entry.get(
                    "title",
                    "Untitled thought",
                ),

                "content": entry.get(
                    "content",
                    "",
                ),

                "mood": entry.get(
                    "mood",
                    "😊",
                ),

                "tags": entry.get(
                    "tags",
                    [],
                ),

                "created_at": entry.get(
                    "created_at"
                ),

                "updated_at": entry.get(
                    "updated_at"
                ),
            }
        )

    return entries


# ============================================================
# 4. JOURNAL SEARCH TOOL
# ============================================================

@tool
def search_journal_tool(question: str):
    """
    Search the user's personal journal.

    This tool definition describes the purpose of
    journal searching for the agent.

    The authenticated user_id is NOT accepted from
    the frontend. The backend injects the authenticated
    user's ID into search_memories().
    """

    return question


# ============================================================
# 5. RECENT JOURNAL TOOL
# ============================================================

@tool
def recent_journal_tool():
    """
    Retrieve the user's recent personal journal entries.

    The actual database operation is performed by
    get_latest_entries() or get_recent_entries()
    using the authenticated user's ID.
    """

    return "recent"