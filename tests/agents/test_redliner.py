# Unit tests for Redliner Agent edit instruction generation.
from backend.agents.auditor.verdict_schema import ClauseVerdict, VerdictEnum, SeverityEnum, ContractAuditReport
from backend.agents.redliner.edit_schema import EditInstruction, RedlinePackage, RedlineActionEnum
from backend.agents.redliner.agent import RedlinerAgent

def test_edit_schema_validation():
    edit = EditInstruction(
        clause_id="clause_1",
        heading_title="Limitation of Liability",
        action=RedlineActionEnum.REPLACE,
        original_text="Vendor liability shall be uncapped.",
        proposed_text="Vendor liability shall be capped at 1x fees.",
        comment_text="Playbook rule prohibits uncapped liability.",
        draft_confidence="high"
    )
    assert edit.action == RedlineActionEnum.REPLACE
    assert edit.draft_confidence == "high"

def test_generate_edit_for_verdict():
    agent = RedlinerAgent()
    verdict = ClauseVerdict(
        clause_id="clause_2",
        heading_title="Limitation of Liability",
        verdict=VerdictEnum.DEVIATION,
        severity=SeverityEnum.CRITICAL,
        playbook_citation_ids=["sample_vendor_msa_rule_1"],
        rationale="Uncapped liability violation."
    )
    clause_text = "Vendor liability shall be uncapped for operational losses."
    edit = agent.generate_edit_for_verdict(verdict, clause_text)
    
    assert edit is not None
    assert edit.clause_id == "clause_2"
    assert edit.action == RedlineActionEnum.REPLACE
    assert len(edit.proposed_text) > 0

def test_generate_redline_package():
    agent = RedlinerAgent()
    report = ContractAuditReport(
        contract_name="test.docx",
        playbook_name="sample_vendor_msa",
        total_clauses=2,
        verdicts=[
            ClauseVerdict(
                clause_id="c1",
                heading_title="Governing Law",
                verdict=VerdictEnum.COMPLIANT,
                severity=SeverityEnum.LOW,
                rationale="Compliant"
            ),
            ClauseVerdict(
                clause_id="c2",
                heading_title="Limitation of Liability",
                verdict=VerdictEnum.DEVIATION,
                severity=SeverityEnum.CRITICAL,
                playbook_citation_ids=["sample_vendor_msa_rule_1"],
                rationale="Uncapped liability"
            )
        ]
    )
    chunks = [
        {"metadata": {"heading_title": "Governing Law"}, "text": "Governing law is Delaware."},
        {"metadata": {"heading_title": "Limitation of Liability"}, "text": "Vendor liability shall be uncapped."}
    ]
    package = agent.generate_redline_package(report, chunks)
    assert isinstance(package, RedlinePackage)
    assert package.total_edits == 1
    assert package.edits[0].clause_id == "c2"
