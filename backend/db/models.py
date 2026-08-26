# SQLAlchemy ORM models for ClauseGuard sessions, documents, decisions, and chat logs.
from datetime import datetime, timezone
from typing import Optional, Any, Dict, List
from sqlalchemy import String, Text, DateTime, JSON, ForeignKey, Integer, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.base import Base

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
