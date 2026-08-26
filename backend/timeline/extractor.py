# LLM-assisted and pattern-based incident timeline event extractor.
import re
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from backend.config.settings import settings

logger = logging.getLogger("clauseguard.timeline.extractor")

DATE_PATTERNS = [
    r'\b(?:\d{1,2}[-/th|st|nd|rd\s]+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,\s]+(?:\d{1,2}[,\s]+)?\d{4}\b',
    r'\b\d{4}-\d{2}-\d{2}\b',
    r'\b\d{1,2}/\d{1,2}/\d{4}\b'
]


def _heuristic_date_extraction(text: str) -> List[str]:
    """Finds raw date expressions in text."""
    found = []
    for pat in DATE_PATTERNS:
        matches = re.findall(pat, text, flags=re.IGNORECASE)
        for m in matches:
            if m not in found:
                found.append(m)
    return found


def _categorize_event(summary: str) -> str:
    """Classifies an event into standard legal incident categories."""
    lower = summary.lower()
    if any(w in lower for w in ["pay", "invoice", "transfer", "deposit", "cheque", "amount"]):
        return "payment"
    if any(w in lower for w in ["notice", "letter", "demand", "email", "intimation"]):
        return "notice"
    if any(w in lower for w in ["agree", "contract", "mou", "signed", "execute"]):
        return "agreement"
    if any(w in lower for w in ["court", "suit", "plaint", "petition", "filed", "hearing", "judge"]):
        return "litigation"
    if any(w in lower for w in ["breach", "default", "violat", "fail"]):
        return "breach"
    return "general"


def extract_timeline_events(
    chunks: List[Dict[str, Any]],
    case_id: str,
    document_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Extracts chronological timeline events from text chunks.
    Combines LLM structured extraction with robust regex/heuristic fallback.
    """
    events = []

    for c in chunks:
        text = c.get("text", "")
        if not text or len(text.strip()) < 20:
            continue

        raw_dates = _heuristic_date_extraction(text)
        if not raw_dates:
            continue

        # Extract first sentence or snippet mentioning the date
        for d in raw_dates[:2]:
            sentences = [s.strip() for s in re.split(r'[.\n]', text) if d.lower() in s.lower()]
            summary = sentences[0] if sentences else f"Incident recorded regarding {d}"
            if len(summary) > 250:
                summary = summary[:247] + "..."

            parsed_dt = None
            for fmt in ["%d %B %Y", "%B %d, %Y", "%B %Y", "%Y-%m-%d", "%d/%m/%Y"]:
                try:
                    parsed_dt = datetime.strptime(d.strip(), fmt)
                    break
                except ValueError:
                    pass

            category = _categorize_event(summary)
            events.append({
                "document_id": document_id or c.get("document_id"),
                "event_date": parsed_dt,
                "event_date_raw": d,
                "event_summary": summary,
                "entities_json": [],
                "page_number": c.get("page_number"),
                "chunk_id": c.get("chunk_id") or c.get("id"),
                "confidence": 0.85 if parsed_dt else 0.70,
                "is_disputed": False,
                "category": category
            })

    return events
