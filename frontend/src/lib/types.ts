// TypeScript interfaces mirroring ClauseGuard FastAPI backend models.

export type VerdictEnum = 'COMPLIANT' | 'DEVIATION' | 'MISSING_CLAUSE' | 'AMBIGUOUS';
export type SeverityEnum = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RedlineActionEnum = 'REPLACE' | 'INSERT' | 'DELETE' | 'COMMENT';
export type HumanDecisionEnum = 'APPROVE' | 'REJECT' | 'EDIT';

export interface ClauseVerdict {
  clause_id: string;
  heading_title: string;
  heading_path: string;
  verdict: VerdictEnum;
  severity: SeverityEnum;
  playbook_citation_ids: string[];
  rationale: string;
  suggested_action?: string | null;
}

export interface ContractAuditReport {
  contract_name: string;
  playbook_name: string;
  total_clauses: number;
  verdicts: ClauseVerdict[];
  overall_risk_level: SeverityEnum;
}

export interface EditInstruction {
  clause_id: string;
  heading_title: string;
  action: RedlineActionEnum;
  original_text: string;
  proposed_text: string;
  comment_text: string;
  draft_confidence: string;
}

export interface RedlinePackage {
  contract_name: string;
  edits: EditInstruction[];
  total_edits: number;
}

export interface ClauseCriticResult {
  clause_id: string;
  status: string;
  is_grounded: boolean;
  cited_rule_ids: string[];
  verified_rules: Record<string, unknown>[];
  critic_notes: string;
  original_verdict?: ClauseVerdict | null;
}

export interface ContractCriticReport {
  contract_name: string;
  playbook_name: string;
  total_verdicts_checked: number;
  grounded_verdicts: number;
  flagged_verdicts: number;
  results: ClauseCriticResult[];
  all_grounded: boolean;
}

export interface SessionInitResponse {
  session_id: string;
  contract_name: string;
  playbook_name: string;
  status: string;
  message: string;
}

export interface SessionStateResponse {
  session_id: string;
  contract_name: string;
  playbook_name: string;
  current_state: string;
  history: Array<{
    from_state: string;
    to_state: string;
    timestamp: string;
    metadata: Record<string, unknown>;
  }>;
  audit_report?: ContractAuditReport | null;
  critic_report?: ContractCriticReport | null;
  redline_package?: RedlinePackage | null;
  human_decisions: Record<string, {
    clause_id: string;
    action: HumanDecisionEnum;
    custom_text?: string | null;
    timestamp: string;
  }>;
  final_docx_path?: string | null;
}

export interface HITLDecisionItem {
  clause_id: string;
  action: HumanDecisionEnum;
  custom_text?: string | null;
}

export interface HITLDecisionRequest {
  decisions: HITLDecisionItem[];
}

export interface HITLDecisionResponse {
  session_id: string;
  message: string;
  updated_edits_count: number;
  current_state: string;
}

export interface FinalizeRedlineResponse {
  session_id: string;
  final_docx_path: string;
  download_url: string;
  current_state: string;
}

export interface AuditVerdictsResponse {
  session_id: string;
  contract_name: string;
  total_clauses: number;
  verdicts: ClauseVerdict[];
  edits: EditInstruction[];
  overall_risk_level: SeverityEnum;
}

export interface AuditReportResponse {
  session_id: string;
  audit_report?: ContractAuditReport | null;
  critic_report?: ContractCriticReport | null;
  redline_package?: RedlinePackage | null;
  history: Array<{
    from_state: string;
    to_state: string;
    timestamp: string;
    metadata: Record<string, unknown>;
  }>;
}
