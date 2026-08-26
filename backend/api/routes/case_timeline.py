# API routes handling Case Timeline Event viewing, filtering, and manual extraction.
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.db.base import get_db
from backend.db.models import TimelineEventModel
from backend.cases.schemas import (
    TimelineEventUpdate,
    TimelineEventResponse
)
from backend.db.repository import (
    db_get_case,
    db_list_timeline_events,
    db_update_timeline_event,
    db_add_timeline_events,
    db_get_case_chunks
)

router = APIRouter(prefix="/api/cases/{case_id}/timeline", tags=["case-timeline"])


def _to_event_response(evt: TimelineEventModel) -> TimelineEventResponse:
    return TimelineEventResponse(
        id=evt.id,
        case_id=evt.case_id,
        document_id=evt.document_id,
        event_date=evt.event_date.isoformat() if evt.event_date else None,
        event_date_raw=evt.event_date_raw or "",
        event_summary=evt.event_summary,
        entities_json=evt.entities_json or [],
        page_number=evt.page_number,
        chunk_id=evt.chunk_id,
        confidence=evt.confidence,
        is_disputed=evt.is_disputed,
        category=evt.category,
        created_at=evt.created_at.isoformat() if evt.created_at else "",
    )


@router.get("", response_model=List[TimelineEventResponse])
def get_case_timeline(
    case_id: str,
    category: Optional[str] = None,
    is_disputed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Retrieves chronological incident timeline events for a case."""
    case = db_get_case(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )

    events = db_list_timeline_events(
        db=db,
        case_id=case_id,
        category=category,
        is_disputed=is_disputed
    )
    return [_to_event_response(e) for e in events]


@router.patch("/{event_id}", response_model=TimelineEventResponse)
def update_timeline_event(
    case_id: str,
    event_id: str,
    payload: TimelineEventUpdate,
    db: Session = Depends(get_db)
):
    """Updates a timeline event (e.g. flag as disputed, edit date or summary)."""
    parsed_date = None
    if payload.event_date:
        try:
            parsed_date = datetime.fromisoformat(payload.event_date)
        except Exception:
            parsed_date = None

    evt = db_update_timeline_event(
        db=db,
        event_id=event_id,
        event_date=parsed_date,
        event_date_raw=payload.event_date_raw,
        event_summary=payload.event_summary,
        entities=payload.entities_json,
        is_disputed=payload.is_disputed,
        category=payload.category
    )
    if not evt or evt.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Timeline event '{event_id}' not found in case '{case_id}'."
        )
    return _to_event_response(evt)


@router.post("/extract", response_model=Dict[str, Any])
def trigger_case_timeline_extraction(case_id: str, db: Session = Depends(get_db)):
    """Triggers timeline event extraction across all chunks in a case."""
    case = db_get_case(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )

    chunks = db_get_case_chunks(db=db, case_id=case_id)
    if not chunks:
        return {"extracted_count": 0, "message": "No document chunks found for case."}

    try:
        from backend.timeline.extractor import extract_timeline_events
        chunk_dicts = [
            {
                "chunk_id": c.id,
                "document_id": c.document_id,
                "text": c.text,
                "heading_title": c.heading_title,
                "page_number": c.page_number
            }
            for c in chunks
        ]
        events = extract_timeline_events(chunk_dicts, case_id=case_id)
        saved = db_add_timeline_events(db=db, case_id=case_id, events=events)
        return {"extracted_count": len(saved), "message": f"Successfully extracted {len(saved)} timeline events."}
    except Exception as e:
        return {"extracted_count": 0, "message": f"Extraction completed with warning: {str(e)}"}
