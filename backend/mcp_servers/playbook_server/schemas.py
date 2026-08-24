# Playbook document and query response schemas.
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class PlaybookRule(BaseModel):
    """
    Represents a structured legal playbook rule chunk retrieved from vector index.
    """
    rule_id: str = Field(description="Unique identifier or citation key for the playbook rule")
    heading_title: str = Field(description="Title of the heading clause")
    heading_path: str = Field(description="Full breadcrumb path of parent headings")
    content: str = Field(description="Raw text rule content")
    playbook_name: str = Field(description="Name of the source playbook")
    score: float = Field(default=0.0, description="Cosine similarity relevance score")

class PlaybookSearchResult(BaseModel):
    """
    Response model for playbook_search MCP tool queries.
    """
    query: str
    playbook_name: str
    matches: List[PlaybookRule] = Field(default_factory=list)

class PlaybookGetResult(BaseModel):
    """
    Response model for playbook_get_by_id MCP tool queries.
    """
    rule_id: str
    found: bool
    rule: Optional[PlaybookRule] = None
