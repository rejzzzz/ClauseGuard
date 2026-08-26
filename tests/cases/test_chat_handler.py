# Unit tests for case chat AI response handler and citations.
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.db.base import Base
from backend.db.repository import (
    db_create_case,
    db_add_case_document,
    db_bulk_add_document_chunks,
    db_create_chat_thread,
    db_get_thread_messages
)
from backend.cases.chat_handler import handle_user_message
from backend.ingestion.embedder import BedrockEmbedder


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


def test_handle_user_message_with_citations(db):
    # Setup Case, Document, Chunks, and Thread
    case = db_create_case(db, title="Chat Citation Case")
    doc = db_add_case_document(db, case_id=case.id, filename="MasterAgreement.pdf", file_type="pdf", file_path="/path")
    
    chunks = [
        {
            "chunk_index": 0,
            "text": "Section 4.1 Payment Terms: Client shall pay invoices within 30 days of receipt.",
            "heading_title": "Section 4.1 Payment",
            "page_number": 5,
            "embedding_json": [0.5, 0.5, 0.0]
        }
    ]
    db_bulk_add_document_chunks(db, case_id=case.id, document_id=doc.id, chunks=chunks)
    thread = db_create_chat_thread(db, case_id=case.id, title="Payment Inquiries")

    embedder = BedrockEmbedder()
    user_msg, assistant_msg = handle_user_message(
        db=db,
        case_id=case.id,
        thread_id=thread.id,
        user_content="When are invoices due according to the contract?",
        user_name="Lead Counsel",
        embedder=embedder
    )

    assert user_msg.role == "user"
    assert user_msg.content == "When are invoices due according to the contract?"
    assert assistant_msg.role == "assistant"
    assert len(assistant_msg.content) > 0
    assert len(assistant_msg.citations_json) >= 1
    assert assistant_msg.citations_json[0]["filename"] == "MasterAgreement.pdf"

    # Verify messages in DB
    all_msgs = db_get_thread_messages(db, thread.id)
    assert len(all_msgs) == 2
