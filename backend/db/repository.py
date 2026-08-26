# Database repository handling persistence for Cases, Case Documents, Chunks, Chat Threads, Timeline Events, Sessions, HITL decisions, and agent chat logs.
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from backend.db.models import (
    SessionModel, 
    HITLDecisionModel, 
    ChatMessageModel, 
    DocumentModel,
    CaseModel,
    CaseDocumentModel,
    DocumentChunkModel,
    ChatThreadModel,
    ThreadMessageModel,
    TimelineEventModel
)
from backend.agents.orchestrator.state_machine import (
    SessionContext, 
    SessionStateEnum, 
    ClauseHumanDecision, 
    HumanDecisionEnum
)
from backend.agents.auditor.verdict_schema import ContractAuditReport
from backend.agents.critic.critic_schema import ContractCriticReport
from backend.agents.redliner.edit_schema import RedlinePackage


# ─── CASE REPOSITORY ──────────────────────────────────────────

def db_create_case(
    db: Session,
    title: str,
    description: Optional[str] = None,
    case_type: str = "general",
    status: str = "ACTIVE",
    case_id: Optional[str] = None
) -> CaseModel:
    """Creates and persists a new Case instance."""
    cid = case_id or f"case_{uuid.uuid4().hex[:10]}"
    case = CaseModel(
        id=cid,
        title=title,
        description=description,
        case_type=case_type,
        status=status,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


def db_get_case(db: Session, case_id: str) -> Optional[CaseModel]:
    """Retrieves a Case instance by case_id."""
    return db.query(CaseModel).filter(CaseModel.id == case_id).first()


def db_list_cases(db: Session, status: Optional[str] = None) -> List[CaseModel]:
    """Lists all cases ordered by updated_at descending."""
    query = db.query(CaseModel)
    if status:
        query = query.filter(CaseModel.status == status)
    return query.order_by(CaseModel.updated_at.desc()).all()


def db_update_case(
    db: Session,
    case_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    case_type: Optional[str] = None,
    status: Optional[str] = None
) -> Optional[CaseModel]:
    """Updates attributes of an existing case."""
    case = db_get_case(db, case_id)
    if not case:
        return None

    if title is not None:
        case.title = title
    if description is not None:
        case.description = description
    if case_type is not None:
        case.case_type = case_type
    if status is not None:
        case.status = status
    case.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(case)
    return case


def db_delete_case(db: Session, case_id: str) -> bool:
    """Deletes a case and all associated cascade relationships."""
    case = db_get_case(db, case_id)
    if case:
        db.delete(case)
        db.commit()
        return True
    return False


# ─── CASE DOCUMENT REPOSITORY ─────────────────────────────────

def db_add_case_document(
    db: Session,
    case_id: str,
    filename: str,
    file_type: str,
    file_path: str,
    file_size_bytes: int = 0,
    page_count: int = 0,
    doc_category: str = "uncategorized",
    doc_id: Optional[str] = None
) -> CaseDocumentModel:
    """Adds a document to a case."""
    did = doc_id or f"doc_{uuid.uuid4().hex[:10]}"
    doc = CaseDocumentModel(
        id=did,
        case_id=case_id,
        filename=filename,
        file_type=file_type,
        file_path=file_path,
        file_size_bytes=file_size_bytes,
        page_count=page_count,
        doc_category=doc_category,
        ingestion_status="PENDING"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def db_get_case_document(db: Session, doc_id: str) -> Optional[CaseDocumentModel]:
    """Retrieves a case document by ID."""
    return db.query(CaseDocumentModel).filter(CaseDocumentModel.id == doc_id).first()


def db_list_case_documents(db: Session, case_id: str) -> List[CaseDocumentModel]:
    """Lists all documents belonging to a case."""
    return db.query(CaseDocumentModel).filter(
        CaseDocumentModel.case_id == case_id
    ).order_by(CaseDocumentModel.created_at.desc()).all()


def db_update_case_document_status(
    db: Session,
    doc_id: str,
    status: str,
    chunk_count: Optional[int] = None,
    page_count: Optional[int] = None
) -> Optional[CaseDocumentModel]:
    """Updates ingestion status and counts for a case document."""
    doc = db_get_case_document(db, doc_id)
    if not doc:
        return None

    doc.ingestion_status = status
    if chunk_count is not None:
        doc.chunk_count = chunk_count
    if page_count is not None:
        doc.page_count = page_count

    db.commit()
    db.refresh(doc)
    return doc


def db_delete_case_document(db: Session, doc_id: str) -> bool:
    """Deletes a case document and its chunks."""
    doc = db_get_case_document(db, doc_id)
    if doc:
        db.delete(doc)
        db.commit()
        return True
    return False


# ─── DOCUMENT CHUNK REPOSITORY ────────────────────────────────

def db_bulk_add_document_chunks(
    db: Session,
    case_id: str,
    document_id: str,
    chunks: List[Dict[str, Any]]
) -> List[DocumentChunkModel]:
    """
    Bulk creates and persists chunk models for a document.
    Each chunk dict should contain: chunk_index, text, heading_path, heading_title, page_number, embedding_json, metadata_json.
    """
    created_chunks = []
    for idx, c in enumerate(chunks):
        cid = f"chunk_{uuid.uuid4().hex[:10]}"
        chunk = DocumentChunkModel(
            id=cid,
            case_id=case_id,
            document_id=document_id,
            chunk_index=c.get("chunk_index", idx),
            text=c.get("text", ""),
            heading_path=c.get("heading_path", ""),
            heading_title=c.get("heading_title", ""),
            page_number=c.get("page_number"),
            embedding_json=c.get("embedding_json"),
            metadata_json=c.get("metadata_json", {})
        )
        db.add(chunk)
        created_chunks.append(chunk)

    db.commit()
    return created_chunks


def db_get_document_chunks(db: Session, document_id: str) -> List[DocumentChunkModel]:
    """Retrieves all chunks for a specific document ordered by chunk_index."""
    return db.query(DocumentChunkModel).filter(
        DocumentChunkModel.document_id == document_id
    ).order_by(DocumentChunkModel.chunk_index.asc()).all()


def db_get_case_chunks(db: Session, case_id: str) -> List[DocumentChunkModel]:
    """Retrieves all chunks across all documents in a case."""
    return db.query(DocumentChunkModel).filter(
        DocumentChunkModel.case_id == case_id
    ).order_by(DocumentChunkModel.created_at.asc()).all()


def db_delete_document_chunks(db: Session, document_id: str) -> bool:
    """Deletes all chunks for a given document."""
    chunks = db_get_document_chunks(db, document_id)
    if chunks:
        for c in chunks:
            db.delete(c)
        db.commit()
        return True
    return False


# ─── CHAT THREAD REPOSITORY ───────────────────────────────────

def db_create_chat_thread(
    db: Session,
    case_id: str,
    title: str = "New Thread",
    description: Optional[str] = None,
    thread_id: Optional[str] = None
) -> ChatThreadModel:
    """Creates a new chat thread within a case."""
    tid = thread_id or f"thread_{uuid.uuid4().hex[:10]}"
    thread = ChatThreadModel(
        id=tid,
        case_id=case_id,
        title=title,
        description=description,
        status="ACTIVE"
    )
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread


def db_get_chat_thread(db: Session, thread_id: str) -> Optional[ChatThreadModel]:
    """Retrieves a chat thread by ID."""
    return db.query(ChatThreadModel).filter(ChatThreadModel.id == thread_id).first()


def db_list_chat_threads(db: Session, case_id: str) -> List[ChatThreadModel]:
    """Lists all chat threads for a case ordered by updated_at descending."""
    return db.query(ChatThreadModel).filter(
        ChatThreadModel.case_id == case_id
    ).order_by(ChatThreadModel.updated_at.desc()).all()


def db_update_chat_thread(
    db: Session,
    thread_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None
) -> Optional[ChatThreadModel]:
    """Updates attributes of a chat thread."""
    thread = db_get_chat_thread(db, thread_id)
    if not thread:
        return None

    if title is not None:
        thread.title = title
    if description is not None:
        thread.description = description
    if status is not None:
        thread.status = status
    thread.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(thread)
    return thread


def db_delete_chat_thread(db: Session, thread_id: str) -> bool:
    """Deletes a chat thread and all its messages."""
    thread = db_get_chat_thread(db, thread_id)
    if thread:
        db.delete(thread)
        db.commit()
        return True
    return False


def db_add_thread_message(
    db: Session,
    thread_id: str,
    case_id: str,
    role: str,
    content: str,
    agent_name: str = "Case Assistant",
    citations: Optional[List[Dict[str, Any]]] = None,
    metadata: Optional[Dict[str, Any]] = None,
    msg_id: Optional[str] = None
) -> ThreadMessageModel:
    """Appends a message to a chat thread."""
    mid = msg_id or f"msg_{uuid.uuid4().hex[:10]}"
    msg = ThreadMessageModel(
        id=mid,
        thread_id=thread_id,
        case_id=case_id,
        role=role,
        agent_name=agent_name,
        content=content,
        citations_json=citations or [],
        metadata_json=metadata or {}
    )
    db.add(msg)

    # Touch thread updated_at
    thread = db_get_chat_thread(db, thread_id)
    if thread:
        thread.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(msg)
    return msg


def db_get_thread_messages(db: Session, thread_id: str) -> List[ThreadMessageModel]:
    """Retrieves chronological message transcript for a thread."""
    return db.query(ThreadMessageModel).filter(
        ThreadMessageModel.thread_id == thread_id
    ).order_by(ThreadMessageModel.created_at.asc()).all()


# ─── TIMELINE EVENT REPOSITORY ────────────────────────────────

def db_add_timeline_events(
    db: Session,
    case_id: str,
    events: List[Dict[str, Any]]
) -> List[TimelineEventModel]:
    """
    Bulk adds extracted timeline events to a case.
    Each event dict should contain: document_id, event_date, event_date_raw, event_summary, entities_json, page_number, chunk_id, confidence, is_disputed, category.
    """
    created_events = []
    for e in events:
        eid = f"evt_{uuid.uuid4().hex[:10]}"
        evt = TimelineEventModel(
            id=eid,
            case_id=case_id,
            document_id=e.get("document_id"),
            event_date=e.get("event_date"),
            event_date_raw=e.get("event_date_raw", ""),
            event_summary=e.get("event_summary", ""),
            entities_json=e.get("entities_json", []),
            page_number=e.get("page_number"),
            chunk_id=e.get("chunk_id"),
            confidence=e.get("confidence", 0.0),
            is_disputed=e.get("is_disputed", False),
            category=e.get("category", "general")
        )
        db.add(evt)
        created_events.append(evt)

    db.commit()
    return created_events


def db_list_timeline_events(
    db: Session,
    case_id: str,
    category: Optional[str] = None,
    is_disputed: Optional[bool] = None
) -> List[TimelineEventModel]:
    """Lists timeline events for a case ordered chronologically."""
    query = db.query(TimelineEventModel).filter(TimelineEventModel.case_id == case_id)
    if category:
        query = query.filter(TimelineEventModel.category == category)
    if is_disputed is not None:
        query = query.filter(TimelineEventModel.is_disputed == is_disputed)

    return query.order_by(TimelineEventModel.event_date.asc().nulls_last(), TimelineEventModel.created_at.asc()).all()


def db_update_timeline_event(
    db: Session,
    event_id: str,
    event_date: Optional[datetime] = None,
    event_date_raw: Optional[str] = None,
    event_summary: Optional[str] = None,
    entities: Optional[List[str]] = None,
    is_disputed: Optional[bool] = None,
    category: Optional[str] = None
) -> Optional[TimelineEventModel]:
    """Updates attributes of a timeline event."""
    evt = db.query(TimelineEventModel).filter(TimelineEventModel.id == event_id).first()
    if not evt:
        return None

    if event_date is not None:
        evt.event_date = event_date
    if event_date_raw is not None:
        evt.event_date_raw = event_date_raw
    if event_summary is not None:
        evt.event_summary = event_summary
    if entities is not None:
        evt.entities_json = entities
    if is_disputed is not None:
        evt.is_disputed = is_disputed
    if category is not None:
        evt.category = category

    db.commit()
    db.refresh(evt)
    return evt


def db_delete_timeline_event(db: Session, event_id: str) -> bool:
    """Deletes a timeline event by ID."""
    evt = db.query(TimelineEventModel).filter(TimelineEventModel.id == event_id).first()
    if evt:
        db.delete(evt)
        db.commit()
        return True
    return False


# ─── LEGACY SESSION REPOSITORY ────────────────────────────────

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
