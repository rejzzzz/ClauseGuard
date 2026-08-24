# Unit tests for structure-aware clause chunking.
from backend.ingestion.clause_tree import build_clause_tree
from backend.ingestion.chunker import chunk_clause_tree

def test_chunker_pipeline():
    segments = [
        {"text": "Section 1: Limitation of Liability", "type": "heading", "metadata": {"source": "test.docx", "style": "Heading 1"}},
        {"text": "Paragraph 1 content.", "type": "paragraph", "metadata": {"source": "test.docx"}},
        {"text": "Section 1.1: General Cap", "type": "heading", "metadata": {"source": "test.docx", "style": "Heading 2"}},
        {"text": "Paragraph 2 content.", "type": "paragraph", "metadata": {"source": "test.docx"}},
    ]
    
    tree = build_clause_tree(segments)
    assert len(tree) == 1
    assert tree[0]["title"] == "Section 1: Limitation of Liability"
    assert len(tree[0]["children"]) == 1
    assert tree[0]["children"][0]["title"] == "Section 1.1: General Cap"
    
    chunks = chunk_clause_tree(tree, max_chunk_size=500)
    assert len(chunks) == 2
    assert chunks[0]["text"].startswith("[Section 1: Limitation of Liability]")
    assert chunks[1]["text"].startswith("[Section 1: Limitation of Liability > Section 1.1: General Cap]")
