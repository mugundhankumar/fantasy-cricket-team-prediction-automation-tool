from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import logging

from .database.session import get_db
from backend.app.api.main import health_check
from .middleware.error_handler import error_handler
from .config import CORS_ORIGINS, API_V1_PREFIX, PROJECT_NAME, PROJECT_VERSION

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    docs_url=f"{API_V1_PREFIX}/docs",
    redoc_url=f"{API_V1_PREFIX}/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handler middleware
app.middleware("http")(error_handler)

@app.get("/health")
async def health():
    """Health check endpoint"""
    db_healthy = await health_check()
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if db_healthy else "disconnected"
    }

# Import and include routers
from .api.routers import matches, teams, predictions

app.include_router(matches.router, prefix=f"{API_V1_PREFIX}/matches", tags=["matches"])
app.include_router(teams.router, prefix=f"{API_V1_PREFIX}/teams", tags=["teams"])
app.include_router(predictions.router, prefix=f"{API_V1_PREFIX}/predictions", tags=["predictions"])
