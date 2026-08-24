# Session state machine governing contract auditing and redlining transitions.
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.agents.auditor.verdict_schema import ContractAuditReport
from backend.agents.critic.critic_schema import ContractCriticReport
from backend.agents.redliner.edit_schema import RedlinePackage

class SessionStateEnum(str, Enum):
    UNINITIALIZED = "UNINITIALIZED"
    INGESTED = "INGESTED"
    AUDITING = "AUDITING"
    CRITIQUED = "CRITIQUED"
    REDLINING = "REDLINING"
    AWAITING_HUMAN = "AWAITING_HUMAN"
    FINALIZED = "FINALIZED"
    FAILED = "FAILED"

class HumanDecisionEnum(str, Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    EDIT = "EDIT"

class ClauseHumanDecision(BaseModel):
    clause_id: str = Field(..., description="Unique identifier for the contract clause decision target")
    action: HumanDecisionEnum = Field(..., description="Human review action")
    custom_text: Optional[str] = Field(None, description="Custom text replacement provided during human edit")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SessionContext(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique review session identifier")
    contract_path: str = Field("", description="File system path to source contract document")
    contract_name: str = Field("contract", description="Basename or display title of contract")
    playbook_name: str = Field("sample_vendor_msa", description="Name of playbook used for auditing")
    current_state: SessionStateEnum = Field(SessionStateEnum.UNINITIALIZED, description="Current workflow state")
    chunks: List[Dict[str, Any]] = Field(default_factory=list, description="Parsed contract IR clause chunks")
    audit_report: Optional[ContractAuditReport] = Field(None, description="Contract audit report from Auditor Agent")
    critic_report: Optional[ContractCriticReport] = Field(None, description="Grounding report from Critic Agent")
    redline_package: Optional[RedlinePackage] = Field(None, description="Proposed redline package from Redliner Agent")
    human_decisions: Dict[str, ClauseHumanDecision] = Field(default_factory=dict, description="Per-clause HITL human actions")
    final_docx_path: Optional[str] = Field(None, description="Path to generated finalized redlined .docx file")
    history: List[Dict[str, Any]] = Field(default_factory=list, description="Chronological log of state transitions")

# Allowed transitions graph
ALLOWED_TRANSITIONS: Dict[SessionStateEnum, List[SessionStateEnum]] = {
    SessionStateEnum.UNINITIALIZED: [SessionStateEnum.INGESTED, SessionStateEnum.FAILED],
    SessionStateEnum.INGESTED: [SessionStateEnum.AUDITING, SessionStateEnum.FAILED],
    SessionStateEnum.AUDITING: [SessionStateEnum.CRITIQUED, SessionStateEnum.FAILED],
    SessionStateEnum.CRITIQUED: [SessionStateEnum.REDLINING, SessionStateEnum.AUDITING, SessionStateEnum.FAILED],
    SessionStateEnum.REDLINING: [SessionStateEnum.AWAITING_HUMAN, SessionStateEnum.FAILED],
    SessionStateEnum.AWAITING_HUMAN: [SessionStateEnum.FINALIZED, SessionStateEnum.REDLINING, SessionStateEnum.FAILED],
    SessionStateEnum.FINALIZED: [],
    SessionStateEnum.FAILED: [SessionStateEnum.UNINITIALIZED]
}

class AuditStateMachine:
    """
    Governs state transitions and HITL interactions for contract review sessions.
    """
    def __init__(self, session_context: Optional[SessionContext] = None):
        self.context = session_context or SessionContext()

    def can_transition_to(self, target_state: SessionStateEnum) -> bool:
        """
        Returns True if transitioning from current_state to target_state is valid.
        """
        allowed = ALLOWED_TRANSITIONS.get(self.context.current_state, [])
        return target_state in allowed

    def transition_to(self, target_state: SessionStateEnum, metadata: Optional[Dict[str, Any]] = None) -> SessionStateEnum:
        """
        Executes state transition if permitted, recording historical transition log.
        """
        if not self.can_transition_to(target_state):
            raise ValueError(
                f"Invalid state transition from '{self.context.current_state.value}' to '{target_state.value}'."
            )
            
        old_state = self.context.current_state
        self.context.current_state = target_state
        
        log_entry = {
            "from_state": old_state.value,
            "to_state": target_state.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {}
        }
        self.context.history.append(log_entry)
        return self.context.current_state

    def record_human_decision(
        self, 
        clause_id: str, 
        action: HumanDecisionEnum, 
        custom_text: Optional[str] = None
    ) -> ClauseHumanDecision:
        """
        Records a human decision for a given clause in the session context.
        """
        decision = ClauseHumanDecision(
            clause_id=clause_id,
            action=action,
            custom_text=custom_text
        )
        self.context.human_decisions[clause_id] = decision
        return decision
