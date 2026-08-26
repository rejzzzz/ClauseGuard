# API routes handling multi-agent reasoning chat logs and interactive user messaging.
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.db.base import get_db
from backend.db.repository import db_get_chat_messages, db_add_chat_message
from backend.api.session_manager import session_manager

router = APIRouter(prefix="/chats", tags=["chats"])


class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="Message text content")
    agent_role: str = Field("User", description="Role of sender: User, Orchestrator, Auditor, Redliner, Critic")
    agent_name: str = Field("User", description="Display name of sender")
    avatar_color: str = Field("bg-indigo-600", description="Tailwind avatar badge color")
    clause_id: Optional[str] = Field(None, description="Associated clause ID reference")
    citation_id: Optional[str] = Field(None, description="Associated playbook citation reference")


class ChatMessageResponse(BaseModel):
    id: str = Field(..., description="Unique message identifier")
    session_id: str = Field(..., description="Review session ID")
    agent_role: str = Field(..., description="Agent role")
    agent_name: str = Field(..., description="Agent display name")
    avatar_color: str = Field(..., description="Avatar background color class")
    message: str = Field(..., description="Message text")
    clause_id: Optional[str] = Field(None, description="Clause ID")
    citation_id: Optional[str] = Field(None, description="Citation ID")
    timestamp: str = Field(..., description="ISO timestamp")


@router.get("/{session_id}", response_model=List[ChatMessageResponse])
def get_session_chat_logs(session_id: str, db: Session = Depends(get_db)):
    """
    Retrieves chronological chat transcript for a review session.
    """
    context = session_manager.get_session(session_id)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review session '{session_id}' not found."
        )

    db_msgs = db_get_chat_messages(db, session_id)
    results = []
    for m in db_msgs:
        results.append(ChatMessageResponse(
            id=m.id,
            session_id=m.session_id,
            agent_role=m.agent_role,
            agent_name=m.agent_name,
            avatar_color=m.avatar_color,
            message=m.message,
            clause_id=m.clause_id,
            citation_id=m.citation_id,
            timestamp=m.timestamp.isoformat() if m.timestamp else ""
        ))
    return results


@router.post("/{session_id}", response_model=ChatMessageResponse)
def post_chat_message(
    session_id: str, 
    payload: ChatMessageRequest, 
    db: Session = Depends(get_db)
):
    """
    Appends a new user or agent reasoning chat message to the session transcript.
    """
    context = session_manager.get_session(session_id)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review session '{session_id}' not found."
        )

    msg = db_add_chat_message(
        db=db,
        session_id=session_id,
        agent_role=payload.agent_role,
        agent_name=payload.agent_name,
        message=payload.message,
        avatar_color=payload.avatar_color,
        clause_id=payload.clause_id,
        citation_id=payload.citation_id
    )

    return ChatMessageResponse(
        id=msg.id,
        session_id=msg.session_id,
        agent_role=msg.agent_role,
        agent_name=msg.agent_name,
        avatar_color=msg.avatar_color,
        message=msg.message,
        clause_id=msg.clause_id,
        citation_id=msg.citation_id,
        timestamp=msg.timestamp.isoformat() if msg.timestamp else ""
    )
