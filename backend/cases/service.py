# Case domain service handling document ingestion orchestration and metadata lifecycle.
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from backend.db.models import CaseDocumentModel
from backend.db.repository import (
    db_get_case_document,
    db_update_case_document_status,
    db_bulk_add_document_chunks,
    db_add_timeline_events
)
from backend.ingestion.pipeline import ingest_contract
from backend.ingestion.embedder import BedrockEmbedder

logger = logging.getLogger("clauseguard.cases.service")


def ingest_case_document(
    db: Session,
    case_id: str,
    doc_id: str,
    file_path: Path,
    embedder: Optional[BedrockEmbedder] = None,
    extract_timeline: bool = True
) -> CaseDocumentModel:
    """
    Orchestrates ingestion of a case document:
    1. Sets ingestion status to PROCESSING
    2. Parses, chunks, and embeds the document
    3. Bulk persists document chunks into database
    4. Auto-extracts incident timeline events if enabled
    5. Updates status to COMPLETED with chunk and page counts
    """
    file_path = Path(file_path)
    doc = db_get_case_document(db, doc_id)
    if not doc:
        raise ValueError(f"Case document '{doc_id}' not found.")

    # 1. Update status to PROCESSING
    db_update_case_document_status(db, doc_id=doc_id, status="PROCESSING")

    try:
        # 2. Ingest document via pipeline
        if embedder is None:
            embedder = BedrockEmbedder()

        embedded_chunks = ingest_contract(file_path=file_path, embedder=embedder)

        # 3. Format chunks for DB bulk insert
        max_page = 0
        chunk_rows = []
        for i, c in enumerate(embedded_chunks):
            meta = c.get("metadata", {})
            pg = meta.get("page_number") or meta.get("page")
            if pg and isinstance(pg, int) and pg > max_page:
                max_page = pg

            chunk_rows.append({
                "chunk_index": i,
                "text": c.get("text", ""),
                "heading_path": meta.get("heading_path", ""),
                "heading_title": meta.get("heading_title", "") or meta.get("title", ""),
                "page_number": pg,
                "embedding_json": c.get("embedding"),
                "metadata_json": meta
            })

        db_bulk_add_document_chunks(
            db=db,
            case_id=case_id,
            document_id=doc_id,
            chunks=chunk_rows
        )

        # 4. Optional timeline extraction
        if extract_timeline:
            try:
                from backend.timeline.extractor import extract_timeline_events
                extracted_events = extract_timeline_events(
                    chunks=chunk_rows,
                    case_id=case_id,
                    document_id=doc_id
                )
                if extracted_events:
                    db_add_timeline_events(db=db, case_id=case_id, events=extracted_events)
            except Exception as tl_exc:
                logger.warning(f"Timeline extraction failed for doc {doc_id}: {tl_exc}")

        # 5. Update status to COMPLETED
        updated_doc = db_update_case_document_status(
            db=db,
            doc_id=doc_id,
            status="COMPLETED",
            chunk_count=len(chunk_rows),
            page_count=max_page if max_page > 0 else 1
        )
        return updated_doc or doc

    except Exception as e:
        logger.error(f"Ingestion failed for case document {doc_id}: {e}", exc_info=True)
        db_update_case_document_status(db, doc_id=doc_id, status="FAILED")
        raise
