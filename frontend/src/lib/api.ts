// REST API Client for communicating with the ClauseGuard FastAPI backend.
import {
  SessionInitResponse,
  SessionStateResponse,
  AuditVerdictsResponse,
  HITLDecisionItem,
  HITLDecisionResponse,
  FinalizeRedlineResponse,
  AuditReportResponse
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
      // Fallback to text status
      errorDetail = response.statusText;
    }
    throw new ApiError(errorDetail, response.status);
  }
  return response.json();
}

/**
  Checks backend service health status.
 */
export async function checkHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(res);
}

/**
  Uploads a contract file (.docx or .pdf) and initializes a review session.
 */
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

/**
  Lists all active review sessions.
 */
export async function listSessions(): Promise<SessionStateResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/sessions`);
  return handleResponse<SessionStateResponse[]>(res);
}

/**
  Retrieves session status and metadata by ID.
 */
export async function getSessionStatus(sessionId: string): Promise<SessionStateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  return handleResponse<SessionStateResponse>(res);
}

/**
  Triggers the multi-agent audit and redlining pipeline for a session.
 */
export async function startAudit(sessionId: string): Promise<SessionStateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/audit`, {
    method: 'POST'
  });
  return handleResponse<SessionStateResponse>(res);
}

/**
  Fetches clause audit verdicts and proposed redline edits.
 */
export async function getSessionVerdicts(sessionId: string): Promise<AuditVerdictsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/verdicts`);
  return handleResponse<AuditVerdictsResponse>(res);
}

/**
  Submits human HITL decisions (APPROVE, REJECT, EDIT) for clause edits.
 */
export async function submitHitlDecisions(
  sessionId: string,
  decisions: HITLDecisionItem[]
): Promise<HITLDecisionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/hitl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ decisions })
  });
  return handleResponse<HITLDecisionResponse>(res);
}

/**
  Finalizes the contract review session and generates the redlined .docx file.
 */
export async function finalizeRedline(sessionId: string): Promise<FinalizeRedlineResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/redline`, {
    method: 'POST'
  });
  return handleResponse<FinalizeRedlineResponse>(res);
}

/**
  Constructs the absolute download URL for the finalized redlined .docx file.
 */
export function getDownloadUrl(sessionId: string): string {
  return `${API_BASE_URL}/api/sessions/${sessionId}/download`;
}

/**
  Retrieves the full structured JSON audit report summary.
 */
export async function getAuditReport(sessionId: string): Promise<AuditReportResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/report`);
  return handleResponse<AuditReportResponse>(res);
}

/**
  Fetches multi-agent and user reasoning chat logs for a session.
 */
export async function fetchChatLogs(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/chats/${sessionId}`);
  return handleResponse(res);
}

/**
  Sends a user or agent chat message for a session.
 */
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
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messagePayload)
  });
  return handleResponse(res);
}
