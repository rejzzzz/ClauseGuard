# CLI command script for parsing and versioning playbook text files.
import argparse
from pathlib import Path
from typing import List, Dict, Any

from backend.ingestion.docx_parser import parse_docx
from backend.ingestion.pdf_parser import parse_pdf
from backend.ingestion.clause_tree import build_clause_tree
from backend.ingestion.chunker import chunk_clause_tree
from backend.ingestion.embedder import BedrockEmbedder
from backend.retrieval.vector_store import LocalVectorStore

def parse_markdown_playbook(file_path: Path) -> List[Dict[str, Any]]:
    """
    Parses a markdown (.md) playbook into unified Document IR segments.
    """
    text = file_path.read_text(encoding="utf-8")
    lines = text.split("\n")
    segments = []
    
    current_block = []
    for line in lines:
        line_str = line.strip()
        if line_str.startswith("#"):
            if current_block:
                block_text = "\n".join(current_block).strip()
                if block_text:
                    segments.append({
                        "text": block_text,
                        "title": None,
                        "type": "paragraph",
                        "metadata": {"source": file_path.name}
                    })
                current_block = []
                
            heading_title = line_str.lstrip("#").strip()
            segments.append({
                "text": heading_title,
                "title": heading_title,
                "type": "heading",
                "metadata": {"source": file_path.name, "style": f"Heading {line_str.count('#')}"}
            })
        else:
            if line_str:
                current_block.append(line_str)
                
    if current_block:
        block_text = "\n".join(current_block).strip()
        if block_text:
            segments.append({
                "text": block_text,
                "title": None,
                "type": "paragraph",
                "metadata": {"source": file_path.name}
            })
            
    return segments

def ingest_playbook(file_path: Path, output_index_dir: Path, embedder: BedrockEmbedder = None) -> Path:
    """
    Ingests a playbook document (.md, .docx, or .pdf) and persists a local FAISS index.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"Playbook file not found: {file_path}")
        
    ext = file_path.suffix.lower()
    if ext == ".docx":
        segments = parse_docx(file_path)
    elif ext == ".pdf":
        segments = parse_pdf(file_path)
    elif ext in (".md", ".markdown", ".txt"):
        segments = parse_markdown_playbook(file_path)
    else:
        raise ValueError(f"Unsupported playbook format: {ext}")
        
    tree = build_clause_tree(segments)
    chunks = chunk_clause_tree(tree)
    
    if not chunks:
        raise ValueError("No valid clause chunks extracted from playbook.")
        
    texts = [c["text"] for c in chunks]
    
    if embedder is None:
        embedder = BedrockEmbedder()
        
    embeddings = embedder.embed_texts(texts)
    
    formatted_docs = []
    for idx, (chunk, text) in enumerate(zip(chunks, texts)):
        rule_id = f"{file_path.stem}_rule_{idx + 1}"
        doc_entry = {
            "text": text,
            "metadata": {
                "rule_id": rule_id,
                "playbook_name": file_path.stem,
                "heading_title": chunk["metadata"].get("heading_title", ""),
                "heading_path": chunk["metadata"].get("heading_path", ""),
                "source": file_path.name,
            }
        }
        formatted_docs.append(doc_entry)
        
    vector_store = LocalVectorStore(dimension=len(embeddings[0]))
    vector_store.add_documents(formatted_docs, embeddings)
    vector_store.save(output_index_dir)
    
    return output_index_dir

def ensure_default_playbook_index(playbook_name: str = "sample_vendor_msa") -> Path:
    """
    Ensures that the default playbook FAISS index exists on disk.
    If absent, builds it from backend/config/playbooks/<playbook_name>.md.
    """
    project_root = Path(__file__).resolve().parents[3]
    playbooks_dir = project_root / "backend" / "config" / "playbooks"
    source_file = playbooks_dir / f"{playbook_name}.md"
    index_dir = playbooks_dir / f"{playbook_name}_index"

    if not index_dir.exists() and source_file.exists():
        ingest_playbook(source_file, index_dir)
        
    return index_dir


def main():
    parser = argparse.ArgumentParser(description="Ingest legal playbooks into local FAISS index.")
    parser.add_argument("--input", required=False, help="Path to input playbook file (.md, .docx, .pdf)")
    parser.add_argument("--output-dir", required=False, help="Path to save index directory")
    args = parser.parse_args()
    
    if args.input and args.output_dir:
        ingest_playbook(Path(args.input), Path(args.output_dir))
        print(f"Playbook successfully indexed at: {args.output_dir}")
    else:
        out = ensure_default_playbook_index("sample_vendor_msa")
        print(f"Default playbook successfully verified/indexed at: {out}")

if __name__ == "__main__":
    main()

