# Integration tests for session upload, status tracking, and audit execution routes.
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from backend.api.main import app
from backend.api.session_manager import session_manager
from backend.agents.orchestrator.state_machine import SessionContext, SessionStateEnum

client = TestClient(app)


def test_upload_contract_success(tmp_path):
    files = {"file": ("test_contract.docx", b"Dummy docx content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    data = {"playbook_name": "sample_vendor_msa"}
    
    response = client.post("/api/sessions/upload", files=files, data=data)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["contract_name"] == "test_contract"
    assert res_data["playbook_name"] == "sample_vendor_msa"
    assert "session_test_contract" in res_data["session_id"]


def test_upload_contract_invalid_extension():
    files = {"file": ("test.txt", b"Dummy text", "text/plain")}
    response = client.post("/api/sessions/upload", files=files)
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_get_session_status():
    ctx = session_manager.create_session(
        contract_path="/path/to/contract.docx",
        contract_name="status_contract",
        session_id="test_status_s1"
    )
    response = client.get("/api/sessions/test_status_s1")
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test_status_s1"
    assert data["current_state"] == "UNINITIALIZED"


def test_list_active_sessions():
    session_manager.create_session(
        contract_path="/path/to/c.docx",
        contract_name="c_contract",
        session_id="test_list_s1"
    )
    response = client.get("/api/sessions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(s["session_id"] == "test_list_s1" for s in data)


@patch("backend.api.routes.sessions.OrchestratorAgent")
def test_run_session_audit(mock_orchestrator):
    ctx = session_manager.create_session(
        contract_path="/path/to/c.docx",
        contract_name="audit_contract",
        session_id="test_audit_s1"
    )
    
    # Setup mock agent return
    mock_instance = mock_orchestrator.return_value
    mock_ctx = SessionContext(
        session_id="test_audit_s1",
        contract_path="/path/to/c.docx",
        contract_name="audit_contract",
        current_state=SessionStateEnum.AWAITING_HUMAN
    )
    mock_instance.run_audit_pipeline.return_value = mock_ctx
    
    response = client.post("/api/sessions/test_audit_s1/audit")
    assert response.status_code == 200
    data = response.json()
    assert data["current_state"] == "AWAITING_HUMAN"
    mock_instance.run_audit_pipeline.assert_called_once()
