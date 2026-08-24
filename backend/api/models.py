# Pydantic models defining REST API request and response schemas.
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.agents.auditor.verdict_schema import ClauseVerdict, ContractAuditReport
from backend.agents.critic.critic_schema import ContractCriticReport
from backend.agents.redliner.edit_schema import EditInstruction, RedlinePackage


class SessionInitResponse(BaseModel):
    session_id: str = Field(..., description="Unique review session identifier")
    contract_name: str = Field(..., description="Display title of the contract document")
    playbook_name: str = Field(..., description="Name of the playbook selected for auditing")
    status: str = Field(..., description="Current session state")
    message: str = Field(..., description="Status message")


class SessionStateResponse(BaseModel):
    session_id: str = Field(..., description="Unique review session identifier")
    contract_name: str = Field(..., description="Display title of the contract document")
    playbook_name: str = Field(..., description="Name of the playbook used for auditing")
    current_state: str = Field(..., description="Current session workflow state")
    history: List[Dict[str, Any]] = Field(default_factory=list, description="State transition log")
    audit_report: Optional[ContractAuditReport] = Field(None, description="Auditor Agent report")
    critic_report: Optional[ContractCriticReport] = Field(None, description="Critic Agent report")
    redline_package: Optional[RedlinePackage] = Field(None, description="Redliner Agent edit package")
    human_decisions: Dict[str, Any] = Field(default_factory=dict, description="Recorded HITL human decisions")
    final_docx_path: Optional[str] = Field(None, description="File path to finalized redlined .docx contract")


class HITLDecisionItem(BaseModel):
    clause_id: str = Field(..., description="Unique identifier for clause target")
    action: str = Field(..., description="Human action: APPROVE, REJECT, or EDIT")
    custom_text: Optional[str] = Field(None, description="Custom human text replacement if action is EDIT")


class HITLDecisionRequest(BaseModel):
    decisions: List[HITLDecisionItem] = Field(..., description="List of human clause review decisions")


class HITLDecisionResponse(BaseModel):
    session_id: str = Field(..., description="Unique review session identifier")
    message: str = Field(..., description="Result summary message")
    updated_edits_count: int = Field(0, description="Total active redline edits after human review")
    current_state: str = Field(..., description="Current workflow state")


class FinalizeRedlineResponse(BaseModel):
    session_id: str = Field(..., description="Unique review session identifier")
    final_docx_path: str = Field(..., description="File system path to generated redlined document")
    download_url: str = Field(..., description="REST endpoint URL to download the generated .docx file")
    current_state: str = Field(..., description="Current workflow state")


class AuditVerdictsResponse(BaseModel):
    session_id: str = Field(..., description="Unique review session identifier")
    contract_name: str = Field(..., description="Display title of the contract document")
    total_clauses: int = Field(0, description="Total clauses evaluated")
    verdicts: List[ClauseVerdict] = Field(default_factory=list, description="Per-clause audit verdicts")
    edits: List[EditInstruction] = Field(default_factory=list, description="Proposed redline edits")
    overall_risk_level: str = Field("LOW", description="Document-level risk summary")


class AuditReportResponse(BaseModel):
    session_id: str = Field(..., description="Unique review session identifier")
    audit_report: Optional[ContractAuditReport] = Field(None, description="Contract audit report")
    critic_report: Optional[ContractCriticReport] = Field(None, description="Grounding check report")
    redline_package: Optional[RedlinePackage] = Field(None, description="Redline edit package")
    history: List[Dict[str, Any]] = Field(default_factory=list, description="Session history transition log")


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message details")
