# Unit tests for SessionManager state storage and file management.
import pytest
from pathlib import Path
from backend.api.session_manager import SessionManager, SessionContext
from backend.agents.orchestrator.state_machine import SessionStateEnum


def test_session_manager_crud(tmp_path: Path):
    manager = SessionManager(base_dir=tmp_path / "sessions")
    
    # 1. Create Session
    ctx = manager.create_session(
        contract_path="/path/to/contract.docx",
        contract_name="test_contract",
        playbook_name="sample_vendor_msa",
        session_id="test_s1"
    )
    assert ctx.session_id == "test_s1"
    assert ctx.contract_name == "test_contract"
    assert ctx.current_state == SessionStateEnum.UNINITIALIZED
    
    # 2. Get Session
    retrieved = manager.get_session("test_s1")
    assert retrieved is not None
    assert retrieved.session_id == "test_s1"
    
    # 3. Update Session
    retrieved.current_state = SessionStateEnum.INGESTED
    manager.update_session(retrieved)
    assert manager.get_session("test_s1").current_state == SessionStateEnum.INGESTED
    
    # 4. List Sessions
    sessions = manager.list_sessions()
    assert any(s.session_id == "test_s1" for s in sessions)
    
    # 5. Save Uploaded File
    saved_path = manager.save_uploaded_file("test_s1", "uploaded.docx", b"dummy content")
    assert saved_path.exists()
    assert saved_path.read_bytes() == b"dummy content"
    
    # 6. Delete Session
    deleted = manager.delete_session("test_s1")
    assert deleted is True
    assert manager.get_session("test_s1") is None
