# Unit tests for PDF parser.
from pathlib import Path
from unittest.mock import MagicMock, patch
from backend.ingestion.pdf_parser import parse_pdf

def test_parse_pdf():
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Section 1: Limitation of Liability\n\nThis is the limitation of liability clause."
    
    mock_reader = MagicMock()
    mock_reader.pages = [mock_page]
    
    with patch("backend.ingestion.pdf_parser.PdfReader", return_value=mock_reader):
        segments = parse_pdf(Path("dummy.pdf"))
        
    assert len(segments) == 2
    assert segments[0]["type"] == "heading"
    assert segments[0]["title"] == "Section 1: Limitation of Liability"
    assert segments[1]["type"] == "paragraph"
    assert segments[1]["text"] == "This is the limitation of liability clause."
    assert segments[1]["metadata"]["page_number"] == 1
