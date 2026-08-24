# Unit tests for Auditor Agent verdict classification and report generation.
from backend.agents.auditor.verdict_schema import ClauseVerdict, VerdictEnum, SeverityEnum, ContractAuditReport
from backend.agents.auditor.agent import AuditorAgent

def test_verdict_schema_validation():
    verdict = ClauseVerdict(
        clause_id="clause_1",
        heading_title="Section 1",
        heading_path="MSA > Section 1",
        verdict=VerdictEnum.DEVIATION,
        severity=SeverityEnum.HIGH,
        playbook_citation_ids=["sample_vendor_msa_rule_1"],
        rationale="Clause specifies uncapped liability.",
        suggested_action="Cap liability at 1x annual fees."
    )
    assert verdict.verdict == VerdictEnum.DEVIATION
    assert verdict.severity == SeverityEnum.HIGH
    assert len(verdict.playbook_citation_ids) == 1

def test_auditor_clause_evaluation():
    agent = AuditorAgent()
    
    # Test compliant clause
    compliant_chunk = {
        "text": "Each party's liability under this agreement shall be capped at 1x fees paid in the preceding 12 months.",
        "metadata": {"heading_title": "Limitation of Liability", "heading_path": "MSA > Limitation of Liability", "source": "test.docx"}
    }
    v1 = agent.audit_clause(compliant_chunk, playbook_name="sample_vendor_msa")
    assert v1.verdict == VerdictEnum.COMPLIANT
    assert v1.severity == SeverityEnum.LOW

    # Test deviation clause with uncapped liability
    deviation_chunk = {
        "text": "Vendor liability shall be uncapped for any operational losses.",
        "metadata": {"heading_title": "Limitation of Liability", "heading_path": "MSA > Limitation of Liability", "source": "test.docx"}
    }
    v2 = agent.audit_clause(deviation_chunk, playbook_name="sample_vendor_msa")
    assert v2.verdict == VerdictEnum.DEVIATION
    assert v2.severity == SeverityEnum.CRITICAL
    assert len(v2.playbook_citation_ids) > 0

def test_audit_contract_aggregation():
    agent = AuditorAgent()
    chunks = [
        {"text": "Governing law shall be Delaware.", "metadata": {"heading_title": "Governing Law"}},
        {"text": "Vendor liability shall be uncapped.", "metadata": {"heading_title": "Limitation of Liability"}},
    ]
    report = agent.audit_contract(chunks, playbook_name="sample_vendor_msa", contract_name="test_contract.docx")
    assert isinstance(report, ContractAuditReport)
    assert report.total_clauses == 2
    assert report.overall_risk_level == SeverityEnum.CRITICAL
