from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ollama import AsyncClient

from app.models.user import User
from app.models.journal import JournalEntry
from app.utils.auth import get_current_user
from app.utils.embeddings import generate_embedding
from app.config import settings
from app.database import client


router = APIRouter(
    prefix="/api/ai",
    tags=["AI"],
)


# ============================================================
# AI REFLECTION
# ============================================================

class ReflectionRequest(BaseModel):
    entry_id: str


class ReflectionResponse(BaseModel):
    reflection: str


@router.post(
    "/reflect",
    response_model=ReflectionResponse,
)
async def reflect_on_entry(
    data: ReflectionRequest,
    current_user: User = Depends(get_current_user),
):
    # Find the journal entry
    entry = await JournalEntry.get(data.entry_id)

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found.",
        )

    # Make sure the entry belongs to the logged-in user
    if entry.user_id != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="You cannot access this journal entry.",
        )

    prompt = f"""
You are EchoVault, a thoughtful private journaling companion.

Read the following journal entry and provide a gentle,
supportive reflection.

Do not diagnose the person.
Do not make assumptions about their mental health.
Do not judge them.

Focus on:
1. What the entry seems to express
2. Important themes or thoughts
3. One gentle observation
4. One reflective question

Keep the response concise and personal.

Journal title:
{entry.title}

Journal content:
{entry.content}
"""

    try:
        ollama_client = AsyncClient()

        response = await ollama_client.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        reflection = response["message"]["content"]

        return ReflectionResponse(
            reflection=reflection
        )

    except Exception as error:
        print("Ollama error:", error)

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate AI reflection. "
                "Make sure Ollama is running and "
                "the llama3.2 model is available."
            ),
        )


# ============================================================
# AI SUMMARY
# ============================================================

class SummaryResponse(BaseModel):
    summary: str


@router.post(
    "/summarize",
    response_model=SummaryResponse,
)
async def summarize_entry(
    data: ReflectionRequest,
    current_user: User = Depends(get_current_user),
):
    entry = await JournalEntry.get(data.entry_id)

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

    prompt = f"""
You are EchoVault, a private journaling assistant.

Summarize the following journal entry clearly and gently.

Do not diagnose the person.
Do not make assumptions about their mental health.
Do not judge them.

Create a short summary of the main events,
thoughts, feelings, and important points.

Keep the summary concise, around 3 to 5 sentences.

Journal title:
{entry.title}

Journal content:
{entry.content}
"""

    try:
        ollama_client = AsyncClient()

        response = await ollama_client.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        summary = response["message"]["content"]

        return SummaryResponse(
            summary=summary
        )

    except Exception as error:
        print("Ollama error:", error)

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate AI summary. "
                "Make sure Ollama is running and "
                "the llama3.2 model is available."
            ),
        )


# ============================================================
# AI MOOD & THEME ANALYSIS
# ============================================================

class MoodThemeResponse(BaseModel):
    mood: str
    themes: list[str]
    insight: str


@router.post(
    "/analyze",
    response_model=MoodThemeResponse,
)
async def analyze_entry(
    data: ReflectionRequest,
    current_user: User = Depends(get_current_user),
):
    entry = await JournalEntry.get(data.entry_id)

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

    prompt = f"""
You are EchoVault, a private journaling assistant.

Analyze the following journal entry.

Do not diagnose the person.
Do not make assumptions about their mental health.
Do not judge them.

Identify:

1. The overall emotional tone of the writing.
2. Three to five important themes.
3. One short, gentle insight based only on the journal.

Return the result in exactly this format:

Mood: <short mood description>

Themes:
- <theme 1>
- <theme 2>
- <theme 3>

Insight:
<one short paragraph>

Journal title:
{entry.title}

Journal content:
{entry.content}
"""

    try:
        ollama_client = AsyncClient()

        response = await ollama_client.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        result = response["message"]["content"]

        # Simple parsing of the model response
        mood = ""
        themes = []
        insight = ""

        lines = result.splitlines()

        current_section = ""

        for line in lines:
            stripped = line.strip()

            if stripped.lower().startswith("mood:"):
                mood = stripped[5:].strip()
                current_section = "mood"

            elif stripped.lower() == "themes:":
                current_section = "themes"

            elif stripped.lower() == "insight:":
                current_section = "insight"

            elif (
                stripped.startswith("-")
                and current_section == "themes"
            ):
                theme = stripped[1:].strip()

                if theme:
                    themes.append(theme)

            elif (
                current_section == "insight"
                and stripped
            ):
                if insight:
                    insight += " "

                insight += stripped

        return MoodThemeResponse(
            mood=mood or "Reflective",
            themes=themes[:5],
            insight=insight or result,
        )

    except Exception as error:
        print("Ollama analysis error:", error)

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to analyze the journal entry. "
                "Make sure Ollama is running and "
                "the llama3.2 model is available."
            ),
        )


# ============================================================
# RAG - ASK ECHOVAULT ABOUT JOURNAL MEMORIES
# ============================================================

class RAGRequest(BaseModel):
    question: str


class RAGResponse(BaseModel):
    answer: str
    sources: list[dict]


@router.post(
    "/rag",
    response_model=RAGResponse,
)
async def rag_answer(
    data: RAGRequest,
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------------
    # 1. Validate question
    # --------------------------------------------------------

    question = data.question.strip()

    if not question:
        return RAGResponse(
            answer="Please enter a question.",
            sources=[],
        )

    try:
        # ----------------------------------------------------
        # 2. Convert question into an embedding
        # ----------------------------------------------------

        query_embedding = await generate_embedding(
            question
        )

        # ----------------------------------------------------
        # 3. Connect to MongoDB journal collection
        # ----------------------------------------------------

        database = client[settings.database_name]

        collection = database["journal_entries"]

        # ----------------------------------------------------
        # 4. Perform MongoDB Atlas Vector Search
        # ----------------------------------------------------

        pipeline = [
            {
                "$vectorSearch": {
                    "index": "journal_vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding,

                    # Number of candidates MongoDB
                    # considers before selecting results
                    "numCandidates": 100,

                    # Retrieve top 5 relevant memories
                    "limit": 5,

                    # IMPORTANT:
                    # Search only the current user's entries
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
                    "created_at": 1,

                    # MongoDB vector similarity score
                    "similarity": {
                        "$meta": "vectorSearchScore"
                    },
                }
            },
        ]

        cursor = collection.aggregate(
            pipeline
        )

        retrieved_entries = []

        async for entry in cursor:
            retrieved_entries.append(entry)

        # ----------------------------------------------------
        # 5. Handle no matching memories
        # ----------------------------------------------------

        if not retrieved_entries:
            return RAGResponse(
                answer=(
                    "I couldn't find any relevant memories "
                    "in your journal for that question."
                ),
                sources=[],
            )

        # ----------------------------------------------------
        # 6. Build context for Llama
        # ----------------------------------------------------

        context_parts = []

        sources = []

        for index, entry in enumerate(
            retrieved_entries,
            start=1,
        ):
            title = entry.get(
                "title",
                "Untitled thought",
            )

            content = entry.get(
                "content",
                "",
            )

            mood = entry.get(
                "mood",
                "",
            )

            tags = entry.get(
                "tags",
                [],
            )

            context_parts.append(
                f"""
Memory {index}

Title:
{title}

Content:
{content}

Mood:
{mood}

Tags:
{", ".join(tags)}
"""
            )

            sources.append(
                {
                    "id": str(entry["_id"]),
                    "title": title,
                    "similarity": round(
                        entry.get(
                            "similarity",
                            0,
                        ),
                        4,
                    ),
                }
            )

        context = "\n".join(context_parts)

        # ----------------------------------------------------
        # 7. Generate grounded answer using Llama 3.2
        # ----------------------------------------------------

        prompt = f"""
You are EchoVault, a private journaling assistant.

Answer the user's question using ONLY the journal memories
provided below.

Do not invent memories, facts, events, feelings, or experiences.

If the memories do not contain enough information to answer
the question, clearly say that the journal does not contain
enough information.

Do not diagnose the user.

Do not make assumptions about the user's mental health.

Be supportive, natural, concise, and grounded in the journal.

USER QUESTION:
{question}

JOURNAL MEMORIES:
{context}

Answer the user's question based only on these memories.
"""

        ollama_client = AsyncClient()

        response = await ollama_client.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        answer = response["message"]["content"].strip()

        # ----------------------------------------------------
        # 8. Return answer and source memories
        # ----------------------------------------------------

        return RAGResponse(
            answer=answer,
            sources=sources,
        )

    except Exception as error:
        print("RAG error:", error)

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate the RAG response. "
                "Make sure MongoDB Atlas Vector Search "
                "and Ollama are available."
            ),
        )