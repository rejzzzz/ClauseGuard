'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  getSessionStatus,
  startAudit,
  getSessionVerdicts,
  submitHitlDecisions,
  finalizeRedline,
  getDownloadUrl
} from '@/lib/api';
import {
  SessionStateResponse,
  AuditVerdictsResponse,
  HumanDecisionEnum,
  HITLDecisionItem
} from '@/lib/types';
import ClauseCard from '@/components/ClauseCard';

interface ReviewPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [session, setSession] = useState<SessionStateResponse | null>(null);
  const [verdictsData, setVerdictsData] = useState<AuditVerdictsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [submittingHitl, setSubmittingHitl] = useState<boolean>(false);
  const [finalizing, setFinalizing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [humanDecisions, setHumanDecisions] = useState<Record<string, HITLDecisionItem>>({});

  // Fetch initial session state
  const refreshSession = async () => {
    try {
      const s = await getSessionStatus(sessionId);
      setSession(s);

      if (s.current_state === 'AWAITING_HUMAN' || s.current_state === 'FINALIZED' || s.audit_report) {
        const vData = await getSessionVerdicts(sessionId);
        setVerdictsData(vData);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load review session.');
    }
  };

  useEffect(() => {
    let ignore = false;
    async function initSession() {
      try {
        const s = await getSessionStatus(sessionId);
        if (ignore) return;
        setSession(s);

        if (s.current_state === 'AWAITING_HUMAN' || s.current_state === 'FINALIZED' || s.audit_report) {
          const vData = await getSessionVerdicts(sessionId);
          if (ignore) return;
          setVerdictsData(vData);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load review session.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    initSession();
    return () => {
      ignore = true;
    };
  }, [sessionId]);

  const handleRunAudit = async () => {
    try {
      setAuditRunning(true);
      setErrorMessage(null);
      setStatusMessage('Executing automated multi-agent pipeline (Ingestion -> Auditor -> Critic -> Redliner)...');
      const updatedSession = await startAudit(sessionId);
      setSession(updatedSession);

      const vData = await getSessionVerdicts(sessionId);
      setVerdictsData(vData);
      setStatusMessage('Multi-agent audit pipeline completed! Review proposed clause redlines below.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to execute audit pipeline.');
    } finally {
      setAuditRunning(false);
    }
  };

  const handleDecisionChange = (clauseId: string, action: HumanDecisionEnum, customText?: string) => {
    setHumanDecisions((prev) => ({
      ...prev,
      [clauseId]: {
        clause_id: clauseId,
        action,
        custom_text: customText || null
      }
    }));
  };

  const handleSubmitHitl = async () => {
    const decisionsList = Object.values(humanDecisions);
    if (decisionsList.length === 0) {
      setErrorMessage('No human review decisions have been modified yet.');
      return;
    }

    try {
      setSubmittingHitl(true);
      setErrorMessage(null);
      const res = await submitHitlDecisions(sessionId, decisionsList);
      setStatusMessage(res.message);
      await refreshSession();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to apply human review decisions.');
    } finally {
      setSubmittingHitl(false);
    }
  };

  const handleFinalizeRedline = async () => {
    try {
      setFinalizing(true);
      setErrorMessage(null);
      const res = await finalizeRedline(sessionId);
      setStatusMessage('Tracked-changes redlined document generated successfully!');
      setSession((prev) => (prev ? { ...prev, current_state: res.current_state, final_docx_path: res.final_docx_path } : null));
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate redlined document.');
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
          Loading review session context...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <h3 className="font-serif font-bold text-red-800 text-xl">Session Not Found</h3>
          <p className="text-sm text-red-600">{errorMessage || 'Requested review session does not exist.'}</p>
          <Link href="/upload" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold inline-block shadow-sm">
            Return to Upload Vault
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full space-y-8 bg-slate-50 text-slate-900 pb-12">
      {/* Session Metadata Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900">
              {session.contract_name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              State: {session.current_state}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Session ID: <span className="font-mono">{session.session_id}</span> | Playbook: <span className="font-semibold text-slate-800">{session.playbook_name}</span>
          </p>
        </div>

        {/* Global Action Controls with Generous Button Spacing */}
        <div className="flex items-center flex-wrap gap-3">
          {(session.current_state === 'UNINITIALIZED' || session.current_state === 'INGESTED') && (
            <button
              onClick={handleRunAudit}
              disabled={auditRunning}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover-lift btn-tactile flex items-center gap-2"
            >
              {auditRunning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Auditing Document...
                </>
              ) : (
                '🚀 Run Multi-Agent Audit'
              )}
            </button>
          )}

          {session.current_state === 'AWAITING_HUMAN' && (
            <>
              <button
                onClick={handleSubmitHitl}
                disabled={submittingHitl}
                className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-2xs hover-lift btn-tactile"
              >
                {submittingHitl ? 'Submitting...' : '✓ Submit Review Decisions'}
              </button>

              <button
                onClick={handleFinalizeRedline}
                disabled={finalizing}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-2xs hover-lift btn-tactile"
              >
                {finalizing ? 'Generating .docx...' : '📝 Generate Redlined Document'}
              </button>
            </>
          )}

          {session.final_docx_path && (
            <a
              href={getDownloadUrl(sessionId)}
              download
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-2 hover-lift btn-tactile"
            >
              ⬇️ Download Redlined .docx
            </a>
          )}

          <Link
            href={`/reports/${sessionId}`}
            className="px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl transition-all shadow-2xs"
          >
            📊 View Audit Report
          </Link>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
          {statusMessage}
        </div>
      )}

      {/* Pre-Audit Callout */}
      {(session.current_state === 'UNINITIALIZED' || session.current_state === 'INGESTED') && !auditRunning && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="text-4xl">📜</div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">
            Ready to Audit Contract
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Click <strong>Run Multi-Agent Audit</strong> above to start document structure parsing, playbook FAISS search, deviation classification, and redline drafting.
          </p>
        </div>
      )}

      {/* Clause Cards Workspace */}
      {verdictsData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Evaluated Contract Clauses ({verdictsData.verdicts.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Overall Document Risk: <strong className="text-red-700 font-serif text-sm">{verdictsData.overall_risk_level}</strong>
            </span>
          </div>

          <div className="space-y-6">
            {verdictsData.verdicts.map((verdict) => {
              const matchingEdit = verdictsData.edits.find((e) => e.clause_id === verdict.clause_id);
              return (
                <ClauseCard
                  key={verdict.clause_id}
                  verdict={verdict}
                  edit={matchingEdit}
                  onDecisionChange={handleDecisionChange}
                  currentDecision={humanDecisions[verdict.clause_id]}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
