# Integration test for contract ingestion pipeline.
from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest

from backend.ingestion.pipeline import ingest_contract
from backend.ingestion.embedder import BedrockEmbedder

def test_ingest_contract_docx():
    mock_p_head = MagicMock()
    mock_p_head.text = "Section 1: Confidentiality"
    mock_p_head.style.name = "Heading 1"

    mock_p_body = MagicMock()
    mock_p_body.text = 'Each party shall hold "Confidential Information" in strict confidence.'
    mock_p_body.style.name = "Normal"

    mock_elem_head = MagicMock(tag="w:p")
    mock_elem_body = MagicMock(tag="w:p")

    mock_doc = MagicMock()
    mock_doc.element.body = [mock_elem_head, mock_elem_body]

    with patch("backend.ingestion.docx_parser.Document", return_value=mock_doc), \
         patch("backend.ingestion.docx_parser.Paragraph", side_effect=[mock_p_head, mock_p_body]), \
         patch("pathlib.Path.exists", return_value=True):
        
        embedder = BedrockEmbedder(dimension=32)
        chunks = ingest_contract(Path("sample.docx"), embedder=embedder)

    assert len(chunks) == 1
    assert chunks[0]["text"].startswith("[Section 1: Confidentiality]")
    assert "Confidential Information" in chunks[0]["metadata"]["defined_terms_used"]
    assert len(chunks[0]["embedding"]) == 32

def test_ingest_contract_unsupported_format():
    with patch("pathlib.Path.exists", return_value=True):
        with pytest.raises(ValueError, match="Unsupported file format"):
            ingest_contract(Path("sample.txt"))

def test_ingest_contract_file_not_found():
    with pytest.raises(FileNotFoundError):
        ingest_contract(Path("non_existent_file.docx"))
