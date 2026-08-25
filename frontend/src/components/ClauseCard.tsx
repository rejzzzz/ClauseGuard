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
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'DEVIATION':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'MISSING_CLAUSE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'AMBIGUOUS':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSeverityBadgeClass = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-red-800 text-white';
      case 'HIGH':
        return 'bg-amber-800 text-white';
      case 'MEDIUM':
        return 'bg-slate-800 text-white';
      case 'LOW':
        return 'bg-slate-200 text-slate-700';
      default:
        return 'bg-slate-200 text-slate-700';
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
    <div className="w-full bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-5 transition-all">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {verdict.heading_path || 'Contract Section'}
          </span>
          <h3 className="text-lg font-serif font-bold text-slate-900">
            {verdict.heading_title || `Clause ${verdict.clause_id}`}
          </h3>
        </div>

        {/* Verdict & Severity Badges */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded border text-xs font-bold tracking-wide ${getVerdictBadgeClass(
              verdict.verdict
            )}`}
          >
            {verdict.verdict}
          </span>
          <span
            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${getSeverityBadgeClass(
              verdict.severity
            )}`}
          >
            {verdict.severity} RISK
          </span>
        </div>
      </div>

      {/* Rationale & Citation Toggle */}
      <div className="text-xs text-slate-700 space-y-2">
        <p className="leading-relaxed font-sans">{verdict.rationale}</p>
        <button
          type="button"
          onClick={() => setShowRationale(!showRationale)}
          className="text-slate-900 font-semibold hover:underline transition-all inline-flex items-center space-x-1"
        >
          <span>{showRationale ? 'Hide Agent Reasoning & Citations' : 'View Agent Reasoning & Citations →'}</span>
        </button>

        {showRationale && (
          <div className="mt-3 p-4 bg-slate-50 rounded-lg space-y-3 text-xs border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">Paralegal Reasoning Trace:</span>
              <p className="text-slate-600 leading-relaxed">{verdict.rationale}</p>
            </div>
            {verdict.suggested_action && (
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Drafter Guidance:</span>
                <p className="text-slate-600 leading-relaxed">{verdict.suggested_action}</p>
              </div>
            )}
            {verdict.playbook_citation_ids.length > 0 && (
              <div>
                <span className="font-bold text-slate-900 block mb-1">Playbook Citations:</span>
                <div className="flex flex-wrap gap-1.5">
                  {verdict.playbook_citation_ids.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[10px]"
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
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-800">
            Custom Legal Language Redline:
          </label>
          <textarea
            value={customText}
            onChange={handleCustomTextChange}
            rows={3}
            className="w-full p-3 border border-slate-300 rounded-lg bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Input custom clause text for OOXML redlining..."
          />
        </div>
      )}

      {/* HITL Action Toolbar Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Human Approval Decision Gate
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleActionClick('APPROVE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeAction === 'APPROVE' && !isEditingCustom
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            ✓ Approve Edit
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('EDIT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isEditingCustom
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            ✏️ Custom Redline
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('REJECT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeAction === 'REJECT'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            ✕ Reject Edit
          </button>
        </div>
      </div>
    </div>
  );
}
