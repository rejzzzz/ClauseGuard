# FastAPI app entrypoint defining middleware, logging, DB initialization, and routers.
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config.settings import settings
from backend.db import init_db
from backend.api.routes import sessions, review, reports, chats

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("clauseguard.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    App lifespan context initializing database tables on startup.
    """
    logger.info("Initializing ClauseGuard database schema...")
    try:
        init_db()
        logger.info("Database schema successfully initialized.")
    except Exception as e:
        logger.warning(f"Database initialization deferred or failed: {e}")
    yield

app = FastAPI(
    title="ClauseGuard API",
    description="Autonomous Multi-Agent Contract Auditing & Redlining System REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration using settings
origins = settings.cors_origins_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled API error processing {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred."}
    )

# Routers
app.include_router(sessions.router)
app.include_router(review.router)
app.include_router(reports.router)
app.include_router(chats.router)

@app.get("/health", tags=["system"])
async def health_check():
    """
    Service health check endpoint.
    """
    return {"status": "ok", "service": "ClauseGuard API"}
