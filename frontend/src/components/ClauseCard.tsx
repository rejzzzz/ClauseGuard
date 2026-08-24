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
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300';
      case 'DEVIATION':
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300';
      case 'MISSING_CLAUSE':
        return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300';
      case 'AMBIGUOUS':
        return 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityBadgeClass = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-amber-600 text-white';
      case 'MEDIUM':
        return 'bg-blue-600 text-white';
      case 'LOW':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
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
    <div className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            {verdict.heading_path || 'Section'}
          </span>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {verdict.heading_title || `Clause ${verdict.clause_id}`}
          </h3>
        </div>

        {/* Verdict & Severity Badges */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full border text-xs font-bold ${getVerdictBadgeClass(
              verdict.verdict
            )}`}
          >
            {verdict.verdict}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadgeClass(
              verdict.severity
            )}`}
          >
            {verdict.severity} RISK
          </span>
        </div>
      </div>

      {/* Rationale & Citation Toggle */}
      <div className="text-xs text-gray-700 dark:text-gray-300">
        <p className="line-clamp-2">{verdict.rationale}</p>
        <button
          type="button"
          onClick={() => setShowRationale(!showRationale)}
          className="text-blue-600 dark:text-blue-400 font-semibold mt-1 hover:underline"
        >
          {showRationale ? 'Hide Evidence Trace' : 'View Reasoning & Citations'}
        </button>

        {showRationale && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-zinc-950 rounded-lg space-y-2 text-xs border border-gray-100 dark:border-zinc-800">
            <div>
              <span className="font-bold text-gray-900 dark:text-white">Full Rationale:</span>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{verdict.rationale}</p>
            </div>
            {verdict.suggested_action && (
              <div>
                <span className="font-bold text-gray-900 dark:text-white">Suggested Guidance:</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{verdict.suggested_action}</p>
              </div>
            )}
            {verdict.playbook_citation_ids.length > 0 && (
              <div>
                <span className="font-bold text-gray-900 dark:text-white">Playbook Citations:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {verdict.playbook_citation_ids.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px]"
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
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Custom Human Redline Language:
          </label>
          <textarea
            value={customText}
            onChange={handleCustomTextChange}
            rows={3}
            className="w-full p-2.5 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-zinc-800 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your custom replacement legal language..."
          />
        </div>
      )}

      {/* HITL Action Toolbar Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Human Review Action
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleActionClick('APPROVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeAction === 'APPROVE' && !isEditingCustom
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            ✓ Approve Edit
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('EDIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isEditingCustom
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            ✏️ Custom Edit
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('REJECT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeAction === 'REJECT'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            ✕ Reject Edit
          </button>
        </div>
      </div>
    </div>
  );
}
