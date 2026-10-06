# 🔐 EchoVault

> A private, AI-powered digital journal designed to help users write, reflect, and rediscover their memories.

EchoVault is a full-stack journaling application that allows users to securely create, manage, search, and reflect on their personal journal entries.

The application combines traditional journaling features with AI-powered reflection, semantic memory search, and an AI companion that can interact with a user's own journal memories.

---

## ✨ Features

### 📝 Personal Journaling
- Create journal entries
- Edit and delete entries
- View individual entries
- Add moods and tags
- Mark entries as favorites
- Browse entries through a calendar
- Multi-user journal isolation

### 🤖 AI-Powered Features
- **Reflect with AI** – generate thoughtful reflections from journal entries
- **Summarize** – generate concise summaries of entries
- **Analyze** – extract useful insights from journal content
- **Ask EchoVault** – ask questions about your previous journal memories
- **AI Companion** – interact with your journal through a conversational AI interface

### 🔎 Semantic Memory Search

EchoVault uses embeddings and vector search to retrieve journal memories based on **meaning**, rather than only matching exact keywords.

For example:

> "What have I written about learning programming?"

can retrieve memories containing related concepts even when the exact wording is different.

### 👤 Multi-User Architecture

Each user's journal data is isolated.

```text
User A
   ↓
Only User A's journal entries

User B
   ↓
Only User B's journal entries
