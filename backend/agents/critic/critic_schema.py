# Pydantic models defining the structured output of the Critic Agent grounding verification.
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from backend.agents.auditor.verdict_schema import ClauseVerdict

class GroundingStatusEnum(str, Enum):
    VALIDATED = "VALIDATED"
    UNSUPPORTED_CITATION = "UNSUPPORTED_CITATION"
    MISSING_CITATION = "MISSING_CITATION"
    HALLUCINATED_RULE = "HALLUCINATED_RULE"

class ClauseCriticResult(BaseModel):
    clause_id: str = Field(..., description="Unique identifier for the evaluated contract clause")
    status: GroundingStatusEnum = Field(..., description="Grounding status classification")
    is_grounded: bool = Field(..., description="True if citations exist and support the verdict rationale")
    cited_rule_ids: List[str] = Field(default_factory=list, description="List of rule IDs cited by auditor")
    verified_rules: List[Dict[str, Any]] = Field(default_factory=list, description="Rule data retrieved from playbook MCP server")
    critic_notes: str = Field("", description="Detailed explanation of critic verification findings")
    original_verdict: Optional[ClauseVerdict] = Field(None, description="Original auditor clause verdict being validated")

class ContractCriticReport(BaseModel):
    contract_name: str = Field(..., description="Name of the audited contract document")
    playbook_name: str = Field(..., description="Name of the playbook version evaluated against")
    total_verdicts_checked: int = Field(0, description="Total clause verdicts evaluated by the critic")
    grounded_verdicts: int = Field(0, description="Count of fully grounded verdicts")
    flagged_verdicts: int = Field(0, description="Count of ungrounded or suspicious verdicts")
    results: List[ClauseCriticResult] = Field(default_factory=list, description="Per-clause grounding verification results")
    all_grounded: bool = Field(True, description="True if 100% of verdicts passed grounding checks")
