# Pydantic schemas defining domain models, requests, and responses for Case-Based features.
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ─── CASE SCHEMAS ──────────────────────────────────────────────

class CaseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Case title or matter name")
    description: Optional[str] = Field(None, description="Detailed case overview or description")
    case_type: str = Field("general", max_length=64, description="Case classification: litigation, corporate, contract_review, etc.")
    status: str = Field("ACTIVE", description="Case status: ACTIVE, ARCHIVED, CLOSED")


class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Updated case title")
    description: Optional[str] = Field(None, description="Updated case description")
    case_type: Optional[str] = Field(None, max_length=64, description="Updated case type")
    status: Optional[str] = Field(None, description="Updated case status")


class CaseResponse(BaseModel):
    id: str = Field(..., description="Unique case identifier")
    title: str = Field(..., description="Case title")
    description: Optional[str] = Field(None, description="Case description")
    case_type: str = Field(..., description="Case type classification")
    status: str = Field(..., description="Current status")
    document_count: int = Field(0, description="Total documents uploaded")
    thread_count: int = Field(0, description="Total active chat threads")
    event_count: int = Field(0, description="Total extracted timeline events")
    created_at: str = Field(..., description="Creation ISO timestamp")
    updated_at: str = Field(..., description="Last update ISO timestamp")


# ─── CASE DOCUMENT SCHEMAS ────────────────────────────────────

class CaseDocumentCreate(BaseModel):
    filename: str = Field(..., description="Uploaded document filename")
    file_type: str = Field("pdf", description="Document extension type: pdf, docx, etc.")
    file_path: str = Field(..., description="Server storage path")
    file_size_bytes: int = Field(0, description="File size in bytes")
    page_count: int = Field(0, description="Total page count")
    doc_category: str = Field("uncategorized", description="Category: pleading, evidence, contract, correspondence, etc.")


class CaseDocumentResponse(BaseModel):
    id: str = Field(..., description="Unique document ID")
    case_id: str = Field(..., description="Owning case ID")
    filename: str = Field(..., description="Filename")
    file_type: str = Field(..., description="File extension")
    file_path: str = Field(..., description="Storage path")
    file_size_bytes: int = Field(0, description="File size in bytes")
    page_count: int = Field(0, description="Page count")
    doc_category: str = Field(..., description="Category classification")
    chunk_count: int = Field(0, description="Ingested chunk count")
    ingestion_status: str = Field("PENDING", description="Status: PENDING, PROCESSING, COMPLETED, FAILED")
    created_at: str = Field(..., description="Upload ISO timestamp")


# ─── DOCUMENT CHUNK SCHEMAS ───────────────────────────────────

class DocumentChunkCreate(BaseModel):
    chunk_index: int = Field(..., description="Sequence index within document")
    text: str = Field(..., description="Text content of the chunk")
    heading_path: str = Field("", description="Hierarchical outline heading path")
    heading_title: str = Field("", description="Section/clause title")
    page_number: Optional[int] = Field(None, description="Source page number")
    embedding_json: Optional[List[float]] = Field(None, description="Vector embedding float list")
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata dictionary")


class DocumentChunkResponse(BaseModel):
    id: str = Field(..., description="Unique chunk ID")
    case_id: str = Field(..., description="Case ID")
    document_id: str = Field(..., description="Document ID")
    chunk_index: int = Field(..., description="Chunk index")
    text: str = Field(..., description="Chunk text content")
    heading_path: str = Field("", description="Heading path")
    heading_title: str = Field("", description="Heading title")
    page_number: Optional[int] = Field(None, description="Source page number")
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata")
    created_at: str = Field(..., description="Ingestion ISO timestamp")


# ─── CHAT THREAD SCHEMAS ──────────────────────────────────────

class ChatThreadCreate(BaseModel):
    title: str = Field("New Thread", max_length=255, description="Chat thread display title")
    description: Optional[str] = Field(None, description="Optional thread purpose description")


class ChatThreadUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255, description="Updated thread title")
    description: Optional[str] = Field(None, description="Updated thread description")
    status: Optional[str] = Field(None, description="Updated status: ACTIVE, ARCHIVED")


class ChatThreadResponse(BaseModel):
    id: str = Field(..., description="Unique thread ID")
    case_id: str = Field(..., description="Case ID")
    title: str = Field(..., description="Thread title")
    description: Optional[str] = Field(None, description="Thread description")
    status: str = Field(..., description="Status")
    message_count: int = Field(0, description="Total messages in thread")
    created_at: str = Field(..., description="Creation ISO timestamp")
    updated_at: str = Field(..., description="Last message/update ISO timestamp")


# ─── THREAD MESSAGE SCHEMAS ───────────────────────────────────

class CitationItem(BaseModel):
    document_id: str = Field(..., description="Source document ID")
    filename: str = Field("", description="Document filename")
    page_number: Optional[int] = Field(None, description="Page number")
    chunk_id: Optional[str] = Field(None, description="Chunk ID")
    text_excerpt: str = Field("", description="Matching source quote")


class ThreadMessageCreate(BaseModel):
    role: str = Field(..., description="Sender role: user, assistant, system")
    agent_name: str = Field("Case Assistant", description="Display agent/user name")
    content: str = Field(..., description="Message text content")
    citations_json: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Array of citation references")
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata dictionary")


class ThreadMessageResponse(BaseModel):
    id: str = Field(..., description="Unique message ID")
    thread_id: str = Field(..., description="Thread ID")
    case_id: str = Field(..., description="Case ID")
    role: str = Field(..., description="Role")
    agent_name: str = Field(..., description="Display name")
    content: str = Field(..., description="Message content")
    citations_json: List[Dict[str, Any]] = Field(default_factory=list, description="Citations")
    metadata_json: Dict[str, Any] = Field(default_factory=dict, description="Metadata")
    created_at: str = Field(..., description="Message ISO timestamp")


# ─── TIMELINE EVENT SCHEMAS ───────────────────────────────────

class TimelineEventCreate(BaseModel):
    document_id: Optional[str] = Field(None, description="Source document ID if available")
    event_date: Optional[str] = Field(None, description="ISO date string YYYY-MM-DD")
    event_date_raw: str = Field("", description="Original verbatim date text, e.g. 'mid-March 2022'")
    event_summary: str = Field(..., description="Concise description of the event")
    entities_json: Optional[List[str]] = Field(default_factory=list, description="Entities involved")
    page_number: Optional[int] = Field(None, description="Page number")
    chunk_id: Optional[str] = Field(None, description="Chunk ID")
    confidence: float = Field(0.0, description="Extraction confidence score (0.0 - 1.0)")
    is_disputed: bool = Field(False, description="Whether event is disputed")
    category: str = Field("general", description="Event category: payment, notice, agreement, hearing, etc.")


class TimelineEventUpdate(BaseModel):
    event_date: Optional[str] = Field(None, description="Updated ISO date string")
    event_date_raw: Optional[str] = Field(None, description="Updated raw date string")
    event_summary: Optional[str] = Field(None, description="Updated event summary")
    entities_json: Optional[List[str]] = Field(None, description="Updated entities list")
    is_disputed: Optional[bool] = Field(None, description="Updated disputed flag")
    category: Optional[str] = Field(None, description="Updated category")


class TimelineEventResponse(BaseModel):
    id: str = Field(..., description="Unique event ID")
    case_id: str = Field(..., description="Case ID")
    document_id: Optional[str] = Field(None, description="Document ID")
    event_date: Optional[str] = Field(None, description="ISO date string")
    event_date_raw: str = Field("", description="Raw date text")
    event_summary: str = Field(..., description="Event summary")
    entities_json: List[str] = Field(default_factory=list, description="Entities list")
    page_number: Optional[int] = Field(None, description="Page number")
    chunk_id: Optional[str] = Field(None, description="Chunk ID")
    confidence: float = Field(0.0, description="Confidence score")
    is_disputed: bool = Field(False, description="Disputed flag")
    category: str = Field("general", description="Category")
    created_at: str = Field(..., description="Creation ISO timestamp")
