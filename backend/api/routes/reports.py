# API routes managing exportable audit reports.
from fastapi import APIRouter, HTTPException, status

from backend.api.models import AuditReportResponse
from backend.api.session_manager import session_manager

router = APIRouter(prefix="/api/sessions", tags=["reports"])


@router.get("/{session_id}/report", response_model=AuditReportResponse)
async def get_session_audit_report(session_id: str):
    """
    Retrieves the complete JSON audit summary report including Auditor verdicts,
    Critic grounding verification, Redliner edits, and session history log.
    """
    ctx = session_manager.get_session(session_id)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    return AuditReportResponse(
        session_id=ctx.session_id,
        audit_report=ctx.audit_report,
        critic_report=ctx.critic_report,
        redline_package=ctx.redline_package,
        history=ctx.history
    )
