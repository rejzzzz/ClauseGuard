# Pydantic models defining the structured output of the Auditor's contract analysis.
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class VerdictEnum(str, Enum):
    COMPLIANT = "COMPLIANT"
    DEVIATION = "DEVIATION"
    MISSING_CLAUSE = "MISSING_CLAUSE"
    AMBIGUOUS = "AMBIGUOUS"

class SeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ClauseVerdict(BaseModel):
    clause_id: str = Field(..., description="Unique identifier for the contract clause unit")
    heading_title: str = Field("", description="Title of the heading or section containing the clause")
    heading_path: str = Field("", description="Full path chain of parent headings")
    verdict: VerdictEnum = Field(..., description="Classification verdict")
    severity: SeverityEnum = Field(SeverityEnum.LOW, description="Severity of deviation")
    playbook_citation_ids: List[str] = Field(default_factory=list, description="IDs of cited playbook rules supporting this verdict")
    rationale: str = Field(..., description="Explanation of the verdict with playbook evidence")
    suggested_action: Optional[str] = Field(None, description="Recommended remediation or drafting guidance")

class ContractAuditReport(BaseModel):
    contract_name: str = Field(..., description="Name of the audited contract document")
    playbook_name: str = Field(..., description="Name of the playbook version used for auditing")
    total_clauses: int = Field(0, description="Total clause units evaluated")
    verdicts: List[ClauseVerdict] = Field(default_factory=list, description="List of per-clause audit verdicts")
    overall_risk_level: SeverityEnum = Field(SeverityEnum.LOW, description="Summary document-level risk assessment")
