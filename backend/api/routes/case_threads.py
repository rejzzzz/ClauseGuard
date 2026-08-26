# API routes handling Multi-Thread Case Chats and Thread Messaging.
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.db.base import get_db
from backend.db.models import ChatThreadModel, ThreadMessageModel
from backend.cases.schemas import (
    ChatThreadCreate,
    ChatThreadUpdate,
    ChatThreadResponse,
    ThreadMessageCreate,
    ThreadMessageResponse
)
from backend.db.repository import (
    db_get_case,
    db_create_chat_thread,
    db_get_chat_thread,
    db_list_chat_threads,
    db_update_chat_thread,
    db_delete_chat_thread,
    db_add_thread_message,
    db_get_thread_messages
)

router = APIRouter(prefix="/api/cases/{case_id}/threads", tags=["case-threads"])


def _to_thread_response(thread: ChatThreadModel) -> ChatThreadResponse:
    return ChatThreadResponse(
        id=thread.id,
        case_id=thread.case_id,
        title=thread.title,
        description=thread.description,
        status=thread.status,
        message_count=len(thread.messages) if thread.messages is not None else 0,
        created_at=thread.created_at.isoformat() if thread.created_at else "",
        updated_at=thread.updated_at.isoformat() if thread.updated_at else "",
    )


def _to_msg_response(msg: ThreadMessageModel) -> ThreadMessageResponse:
    return ThreadMessageResponse(
        id=msg.id,
        thread_id=msg.thread_id,
        case_id=msg.case_id,
        role=msg.role,
        agent_name=msg.agent_name,
        content=msg.content,
        citations_json=msg.citations_json or [],
        metadata_json=msg.metadata_json or {},
        created_at=msg.created_at.isoformat() if msg.created_at else "",
    )


@router.post("", response_model=ChatThreadResponse, status_code=status.HTTP_201_CREATED)
def create_chat_thread(
    case_id: str,
    payload: ChatThreadCreate,
    db: Session = Depends(get_db)
):
    """Creates a new dedicated chat thread inside a case."""
    case = db_get_case(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )

    thread = db_create_chat_thread(
        db=db,
        case_id=case_id,
        title=payload.title,
        description=payload.description
    )
    return _to_thread_response(thread)


@router.get("", response_model=List[ChatThreadResponse])
def list_chat_threads(case_id: str, db: Session = Depends(get_db)):
    """Lists all active chat threads for a case."""
    case = db_get_case(db=db, case_id=case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )

    threads = db_list_chat_threads(db=db, case_id=case_id)
    return [_to_thread_response(t) for t in threads]


@router.get("/{thread_id}", response_model=ChatThreadResponse)
def get_chat_thread(case_id: str, thread_id: str, db: Session = Depends(get_db)):
    """Retrieves metadata for a specific thread."""
    thread = db_get_chat_thread(db=db, thread_id=thread_id)
    if not thread or thread.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread '{thread_id}' not found in case '{case_id}'."
        )
    return _to_thread_response(thread)


@router.patch("/{thread_id}", response_model=ChatThreadResponse)
def update_chat_thread(
    case_id: str,
    thread_id: str,
    payload: ChatThreadUpdate,
    db: Session = Depends(get_db)
):
    """Updates thread title, description, or active status."""
    thread = db_get_chat_thread(db=db, thread_id=thread_id)
    if not thread or thread.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread '{thread_id}' not found in case '{case_id}'."
        )

    updated = db_update_chat_thread(
        db=db,
        thread_id=thread_id,
        title=payload.title,
        description=payload.description,
        status=payload.status
    )
    return _to_thread_response(updated)


@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_thread(case_id: str, thread_id: str, db: Session = Depends(get_db)):
    """Deletes a chat thread and all its messages."""
    thread = db_get_chat_thread(db=db, thread_id=thread_id)
    if not thread or thread.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread '{thread_id}' not found in case '{case_id}'."
        )

    db_delete_chat_thread(db=db, thread_id=thread_id)
    return None


@router.get("/{thread_id}/messages", response_model=List[ThreadMessageResponse])
def get_thread_messages(case_id: str, thread_id: str, db: Session = Depends(get_db)):
    """Retrieves the chronological message transcript for a thread."""
    thread = db_get_chat_thread(db=db, thread_id=thread_id)
    if not thread or thread.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread '{thread_id}' not found in case '{case_id}'."
        )

    messages = db_get_thread_messages(db=db, thread_id=thread_id)
    return [_to_msg_response(m) for m in messages]


@router.post("/{thread_id}/messages", response_model=List[ThreadMessageResponse], status_code=status.HTTP_201_CREATED)
def post_thread_message(
    case_id: str,
    thread_id: str,
    payload: ThreadMessageCreate,
    db: Session = Depends(get_db)
):
    """
    Posts a message to the thread. If role is 'user', triggers AI retrieval and response generation,
    returning both the user message and the generated assistant message with citations.
    """
    thread = db_get_chat_thread(db=db, thread_id=thread_id)
    if not thread or thread.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread '{thread_id}' not found in case '{case_id}'."
        )

    # If message is from system or assistant directly:
    if payload.role != "user":
        msg = db_add_thread_message(
            db=db,
            thread_id=thread_id,
            case_id=case_id,
            role=payload.role,
            content=payload.content,
            agent_name=payload.agent_name,
            citations=payload.citations_json,
            metadata=payload.metadata_json
        )
        return [_to_msg_response(msg)]

    # If role is 'user', check if chat_handler is available to produce full assistant response
    try:
        from backend.cases.chat_handler import handle_user_message
        user_msg, assistant_msg = handle_user_message(
            db=db,
            case_id=case_id,
            thread_id=thread_id,
            user_content=payload.content,
            user_name=payload.agent_name
        )
        return [_to_msg_response(user_msg), _to_msg_response(assistant_msg)]
    except ImportError:
        # Fallback when chat_handler is not yet imported
        user_msg = db_add_thread_message(
            db=db,
            thread_id=thread_id,
            case_id=case_id,
            role="user",
            content=payload.content,
            agent_name=payload.agent_name,
            citations=payload.citations_json,
            metadata=payload.metadata_json
        )
        return [_to_msg_response(user_msg)]
