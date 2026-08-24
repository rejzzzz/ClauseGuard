# Retrieval utility matching standard approved fallback clauses from the playbook.
from pathlib import Path
from typing import Dict, Any, Optional
from backend.mcp_servers.playbook_server.server import playbook_get_by_id

class ClauseBank:
    """
    Clause bank lookup utility for retrieving pre-approved standard and fallback 
    legal clauses from versioned playbooks.
    """
    def __init__(self, default_playbook: str = "sample_vendor_msa"):
        self.default_playbook = default_playbook
        
    def get_rule_language(self, rule_id: str, playbook_name: Optional[str] = None) -> Optional[str]:
        """
        Retrieves pre-approved text for a given rule_id from the playbook server.
        """
        pb_name = playbook_name or self.default_playbook
        res = playbook_get_by_id(rule_id=rule_id, playbook_name=pb_name)
        if res.get("found") and res.get("rule"):
            return res["rule"].get("content", "")
        return None
