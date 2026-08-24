# Extracts text, page numbers, and structural outlines from .pdf documents.
from pathlib import Path
from typing import List, Dict, Any, Optional
from pypdf import PdfReader

def parse_pdf(file_path: Path) -> List[Dict[str, Any]]:
    """
    Parses a PDF file and returns a list of segment dictionaries (unified Document IR).
    Each segment contains:
      - text: str (the text content of the segment)
      - title: Optional[str] (resolved outline title or heading)
      - type: str ("heading" or "paragraph")
      - metadata: Dict[str, Any] (source filename, page number, block index)
    """
    reader = PdfReader(str(file_path))
    segments = []
    
    for page_idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        # Split page text into paragraphs using double newlines
        blocks = [b.strip() for b in page_text.split("\n\n") if b.strip()]
        
        for block_idx, block in enumerate(blocks):
            lines = block.split("\n")
            first_line = lines[0].strip()
            
            is_heading = False
            # Heuristic for determining if a block is a heading:
            # Short block containing starts-with patterns or is entirely uppercase.
            if len(block) < 120 and (
                first_line.isupper() or 
                first_line.startswith(("Section", "SECTION", "Article", "ARTICLE")) or
                (first_line and first_line[0].isdigit())
            ):
                is_heading = True
                
            segments.append({
                "text": block,
                "title": first_line if is_heading else None,
                "type": "heading" if is_heading else "paragraph",
                "metadata": {
                    "source": file_path.name,
                    "page_number": page_idx + 1,
                    "block_index": block_idx,
                }
            })
            
    return segments
