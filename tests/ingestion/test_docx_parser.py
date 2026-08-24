# Unit tests for document parser and IR extraction.
from pathlib import Path
from unittest.mock import MagicMock, patch
from backend.ingestion.docx_parser import parse_docx

def test_parse_docx():
    mock_p_element = MagicMock()
    mock_p_element.tag = "w:p"
    
    mock_p = MagicMock()
    mock_p.text = "Heading 1 Text"
    mock_p.style.name = "Heading 1"
    
    mock_doc = MagicMock()
    mock_doc.element.body = [mock_p_element]
    
    with patch("backend.ingestion.docx_parser.Document", return_value=mock_doc), \
         patch("backend.ingestion.docx_parser.Paragraph", return_value=mock_p):
        segments = parse_docx(Path("dummy.docx"))
        
    assert len(segments) == 1
    assert segments[0]["type"] == "heading"
    assert segments[0]["title"] == "Heading 1 Text"
