from typing import List, Dict, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.agent.graph import agent_graph
from app.routes.auth import get_current_user


router = APIRouter(
    prefix="/api/agent",
    tags=["Agent"],
)


# ==========================================
# Request Schema
# ==========================================

class AgentRequest(BaseModel):

    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )

    conversation: List[
        Dict[str, str]
    ] = []


# ==========================================
# Ask Agent
# ==========================================

@router.post("/ask")
async def ask_agent(
    data: AgentRequest,
    current_user=Depends(get_current_user),
):

    # --------------------------------------
    # Prepare conversation history
    # --------------------------------------

    conversation = []

    for message in data.conversation:

        role = message.get(
            "role",
            ""
        )

        content = message.get(
            "content",
            ""
        ).strip()

        # Only keep valid messages
        if role in [
            "user",
            "assistant",
        ] and content:

            conversation.append(
                {
                    "role": role,
                    "content": content,
                }
            )

    # --------------------------------------
    # Limit conversation size
    # --------------------------------------
    #
    # We don't need the entire chat forever.
    # Keeping the last 10 messages gives the
    # Agent enough context while preventing
    # the prompt from becoming unnecessarily
    # large.
    #

    conversation = conversation[-10:]

    # --------------------------------------
    # Initial Agent State
    # --------------------------------------

    initial_state = {

        "question": data.question,

        # IMPORTANT:
        # User ID comes from JWT.
        # Never accept user_id from frontend.
        "user_id": str(
            current_user.id
        ),

        "conversation": conversation,

        "memories": [],

        "answer": "",

        "selected_tool": "",
    }

    # --------------------------------------
    # Run Agent Graph
    # --------------------------------------

    result = await agent_graph.ainvoke(
        initial_state
    )

    # --------------------------------------
    # Return Response
    # --------------------------------------

    return {

        "question":
            data.question,

        "answer":
            result.get(
                "answer",
                ""
            ),

        "tool_used":
            result.get(
                "selected_tool",
                ""
            ),

        "memories":
            result.get(
                "memories",
                [],
            ),
    }