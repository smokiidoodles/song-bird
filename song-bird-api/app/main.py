from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import account, health, recommendations, spotify

app = FastAPI(
    title="Song Bird API",
    version="0.3.0",
    description="Backend services for Song Bird music discovery.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health.router)
app.include_router(account.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(spotify.router, prefix="/api/spotify")