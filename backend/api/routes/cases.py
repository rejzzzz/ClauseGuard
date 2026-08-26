# API routes handling Case CRUD operations and metadata tracking.
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.db.base import get_db
from backend.db.models import CaseModel
from backend.cases.schemas import CaseCreate, CaseUpdate, CaseResponse
from backend.db.repository import (
    db_create_case,
    db_get_case,
    db_list_cases,
    db_update_case,
    db_delete_case
)

router = APIRouter(prefix="/api/cases", tags=["cases"])


def _to_case_response(case: CaseModel) -> CaseResponse:
    return CaseResponse(
        id=case.id,
        title=case.title,
        description=case.description,
        case_type=case.case_type,
        status=case.status,
        document_count=len(case.documents) if case.documents is not None else 0,
        thread_count=len(case.chat_threads) if case.chat_threads is not None else 0,
        event_count=len(case.timeline_events) if case.timeline_events is not None else 0,
        created_at=case.created_at.isoformat() if case.created_at else "",
        updated_at=case.updated_at.isoformat() if case.updated_at else "",
    )


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(payload: CaseCreate, db: Session = Depends(get_db)):
    """Creates a new legal case matter."""
    case = db_create_case(
        db=db,
        title=payload.title,
        description=payload.description,
        case_type=payload.case_type,
        status=payload.status
    )
    return _to_case_response(case)


@router.get("", response_model=List[CaseResponse])
def list_cases(status: Optional[str] = None, db: Session = Depends(get_db)):
    """Lists all cases with optional status filter."""
    cases = db_list_cases(db=db, status=status)
    return [_to_case_response(c) for c in cases]


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    """Retrieves case details by ID."""
    case = db_get_case(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )
    return _to_case_response(case)


@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(case_id: str, payload: CaseUpdate, db: Session = Depends(get_db)):
    """Updates case attributes."""
    case = db_update_case(
        db=db,
        case_id=case_id,
        title=payload.title,
        description=payload.description,
        case_type=payload.case_type,
        status=payload.status
    )
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )
    return _to_case_response(case)


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(case_id: str, db: Session = Depends(get_db)):
    """Deletes a case and all associated cascade records."""
    success = db_delete_case(db=db, case_id=case_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )
    return None
