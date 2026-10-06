from typing import TypedDict, List, Dict

from langchain_ollama import ChatOllama
from langchain_core.messages import (
    HumanMessage,
    SystemMessage,
)

from langgraph.graph import StateGraph, START, END

from app.agent.tools import (
    search_memories,
    get_latest_entries,
    get_recent_entries,
)


# ==========================================
# Agent State
# ==========================================

class AgentState(TypedDict):
    question: str
    user_id: str

    # Previous conversation messages
    conversation: List[Dict[str, str]]

    # Rewritten query used only for journal search
    search_query: str

    memories: list
    answer: str
    selected_tool: str


# ==========================================
# LLM
# ==========================================

answer_llm = ChatOllama(
    model="llama3.2",
    temperature=0,
)


# ==========================================
# Agent Node
# ==========================================

async def agent_node(state: AgentState):
    print("\n===== AGENT NODE =====")

    print("Question:", state["question"])

    print(
        "Conversation messages:",
        len(state.get("conversation", []))
    )

    return {
        "answer": "",
    }


# ==========================================
# Router
# ==========================================

def route_after_agent(state: AgentState):
    question = state["question"].lower().strip()

    conversation = state.get("conversation", [])

    # Combine previous conversation
    conversation_text = " ".join(
        message.get("content", "").lower()
        for message in conversation
    )

    # ==========================================
    # Journal patterns
    # ==========================================

    journal_patterns = [
        "what have i written",
        "what did i write",
        "what have i said",
        "what did i say",
        "my journal",
        "my entry",
        "my entries",
        "in my journal",
        "i wrote about",
        "i mentioned",
        "i wrote",
        "my thoughts",
        "my memories",
    ]

    # ==========================================
    # Recent patterns
    # ==========================================

    recent_patterns = [
        "recent",
        "recently",
        "latest",
        "last few",
        "last entries",
        "these days",
    ]

    # ==========================================
    # Today patterns
    # ==========================================

    today_patterns = [
        "today",
        "this morning",
        "earlier today",
    ]

    # ==========================================
    # Week patterns
    # ==========================================

    week_patterns = [
        "this week",
        "past week",
        "last week",
        "this week's",
    ]

    # ==========================================
    # 1. Explicit current-question routes
    # ==========================================

    if any(pattern in question for pattern in today_patterns):
        return "today"

    if any(pattern in question for pattern in week_patterns):
        return "week"

    if any(pattern in question for pattern in recent_patterns):
        return "recent"

    if any(pattern in question for pattern in journal_patterns):
        return "search"

    # ==========================================
    # 2. Follow-up question detection
    # ==========================================

    follow_up_patterns = [
        "what about",
        "how about",
        "what else",
        "tell me more",
        "more about",
        "what do you mean",
        "can you explain",
        "why",
        "how",
    ]

    is_follow_up = any(
        question.startswith(pattern)
        for pattern in follow_up_patterns
    )

    # ==========================================
    # 3. Context-aware follow-up
    # ==========================================

    if is_follow_up and conversation_text:

        previous_journal_patterns = [
            "journal",
            "written",
            "wrote",
            "entries",
            "memories",
            "my thoughts",
            "you have written",
            "you've written",
        ]

        if any(
            pattern in conversation_text
            for pattern in previous_journal_patterns
        ):
            return "search"

    # ==========================================
    # 4. General question
    # ==========================================

    return "final"


# ==========================================
# Rewrite Search Query
# ==========================================

async def rewrite_search_query(state: AgentState):

    question = state["question"]

    conversation = state.get("conversation", [])

    # ------------------------------------------
    # No previous conversation
    # ------------------------------------------

    if not conversation:

        return {
            **state,
            "search_query": question,
        }

    # ------------------------------------------
    # Take recent conversation
    # ------------------------------------------

    previous_messages = conversation[-4:]

    conversation_text = "\n".join(
        f"{message.get('role', 'user')}: "
        f"{message.get('content', '')}"
        for message in previous_messages
    )

    # ------------------------------------------
    # Query rewriting prompt
    # ------------------------------------------

    prompt = f"""
You are a search-query rewriting assistant
for a private journal application.

Your task is to convert the user's CURRENT question
into a clear, standalone search query for searching
their private journal.

Use the previous conversation only to understand
references such as:

- it
- that
- those
- this
- my projects
- my studies
- what about
- what else

Do not answer the question.

Do not invent information.

Do not include unnecessary conversation.

Return ONLY the standalone search query.

Previous conversation:
{conversation_text}

Current question:
{question}

Standalone search query:
"""

    response = await answer_llm.ainvoke(prompt)

    rewritten_query = response.content.strip()

    # ------------------------------------------
    # Safety fallback
    # ------------------------------------------

    if not rewritten_query:
        rewritten_query = question

    print("\n===== SEARCH QUERY REWRITE =====")
    print("Original:", question)
    print("Rewritten:", rewritten_query)

    return {
        **state,
        "search_query": rewritten_query,
    }


# ==========================================
# Search Tool Node
# ==========================================

async def search_tool_node(state: AgentState):

    print("\n===== SEARCH TOOL NODE =====")

    # Use rewritten query if available
    search_query = state.get(
        "search_query",
        state["question"],
    )

    print("Search query:", search_query)

    memories = await search_memories(
        search_query,
        state["user_id"],
        limit=5,
    )

    print(
        "MEMORIES FOUND:",
        len(memories)
    )

    return {
        **state,
        "memories": memories,
        "selected_tool": "search_journal_tool",
    }


# ==========================================
# Recent Tool Node
# ==========================================

async def recent_tool_node(state: AgentState):

    print("\n===== RECENT TOOL NODE =====")

    user_id = state["user_id"]

    memories = await get_latest_entries(
        user_id,
        limit=10,
    )

    print(
        "LATEST ENTRIES FOUND:",
        len(memories)
    )

    return {
        **state,
        "memories": memories,
        "selected_tool": "recent_journal_tool",
    }


# ==========================================
# Week Tool Node
# ==========================================

async def week_tool_node(state: AgentState):

    print("\n===== WEEK TOOL NODE =====")

    user_id = state["user_id"]

    memories = await get_recent_entries(
        user_id,
        days=7,
        limit=10,
    )

    print(
        "WEEK ENTRIES FOUND:",
        len(memories)
    )

    return {
        **state,
        "memories": memories,
        "selected_tool": "recent_journal_tool",
    }


# ==========================================
# Today Tool Node
# ==========================================

async def today_tool_node(state: AgentState):

    print("\n===== TODAY TOOL NODE =====")

    user_id = state["user_id"]

    memories = await get_recent_entries(
        user_id,
        days=1,
        limit=10,
    )

    print(
        "TODAY ENTRIES FOUND:",
        len(memories)
    )

    return {
        **state,
        "memories": memories,
        "selected_tool": "recent_journal_tool",
    }


# ==========================================
# Final Answer Node
# ==========================================

async def final_answer_node(state: AgentState):

    print("\n===== FINAL ANSWER NODE =====")

    # IMPORTANT:
    # Always use the ORIGINAL user question here.
    question = state["question"]

    memories = state.get("memories", [])

    selected_tool = state.get(
        "selected_tool",
        "",
    )

    conversation = state.get(
        "conversation",
        [],
    )

    print("Question:", question)
    print("Memories:", len(memories))

    # ======================================
    # No journal memories
    # ======================================

    if (
        not memories
        and selected_tool in [
            "search_journal_tool",
            "recent_journal_tool",
        ]
    ):

        answer = (
            "I couldn't find any matching "
            "entries in your journal."
        )

        print(
            "FINAL ANSWER:",
            answer,
        )

        return {
            "answer": answer,
        }

    # ======================================
    # General Question
    # ======================================

    if not memories:

        conversation_text = ""

        for message in conversation:

            role = message.get(
                "role",
                "user",
            )

            content = message.get(
                "content",
                "",
            )

            conversation_text += (
                f"{role}: {content}\n"
            )

        system_prompt = """
You are EchoVault, an AI companion
inside a private journaling application.

Answer the user's question naturally
and helpfully.

Use the previous conversation when
it helps understand follow-up questions.

Do not claim access to journal memories
unless journal memories were explicitly
provided to you.

Do not invent personal information.
"""

        messages = [
            SystemMessage(
                content=system_prompt
            )
        ]

        if conversation_text:

            messages.append(
                HumanMessage(
                    content=(
                        "Previous conversation:\n"
                        + conversation_text
                    )
                )
            )

        messages.append(
            HumanMessage(
                content=question
            )
        )

        response = await answer_llm.ainvoke(
            messages
        )

        answer = response.content

        print(
            "FINAL ANSWER:",
            answer,
        )

        return {
            "answer": answer,
        }

    # ======================================
    # Journal-based Answer
    # ======================================

    memory_text = ""

    for index, memory in enumerate(
        memories,
        start=1,
    ):

        memory_text += f"""
Memory {index}:

Title:
{memory.get("title", "Untitled thought")}

Content:
{memory.get("content", "")}

Mood:
{memory.get("mood", "")}

Tags:
{", ".join(memory.get("tags", []))}

Created:
{memory.get("created_at", "")}

Similarity:
{memory.get("similarity", "")}

-------------------------
"""

    conversation_text = ""

    for message in conversation:

        role = message.get(
            "role",
            "user",
        )

        content = message.get(
            "content",
            "",
        )

        conversation_text += (
            f"{role}: {content}\n"
        )

    system_prompt = """
You are EchoVault, an AI companion
for a private journal.

Answer the user's question using
the provided journal memories.

You may also use the previous
conversation to understand
follow-up questions.

Important rules:

1. Only use information contained
   in the provided journal memories
   when answering personal journal
   questions.

2. Do not invent journal entries.

3. Do not claim that something was
   written if it is not present
   in the provided memories.

4. If the memories do not contain
   enough information, clearly say so.

5. Be conversational and concise.

6. Never reveal another user's
   journal information.
"""

    messages = [
        SystemMessage(
            content=system_prompt
        )
    ]

    if conversation_text:

        messages.append(
            HumanMessage(
                content=(
                    "Previous conversation:\n"
                    + conversation_text
                )
            )
        )

    messages.append(
        HumanMessage(
            content=(
                "Journal memories:\n"
                + memory_text
                + "\n\nCurrent question:\n"
                + question
            )
        )
    )

    response = await answer_llm.ainvoke(
        messages
    )

    answer = response.content

    print(
        "FINAL ANSWER:",
        answer,
    )

    return {
        "answer": answer,
    }


# ==========================================
# Build Graph
# ==========================================

graph = StateGraph(AgentState)


# ==========================================
# Nodes
# ==========================================

graph.add_node(
    "agent",
    agent_node,
)

graph.add_node(
    "rewrite_search",
    rewrite_search_query,
)

graph.add_node(
    "search",
    search_tool_node,
)

graph.add_node(
    "recent",
    recent_tool_node,
)

graph.add_node(
    "week",
    week_tool_node,
)

graph.add_node(
    "today",
    today_tool_node,
)

graph.add_node(
    "final",
    final_answer_node,
)


# ==========================================
# Graph Connections
# ==========================================

graph.add_edge(
    START,
    "agent",
)


graph.add_conditional_edges(
    "agent",
    route_after_agent,
    {
        # IMPORTANT:
        # Journal searches first go through
        # the query rewriting node.
        "search": "rewrite_search",

        "recent": "recent",
        "week": "week",
        "today": "today",
        "final": "final",
    },
)


# Rewritten query → Journal Search

graph.add_edge(
    "rewrite_search",
    "search",
)


# Tool nodes → Final Answer

graph.add_edge(
    "search",
    "final",
)

graph.add_edge(
    "recent",
    "final",
)

graph.add_edge(
    "week",
    "final",
)

graph.add_edge(
    "today",
    "final",
)


# Final → End

graph.add_edge(
    "final",
    END,
)


# ==========================================
# Compile
# ==========================================

agent_graph = graph.compile()