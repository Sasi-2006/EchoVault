from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_database
from app.routes.auth import router as auth_router
from app.routes.journal import router as journal_router
from app.routes.ai import router as ai_router
from app.routes import agent
from app.routes.search import router as search_router
@asynccontextmanager
async def lifespan(app: FastAPI):

    await init_database()

    print("EchoVault database connected.")

    yield


app = FastAPI(
    title="EchoVault API",
    description="Private journaling API",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(journal_router)
app.include_router(ai_router)
app.include_router(search_router)
app.include_router(agent.router)
@app.get("/")
async def root():
    return {
        "message": "Welcome to EchoVault API"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }