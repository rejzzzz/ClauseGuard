# API tests for Case Timeline viewing and updates.
import pytest
from fastapi.testclient import TestClient
from backend.api.main import app
from backend.db.base import SessionLocal
from backend.db.repository import (
    db_add_timeline_events,
    db_add_case_document,
    db_bulk_add_document_chunks
)

client = TestClient(app)


def test_case_timeline_lifecycle():
    # 1. Create a parent case
    case_res = client.post("/api/cases", json={"title": "Timeline API Matter"})
    case_id = case_res.json()["id"]

    # 2. Add sample timeline events via DB
    with SessionLocal() as db:
        events_data = [
            {
                "event_date_raw": "10 Jan 2023",
                "event_summary": "Notice sent to tenant",
                "entities_json": ["Landlord", "Tenant"],
                "category": "notice",
                "confidence": 0.95
            },
            {
                "event_date_raw": "15 Feb 2023",
                "event_summary": "Rent payment deposited",
                "entities_json": ["Tenant"],
                "category": "payment",
                "confidence": 0.88
            }
        ]
        created = db_add_timeline_events(db=db, case_id=case_id, events=events_data)
        event_id_1 = created[0].id

    # 3. Get timeline events
    get_tl_res = client.get(f"/api/cases/{case_id}/timeline")
    assert get_tl_res.status_code == 200
    events = get_tl_res.json()
    assert len(events) == 2

    # 4. Filter by category
    get_filtered_res = client.get(f"/api/cases/{case_id}/timeline?category=payment")
    assert get_filtered_res.status_code == 200
    filtered_events = get_filtered_res.json()
    assert len(filtered_events) == 1
    assert filtered_events[0]["category"] == "payment"

    # 5. Patch event to mark as disputed
    patch_res = client.patch(
        f"/api/cases/{case_id}/timeline/{event_id_1}",
        json={"is_disputed": True, "event_summary": "Notice sent to tenant (Disputed receipt)"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["is_disputed"] is True
    assert "Disputed" in patch_res.json()["event_summary"]

    # 6. Test timeline extraction trigger endpoint
    with SessionLocal() as db:
        doc = db_add_case_document(db=db, case_id=case_id, filename="pleading.pdf", file_type="pdf", file_path="/p")
        chunks = [
            {
                "chunk_index": 0,
                "text": "On 22 July 2023, the tribunal pronounced interim relief.",
                "page_number": 4
            }
        ]
        db_bulk_add_document_chunks(db=db, case_id=case_id, document_id=doc.id, chunks=chunks)

    extract_res = client.post(f"/api/cases/{case_id}/timeline/extract")
    assert extract_res.status_code == 200
    assert extract_res.json()["extracted_count"] >= 1

    # Cleanup case
    client.delete(f"/api/cases/{case_id}")
