# OOXML mutation wrapper utilizing python-docx to insert w:ins, w:del and comments.
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml

def create_w_del(text: str, author: str = "ClauseGuard", change_id: int = 1) -> OxmlElement:
    """Creates a <w:del> element with tracked deletion text."""
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    xml = f'<w:del {nsdecls("w")} w:id="{change_id}" w:author="{author}" w:date="{now_iso}"><w:r><w:delText xml:space="preserve">{text}</w:delText></w:r></w:del>'
    return parse_xml(xml)

def create_w_ins(text: str, author: str = "ClauseGuard", change_id: int = 2) -> OxmlElement:
    """Creates a <w:ins> element with tracked insertion text."""
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    xml = f'<w:ins {nsdecls("w")} w:id="{change_id}" w:author="{author}" w:date="{now_iso}"><w:r><w:t xml:space="preserve">{text}</w:t></w:r></w:ins>'
    return parse_xml(xml)

def apply_tracked_redlines(
    input_docx: Path,
    output_docx: Path,
    redline_edits: List[Dict[str, Any]],
    author: str = "ClauseGuard"
) -> Path:
    """
    Opens input .docx, finds matching paragraph text, and performs OOXML surgery 
    to insert native Track Changes (<w:del> / <w:ins>) elements.
    """
    doc = Document(str(input_docx))
    change_counter = 100
    
    for edit in redline_edits:
        original_text = edit.get("original_text", "").strip()
        proposed_text = edit.get("proposed_text", "").strip()
        action = edit.get("action", "REPLACE").upper()
        
        # Search document paragraphs for target text match
        for paragraph in doc.paragraphs:
            p_text = paragraph.text.strip()
            
            # Match paragraph by original text
            if original_text and (original_text in p_text or p_text in original_text):
                p_elem = paragraph._p
                
                # Build tracked deletion & insertion
                del_elem = create_w_del(p_text, author=author, change_id=change_counter) if action in ("REPLACE", "DELETE") else None
                change_counter += 1
                
                ins_elem = create_w_ins(proposed_text, author=author, change_id=change_counter) if action in ("REPLACE", "INSERT") else None
                change_counter += 1
                
                # Clear original paragraph runs
                for run in list(paragraph.runs):
                    p_elem.remove(run._r)
                    
                # Append tracked change XML elements
                if del_elem is not None:
                    p_elem.append(del_elem)
                if ins_elem is not None:
                    p_elem.append(ins_elem)
                    
                break
                
    output_docx.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(output_docx))
    return output_docx
