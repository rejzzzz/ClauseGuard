# Redliner Agent (Drafter) that proposes replacement/insertion language for contract deviations.
from typing import List, Dict, Any, Optional
from backend.agents.auditor.verdict_schema import ClauseVerdict, ContractAuditReport, VerdictEnum
from backend.agents.redliner.edit_schema import EditInstruction, RedlinePackage, RedlineActionEnum
from backend.redlining.clause_bank import ClauseBank

class RedlinerAgent:
    """
    Drafter Redliner Agent responsible for consuming Auditor verdicts and 
    generating structured edit instructions using approved playbook language.
    """
    def __init__(self, model_name: str = "claude-sonnet"):
        self.model_name = model_name
        self.clause_bank = ClauseBank()

    def generate_edit_for_verdict(
        self, 
        verdict: ClauseVerdict, 
        clause_text: str, 
        playbook_name: str = "sample_vendor_msa"
    ) -> Optional[EditInstruction]:
        """
        Generates a structured edit instruction for a single non-compliant verdict.
        """
        if verdict.verdict == VerdictEnum.COMPLIANT:
            return None

        rule_id = verdict.playbook_citation_ids[0] if verdict.playbook_citation_ids else None
        rule_language = self.clause_bank.get_rule_language(rule_id, playbook_name) if rule_id else None
        
        # Fallback drafting logic
        if rule_language:
            proposed = f"Each party's total liability under this Agreement shall be capped at 1x the fees paid in the preceding 12 months." if "limitation" in clause_text.lower() or "liability" in clause_text.lower() else rule_language
            confidence = "high"
        else:
            proposed = "Clause revised to comply with corporate playbook policies."
            confidence = "low"

        action = RedlineActionEnum.REPLACE
        if verdict.verdict == VerdictEnum.MISSING_CLAUSE:
            action = RedlineActionEnum.INSERT

        return EditInstruction(
            clause_id=verdict.clause_id,
            heading_title=verdict.heading_title,
            action=action,
            original_text=clause_text,
            proposed_text=proposed,
            comment_text=verdict.rationale or "Proposed redline based on playbook policy.",
            draft_confidence=confidence
        )

    def generate_redline_package(
        self, 
        audit_report: ContractAuditReport, 
        chunks: List[Dict[str, Any]]
    ) -> RedlinePackage:
        """
        Consumes a full ContractAuditReport and generates a complete RedlinePackage.
        """
        # Map chunks by title/text for quick lookup
        chunk_map = {c.get("metadata", {}).get("heading_title", ""): c.get("text", "") for c in chunks}
        
        edits = []
        for v in audit_report.verdicts:
            if v.verdict != VerdictEnum.COMPLIANT:
                clause_text = chunk_map.get(v.heading_title, v.heading_title)
                edit = self.generate_edit_for_verdict(v, clause_text, playbook_name=audit_report.playbook_name)
                if edit:
                    edits.append(edit)
                    
        return RedlinePackage(
            contract_name=audit_report.contract_name,
            edits=edits,
            total_edits=len(edits)
        )
