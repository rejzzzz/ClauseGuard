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
  const loadSession = async () => {
    try {
      setLoading(true);
      const s = await getSessionStatus(sessionId);
      setSession(s);

      // If session is already audited/awaiting human/finalized, load verdicts
      if (s.current_state === 'AWAITING_HUMAN' || s.current_state === 'FINALIZED' || s.audit_report) {
        const vData = await getSessionVerdicts(sessionId);
        setVerdictsData(vData);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load review session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
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
      await loadSession();
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
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-gray-500 font-medium">
          <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          Loading review session context...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <h3 className="font-bold text-red-800 text-lg mb-2">Session Not Found</h3>
          <p className="text-sm text-red-600 mb-4">{errorMessage || 'Requested review session does not exist.'}</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            Return to Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
      {/* Session Metadata Header */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {session.contract_name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              State: {session.current_state}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Session ID: <span className="font-mono">{session.session_id}</span> | Playbook: <span className="font-semibold">{session.playbook_name}</span>
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center flex-wrap gap-3">
          {(session.current_state === 'UNINITIALIZED' || session.current_state === 'INGESTED') && (
            <button
              onClick={handleRunAudit}
              disabled={auditRunning}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition shadow-sm flex items-center gap-2"
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition shadow-sm"
              >
                {submittingHitl ? 'Submitting...' : '✓ Submit Review Decisions'}
              </button>

              <button
                onClick={handleFinalizeRedline}
                disabled={finalizing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition shadow-sm"
              >
                {finalizing ? 'Generating .docx...' : '📝 Generate Redlined Document'}
              </button>
            </>
          )}

          {session.final_docx_path && (
            <a
              href={getDownloadUrl(sessionId)}
              download
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              ⬇️ Download Redlined .docx
            </a>
          )}

          <Link
            href={`/reports/${sessionId}`}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-lg transition"
          >
            📊 View Audit Report
          </Link>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
          {statusMessage}
        </div>
      )}

      {/* Pre-Audit Callout */}
      {(session.current_state === 'UNINITIALIZED' || session.current_state === 'INGESTED') && !auditRunning && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="text-4xl">🤖</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Ready to Audit Contract
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click <strong>Run Multi-Agent Audit</strong> above to start document structure parsing, playbook FAISS search, deviation classification, and redline drafting.
          </p>
        </div>
      )}

      {/* Clause Cards Workspace */}
      {verdictsData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Evaluated Contract Clauses ({verdictsData.verdicts.length})
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              Overall Risk: <strong className="text-red-600 dark:text-red-400">{verdictsData.overall_risk_level}</strong>
            </span>
          </div>

          <div className="space-y-4">
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
