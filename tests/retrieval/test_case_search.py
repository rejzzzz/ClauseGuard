# Unit tests for case-scoped semantic similarity search.
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.db.base import Base
from backend.db.repository import (
    db_create_case,
    db_add_case_document,
    db_bulk_add_document_chunks
)
from backend.retrieval.case_search import search_case_chunks, _cosine_similarity


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


def test_cosine_similarity():
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    assert _cosine_similarity(v1, v2) == pytest.approx(1.0)

    v3 = [0.0, 1.0, 0.0]
    assert _cosine_similarity(v1, v3) == pytest.approx(0.0)

    assert _cosine_similarity([], [1.0]) == 0.0


def test_search_case_chunks_scoped(db):
    # Setup Case 1
    case1 = db_create_case(db, title="Matter 1")
    doc1 = db_add_case_document(db, case_id=case1.id, filename="MSA1.docx", file_type="docx", file_path="/p1")
    chunks1 = [
        {"chunk_index": 0, "text": "Indemnity obligation text", "heading_title": "Indemnity", "embedding_json": [1.0, 0.0, 0.0]},
        {"chunk_index": 1, "text": "Termination clause text", "heading_title": "Termination", "embedding_json": [0.0, 1.0, 0.0]}
    ]
    db_bulk_add_document_chunks(db, case_id=case1.id, document_id=doc1.id, chunks=chunks1)

    # Setup Case 2 (must be excluded from Case 1 search)
    case2 = db_create_case(db, title="Matter 2")
    doc2 = db_add_case_document(db, case_id=case2.id, filename="MSA2.docx", file_type="docx", file_path="/p2")
    chunks2 = [
        {"chunk_index": 0, "text": "Unrelated matter text", "heading_title": "Other", "embedding_json": [1.0, 0.0, 0.0]}
    ]
    db_bulk_add_document_chunks(db, case_id=case2.id, document_id=doc2.id, chunks=chunks2)

    # Query Case 1 for vector [1.0, 0.0, 0.0]
    results = search_case_chunks(db=db, case_id=case1.id, query_embedding=[1.0, 0.0, 0.0], top_k=5)
    assert len(results) == 2
    assert results[0]["heading_title"] == "Indemnity"
    assert results[0]["similarity"] == pytest.approx(1.0)
    assert all(r["document_id"] == doc1.id for r in results)
