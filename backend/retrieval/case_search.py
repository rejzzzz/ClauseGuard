# Case-scoped semantic similarity search over document chunks.
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.db.repository import db_get_case_chunks
from backend.db.models import DocumentChunkModel


def _cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def search_case_chunks(
    db: Session,
    case_id: str,
    query_embedding: List[float],
    top_k: int = 10,
    min_similarity: float = 0.0
) -> List[Dict[str, Any]]:
    """
    Executes a case-scoped semantic similarity search across all document chunks in a case.
    
    Returns a list of dicts with:
      - chunk_id: str
      - document_id: str
      - filename: str
      - text: str
      - heading_title: str
      - page_number: Optional[int]
      - similarity: float
    """
    chunks: List[DocumentChunkModel] = db_get_case_chunks(db=db, case_id=case_id)
    if not chunks:
        return []

    scored_chunks = []
    for c in chunks:
        emb = c.embedding_json
        if not emb:
            continue
        sim = _cosine_similarity(query_embedding, emb)
        if sim >= min_similarity:
            scored_chunks.append((c, sim))

    # Sort descending by similarity score
    scored_chunks.sort(key=lambda x: x[1], reverse=True)
    top_results = scored_chunks[:top_k]

    results = []
    for c, sim in top_results:
        filename = c.document.filename if c.document else "Document"
        results.append({
            "chunk_id": c.id,
            "document_id": c.document_id,
            "filename": filename,
            "text": c.text,
            "heading_title": c.heading_title,
            "page_number": c.page_number,
            "similarity": float(sim),
            "metadata": c.metadata_json or {}
        })

    return results
