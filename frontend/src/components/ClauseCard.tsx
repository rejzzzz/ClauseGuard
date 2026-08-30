'use client';

import React, { useState } from 'react';
import { ClauseVerdict, EditInstruction, HumanDecisionEnum } from '@/lib/types';
import DiffView from './DiffView';

interface ClauseCardProps {
  verdict: ClauseVerdict;
  edit?: EditInstruction;
  onDecisionChange: (clauseId: string, action: HumanDecisionEnum, customText?: string) => void;
  currentDecision?: { action: HumanDecisionEnum; custom_text?: string | null };
}

export default function ClauseCard({
  verdict,
  edit,
  onDecisionChange,
  currentDecision
}: ClauseCardProps) {
  const [showRationale, setShowRationale] = useState<boolean>(false);
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(
    currentDecision?.action === 'EDIT'
  );
  const [customText, setCustomText] = useState<string>(
    currentDecision?.custom_text || edit?.proposed_text || ''
  );

  const activeAction = currentDecision?.action || 'APPROVE';

  const getVerdictBadgeClass = (v: string) => {
    switch (v) {
      case 'COMPLIANT':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs';
      case 'DEVIATION':
        return 'bg-red-50 text-red-800 border-red-200 shadow-2xs';
      case 'MISSING_CLAUSE':
        return 'bg-amber-50 text-amber-800 border-amber-200 shadow-2xs';
      case 'AMBIGUOUS':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 shadow-2xs';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 shadow-2xs';
    }
  };

  const getSeverityBadgeClass = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-red-800 text-white shadow-2xs';
      case 'HIGH':
        return 'bg-amber-800 text-white shadow-2xs';
      case 'MEDIUM':
        return 'bg-slate-800 text-white shadow-2xs';
      case 'LOW':
        return 'bg-slate-200 text-slate-700 shadow-2xs';
      default:
        return 'bg-slate-200 text-slate-700 shadow-2xs';
    }
  };

  const handleActionClick = (action: HumanDecisionEnum) => {
    if (action === 'EDIT') {
      setIsEditingCustom(true);
      onDecisionChange(verdict.clause_id, 'EDIT', customText);
    } else {
      setIsEditingCustom(false);
      onDecisionChange(verdict.clause_id, action);
    }
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCustomText(val);
    onDecisionChange(verdict.clause_id, 'EDIT', val);
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-9 shadow-sm hover:shadow-md transition-all duration-200 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            {verdict.heading_path || 'Contract Section'}
          </span>
          <h3 className="text-xl font-serif font-bold text-slate-900 leading-snug">
            {verdict.heading_title || `Clause ${verdict.clause_id}`}
          </h3>
        </div>

        {/* Verdict & Severity Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3.5 py-1.5 rounded-full border text-xs font-extrabold tracking-wide ${getVerdictBadgeClass(
              verdict.verdict
            )}`}
          >
            {verdict.verdict}
          </span>
          <span
            className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${getSeverityBadgeClass(
              verdict.severity
            )}`}
          >
            {verdict.severity} RISK
          </span>
        </div>
      </div>

      {/* Rationale & Citation Toggle */}
      <div className="text-xs text-slate-700 space-y-3">
        <p className="leading-relaxed font-sans text-sm text-slate-700">{verdict.rationale}</p>
        <button
          type="button"
          onClick={() => setShowRationale(!showRationale)}
          className="text-slate-900 font-bold hover:text-slate-700 transition-all inline-flex items-center space-x-1.5 text-xs py-1"
        >
          <span>{showRationale ? 'Hide Agent Reasoning & Citations' : 'View Agent Reasoning & Citations →'}</span>
        </button>

        {showRationale && (
          <div className="mt-3 p-5 bg-slate-50/90 rounded-xl space-y-3.5 text-xs border border-slate-200/90">
            <div>
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[10px] font-mono">
                Paralegal Reasoning Trace:
              </span>
              <p className="text-slate-700 leading-relaxed text-sm">{verdict.rationale}</p>
            </div>
            {verdict.suggested_action && (
              <div className="border-t border-slate-200/80 pt-3">
                <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[10px] font-mono">
                  Drafter Guidance:
                </span>
                <p className="text-slate-700 leading-relaxed text-sm">{verdict.suggested_action}</p>
              </div>
            )}
            {verdict.playbook_citation_ids.length > 0 && (
              <div className="border-t border-slate-200/80 pt-3">
                <span className="font-bold text-slate-900 block mb-1.5 uppercase tracking-wider text-[10px] font-mono">
                  Playbook Citations:
                </span>
                <div className="flex flex-wrap gap-2">
                  {verdict.playbook_citation_ids.map((id) => (
                    <span
                      key={id}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300/80 text-slate-800 font-mono text-xs shadow-2xs font-semibold"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Diff View Comparison */}
      {edit && (
        <DiffView
          originalText={edit.original_text}
          proposedText={isEditingCustom ? customText : edit.proposed_text}
          action={edit.action}
        />
      )}

      {/* Custom Text Edit Area */}
      {isEditingCustom && (
        <div className="space-y-2.5 pt-2">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Custom Legal Language Redline:
          </label>
          <textarea
            value={customText}
            onChange={handleCustomTextChange}
            rows={4}
            className="w-full p-4 border border-slate-300 rounded-xl bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed shadow-xs"
            placeholder="Input custom clause text for OOXML redlining..."
          />
        </div>
      )}

      {/* HITL Action Toolbar Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
          Human Approval Decision Gate
        </span>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleActionClick('APPROVE')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all btn-tactile ${
              activeAction === 'APPROVE' && !isEditingCustom
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            ✓ Approve Edit
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('EDIT')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all btn-tactile ${
              isEditingCustom
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            ✏️ Custom Redline
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('REJECT')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all btn-tactile ${
              activeAction === 'REJECT'
                ? 'bg-red-700 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            ✕ Reject Edit
          </button>
        </div>
      </div>
    </div>
  );
}
