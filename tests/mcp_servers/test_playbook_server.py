# Unit tests for FastMCP playbook server tools.
import pytest
from backend.mcp_servers.playbook_server.server import playbook_search, playbook_get_by_id

def test_playbook_search():
    result = playbook_search(query="limitation of liability", top_k=2, playbook_name="sample_vendor_msa")
    
    assert result["query"] == "limitation of liability"
    assert result["playbook_name"] == "sample_vendor_msa"
    assert len(result["matches"]) > 0
    assert "rule_id" in result["matches"][0]
    assert "content" in result["matches"][0]

def test_playbook_get_by_id():
    search_res = playbook_search(query="indemnification", top_k=1, playbook_name="sample_vendor_msa")
    rule_id = search_res["matches"][0]["rule_id"]
    
    get_res = playbook_get_by_id(rule_id=rule_id, playbook_name="sample_vendor_msa")
    
    assert get_res["found"] is True
    assert get_res["rule"]["rule_id"] == rule_id
    assert len(get_res["rule"]["content"]) > 0
