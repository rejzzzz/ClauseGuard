# API routes managing exportable audit reports.
from fastapi import APIRouter

router = APIRouter(prefix="/api/sessions", tags=["reports"])
