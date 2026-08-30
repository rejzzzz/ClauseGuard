// REST API Client for communicating with the ClauseGuard FastAPI backend.
import {
  SessionInitResponse,
  SessionStateResponse,
  AuditVerdictsResponse,
  HITLDecisionItem,
  HITLDecisionResponse,
  FinalizeRedlineResponse,
  AuditReportResponse,
  CaseItem,
  CaseCreateRequest,
  CaseUpdateRequest,
  CaseDocumentItem,
  ChatThreadItem,
  ThreadMessageItem,
  TimelineEventItem
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = 'An error occurred while communicating with the backend API.';
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      errorDetail = response.statusText;
    }
    throw new ApiError(errorDetail, response.status);
  }
  if (response.status === 204) {
    return {} as T;
  }
  return response.json();
}

/**
 * Checks backend service health status.
 */
export async function checkHealth(): Promise<{ status: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await handleResponse(res);
  } catch {
    return { status: 'offline', service: 'ClauseGuard Standalone' };
  }
}

// ─── CASE WORKBENCH API FUNCTIONS ────────────────────────────

/**
 * Lists all case matters.
 */
export async function listCases(statusFilter?: string): Promise<CaseItem[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/cases`);
    if (statusFilter) {
      url.searchParams.append('status', statusFilter);
    }
    const res = await fetch(url.toString());
    return await handleResponse<CaseItem[]>(res);
  } catch {
    console.log('[ClauseGuard] Backend API is offline');
    return [];
  }
}

/**
 * Retrieves case matter details by ID.
 */
export async function getCase(caseId: string): Promise<CaseItem> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}`);
  return handleResponse<CaseItem>(res);
}

/**
 * Creates a new legal case matter.
 */
export async function createCase(payload: CaseCreateRequest): Promise<CaseItem> {
  const res = await fetch(`${API_BASE_URL}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<CaseItem>(res);
}

/**
 * Updates case details (title, description, case_type, status).
 */
export async function updateCase(caseId: string, payload: CaseUpdateRequest): Promise<CaseItem> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<CaseItem>(res);
}

/**
 * Deletes a case matter and all its child resources.
 */
export async function deleteCase(caseId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
    method: 'DELETE'
  });
  await handleResponse<void>(res);
}

// ─── CASE DOCUMENTS API FUNCTIONS ─────────────────────────────

/**
 * Lists all documents uploaded to a case.
 */
export async function listCaseDocuments(caseId: string): Promise<CaseDocumentItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/documents`);
  return handleResponse<CaseDocumentItem[]>(res);
}

/**
 * Uploads a document (.pdf or .docx) to a case matter.
 */
export async function uploadCaseDocument(
  caseId: string,
  file: File,
  docCategory = 'uncategorized'
): Promise<CaseDocumentItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_category', docCategory);

  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/documents`, {
    method: 'POST',
    body: formData
  });
  return handleResponse<CaseDocumentItem>(res);
}

/**
 * Deletes a document from a case matter.
 */
export async function deleteCaseDocument(caseId: string, docId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/documents/${docId}`, {
    method: 'DELETE'
  });
  await handleResponse<void>(res);
}

// ─── CASE THREADS & MESSAGES API FUNCTIONS ───────────────────

/**
 * Lists all chat threads for a case matter.
 */
export async function listCaseThreads(caseId: string): Promise<ChatThreadItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/threads`);
  return handleResponse<ChatThreadItem[]>(res);
}

/**
 * Creates a new chat thread within a case.
 */
export async function createCaseThread(
  caseId: string,
  title: string,
  description?: string
): Promise<ChatThreadItem> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });
  return handleResponse<ChatThreadItem>(res);
}

/**
 * Updates a chat thread (e.g. title, status).
 */
export async function updateCaseThread(
  caseId: string,
  threadId: string,
  payload: { title?: string; description?: string; status?: string }
): Promise<ChatThreadItem> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/threads/${threadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<ChatThreadItem>(res);
}

/**
 * Deletes a chat thread and all its messages.
 */
export async function deleteCaseThread(caseId: string, threadId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/threads/${threadId}`, {
    method: 'DELETE'
  });
  await handleResponse<void>(res);
}

/**
 * Fetches message transcript for a chat thread.
 */
export async function fetchThreadMessages(caseId: string, threadId: string): Promise<ThreadMessageItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/threads/${threadId}/messages`);
  return handleResponse<ThreadMessageItem[]>(res);
}

/**
 * Sends a message in a thread. If role is 'user', returns both user message and AI assistant response.
 */
export async function sendThreadMessage(
  caseId: string,
  threadId: string,
  content: string,
  agentName = 'Senior Counsel',
  role = 'user'
): Promise<ThreadMessageItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/threads/${threadId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      agent_name: agentName,
      content
    })
  });
  return handleResponse<ThreadMessageItem[]>(res);
}

// ─── CASE TIMELINE API FUNCTIONS ──────────────────────────────

/**
 * Fetches incident timeline events for a case.
 */
export async function fetchCaseTimeline(
  caseId: string,
  category?: string,
  isDisputed?: boolean
): Promise<TimelineEventItem[]> {
  const url = new URL(`${API_BASE_URL}/api/cases/${caseId}/timeline`);
  if (category) url.searchParams.append('category', category);
  if (isDisputed !== undefined) url.searchParams.append('is_disputed', String(isDisputed));

  const res = await fetch(url.toString());
  return handleResponse<TimelineEventItem[]>(res);
}

/**
 * Updates a timeline event (e.g. mark disputed, edit summary).
 */
export async function updateTimelineEvent(
  caseId: string,
  eventId: string,
  payload: { is_disputed?: boolean; event_summary?: string; category?: string }
): Promise<TimelineEventItem> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/timeline/${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse<TimelineEventItem>(res);
}

/**
 * Triggers timeline extraction across all chunks in a case.
 */
export async function triggerTimelineExtraction(caseId: string): Promise<{ extracted_count: number; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/timeline/extract`, {
    method: 'POST'
  });
  return handleResponse<{ extracted_count: number; message: string }>(res);
}

// ─── LEGACY SESSION API FUNCTIONS ─────────────────────────────

export async function uploadContract(
  file: File,
  playbookName = 'sample_vendor_msa'
): Promise<SessionInitResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('playbook_name', playbookName);

  const res = await fetch(`${API_BASE_URL}/api/sessions/upload`, {
    method: 'POST',
    body: formData
  });
  return handleResponse<SessionInitResponse>(res);
}

export async function listSessions(): Promise<SessionStateResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/sessions`);
  return handleResponse<SessionStateResponse[]>(res);
}

export async function getSessionStatus(sessionId: string): Promise<SessionStateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  return handleResponse<SessionStateResponse>(res);
}

export async function startAudit(sessionId: string): Promise<SessionStateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/audit`, {
    method: 'POST'
  });
  return handleResponse<SessionStateResponse>(res);
}

export async function getSessionVerdicts(sessionId: string): Promise<AuditVerdictsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/verdicts`);
  return handleResponse<AuditVerdictsResponse>(res);
}

export async function submitHitlDecisions(
  sessionId: string,
  decisions: HITLDecisionItem[]
): Promise<HITLDecisionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/hitl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decisions })
  });
  return handleResponse<HITLDecisionResponse>(res);
}

export async function finalizeRedline(sessionId: string): Promise<FinalizeRedlineResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/redline`, {
    method: 'POST'
  });
  return handleResponse<FinalizeRedlineResponse>(res);
}

export function getDownloadUrl(sessionId: string): string {
  return `${API_BASE_URL}/api/sessions/${sessionId}/download`;
}

export async function getAuditReport(sessionId: string): Promise<AuditReportResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/report`);
  return handleResponse<AuditReportResponse>(res);
}

export async function fetchChatLogs(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/chats/${sessionId}`);
  return handleResponse(res);
}

export async function sendChatMessage(sessionId: string, messagePayload: {
  message: string;
  agent_role?: string;
  agent_name?: string;
  avatar_color?: string;
  clause_id?: string;
  citation_id?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/chats/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messagePayload)
  });
  return handleResponse(res);
}
