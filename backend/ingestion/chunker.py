# Chunker that splits clauses by structure-aware boundaries rather than token limits.
from typing import List, Dict, Any

def chunk_clause_tree(tree_nodes: List[Dict[str, Any]], max_chunk_size: int = 1500) -> List[Dict[str, Any]]:
    """
    Flattens the clause tree into a flat list of indexable text chunks.
    Each chunk contains:
      - text: str (heading context + paragraph/table content)
      - metadata: Dict[str, Any] (source, heading_path, heading_title)
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
                
                if len(full_chunk_text) <= max_chunk_size:
                    chunks.append({
                        "text": full_chunk_text,
                        "metadata": metadata
                    })
                else:
                    # Split over-large sections along segment boundaries while retaining heading context
                    current_text = heading_prefix
                    for block in segments_text:
                        if len(current_text) + len(block) > max_chunk_size and current_text != heading_prefix:
                            chunks.append({
                                "text": current_text.strip(),
                                "metadata": metadata
                            })
                            current_text = heading_prefix + block + "\n"
                        else:
                            current_text += block + "\n"
                    if current_text != heading_prefix:
                        chunks.append({
                            "text": current_text.strip(),
                            "metadata": metadata
                        })
                        
            # Traverse nested children
            traverse(node["children"])
            
    traverse(tree_nodes)
    return chunks
