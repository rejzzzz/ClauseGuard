# Text diff rendering utility for displaying deviations in the review UI.
import difflib
from typing import List, Tuple

def compute_word_diff(original: str, proposed: str) -> List[Tuple[str, str]]:
    """
    Computes word-level diff operations between original and proposed text.
    Returns a list of tuples: (operation, text), where operation is "equal", "delete", or "insert".
    """
    orig_words = original.split()
    prop_words = proposed.split()
    
    matcher = difflib.SequenceMatcher(None, orig_words, prop_words)
    diff_tokens = []
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            diff_tokens.append(("equal", " ".join(orig_words[i1:i2])))
        elif tag == "delete":
            diff_tokens.append(("delete", " ".join(orig_words[i1:i2])))
        elif tag == "insert":
            diff_tokens.append(("insert", " ".join(prop_words[j1:j2])))
        elif tag == "replace":
            diff_tokens.append(("delete", " ".join(orig_words[i1:i2])))
            diff_tokens.append(("insert", " ".join(prop_words[j1:j2])))
            
    return diff_tokens

def render_diff_html(original: str, proposed: str) -> str:
    """
    Renders visual HTML diff representation with <del> and <ins> tags.
    """
    diff_tokens = compute_word_diff(original, proposed)
    html_parts = []
    
    for op, text in diff_tokens:
        if not text:
            continue
        if op == "equal":
            html_parts.append(text)
        elif op == "delete":
            html_parts.append(f"<del>{text}</del>")
        elif op == "insert":
            html_parts.append(f"<ins>{text}</ins>")
            
    return " ".join(html_parts)
