# Unit tests for Case-Based SQLAlchemy ORM models.
from datetime import datetime, timezone
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.db.base import Base
from backend.db.models import (
    CaseModel,
    CaseDocumentModel,
    DocumentChunkModel,
    ChatThreadModel,
    ThreadMessageModel,
    TimelineEventModel,
    SessionModel
)


@pytest.fixture
def db_session():
    """Provides an in-memory SQLite database session for model testing."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_case_model_creation(db_session):
    case = CaseModel(
        id="case_001",
        title="State v. Defendant",
        description="Criminal dispute",
        case_type="litigation",
        status="ACTIVE"
    )
    db_session.add(case)
    db_session.commit()

    saved = db_session.query(CaseModel).filter(CaseModel.id == "case_001").first()
    assert saved is not None
    assert saved.title == "State v. Defendant"
    assert saved.case_type == "litigation"
    assert saved.status == "ACTIVE"


def test_case_document_relationship(db_session):
    case = CaseModel(id="case_002", title="Property Dispute")
    doc = CaseDocumentModel(
        id="doc_001",
        case_id="case_002",
        filename="FIR.pdf",
        file_type="pdf",
        file_path="/storage/FIR.pdf",
        doc_category="evidence"
    )
    db_session.add(case)
    db_session.add(doc)
    db_session.commit()

    saved_case = db_session.query(CaseModel).filter(CaseModel.id == "case_002").first()
    assert len(saved_case.documents) == 1
    assert saved_case.documents[0].filename == "FIR.pdf"


def test_document_chunk_model(db_session):
    case = CaseModel(id="case_003", title="Contract Claim")
    doc = CaseDocumentModel(id="doc_002", case_id="case_003", filename="MSA.docx", file_type="docx", file_path="/storage/MSA.docx")
    chunk = DocumentChunkModel(
        id="chunk_001",
        case_id="case_003",
        document_id="doc_002",
        chunk_index=0,
        text="Section 1. Confidentiality...",
        heading_title="Section 1",
        page_number=1,
        embedding_json=[0.1, 0.2, 0.3]
    )
    db_session.add_all([case, doc, chunk])
    db_session.commit()

    saved_chunk = db_session.query(DocumentChunkModel).filter(DocumentChunkModel.id == "chunk_001").first()
    assert saved_chunk is not None
    assert saved_chunk.heading_title == "Section 1"
    assert saved_chunk.embedding_json == [0.1, 0.2, 0.3]


def test_chat_thread_and_messages(db_session):
    case = CaseModel(id="case_004", title="Arbitration")
    thread = ChatThreadModel(id="thread_001", case_id="case_004", title="Bail Prep")
    msg1 = ThreadMessageModel(
        id="msg_001",
        thread_id="thread_001",
        case_id="case_004",
        role="user",
        content="Summarize bail grounds"
    )
    msg2 = ThreadMessageModel(
        id="msg_002",
        thread_id="thread_001",
        case_id="case_004",
        role="assistant",
        content="Ground 1: Lack of prima facie evidence..."
    )
    db_session.add_all([case, thread, msg1, msg2])
    db_session.commit()

    saved_thread = db_session.query(ChatThreadModel).filter(ChatThreadModel.id == "thread_001").first()
    assert len(saved_thread.messages) == 2
    assert saved_thread.messages[0].role == "user"


def test_timeline_event_model(db_session):
    case = CaseModel(id="case_005", title="Civil Suit")
    evt = TimelineEventModel(
        id="evt_001",
        case_id="case_005",
        event_date_raw="14 June 2022",
        event_summary="Notice issued by plaintiff",
        entities_json=["Plaintiff", "Defendant"],
        confidence=0.95,
        is_disputed=True,
        category="notice"
    )
    db_session.add_all([case, evt])
    db_session.commit()

    saved_evt = db_session.query(TimelineEventModel).filter(TimelineEventModel.id == "evt_001").first()
    assert saved_evt is not None
    assert saved_evt.is_disputed is True
    assert saved_evt.entities_json == ["Plaintiff", "Defendant"]


def test_session_model_with_case_id(db_session):
    case = CaseModel(id="case_006", title="Vendor Audit")
    session = SessionModel(
        session_id="sess_001",
        case_id="case_006",
        contract_name="vendor_msa.docx",
        contract_path="/storage/vendor_msa.docx"
    )
    db_session.add_all([case, session])
    db_session.commit()

    saved_session = db_session.query(SessionModel).filter(SessionModel.session_id == "sess_001").first()
    assert saved_session.case_id == "case_006"
    assert saved_session.case.title == "Vendor Audit"
