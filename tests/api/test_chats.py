# Integration tests for chat API endpoints and database repository functions.
import pytest
from fastapi.testclient import TestClient

from backend.api.main import app
from backend.api.session_manager import session_manager

client = TestClient(app)

def test_chat_endpoints_lifecycle(tmp_path):
    """
    Tests creating a session, appending chat messages via POST /chats/{session_id},
    and retrieving the chat log via GET /chats/{session_id}.
    """
    # Create test session
    session_dir = tmp_path / "test_contract.docx"
    session_dir.write_text("Test contract content")

    context = session_manager.create_session(
        contract_path=str(session_dir),
        contract_name="test_contract.docx",
        playbook_name="sample_vendor_msa"
    )
    sid = context.session_id

    # POST user chat message
    payload = {
        "message": "Please make sure to flag any missing indemnity provisions.",
        "agent_role": "User",
        "agent_name": "Counsel User",
        "avatar_color": "bg-indigo-600"
    }
    response = client.post(f"/chats/{sid}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == sid
    assert data["message"] == payload["message"]
    assert data["agent_role"] == "User"

    # GET chat logs
    log_res = client.get(f"/chats/{sid}")
    assert log_res.status_code == 200
    logs = log_res.json()
    assert len(logs) >= 1
    assert logs[-1]["message"] == payload["message"]
