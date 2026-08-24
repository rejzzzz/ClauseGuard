# API routes handling review session initialization and tracking.
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status

from backend.api.models import SessionInitResponse, SessionStateResponse
from backend.api.session_manager import session_manager
from backend.agents.orchestrator.agent import OrchestratorAgent
from backend.agents.orchestrator.state_machine import SessionStateEnum

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/upload", response_model=SessionInitResponse, status_code=status.HTTP_201_CREATED)
async def upload_contract(
    file: UploadFile = File(...),
    playbook_name: str = Form("sample_vendor_msa")
):
    """
    Uploads a contract (.docx or .pdf) and initializes a review session.
    """
    filename = file.filename or "contract.docx"
    ext = Path(filename).suffix.lower()
    if ext not in [".docx", ".pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Only .docx and .pdf files are supported."
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Temporary session initialization to get session storage directory
    temp_id = f"session_{Path(filename).stem}"
    saved_path = session_manager.save_uploaded_file(temp_id, filename, content)

    # Create official session
    context = session_manager.create_session(
        contract_path=str(saved_path),
        contract_name=Path(filename).stem,
        playbook_name=playbook_name,
        session_id=temp_id
    )

    return SessionInitResponse(
        session_id=context.session_id,
        contract_name=context.contract_name,
        playbook_name=context.playbook_name,
        status=context.current_state.value,
        message="Contract uploaded successfully. Ready for audit."
    )


@router.get("", response_model=List[SessionStateResponse])
async def list_active_sessions():
    """
    Lists all active contract review sessions.
    """
    sessions = session_manager.list_sessions()
    return [
        SessionStateResponse(
            session_id=s.session_id,
            contract_name=s.contract_name,
            playbook_name=s.playbook_name,
            current_state=s.current_state.value,
            history=s.history,
            audit_report=s.audit_report,
            critic_report=s.critic_report,
            redline_package=s.redline_package,
            human_decisions={k: v.model_dump() for k, v in s.human_decisions.items()},
            final_docx_path=s.final_docx_path
        )
        for s in sessions
    ]


@router.get("/{session_id}", response_model=SessionStateResponse)
async def get_session_status(session_id: str):
    """
    Retrieves the status, history, and artifacts for a specific review session.
    """
    ctx = session_manager.get_session(session_id)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    return SessionStateResponse(
        session_id=ctx.session_id,
        contract_name=ctx.contract_name,
        playbook_name=ctx.playbook_name,
        current_state=ctx.current_state.value,
        history=ctx.history,
        audit_report=ctx.audit_report,
        critic_report=ctx.critic_report,
        redline_package=ctx.redline_package,
        human_decisions={k: v.model_dump() for k, v in ctx.human_decisions.items()},
        final_docx_path=ctx.final_docx_path
    )


@router.post("/{session_id}/audit", response_model=SessionStateResponse)
async def run_session_audit(session_id: str):
    """
    Triggers the multi-agent audit and redlining pipeline for the session.
    """
    ctx = session_manager.get_session(session_id)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    orchestrator = OrchestratorAgent()
    try:
        updated_ctx = orchestrator.run_audit_pipeline(
            contract_path=ctx.contract_path,
            playbook_name=ctx.playbook_name,
            session_id=ctx.session_id
        )
        session_manager.update_session(updated_ctx)
    except Exception as exc:
        ctx.current_state = SessionStateEnum.FAILED
        session_manager.update_session(ctx)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audit pipeline execution failed: {str(exc)}"
        )

    return SessionStateResponse(
        session_id=updated_ctx.session_id,
        contract_name=updated_ctx.contract_name,
        playbook_name=updated_ctx.playbook_name,
        current_state=updated_ctx.current_state.value,
        history=updated_ctx.history,
        audit_report=updated_ctx.audit_report,
        critic_report=updated_ctx.critic_report,
        redline_package=updated_ctx.redline_package,
        human_decisions={k: v.model_dump() for k, v in updated_ctx.human_decisions.items()},
        final_docx_path=updated_ctx.final_docx_path
    )
