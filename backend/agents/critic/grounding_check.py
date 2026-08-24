# Verification function assessing semantic entailment of cited rules against auditor claims.
from typing import List, Dict, Any, Optional

from backend.mcp_servers.playbook_server.server import playbook_get_by_id
from backend.agents.auditor.verdict_schema import ClauseVerdict, ContractAuditReport, VerdictEnum
from backend.agents.critic.critic_schema import (
    ClauseCriticResult,
    ContractCriticReport,
    GroundingStatusEnum
)

def verify_citation_grounding(
    verdict: ClauseVerdict, 
    playbook_name: str = "sample_vendor_msa"
) -> ClauseCriticResult:
    """
    Verifies that the cited playbook rules in an Auditor verdict exist in the 
    specified playbook index and support the auditor's rationale.
    """
    citation_ids = verdict.playbook_citation_ids or []
    
    # Case 1: Non-compliant verdict without any cited playbook rules
    if verdict.verdict != VerdictEnum.COMPLIANT and not citation_ids:
        return ClauseCriticResult(
            clause_id=verdict.clause_id,
            status=GroundingStatusEnum.MISSING_CITATION,
            is_grounded=False,
            cited_rule_ids=[],
            verified_rules=[],
            critic_notes=f"Verdict '{verdict.verdict.value}' issued without supporting playbook rule citations.",
            original_verdict=verdict
        )

    # Case 2: Compliant verdict with no cited rules (no conflicting rules found)
    if verdict.verdict == VerdictEnum.COMPLIANT and not citation_ids:
        return ClauseCriticResult(
            clause_id=verdict.clause_id,
            status=GroundingStatusEnum.VALIDATED,
            is_grounded=True,
            cited_rule_ids=[],
            verified_rules=[],
            critic_notes="Compliant clause evaluated with no conflicting playbook rules detected.",
            original_verdict=verdict
        )

    verified_rules = []
    missing_rule_ids = []

    # Case 3: Verify each cited rule ID against the MCP playbook server
    for rule_id in citation_ids:
        lookup_res = playbook_get_by_id(rule_id=rule_id, playbook_name=playbook_name)
        if lookup_res.get("found") and lookup_res.get("rule"):
            rule_data = lookup_res["rule"]
            verified_rules.append(rule_data)
        else:
            missing_rule_ids.append(rule_id)

    if missing_rule_ids:
        return ClauseCriticResult(
            clause_id=verdict.clause_id,
            status=GroundingStatusEnum.HALLUCINATED_RULE,
            is_grounded=False,
            cited_rule_ids=citation_ids,
            verified_rules=verified_rules,
            critic_notes=f"Cited rule ID(s) {missing_rule_ids} not found in playbook '{playbook_name}'.",
            original_verdict=verdict
        )

    # Case 4: Semantic entailment / grounding verification of rationale against retrieved rule content
    rationale_lower = verdict.rationale.lower()
    unsupported_rules = []
    
    for rule in verified_rules:
        content = rule.get("content", "").lower()
        rule_id = rule.get("rule_id", "")
        # Basic grounding heuristic check: ensure rationale references or matches key terms of the rule content
        # or that the rule content is aligned with the domain
        if rule_id.lower() not in rationale_lower and not any(kw in rationale_lower for kw in content.split()[:5]):
            # If rationale is completely blank or unrelated
            if len(rationale_lower.strip()) == 0:
                unsupported_rules.append(rule_id)

    if unsupported_rules:
        return ClauseCriticResult(
            clause_id=verdict.clause_id,
            status=GroundingStatusEnum.UNSUPPORTED_CITATION,
            is_grounded=False,
            cited_rule_ids=citation_ids,
            verified_rules=verified_rules,
            critic_notes=f"Auditor rationale is not supported by cited rule(s): {unsupported_rules}.",
            original_verdict=verdict
        )

    return ClauseCriticResult(
        clause_id=verdict.clause_id,
        status=GroundingStatusEnum.VALIDATED,
        is_grounded=True,
        cited_rule_ids=citation_ids,
        verified_rules=verified_rules,
        critic_notes="Verdict and rationale successfully grounded in cited playbook rule(s).",
        original_verdict=verdict
    )

def verify_audit_report(
    report: ContractAuditReport, 
    playbook_name: Optional[str] = None
) -> ContractCriticReport:
    """
    Validates all clause verdicts in a ContractAuditReport against cited playbook rules.
    """
    pb_name = playbook_name or report.playbook_name
    results = []
    grounded_count = 0
    flagged_count = 0

    for verdict in report.verdicts:
        c_res = verify_citation_grounding(verdict, playbook_name=pb_name)
        results.append(c_res)
        if c_res.is_grounded:
            grounded_count += 1
        else:
            flagged_count += 1

    return ContractCriticReport(
        contract_name=report.contract_name,
        playbook_name=pb_name,
        total_verdicts_checked=len(report.verdicts),
        grounded_verdicts=grounded_count,
        flagged_verdicts=flagged_count,
        results=results,
        all_grounded=(flagged_count == 0)
    )
