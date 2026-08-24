# FastAPI app entrypoint defining middleware, logging, and general routers.
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.routes import sessions, review, reports

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("clauseguard.api")

app = FastAPI(
    title="ClauseGuard API",
    description="Autonomous Multi-Agent Contract Auditing & Redlining System REST API",
    version="1.0.0"
)

# CORS middleware configuration allowing local frontend development origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

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

@app.get("/health", tags=["system"])
async def health_check():
    """
    Service health check endpoint.
    """
    return {"status": "ok", "service": "ClauseGuard API"}
