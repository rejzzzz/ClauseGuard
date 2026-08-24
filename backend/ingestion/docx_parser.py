# Document parser extracting raw text, tables, and styles from .docx files.
from pathlib import Path
from typing import List, Dict, Any, Optional
from docx import Document
from docx.text.paragraph import Paragraph
from docx.table import Table

def parse_docx(file_path: Path) -> List[Dict[str, Any]]:
    """
    Parses a DOCX file and returns a list of segment dictionaries (unified Document IR).
    Each segment contains:
      - text: str (paragraph text or formatted table content)
      - title: Optional[str] (resolved outline title if paragraph is a heading)
      - type: str ("heading", "paragraph", or "table")
      - metadata: Dict[str, Any] (source file, element index, formatting style)
    """
    doc = Document(str(file_path))
    segments = []
    
    element_index = 0
    for child in doc.element.body:
        if child.tag.endswith('p'):
            p = Paragraph(child, doc)
            text = p.text.strip()
            if not text:
                continue
                
            style_name = p.style.name if p.style else ""
            is_heading = style_name.startswith("Heading") or style_name.startswith("Title")
            
            segments.append({
                "text": text,
                "title": text if is_heading else None,
                "type": "heading" if is_heading else "paragraph",
                "metadata": {
                    "source": file_path.name,
                    "element_index": element_index,
                    "style": style_name,
                }
            })
            element_index += 1
            
        elif child.tag.endswith('tbl'):
            t = Table(child, doc)
            row_texts = []
            
            for row in t.rows:
                cell_texts = [cell.text.strip() for cell in row.cells]
                # Filter merged cell duplicates
                filtered_cells = []
                for cell_text in cell_texts:
                    if not filtered_cells or filtered_cells[-1] != cell_text:
                        filtered_cells.append(cell_text)
                if any(filtered_cells):
                    row_texts.append(" | ".join(filtered_cells))
                    
            table_text = "\n".join(row_texts)
            if table_text.strip():
                segments.append({
                    "text": table_text,
                    "title": None,
                    "type": "table",
                    "metadata": {
                        "source": file_path.name,
                        "element_index": element_index,
                        "rows_count": len(t.rows),
                        "cols_count": len(t.columns),
                    }
                })
                element_index += 1
                
    return segments
