# Structure-aware segmenter parsing document outline levels into a clause tree.
from typing import List, Dict, Any, Optional

def build_clause_tree(segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Groups paragraphs under headings to form a tree structure.
    Each node in the tree contains:
      - title: str (heading text or "Root")
      - segments: List[Dict[str, Any]] (direct paragraph/table elements under this heading)
      - children: List[Dict[str, Any]] (sub-heading nodes)
      - parent_chain: List[str] (titles of parent nodes for heading context)
    """
    root = {
        "title": "Root",
        "segments": [],
        "children": [],
        "parent_chain": []
    }
    
    def get_heading_level(title: str, style: str) -> int:
        # Style level check (e.g. style = "Heading 1" -> level 1)
        if style.startswith("Heading "):
            try:
                return int(style.split(" ")[-1])
            except ValueError:
                pass
        
        # Numbering scheme checks (e.g. "1.1.1 " -> level 3)
        words = title.split()
        if not words:
            return 1
            
        num_part = ""
        if words[0].lower() in ("section", "article", "sec", "art") and len(words) > 1:
            num_part = words[1]
        else:
            num_part = words[0]
            
        num_part = num_part.rstrip(".")
        if all(c.isdigit() or c == "." for c in num_part) and "." in num_part:
            return num_part.count(".") + 1
            
        return 1
        
    stack = [root]
    
    for segment in segments:
        if segment["type"] == "heading":
            title = segment["text"]
            style = segment["metadata"].get("style", "")
            level = get_heading_level(title, style)
            
            node = {
                "title": title,
                "segments": [],
                "children": [],
                "parent_chain": []
            }
            
            while len(stack) > 1:
                # Pop until we find the parent node with a lower level
                if level <= len(stack) - 1:
                    stack.pop()
                else:
                    break
                    
            parent_node = stack[-1]
            node["parent_chain"] = parent_node["parent_chain"] + ([parent_node["title"]] if parent_node["title"] != "Root" else [])
            parent_node["children"].append(node)
            stack.append(node)
        else:
            stack[-1]["segments"].append(segment)
            
    return root["children"]
