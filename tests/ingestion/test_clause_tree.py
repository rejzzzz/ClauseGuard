# Unit tests for clause tree parsing and heading level heuristics.
from backend.ingestion.clause_tree import build_clause_tree, get_heading_level

def test_get_heading_level():
    assert get_heading_level("Heading Text", style="Heading 1") == 1
    assert get_heading_level("Heading Text", style="Heading 3") == 3
    assert get_heading_level("Article I: Definitions") == 1
    assert get_heading_level("Section 2.1: Confidentiality") == 2
    assert get_heading_level("1.1.1 Sub-clause") == 3
    assert get_heading_level("(a) Exceptions") == 3

def test_build_clause_tree_nested():
    segments = [
        {"text": "Article I: General Terms", "type": "heading", "metadata": {"style": "Heading 1", "source": "contract.docx"}},
        {"text": "General preamble text.", "type": "paragraph", "metadata": {"source": "contract.docx"}},
        {"text": "Section 1.1: Scope", "type": "heading", "metadata": {"style": "Heading 2", "source": "contract.docx"}},
        {"text": "Scope paragraph details.", "type": "paragraph", "metadata": {"source": "contract.docx"}},
        {"text": "(a) Permitted Use", "type": "heading", "metadata": {"source": "contract.docx"}},
        {"text": "Permitted use details.", "type": "paragraph", "metadata": {"source": "contract.docx"}},
    ]
    
    tree = build_clause_tree(segments)
    assert len(tree) == 1
    root_node = tree[0]
    assert root_node["title"] == "Article I: General Terms"
    assert len(root_node["segments"]) == 1
    assert root_node["segments"][0]["text"] == "General preamble text."
    
    assert len(root_node["children"]) == 1
    sec_node = root_node["children"][0]
    assert sec_node["title"] == "Section 1.1: Scope"
    assert sec_node["parent_chain"] == ["Article I: General Terms"]
    
    assert len(sec_node["children"]) == 1
    sub_node = sec_node["children"][0]
    assert sub_node["title"] == "(a) Permitted Use"
    assert sub_node["parent_chain"] == ["Article I: General Terms", "Section 1.1: Scope"]
