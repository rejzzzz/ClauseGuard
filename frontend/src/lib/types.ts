// TypeScript interfaces mirroring ClauseGuard FastAPI backend models.

export type VerdictEnum = 'COMPLIANT' | 'DEVIATION' | 'MISSING_CLAUSE' | 'AMBIGUOUS';
export type SeverityEnum = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RedlineActionEnum = 'REPLACE' | 'INSERT' | 'DELETE' | 'COMMENT';
export type HumanDecisionEnum = 'APPROVE' | 'REJECT' | 'EDIT';

// ─── CASE-BASED WORKBENCH MODELS ─────────────────────────────

export interface CaseItem {
  id: string;
  title: string;
  description?: string | null;
  case_type: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED' | string;
  document_count: number;
  thread_count: number;
  event_count: number;
  created_at: string;
  updated_at: string;
}

export interface CaseCreateRequest {
  title: string;
  description?: string | null;
  case_type?: string;
  status?: string;
}

export interface CaseUpdateRequest {
  title?: string;
  description?: string | null;
  case_type?: string;
  status?: string;
}

export interface CaseDocumentItem {
  id: string;
  case_id: string;
  filename: string;
  file_type: string;
  file_path: string;
  file_size_bytes: number;
  page_count: number;
  doc_category: string;
  chunk_count: number;
  ingestion_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | string;
  created_at: string;
}

export interface ChatThreadItem {
  id: string;
  case_id: string;
  title: string;
  description?: string | null;
  status: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface CitationItem {
  document_id: string;
  filename: string;
  page_number?: number | null;
  chunk_id?: string | null;
  text_excerpt: string;
}

export interface ThreadMessageItem {
  id: string;
  thread_id: string;
  case_id: string;
  role: 'user' | 'assistant' | 'system' | string;
  agent_name: string;
  content: string;
  citations_json: CitationItem[];
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface TimelineEventItem {
  id: string;
  case_id: string;
  document_id?: string | null;
  event_date?: string | null;
  event_date_raw: string;
  event_summary: string;
  entities_json: string[];
  page_number?: number | null;
  chunk_id?: string | null;
  confidence: number;
  is_disputed: boolean;
  category: 'payment' | 'notice' | 'agreement' | 'litigation' | 'breach' | 'general' | string;
  created_at: string;
}

// ─── LEGACY CONTRACT REVIEW MODELS ───────────────────────────

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

export interface PastDocumentItem {
  id: string;
  sessionId: string;
  contractName: string;
  playbookName: string;
  fileType: 'docx' | 'pdf';
  uploadDate: string;
  clauseCount: number;
  deviationsCount: number;
  overallRisk: SeverityEnum;
  status: 'COMPLETED' | 'AWAITING_HUMAN' | 'PROCESSING';
  criticScore: number;
}

export interface AuditSummaryMetrics {
  totalAudits: number;
  overallRiskScore: number;
  compliancePassRate: number;
  totalRedlines: number;
  criticalFlags: number;
}

export interface RiskCategoryScore {
  category: string;
  score: number;
  status: 'COMPLIANT' | 'DEVIATION' | 'HIGH_RISK';
}

export interface AgentChatMessage {
  id: string;
  agentRole: 'Orchestrator' | 'Auditor' | 'Redliner' | 'Critic' | 'User';
  agentName: string;
  avatarColor: string;
  timestamp: string;
  message: string;
  clauseId?: string;
  citationId?: string;
}
