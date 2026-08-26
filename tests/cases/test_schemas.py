# Unit tests for Case-Based Pydantic schemas.
import pytest
from backend.cases.schemas import (
    CaseCreate,
    CaseUpdate,
    CaseResponse,
    CaseDocumentCreate,
    CaseDocumentResponse,
    DocumentChunkCreate,
    DocumentChunkResponse,
    ChatThreadCreate,
    ChatThreadResponse,
    ThreadMessageCreate,
    ThreadMessageResponse,
    TimelineEventCreate,
    TimelineEventResponse
)


def test_case_create_schema():
    data = CaseCreate(title="XYZ Corp Suit", description="Corporate dispute", case_type="corporate")
    assert data.title == "XYZ Corp Suit"
    assert data.status == "ACTIVE"


def test_case_response_schema():
    resp = CaseResponse(
        id="case_100",
        title="Test Case",
        description="Desc",
        case_type="litigation",
        status="ACTIVE",
        document_count=5,
        thread_count=2,
        event_count=12,
        created_at="2026-08-27T00:00:00Z",
        updated_at="2026-08-27T00:00:00Z"
    )
    assert resp.document_count == 5
    assert resp.event_count == 12


def test_case_document_schemas():
    req = CaseDocumentCreate(filename="FIR.pdf", file_type="pdf", file_path="/path/FIR.pdf", doc_category="pleading")
    assert req.filename == "FIR.pdf"

    res = CaseDocumentResponse(
        id="doc_100",
        case_id="case_100",
        filename="FIR.pdf",
        file_type="pdf",
        file_path="/path/FIR.pdf",
        doc_category="pleading",
        chunk_count=10,
        ingestion_status="COMPLETED",
        created_at="2026-08-27T00:00:00Z"
    )
    assert res.chunk_count == 10
    assert res.ingestion_status == "COMPLETED"


def test_thread_message_schema():
    msg = ThreadMessageCreate(
        role="assistant",
        agent_name="Case Assistant",
        content="Here are the facts...",
        citations_json=[{"document_id": "doc_100", "page_number": 4, "text_excerpt": "Quote"}]
    )
    assert len(msg.citations_json) == 1
    assert msg.citations_json[0]["page_number"] == 4


def test_timeline_event_schemas():
    evt = TimelineEventCreate(
        event_date_raw="March 2021",
        event_summary="Payment made",
        entities_json=["Party A"],
        confidence=0.9,
        category="payment"
    )
    assert evt.category == "payment"
    assert evt.confidence == 0.9
