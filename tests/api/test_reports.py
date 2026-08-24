# Integration tests for audit report export endpoints.
import pytest
from fastapi.testclient import TestClient

from backend.api.main import app
from backend.api.session_manager import session_manager
from backend.agents.orchestrator.state_machine import SessionContext, SessionStateEnum
from backend.agents.auditor.verdict_schema import ContractAuditReport, ClauseVerdict, VerdictEnum, SeverityEnum
from backend.agents.critic.critic_schema import ContractCriticReport, ClauseCriticResult, GroundingStatusEnum

client = TestClient(app)


def test_get_session_audit_report():
    ctx = session_manager.create_session(
        contract_path="/path/to/c.docx",
        contract_name="report_contract",
        session_id="test_report_s1"
    )
    ctx.current_state = SessionStateEnum.CRITIQUED
    ctx.audit_report = ContractAuditReport(
        contract_name="report_contract",
        playbook_name="sample_vendor_msa",
        total_clauses=1,
        verdicts=[
            ClauseVerdict(
                clause_id="c1",
                verdict=VerdictEnum.COMPLIANT,
                rationale="Clause satisfies playbook rules"
            )
        ],
        overall_risk_level=SeverityEnum.LOW
    )
    ctx.critic_report = ContractCriticReport(
        contract_name="report_contract",
        playbook_name="sample_vendor_msa",
        total_verdicts_checked=1,
        grounded_verdicts=1,
        flagged_verdicts=0,
        results=[
            ClauseCriticResult(
                clause_id="c1",
                status=GroundingStatusEnum.VALIDATED,
                is_grounded=True,
                critic_notes="Grounding verified"
            )
        ],
        all_grounded=True
    )
    session_manager.update_session(ctx)

    response = client.get("/api/sessions/test_report_s1/report")
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test_report_s1"
    assert data["audit_report"]["total_clauses"] == 1
    assert data["critic_report"]["all_grounded"] is True


def test_get_session_audit_report_not_found():
    response = client.get("/api/sessions/non_existent_session/report")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
