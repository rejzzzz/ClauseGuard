# Chunker that splits clauses by structure-aware boundaries rather than token limits.
import re
from typing import List, Dict, Any

def extract_defined_terms(text: str) -> List[str]:
    """
    Extracts candidate defined terms enclosed in quotes or title-case quotes.
    e.g. '"Confidential Information"' or '“Party”'
    """
    matches = re.findall(r'["“]([A-Z][a-zA-Z0-9\s]{1,40})["”]', text)
    # Deduplicate while preserving order
    seen = set()
    terms = []
    for m in matches:
        term = m.strip()
        if term not in seen:
            seen.add(term)
            terms.append(term)
    return terms


def chunk_clause_tree(tree_nodes: List[Dict[str, Any]], max_chunk_size: int = 1500) -> List[Dict[str, Any]]:
    """
    Flattens the clause tree into a flat list of indexable text chunks.
    Each chunk contains:
      - text: str (heading context + paragraph/table content)
      - metadata: Dict[str, Any] (source, heading_path, heading_title, defined_terms_used)
    """
    chunks = []
    
    def traverse(nodes: List[Dict[str, Any]]):
        for node in nodes:
            segments_text = []
            source_file = None
            
            metadata = {
                "heading_title": node["title"],
                "heading_path": " > ".join(node["parent_chain"] + [node["title"]]),
            }
            
            for seg in node["segments"]:
                segments_text.append(seg["text"])
                if not source_file:
                    source_file = seg["metadata"].get("source")
                    
            if source_file:
                metadata["source"] = source_file
                
            heading_prefix = f"[{metadata['heading_path']}]\n"
            content_text = "\n".join(segments_text).strip()
            
            if content_text:
                full_chunk_text = heading_prefix + content_text
                defined_terms = extract_defined_terms(full_chunk_text)
                
                if len(full_chunk_text) <= max_chunk_size:
                    chunk_meta = dict(metadata)
                    chunk_meta["defined_terms_used"] = defined_terms
                    chunks.append({
                        "text": full_chunk_text,
                        "metadata": chunk_meta
                    })
                else:
                    # Split over-large sections along segment boundaries while retaining heading context
                    current_text = heading_prefix
                    for block in segments_text:
                        if len(current_text) + len(block) > max_chunk_size and current_text != heading_prefix:
                            chunk_str = current_text.strip()
                            chunk_meta = dict(metadata)
                            chunk_meta["defined_terms_used"] = extract_defined_terms(chunk_str)
                            chunks.append({
                                "text": chunk_str,
                                "metadata": chunk_meta
                            })
                            current_text = heading_prefix + block + "\n"
                        else:
                            current_text += block + "\n"
                    if current_text != heading_prefix:
                        chunk_str = current_text.strip()
                        chunk_meta = dict(metadata)
                        chunk_meta["defined_terms_used"] = extract_defined_terms(chunk_str)
                        chunks.append({
                            "text": chunk_str,
                            "metadata": chunk_meta
                        })
                        
            # Traverse nested children
            traverse(node["children"])
            
    traverse(tree_nodes)
    return chunks

