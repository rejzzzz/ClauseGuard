# API routes managing human-in-the-loop audit actions (approve, edit, reject) and redline export.
from pathlib import Path
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from backend.api.models import (
    AuditVerdictsResponse,
    HITLDecisionRequest,
    HITLDecisionResponse,
    FinalizeRedlineResponse
)
from backend.api.session_manager import session_manager
from backend.agents.orchestrator.agent import OrchestratorAgent
from backend.agents.orchestrator.state_machine import SessionStateEnum, HumanDecisionEnum

router = APIRouter(prefix="/api/sessions", tags=["review"])


@router.get("/{session_id}/verdicts", response_model=AuditVerdictsResponse)
async def get_session_verdicts(session_id: str):
    """
    Retrieves all clause audit verdicts and proposed redline edits for a session.
    """
    ctx = session_manager.get_session(session_id)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    verdicts = ctx.audit_report.verdicts if ctx.audit_report else []
    edits = ctx.redline_package.edits if ctx.redline_package else []
    total_clauses = ctx.audit_report.total_clauses if ctx.audit_report else len(verdicts)
    overall_risk = ctx.audit_report.overall_risk_level.value if ctx.audit_report else "LOW"

    return AuditVerdictsResponse(
        session_id=ctx.session_id,
        contract_name=ctx.contract_name,
        total_clauses=total_clauses,
        verdicts=verdicts,
        edits=edits,
        overall_risk_level=overall_risk
    )


@router.post("/{session_id}/hitl", response_model=HITLDecisionResponse)
async def submit_human_decisions(session_id: str, body: HITLDecisionRequest):
    """
    Submits human review decisions (APPROVE, REJECT, EDIT) for contract clause edits.
    """
    ctx = session_manager.get_session(session_id)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    if ctx.current_state != SessionStateEnum.AWAITING_HUMAN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot apply human review decisions in state '{ctx.current_state.value}'. Session must be in 'AWAITING_HUMAN' state."
        )

    decisions_list = [d.model_dump() for d in body.decisions]
    orchestrator = OrchestratorAgent()
    try:
        updated_ctx = orchestrator.apply_human_review(ctx, decisions_list)
        session_manager.update_session(updated_ctx)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record human review decisions: {str(exc)}"
        )

    active_edits_count = len(updated_ctx.redline_package.edits) if updated_ctx.redline_package else 0

    return HITLDecisionResponse(
        session_id=updated_ctx.session_id,
        message=f"Applied {len(body.decisions)} human decision(s). {active_edits_count} active redline edit(s) remaining.",
        updated_edits_count=active_edits_count,
        current_state=updated_ctx.current_state.value
    )


@router.post("/{session_id}/redline", response_model=FinalizeRedlineResponse)
async def finalize_redlined_document(session_id: str):
    """
    Finalizes the contract review session and generates the redlined .docx file with tracked changes.
    """
    ctx = session_manager.get_session(session_id)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    if ctx.current_state != SessionStateEnum.AWAITING_HUMAN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot finalize redline in state '{ctx.current_state.value}'. Session must be in 'AWAITING_HUMAN' state."
        )

    session_dir = session_manager.get_session_dir(session_id)
    output_path = str(session_dir / f"{ctx.contract_name}_redlined.docx")

    orchestrator = OrchestratorAgent()
    try:
        final_path = orchestrator.finalize_review(ctx, output_path=output_path)
        session_manager.update_session(ctx)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to finalize redlined document: {str(exc)}"
        )

    download_url = f"/api/sessions/{session_id}/download"

    return FinalizeRedlineResponse(
        session_id=ctx.session_id,
        final_docx_path=final_path,
        download_url=download_url,
        current_state=ctx.current_state.value
    )


@router.get("/{session_id}/download")
async def download_redlined_document(session_id: str):
    """
    Downloads the finalized redlined .docx contract document.
    """
    ctx = session_manager.get_session(session_id)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    if not ctx.final_docx_path or not Path(ctx.final_docx_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Redlined document for session '{session_id}' has not been finalized or generated yet."
        )

    file_path = Path(ctx.final_docx_path)
    return FileResponse(
        path=file_path,
        filename=f"{ctx.contract_name}_redlined.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
