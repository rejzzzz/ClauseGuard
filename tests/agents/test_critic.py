# Unit tests for Critic Agent grounding verification.
import pytest
from backend.agents.auditor.verdict_schema import ClauseVerdict, VerdictEnum, SeverityEnum, ContractAuditReport
from backend.agents.auditor.agent import AuditorAgent
from backend.agents.critic.agent import CriticAgent
from backend.agents.critic.critic_schema import (
    ClauseCriticResult,
    ContractCriticReport,
    GroundingStatusEnum
)
from backend.agents.critic.grounding_check import verify_citation_grounding, verify_audit_report
from backend.mcp_servers.playbook_server.server import playbook_search

def test_critic_compliant_verdict_without_citations():
    verdict = ClauseVerdict(
        clause_id="clause_1",
        heading_title="Definitions",
        heading_path="MSA > Definitions",
        verdict=VerdictEnum.COMPLIANT,
        severity=SeverityEnum.LOW,
        playbook_citation_ids=[],
        rationale="Standard definition section with no playbook conflict.",
        suggested_action=None
    )
    res = verify_citation_grounding(verdict, playbook_name="sample_vendor_msa")
    assert res.is_grounded is True
    assert res.status == GroundingStatusEnum.VALIDATED

def test_critic_valid_citation_grounding():
    # Retrieve real rule ID from sample playbook index
    search_res = playbook_search(query="limitation of liability", top_k=1, playbook_name="sample_vendor_msa")
    rule_id = search_res["matches"][0]["rule_id"]

    verdict = ClauseVerdict(
        clause_id="clause_2",
        heading_title="Limitation of Liability",
        heading_path="MSA > Limitation of Liability",
        verdict=VerdictEnum.DEVIATION,
        severity=SeverityEnum.CRITICAL,
        playbook_citation_ids=[rule_id],
        rationale=f"Clause specifies uncapped liability violating rule {rule_id}.",
        suggested_action="Cap liability at 1x annual fees."
    )
    
    res = verify_citation_grounding(verdict, playbook_name="sample_vendor_msa")
    assert res.is_grounded is True
    assert res.status == GroundingStatusEnum.VALIDATED
    assert len(res.verified_rules) == 1
    assert res.verified_rules[0]["rule_id"] == rule_id

def test_critic_missing_citation_flag():
    verdict = ClauseVerdict(
        clause_id="clause_3",
        heading_title="Indemnification",
        heading_path="MSA > Indemnification",
        verdict=VerdictEnum.DEVIATION,
        severity=SeverityEnum.HIGH,
        playbook_citation_ids=[], # Missing citation
        rationale="Vendor refuses customer indemnification.",
        suggested_action="Require mutual indemnification."
    )
    
    res = verify_citation_grounding(verdict, playbook_name="sample_vendor_msa")
    assert res.is_grounded is False
    assert res.status == GroundingStatusEnum.MISSING_CITATION

def test_critic_hallucinated_rule_flag():
    verdict = ClauseVerdict(
        clause_id="clause_4",
        heading_title="Governing Law",
        heading_path="MSA > Governing Law",
        verdict=VerdictEnum.DEVIATION,
        severity=SeverityEnum.MEDIUM,
        playbook_citation_ids=["non_existent_fake_rule_99999"], # Fake citation
        rationale="Non-US jurisdiction selected.",
        suggested_action="Change jurisdiction to Delaware."
    )
    
    res = verify_citation_grounding(verdict, playbook_name="sample_vendor_msa")
    assert res.is_grounded is False
    assert res.status == GroundingStatusEnum.HALLUCINATED_RULE

def test_critic_agent_validate_verdict():
    agent = CriticAgent()
    
    search_res = playbook_search(query="indemnification", top_k=1, playbook_name="sample_vendor_msa")
    rule_id = search_res["matches"][0]["rule_id"]

    verdict = ClauseVerdict(
        clause_id="clause_5",
        heading_title="Indemnification",
        verdict=VerdictEnum.DEVIATION,
        severity=SeverityEnum.HIGH,
        playbook_citation_ids=[rule_id],
        rationale=f"Indemnification clause violates playbook position under {rule_id}.",
        suggested_action="Use standard indemnification text."
    )
    
    res = agent.validate_verdict(verdict, playbook_name="sample_vendor_msa")
    assert isinstance(res, ClauseCriticResult)
    assert res.is_grounded is True

def test_critic_agent_validate_audit_report():
    critic = CriticAgent()
    auditor = AuditorAgent()

    chunks = [
        {"text": "Governing law shall be New York.", "metadata": {"heading_title": "Governing Law"}},
        {"text": "Vendor liability shall be uncapped.", "metadata": {"heading_title": "Limitation of Liability"}},
    ]
    
    audit_report = auditor.audit_contract(chunks, playbook_name="sample_vendor_msa", contract_name="sample.docx")
    critic_report = critic.validate_audit_report(audit_report)

    assert isinstance(critic_report, ContractCriticReport)
    assert critic_report.total_verdicts_checked == 2
    assert critic_report.grounded_verdicts > 0
    assert len(critic_report.results) == 2
