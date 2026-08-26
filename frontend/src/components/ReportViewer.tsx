'use client';

import React from 'react';
import { AuditReportResponse } from '@/lib/types';

interface ReportViewerProps {
  reportData: AuditReportResponse;
}

export default function ReportViewer({ reportData }: ReportViewerProps) {
  const { audit_report, critic_report, history } = reportData;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Clauses Evaluated */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm hover-lift glass-card space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Total Clauses Evaluated</span>
          <div className="text-4xl font-serif font-black text-slate-900 mt-1">
            {audit_report?.total_clauses ?? 0}
          </div>
          <span className="text-xs text-slate-500 font-mono block">Contract: {audit_report?.contract_name || 'N/A'}</span>
        </div>

        {/* Overall Document Risk Level */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm hover-lift glass-card space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Overall Document Risk</span>
          <div className="text-4xl font-serif font-black text-red-700 mt-1">
            {audit_report?.overall_risk_level || 'LOW'}
          </div>
          <span className="text-xs text-slate-500 font-mono block">Playbook: {audit_report?.playbook_name || 'N/A'}</span>
        </div>

        {/* Critic Grounding Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm hover-lift glass-card space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Critic Grounding Status</span>
          <div className="text-4xl font-serif font-black text-emerald-700 mt-1">
            {critic_report ? `${critic_report.grounded_verdicts} / ${critic_report.total_verdicts_checked}` : '0 / 0'}
          </div>
          <span className="text-xs text-emerald-800 font-bold block">
            {critic_report?.all_grounded ? '✓ 100% Playbook Grounded' : '⚠️ Flagged Verdicts Present'}
          </span>
        </div>
      </div>

      {/* Critic Grounding Detailed Results */}
      {critic_report && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-sm glass-card space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              Critic Agent Grounding Verification Trace
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              Semantic entailment check validating auditor claim against cited playbook vectors
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 text-slate-600 font-bold uppercase tracking-wider text-xs bg-slate-50/90">
                  <th className="py-4 px-5">Clause ID</th>
                  <th className="py-4 px-5">Grounding Status</th>
                  <th className="py-4 px-5">Grounded?</th>
                  <th className="py-4 px-5">Critic Verification Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {critic_report.results.map((res) => (
                  <tr key={res.clause_id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 text-xs">
                      {res.clause_id}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] shadow-2xs">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {res.is_grounded ? (
                        <span className="text-emerald-700 font-extrabold text-xs">✓ True</span>
                      ) : (
                        <span className="text-red-700 font-extrabold text-xs">✕ False</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-700 leading-relaxed font-sans text-xs">
                      {res.critic_notes || 'Grounding verified against playbook rules.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Workflow History Log */}
      {history && history.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-sm glass-card space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              Session Workflow State Machine Transitions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">Chronological state machine audit log</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {history.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-900 font-extrabold text-xs">
                  Step {idx + 1}
                </span>
                <span className="text-slate-700 font-sans text-xs sm:text-sm">
                  <strong className="text-slate-900 font-mono">{entry.from_state}</strong> → <strong className="text-slate-900 font-mono">{entry.to_state}</strong>
                </span>
                <span className="text-slate-400 text-xs ml-auto font-mono">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
