# Critic Agent (Validator) checking auditor verdicts against cited playbook documents.
from typing import List, Dict, Any, Optional

from backend.agents.auditor.verdict_schema import ClauseVerdict, ContractAuditReport
from backend.agents.critic.critic_schema import (
    ClauseCriticResult,
    ContractCriticReport,
    GroundingStatusEnum
)
from backend.agents.critic.grounding_check import verify_citation_grounding, verify_audit_report

class CriticAgent:
    """
    Validator Critic Agent responsible for inspecting Auditor verdicts against 
    cited playbook documents via MCP lookup and validating citation grounding.
    """
    def __init__(self, model_name: str = "claude-haiku"):
        self.model_name = model_name

    def validate_verdict(
        self, 
        verdict: ClauseVerdict, 
        playbook_name: str = "sample_vendor_msa"
    ) -> ClauseCriticResult:
        """
        Validates a single Auditor ClauseVerdict against the specified playbook.
        """
        return verify_citation_grounding(verdict, playbook_name=playbook_name)

    def validate_audit_report(
        self, 
        audit_report: ContractAuditReport, 
        playbook_name: Optional[str] = None
    ) -> ContractCriticReport:
        """
        Validates all clause verdicts within a ContractAuditReport.
        """
        return verify_audit_report(audit_report, playbook_name=playbook_name)
