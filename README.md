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
```
The authenticated user's identity is obtained from the JWT token, and journal queries are filtered using that user identity.

🏗️ Architecture

                    ┌─────────────────────┐
                    │      React UI       │
                    │       Vite          │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐     ┌────────────┐    ┌─────────────┐
       │ MongoDB   │     │   Ollama   │    │   JWT Auth  │
       │   Atlas   │     │ Llama 3.2  │    │             │
       └───────────┘     └────────────┘    └─────────────┘
             │                 │
             │                 │
             ▼                 ▼
       Vector Search      AI Responses
       & Memories

🧠 AI & RAG Architecture

EchoVault uses a Retrieval-Augmented Generation (RAG) approach for questions about journal memories.
User Question
      │
      ▼
   Router
      │
      ├── General Question
      │       ↓
      │    LLM Answer
      │
      ├── Journal Question
      │       ↓
      │   Query Rewrite
      │       ↓
      │  Vector Search
      │       ↓
      │  User Memories
      │       ↓
      │    LLM Answer
      │
      └── Recent/Time-based Question
              ↓
        MongoDB Query
              ↓
         User Memories
              ↓
           LLM Answer
The system is designed to prevent the AI from inventing personal memories that do not exist in the user's journal.

🛠️ Tech Stack
Frontend
React
Vite
JavaScript
Axios
Lucide React
Backend
Python
FastAPI
Pydantic
Beanie
Motor
JWT Authentication
Database
MongoDB Atlas
MongoDB Atlas Vector Search
AI
Ollama
Llama 3.2
nomic-embed-text
LangChain
LangGraph
Development Tools
VS Code
Git
GitHub
Postman


📁 Project Structure

EchoVault/
│
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── graph.py
│   │   │   └── tools.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── journal.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── journal.py
│   │   │   ├── ai.py
│   │   │   ├── search.py
│   │   │   └── agent.py
│   │   │
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── .gitignore
│
└── README.md

🔐 Authentication

EchoVault uses JWT-based authentication.

Register
   ↓
Login
   ↓
JWT Token
   ↓
Authenticated API Requests
   ↓
Backend identifies current user
   ↓
User-specific journal data
Journal data is associated with the authenticated user's ID.

🚀 Running Locally
Prerequisites

Make sure you have installed:

Python 3.11
Node.js
MongoDB Atlas account
Ollama
Git

1. Clone the Repository
git clone https://github.com/Sasi-2006/EchoVault.git
cd EchoVault
2. Backend Setup

Navigate to the backend:

cd backend

Create a virtual environment:

python -m venv venv

Activate it on Windows PowerShell:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Create a .env file inside backend/:

MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=echovault
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

Start the backend:

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs
3. AI Setup

Install Ollama and make sure it is running.

Pull the required models:

ollama pull llama3.2
ollama pull nomic-embed-text

The application uses:

llama3.2 for AI responses
nomic-embed-text for journal embeddings
4. Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Create:

frontend/.env

Add:

VITE_API_URL=http://127.0.0.1:8000

Start the frontend:

npm run dev

The application will normally be available at:

http://localhost:5173
🔑 Environment Variables
Backend
MONGODB_URL=
DATABASE_NAME=
JWT_SECRET=
JWT_ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
Frontend
VITE_API_URL=

Environment files containing secrets are intentionally excluded from Git.

🧪 Example AI Queries

Once journal entries have been created, users can ask questions such as:

What have I written about Python?
What have I been learning recently?
What were some productive days I had?
What about my projects?
Tell me more about that.

The AI retrieves relevant memories from the authenticated user's journal before generating an answer.

🔒 Privacy & Security

EchoVault is designed around private, user-specific journaling.

Key principles:

JWT-based authentication
User-specific journal queries
Vector search filtered by user_id
No hard-coded user identity
Environment variables for secrets
.env files excluded from Git
AI responses grounded in retrieved journal memories

EchoVault is currently an MVP project and should undergo additional security hardening before handling highly sensitive real-world data at production scale.

🛣️ Roadmap
✅ Completed
 User registration and login
 JWT authentication
 Multi-user journal system
 Create, edit, and delete journal entries
 Favorites
 Mood and tags
 Calendar view
 AI reflection
 AI summarization
 AI analysis
 Semantic journal search
 RAG-based memory questions
 AI companion
 LangGraph-based agent workflow
 MongoDB Atlas Vector Search
 GitHub repository setup
🔄 Future Improvements
 Journal insights and statistics
 Mood trends
 More advanced memory retrieval
 Better conversational context tracking
 Production AI infrastructure
 Automated testing
 Enhanced security
 Production deployment
 Mobile-friendly improvements
 Additional AI-powered journaling features
🎯 What I Learned Building EchoVault

This project helped me work with:

Full-stack application architecture
REST API development with FastAPI
React application development
MongoDB and MongoDB Atlas
JWT authentication
Multi-user data isolation
Vector embeddings
Semantic search
Retrieval-Augmented Generation (RAG)
Ollama and local LLMs
LangChain
LangGraph
AI agent architecture
Git and GitHub
API testing with Postman
👩‍💻 Author

Sasivarna Gummidipudi

B.Tech Computer Science Engineering

GitHub: Sasi-2006

⭐ Support

If you find EchoVault interesting, consider giving the repository a ⭐ on GitHub.

📌 Project Status

Status: 🚧 MVP — Deployment in Progress

EchoVault is currently being prepared for production deployment. Additional security, testing, and production AI infrastructure improvements will be added as the project evolves.


### Then save and push it

Put that file at:

```text
C:\Users\Lenovo\Desktop\EchoVault\README.md

Then run:

git add README.md
git commit -m "Add project README"
git push
```
