# API routes handling Case Documents upload, metadata inspection, and deletion.
import os
import re
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.config.settings import settings
from backend.db.base import get_db
from backend.db.models import CaseDocumentModel
from backend.cases.schemas import CaseDocumentResponse
from backend.db.repository import (
    db_get_case,
    db_add_case_document,
    db_get_case_document,
    db_list_case_documents,
    db_delete_case_document
)

router = APIRouter(prefix="/api/cases/{case_id}/documents", tags=["case-documents"])


def _to_doc_response(doc: CaseDocumentModel) -> CaseDocumentResponse:
    return CaseDocumentResponse(
        id=doc.id,
        case_id=doc.case_id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_path=doc.file_path,
        file_size_bytes=doc.file_size_bytes,
        page_count=doc.page_count,
        doc_category=doc.doc_category,
        chunk_count=doc.chunk_count,
        ingestion_status=doc.ingestion_status,
        created_at=doc.created_at.isoformat() if doc.created_at else "",
    )


@router.post("", response_model=CaseDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_case_document(
    case_id: str,
    file: UploadFile = File(...),
    doc_category: str = Form("uncategorized"),
    db: Session = Depends(get_db)
):
    """Uploads a new document to a case matter and registers it for ingestion."""
    case = db_get_case(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )

    filename = file.filename or "document.pdf"
    ext = Path(filename).suffix.lower()
    if ext not in [".docx", ".pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Only .docx and .pdf files are supported."
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    doc_dir = settings.CASE_STORAGE_DIR / case_id / doc_id
    doc_dir.mkdir(parents=True, exist_ok=True)

    # Sanitize filename
    clean_filename = re.sub(r'[^a-zA-Z0-9_.\-]', '_', filename)
    file_path = doc_dir / clean_filename
    file_path.write_bytes(content)

    doc = db_add_case_document(
        db=db,
        case_id=case_id,
        filename=clean_filename,
        file_type=ext.lstrip("."),
        file_path=str(file_path),
        file_size_bytes=len(content),
        page_count=0,
        doc_category=doc_category,
        doc_id=doc_id
    )

    # Try optional synchronous ingestion if service is available
    try:
        from backend.cases.service import ingest_case_document
        doc = ingest_case_document(db=db, case_id=case_id, doc_id=doc_id, file_path=file_path)
    except ImportError:
        pass
    except Exception as e:
        print(f"[upload_case_document] Ingestion warning: {e}")

    return _to_doc_response(doc)


@router.get("", response_model=List[CaseDocumentResponse])
def list_case_documents(case_id: str, db: Session = Depends(get_db)):
    """Lists all documents uploaded to a specific case."""
    case = db_get_case(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )
    docs = db_list_case_documents(db=db, case_id=case_id)
    return [_to_doc_response(d) for d in docs]


@router.get("/{doc_id}", response_model=CaseDocumentResponse)
def get_case_document(case_id: str, doc_id: str, db: Session = Depends(get_db)):
    """Retrieves document details and status."""
    doc = db_get_case_document(db=db, doc_id=doc_id)
    if not doc or doc.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{doc_id}' not found in case '{case_id}'."
        )
    return _to_doc_response(doc)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case_document(case_id: str, doc_id: str, db: Session = Depends(get_db)):
    """Deletes a document and all associated chunks from a case."""
    doc = db_get_case_document(db=db, doc_id=doc_id)
    if not doc or doc.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{doc_id}' not found in case '{case_id}'."
        )

    # Remove file on disk if exists
    try:
        p = Path(doc.file_path)
        if p.exists():
            p.unlink()
            if p.parent.exists() and not list(p.parent.iterdir()):
                p.parent.rmdir()
    except Exception:
        pass

    db_delete_case_document(db=db, doc_id=doc_id)
    return None
