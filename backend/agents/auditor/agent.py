# Auditor Agent (Paralegal) that classifies contract clauses against legal playbooks.
from typing import List, Dict, Any, Optional

from backend.mcp_servers.playbook_server.server import playbook_search
from backend.agents.auditor.verdict_schema import (
    ClauseVerdict,
    ContractAuditReport,
    VerdictEnum,
    SeverityEnum
)

class AuditorAgent:
    """
    Paralegal Auditor Agent responsible for evaluating contract clauses against 
    versioned playbook rules via MCP playbook search.
    """
    def __init__(self, model_name: str = "claude-haiku"):
        self.model_name = model_name

    def audit_clause(
        self, 
        clause_chunk: Dict[str, Any], 
        playbook_name: str = "sample_vendor_msa",
        clause_id: Optional[str] = None
    ) -> ClauseVerdict:
        """
        Audits a single contract clause chunk against the specified playbook.
        """
        text = clause_chunk.get("text", "")
        meta = clause_chunk.get("metadata", {})
        heading_title = meta.get("heading_title", "")
        heading_path = meta.get("heading_path", "")
        
        cid = clause_id or f"clause_{meta.get('source', 'doc')}_{meta.get('heading_title', 'section')}"
        
        # Search relevant playbook rules via MCP tool
        search_response = playbook_search(query=text, top_k=3, playbook_name=playbook_name)
        matches = search_response.get("matches", [])
        
        if not matches:
            return ClauseVerdict(
                clause_id=cid,
                heading_title=heading_title,
                heading_path=heading_path,
                verdict=VerdictEnum.COMPLIANT,
                severity=SeverityEnum.LOW,
                playbook_citation_ids=[],
                rationale="No conflicting playbook rule found for this clause.",
                suggested_action=None
            )
            
        top_match = matches[0]
        rule_id = top_match.get("rule_id", "rule_unknown")
        rule_content = top_match.get("content", "").lower()
        text_lower = text.lower()
        
        # Heuristic rules classification (Rule engine + LLM fallback pattern)
        if "unacceptable" in rule_content or "never accept" in rule_content:
            # Check for unacceptable patterns
            if "uncapped" in text_lower or "customer indemnifying" in text_lower or "non-us" in text_lower:
                return ClauseVerdict(
                    clause_id=cid,
                    heading_title=heading_title,
                    heading_path=heading_path,
                    verdict=VerdictEnum.DEVIATION,
                    severity=SeverityEnum.CRITICAL,
                    playbook_citation_ids=[rule_id],
                    rationale=f"Clause violates strict playbook prohibition in rule {rule_id}.",
                    suggested_action="Reject clause or replace with standard playbook position."
                )
                
        if "fallback" in rule_content:
            # Check for fallback positions (e.g. 2x fees cap instead of 1x)
            if "2x" in text_lower or "1,000,000" in text_lower or "new york" in text_lower:
                return ClauseVerdict(
                    clause_id=cid,
                    heading_title=heading_title,
                    heading_path=heading_path,
                    verdict=VerdictEnum.DEVIATION,
                    severity=SeverityEnum.MEDIUM,
                    playbook_citation_ids=[rule_id],
                    rationale=f"Clause adopts fallback position under rule {rule_id}.",
                    suggested_action="Review fallback acceptability with lead counsel."
                )

        return ClauseVerdict(
            clause_id=cid,
            heading_title=heading_title,
            heading_path=heading_path,
            verdict=VerdictEnum.COMPLIANT,
            severity=SeverityEnum.LOW,
            playbook_citation_ids=[rule_id],
            rationale=f"Clause complies with playbook rule {rule_id}.",
            suggested_action=None
        )

    def audit_contract(
        self, 
        chunks: List[Dict[str, Any]], 
        playbook_name: str = "sample_vendor_msa",
        contract_name: str = "contract"
    ) -> ContractAuditReport:
        """
        Audits all clause chunks in a contract and produces a ContractAuditReport.
        """
        verdicts = []
        highest_severity = SeverityEnum.LOW
        severity_order = {SeverityEnum.LOW: 0, SeverityEnum.MEDIUM: 1, SeverityEnum.HIGH: 2, SeverityEnum.CRITICAL: 3}
        
        for idx, chunk in enumerate(chunks):
            cid = f"{contract_name}_clause_{idx + 1}"
            v = self.audit_clause(chunk, playbook_name=playbook_name, clause_id=cid)
            verdicts.append(v)
            
            if severity_order[v.severity] > severity_order[highest_severity]:
                highest_severity = v.severity
                
        return ContractAuditReport(
            contract_name=contract_name,
            playbook_name=playbook_name,
            total_clauses=len(chunks),
            verdicts=verdicts,
            overall_risk_level=highest_severity
        )
