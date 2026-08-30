# Unit tests for timeline event extraction.
import pytest
from backend.timeline.extractor import extract_timeline_events, _heuristic_date_extraction, _categorize_event


def test_date_patterns_heuristic():
    text1 = "On 15 January 2022, the parties executed the initial memorandum."
    dates1 = _heuristic_date_extraction(text1)
    assert len(dates1) == 1
    assert "15 January 2022" in dates1[0]

    text2 = "Payment was received on 2023-04-10 as agreed."
    dates2 = _heuristic_date_extraction(text2)
    assert len(dates2) == 1
    assert "2023-04-10" in dates2[0]


def test_categorize_event():
    assert _categorize_event("Invoice payment processed") == "payment"
    assert _categorize_event("Legal notice served on tenant") == "notice"
    assert _categorize_event("Agreement signed between parties") == "agreement"
    assert _categorize_event("Civil suit filed in high court") == "litigation"


def test_extract_timeline_events():
    chunks = [
        {
            "chunk_id": "c1",
            "document_id": "d1",
            "text": "On 14 August 2021, Party A issued a formal demand notice regarding unpaid dues.",
            "page_number": 2
        },
        {
            "chunk_id": "c2",
            "document_id": "d1",
            "text": "General boilerplate language without any specific dates or incidents.",
            "page_number": 3
        }
    ]

    events = extract_timeline_events(chunks, case_id="case_test", document_id="d1")
    assert len(events) == 1
    assert events[0]["category"] == "notice"
    assert "14 August 2021" in events[0]["event_date_raw"]
    assert events[0]["page_number"] == 2
    assert events[0]["confidence"] > 0.5
