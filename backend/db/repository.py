# Database repository handling persistence for SessionContext, HITL decisions, and agent chat logs.
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from backend.db.models import SessionModel, HITLDecisionModel, ChatMessageModel, DocumentModel
from backend.agents.orchestrator.state_machine import (
    SessionContext, 
    SessionStateEnum, 
    ClauseHumanDecision, 
    HumanDecisionEnum
)
from backend.agents.auditor.verdict_schema import ContractAuditReport
from backend.agents.critic.critic_schema import ContractCriticReport
from backend.agents.redliner.edit_schema import RedlinePackage


def db_context_to_model(context: SessionContext) -> SessionModel:
    """
    Converts Pydantic SessionContext to SQLAlchemy SessionModel.
    """
    audit_dict = context.audit_report.model_dump() if context.audit_report else None
    critic_dict = context.critic_report.model_dump() if context.critic_report else None
    redline_dict = context.redline_package.model_dump() if context.redline_package else None

    model = SessionModel(
        session_id=context.session_id,
        contract_name=context.contract_name,
        playbook_name=context.playbook_name,
        contract_path=context.contract_path,
        current_state=context.current_state.value if isinstance(context.current_state, SessionStateEnum) else str(context.current_state),
        final_docx_path=context.final_docx_path,
        chunks_json=context.chunks,
        audit_report_json=audit_dict,
        critic_report_json=critic_dict,
        redline_package_json=redline_dict,
        history_json=context.history,
    )
    return model


def db_model_to_context(model: SessionModel) -> SessionContext:
    """
    Converts SQLAlchemy SessionModel to Pydantic SessionContext.
    """
    audit_report = ContractAuditReport.model_validate(model.audit_report_json) if model.audit_report_json else None
    critic_report = ContractCriticReport.model_validate(model.critic_report_json) if model.critic_report_json else None
    redline_package = RedlinePackage.model_validate(model.redline_package_json) if model.redline_package_json else None

    # Load human decisions
    human_decisions: Dict[str, ClauseHumanDecision] = {}
    if model.decisions:
        for d in model.decisions:
            human_decisions[d.clause_id] = ClauseHumanDecision(
                clause_id=d.clause_id,
                action=HumanDecisionEnum(d.action),
                custom_text=d.custom_text,
                timestamp=d.timestamp.isoformat() if isinstance(d.timestamp, datetime) else str(d.timestamp)
            )

    try:
        state_enum = SessionStateEnum(model.current_state)
    except ValueError:
        state_enum = SessionStateEnum.UNINITIALIZED

    context = SessionContext(
        session_id=model.session_id,
        contract_path=model.contract_path,
        contract_name=model.contract_name,
        playbook_name=model.playbook_name,
        current_state=state_enum,
        chunks=model.chunks_json or [],
        audit_report=audit_report,
        critic_report=critic_report,
        redline_package=redline_package,
        human_decisions=human_decisions,
        final_docx_path=model.final_docx_path,
        history=model.history_json or []
    )
    return context


def db_save_session(db: Session, context: SessionContext) -> SessionContext:
    """
    Persists or updates SessionContext in the database.
    """
    existing = db.query(SessionModel).filter(SessionModel.session_id == context.session_id).first()
    audit_dict = context.audit_report.model_dump() if context.audit_report else None
    critic_dict = context.critic_report.model_dump() if context.critic_report else None
    redline_dict = context.redline_package.model_dump() if context.redline_package else None
    state_str = context.current_state.value if isinstance(context.current_state, SessionStateEnum) else str(context.current_state)

    if existing:
        existing.contract_name = context.contract_name
        existing.playbook_name = context.playbook_name
        existing.contract_path = context.contract_path
        existing.current_state = state_str
        existing.final_docx_path = context.final_docx_path
        existing.chunks_json = context.chunks
        existing.audit_report_json = audit_dict
        existing.critic_report_json = critic_dict
        existing.redline_package_json = redline_dict
        existing.history_json = context.history
        existing.updated_at = datetime.now(timezone.utc)
    else:
        new_model = db_context_to_model(context)
        db.add(new_model)

    # Save human decisions
    for c_id, dec in context.human_decisions.items():
        db_record_human_decision(
            db=db, 
            session_id=context.session_id, 
            clause_id=c_id, 
            action=dec.action.value if isinstance(dec.action, HumanDecisionEnum) else str(dec.action),
            custom_text=dec.custom_text
        )

    db.commit()
    return context


def db_get_session(db: Session, session_id: str) -> Optional[SessionContext]:
    """
    Retrieves SessionContext by session_id from database.
    """
    model = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()
    if not model:
        return None
    return db_model_to_context(model)


def db_list_sessions(db: Session) -> List[SessionContext]:
    """
    Returns list of all active SessionContext objects ordered by creation date descending.
    """
    models = db.query(SessionModel).order_by(SessionModel.created_at.desc()).all()
    return [db_model_to_context(m) for m in models]


def db_delete_session(db: Session, session_id: str) -> bool:
    """
    Deletes session context from database.
    """
    model = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()
    if model:
        db.delete(model)
        db.commit()
        return True
    return False


def db_record_human_decision(
    db: Session, 
    session_id: str, 
    clause_id: str, 
    action: str, 
    custom_text: Optional[str] = None
) -> HITLDecisionModel:
    """
    Records or updates a human review decision in the database.
    """
    existing = db.query(HITLDecisionModel).filter(
        HITLDecisionModel.session_id == session_id,
        HITLDecisionModel.clause_id == clause_id
    ).first()

    if existing:
        existing.action = action
        existing.custom_text = custom_text
        existing.timestamp = datetime.now(timezone.utc)
        record = existing
    else:
        record = HITLDecisionModel(
            session_id=session_id,
            clause_id=clause_id,
            action=action,
            custom_text=custom_text
        )
        db.add(record)
    db.commit()
    return record


def db_add_chat_message(
    db: Session,
    session_id: str,
    agent_role: str,
    agent_name: str,
    message: str,
    avatar_color: str = "bg-blue-600",
    clause_id: Optional[str] = None,
    citation_id: Optional[str] = None,
    msg_id: Optional[str] = None
) -> ChatMessageModel:
    """
    Appends a multi-agent or user chat message to the database.
    """
    chat_id = msg_id or f"msg_{uuid.uuid4().hex[:10]}"
    msg = ChatMessageModel(
        id=chat_id,
        session_id=session_id,
        agent_role=agent_role,
        agent_name=agent_name,
        avatar_color=avatar_color,
        message=message,
        clause_id=clause_id,
        citation_id=citation_id
    )
    db.add(msg)
    db.commit()
    return msg


def db_get_chat_messages(db: Session, session_id: str) -> List[ChatMessageModel]:
    """
    Retrieves all chat messages for a given session ordered chronologically.
    """
    return db.query(ChatMessageModel).filter(
        ChatMessageModel.session_id == session_id
    ).order_by(ChatMessageModel.timestamp.asc()).all()
