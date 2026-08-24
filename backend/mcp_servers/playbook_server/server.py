# Playbook MCP server exposing search and document retrieval tools.
from pathlib import Path
from typing import Dict, Any, Optional
from mcp.server.fastmcp import FastMCP

from backend.ingestion.embedder import BedrockEmbedder
from backend.retrieval.vector_store import LocalVectorStore
from backend.mcp_servers.playbook_server.schemas import (
    PlaybookRule,
    PlaybookSearchResult,
    PlaybookGetResult
)

mcp = FastMCP("PlaybookServer")

_vector_store_cache: Dict[str, LocalVectorStore] = {}

def _get_vector_store(playbook_name: str) -> LocalVectorStore:
    project_root = Path(__file__).resolve().parents[3]
    index_dir = project_root / "backend" / "config" / "playbooks" / f"{playbook_name}_index"
    
    if not index_dir.exists():
        raise FileNotFoundError(f"Playbook index directory not found: {index_dir}")
        
    cache_key = str(index_dir)
    if cache_key not in _vector_store_cache:
        store = LocalVectorStore()
        store.load(index_dir)
        _vector_store_cache[cache_key] = store
        
    return _vector_store_cache[cache_key]

@mcp.tool()
def playbook_search(query: str, top_k: int = 5, playbook_name: str = "sample_vendor_msa") -> Dict[str, Any]:
    """
    Searches the specified legal playbook for rules semantically relevant to the query.
    Returns matching playbook rules sorted by relevance score.
    """
    store = _get_vector_store(playbook_name)
    embedder = BedrockEmbedder()
    query_embedding = embedder.embed_text(query)
    
    search_hits = store.search(query_embedding, top_k=top_k)
    
    matches = []
    for doc, score in search_hits:
        meta = doc.get("metadata", {})
        rule = PlaybookRule(
            rule_id=meta.get("rule_id", "unknown_rule"),
            heading_title=meta.get("heading_title", ""),
            heading_path=meta.get("heading_path", ""),
            content=doc.get("text", ""),
            playbook_name=meta.get("playbook_name", playbook_name),
            score=score
        )
        matches.append(rule)
        
    result = PlaybookSearchResult(
        query=query,
        playbook_name=playbook_name,
        matches=matches
    )
    return result.model_dump()

@mcp.tool()
def playbook_get_by_id(rule_id: str, playbook_name: str = "sample_vendor_msa") -> Dict[str, Any]:
    """
    Retrieves the exact legal playbook rule matching the specified rule/citation ID.
    Used by the Critic agent to verify citation grounding.
    """
    store = _get_vector_store(playbook_name)
    
    found_doc = None
    for doc in store.documents:
        if doc.get("metadata", {}).get("rule_id") == rule_id:
            found_doc = doc
            break
            
    if not found_doc:
        result = PlaybookGetResult(rule_id=rule_id, found=False)
        return result.model_dump()
        
    meta = found_doc.get("metadata", {})
    rule = PlaybookRule(
        rule_id=rule_id,
        heading_title=meta.get("heading_title", ""),
        heading_path=meta.get("heading_path", ""),
        content=found_doc.get("text", ""),
        playbook_name=meta.get("playbook_name", playbook_name),
        score=1.0
    )
    
    result = PlaybookGetResult(rule_id=rule_id, found=True, rule=rule)
    return result.model_dump()

if __name__ == "__main__":
    mcp.run()
