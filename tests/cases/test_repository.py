# Integration tests for Case-Based database repository CRUD functions.
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.db.base import Base
from backend.db.repository import (
    db_create_case,
    db_get_case,
    db_list_cases,
    db_update_case,
    db_delete_case,
    db_add_case_document,
    db_get_case_document,
    db_list_case_documents,
    db_update_case_document_status,
    db_delete_case_document,
    db_bulk_add_document_chunks,
    db_get_document_chunks,
    db_get_case_chunks,
    db_delete_document_chunks,
    db_create_chat_thread,
    db_get_chat_thread,
    db_list_chat_threads,
    db_update_chat_thread,
    db_delete_chat_thread,
    db_add_thread_message,
    db_get_thread_messages,
    db_add_timeline_events,
    db_list_timeline_events,
    db_update_timeline_event,
    db_delete_timeline_event
)


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_case_crud(db):
    case = db_create_case(db, title="Dispute A", description="Overview", case_type="litigation")
    assert case.id is not None
    assert case.title == "Dispute A"

    fetched = db_get_case(db, case.id)
    assert fetched is not None
    assert fetched.id == case.id

    updated = db_update_case(db, case.id, title="Dispute A Updated", status="ARCHIVED")
    assert updated.title == "Dispute A Updated"
    assert updated.status == "ARCHIVED"

    cases = db_list_cases(db)
    assert len(cases) == 1

    deleted = db_delete_case(db, case.id)
    assert deleted is True
    assert db_get_case(db, case.id) is None


def test_case_documents_crud(db):
    case = db_create_case(db, title="Case Docs Test")
    doc = db_add_case_document(db, case_id=case.id, filename="Plaint.pdf", file_type="pdf", file_path="/storage/Plaint.pdf", doc_category="pleading")
    assert doc.id is not None
    assert doc.ingestion_status == "PENDING"

    docs = db_list_case_documents(db, case.id)
    assert len(docs) == 1
    assert docs[0].filename == "Plaint.pdf"

    updated_doc = db_update_case_document_status(db, doc.id, status="COMPLETED", chunk_count=15, page_count=5)
    assert updated_doc.ingestion_status == "COMPLETED"
    assert updated_doc.chunk_count == 15

    deleted = db_delete_case_document(db, doc.id)
    assert deleted is True
    assert db_get_case_document(db, doc.id) is None


def test_document_chunks_crud(db):
    case = db_create_case(db, title="Chunk Test Case")
    doc = db_add_case_document(db, case_id=case.id, filename="Contract.pdf", file_type="pdf", file_path="/path")
    
    chunks_data = [
        {"chunk_index": 0, "text": "Chunk 1 text", "heading_title": "H1", "page_number": 1},
        {"chunk_index": 1, "text": "Chunk 2 text", "heading_title": "H2", "page_number": 2}
    ]
    created_chunks = db_bulk_add_document_chunks(db, case_id=case.id, document_id=doc.id, chunks=chunks_data)
    assert len(created_chunks) == 2

    doc_chunks = db_get_document_chunks(db, doc.id)
    assert len(doc_chunks) == 2
    assert doc_chunks[0].chunk_index == 0

    case_chunks = db_get_case_chunks(db, case.id)
    assert len(case_chunks) == 2

    deleted = db_delete_document_chunks(db, doc.id)
    assert deleted is True
    assert len(db_get_document_chunks(db, doc.id)) == 0


def test_chat_threads_and_messages_crud(db):
    case = db_create_case(db, title="Thread Test Case")
    thread = db_create_chat_thread(db, case_id=case.id, title="Main Discussion")
    assert thread.title == "Main Discussion"

    threads = db_list_chat_threads(db, case.id)
    assert len(threads) == 1

    msg1 = db_add_thread_message(db, thread_id=thread.id, case_id=case.id, role="user", content="Hello assistant")
    msg2 = db_add_thread_message(db, thread_id=thread.id, case_id=case.id, role="assistant", content="Hello lawyer", citations=[{"doc": "1"}])

    messages = db_get_thread_messages(db, thread.id)
    assert len(messages) == 2
    assert messages[0].content == "Hello assistant"
    assert messages[1].citations_json == [{"doc": "1"}]

    db_update_chat_thread(db, thread.id, title="Renamed Thread")
    updated_thread = db_get_chat_thread(db, thread.id)
    assert updated_thread.title == "Renamed Thread"

    db_delete_chat_thread(db, thread.id)
    assert db_get_chat_thread(db, thread.id) is None


def test_timeline_events_crud(db):
    case = db_create_case(db, title="Timeline Test Case")
    events_data = [
        {"event_date_raw": "Jan 2020", "event_summary": "Event A", "category": "notice", "confidence": 0.8},
        {"event_date_raw": "Feb 2020", "event_summary": "Event B", "category": "payment", "confidence": 0.9}
    ]
    created_events = db_add_timeline_events(db, case_id=case.id, events=events_data)
    assert len(created_events) == 2

    events = db_list_timeline_events(db, case.id)
    assert len(events) == 2

    payment_events = db_list_timeline_events(db, case.id, category="payment")
    assert len(payment_events) == 1
    assert payment_events[0].event_summary == "Event B"

    updated_evt = db_update_timeline_event(db, created_events[0].id, is_disputed=True)
    assert updated_evt.is_disputed is True

    deleted = db_delete_timeline_event(db, created_events[0].id)
    assert deleted is True
    assert len(db_list_timeline_events(db, case.id)) == 1
