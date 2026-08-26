# SQLAlchemy ORM models for ClauseGuard cases, case documents, chunks, threads, timeline, sessions, decisions, and chat logs.
from datetime import datetime, timezone
from typing import Optional, Any, Dict, List
from sqlalchemy import String, Text, DateTime, JSON, ForeignKey, Integer, Float, Boolean, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.base import Base

class CaseModel(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    case_type: Mapped[str] = mapped_column(String(64), nullable=False, default="general")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ACTIVE", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    documents: Mapped[List["CaseDocumentModel"]] = relationship(
        "CaseDocumentModel", back_populates="case", cascade="all, delete-orphan"
    )
    chunks: Mapped[List["DocumentChunkModel"]] = relationship(
        "DocumentChunkModel", back_populates="case", cascade="all, delete-orphan"
    )
    chat_threads: Mapped[List["ChatThreadModel"]] = relationship(
        "ChatThreadModel", back_populates="case", cascade="all, delete-orphan"
    )
    thread_messages: Mapped[List["ThreadMessageModel"]] = relationship(
        "ThreadMessageModel", back_populates="case", cascade="all, delete-orphan"
    )
    timeline_events: Mapped[List["TimelineEventModel"]] = relationship(
        "TimelineEventModel", back_populates="case", cascade="all, delete-orphan"
    )
    sessions: Mapped[List["SessionModel"]] = relationship(
        "SessionModel", back_populates="case"
    )


class CaseDocumentModel(Base):
    __tablename__ = "case_documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(16), nullable=False, default="pdf")
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    page_count: Mapped[int] = mapped_column(Integer, default=0)
    doc_category: Mapped[str] = mapped_column(String(64), default="uncategorized")
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    ingestion_status: Mapped[str] = mapped_column(String(32), default="PENDING", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    case: Mapped["CaseModel"] = relationship("CaseModel", back_populates="documents")
    chunks: Mapped[List["DocumentChunkModel"]] = relationship(
        "DocumentChunkModel", back_populates="document", cascade="all, delete-orphan"
    )
    timeline_events: Mapped[List["TimelineEventModel"]] = relationship(
        "TimelineEventModel", back_populates="document"
    )


class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"
    __table_args__ = (
        Index("ix_chunks_case_doc", "case_id", "document_id"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey("case_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    heading_path: Mapped[str] = mapped_column(String(512), default="")
    heading_title: Mapped[str] = mapped_column(String(255), default="")
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    embedding_json: Mapped[Optional[List[float]]] = mapped_column(JSON, nullable=True)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    case: Mapped["CaseModel"] = relationship("CaseModel", back_populates="chunks")
    document: Mapped["CaseDocumentModel"] = relationship("CaseDocumentModel", back_populates="chunks")


class ChatThreadModel(Base):
    __tablename__ = "chat_threads"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="New Thread")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ACTIVE", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    case: Mapped["CaseModel"] = relationship("CaseModel", back_populates="chat_threads")
    messages: Mapped[List["ThreadMessageModel"]] = relationship(
        "ThreadMessageModel", back_populates="thread", cascade="all, delete-orphan"
    )


class ThreadMessageModel(Base):
    __tablename__ = "thread_messages"
    __table_args__ = (
        Index("ix_messages_thread_time", "thread_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    thread_id: Mapped[str] = mapped_column(String(64), ForeignKey("chat_threads.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(32), nullable=False)  # user, assistant, system
    agent_name: Mapped[str] = mapped_column(String(64), default="Case Assistant")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    citations_json: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    thread: Mapped["ChatThreadModel"] = relationship("ChatThreadModel", back_populates="messages")
    case: Mapped["CaseModel"] = relationship("CaseModel", back_populates="thread_messages")


class TimelineEventModel(Base):
    __tablename__ = "timeline_events"
    __table_args__ = (
        Index("ix_timeline_case_date", "case_id", "event_date"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("case_documents.id", ondelete="SET NULL"), nullable=True, index=True)
    event_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    event_date_raw: Mapped[str] = mapped_column(String(255), default="")
    event_summary: Mapped[str] = mapped_column(Text, nullable=False)
    entities_json: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    chunk_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    is_disputed: Mapped[bool] = mapped_column(Boolean, default=False)
    category: Mapped[str] = mapped_column(String(64), default="general")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    case: Mapped["CaseModel"] = relationship("CaseModel", back_populates="timeline_events")
    document: Mapped[Optional["CaseDocumentModel"]] = relationship("CaseDocumentModel", back_populates="timeline_events")


class DocumentModel(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(16), nullable=False, default="docx")
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    clause_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )


class SessionModel(Base):
    __tablename__ = "sessions"

    session_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    case_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)
    contract_name: Mapped[str] = mapped_column(String(255), nullable=False)
    playbook_name: Mapped[str] = mapped_column(String(64), nullable=False, default="sample_vendor_msa")
    contract_path: Mapped[str] = mapped_column(Text, nullable=False, default="")
    current_state: Mapped[str] = mapped_column(String(32), nullable=False, default="UNINITIALIZED", index=True)
    final_docx_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Structured JSON payloads
    chunks_json: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    audit_report_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    critic_report_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    redline_package_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    history_json: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    case: Mapped[Optional["CaseModel"]] = relationship("CaseModel", back_populates="sessions")
    decisions: Mapped[List["HITLDecisionModel"]] = relationship(
        "HITLDecisionModel", back_populates="session", cascade="all, delete-orphan"
    )
    chat_messages: Mapped[List["ChatMessageModel"]] = relationship(
        "ChatMessageModel", back_populates="session", cascade="all, delete-orphan"
    )


class HITLDecisionModel(Base):
    __tablename__ = "hitl_decisions"
    __table_args__ = (
        UniqueConstraint("session_id", "clause_id", name="uq_session_clause_decision"),
        Index("ix_hitl_session_clause", "session_id", "clause_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    clause_id: Mapped[str] = mapped_column(String(64), nullable=False)
    action: Mapped[str] = mapped_column(String(16), nullable=False)  # APPROVE, REJECT, EDIT
    custom_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    session: Mapped["SessionModel"] = relationship("SessionModel", back_populates="decisions")


class ChatMessageModel(Base):
    __tablename__ = "chat_messages"
    __table_args__ = (
        Index("ix_chat_session_time", "session_id", "timestamp"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    agent_role: Mapped[str] = mapped_column(String(32), nullable=False)  # Orchestrator, Auditor, Redliner, Critic, User
    agent_name: Mapped[str] = mapped_column(String(64), nullable=False)
    avatar_color: Mapped[str] = mapped_column(String(32), default="bg-blue-600")
    message: Mapped[str] = mapped_column(Text, nullable=False)
    clause_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    citation_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    session: Mapped["SessionModel"] = relationship("SessionModel", back_populates="chat_messages")
