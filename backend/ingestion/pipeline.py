# Unified ingestion pipeline for processing contract documents (.docx, .pdf).
from pathlib import Path
from typing import List, Dict, Any, Optional

from backend.ingestion.docx_parser import parse_docx
from backend.ingestion.pdf_parser import parse_pdf
from backend.ingestion.clause_tree import build_clause_tree
from backend.ingestion.chunker import chunk_clause_tree
from backend.ingestion.embedder import BedrockEmbedder

def ingest_contract(
    file_path: Path, 
    embedder: Optional[BedrockEmbedder] = None,
    max_chunk_size: int = 1500
) -> List[Dict[str, Any]]:
    """
    Ingests a contract file (.docx or .pdf), constructs a clause tree, 
    chunks clauses with structure context, and generates embeddings.
    
    Returns:
        List of chunk dictionaries, each containing:
          - text: str (heading context + content)
          - metadata: Dict[str, Any] (source, heading_path, heading_title, defined_terms_used)
          - embedding: List[float] (Titan embedding or fallback vector)
    """
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"Contract file not found: {file_path}")
        
    ext = file_path.suffix.lower()
    if ext == ".docx":
        segments = parse_docx(file_path)
    elif ext == ".pdf":
        segments = parse_pdf(file_path)
    else:
        raise ValueError(f"Unsupported file format '{ext}'. Expected .docx or .pdf")
        
    tree = build_clause_tree(segments)
    chunks = chunk_clause_tree(tree, max_chunk_size=max_chunk_size)
    
    if embedder is None:
        embedder = BedrockEmbedder()
        
    embedded_chunks = embedder.embed_chunks(chunks)
    return embedded_chunks
