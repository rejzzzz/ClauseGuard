# Pydantic models defining the structured edit instructions output by the Redliner.
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class RedlineActionEnum(str, Enum):
    REPLACE = "REPLACE"
    INSERT = "INSERT"
    DELETE = "DELETE"
    COMMENT = "COMMENT"

class EditInstruction(BaseModel):
    clause_id: str = Field(..., description="Unique ID of the clause being edited")
    heading_title: str = Field("", description="Heading title of the clause section")
    action: RedlineActionEnum = Field(RedlineActionEnum.REPLACE, description="Type of edit action")
    original_text: str = Field(..., description="Target text in the original document")
    proposed_text: str = Field("", description="Replacement or inserted legal language")
    comment_text: str = Field("", description="Rationale explaining why the edit is made")
    draft_confidence: str = Field("high", description="Confidence level: high (from playbook fallback) or low (freehand)")

class RedlinePackage(BaseModel):
    contract_name: str = Field(..., description="Name of the audited contract")
    edits: List[EditInstruction] = Field(default_factory=list, description="List of proposed edit instructions")
    total_edits: int = Field(0, description="Total number of edits proposed")
