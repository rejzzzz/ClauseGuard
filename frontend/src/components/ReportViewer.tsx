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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Clauses Evaluated</span>
          <div className="text-4xl font-serif font-black text-slate-900 mt-1">
            {audit_report?.total_clauses ?? 0}
          </div>
          <span className="text-xs text-slate-500 font-mono">Contract: {audit_report?.contract_name || 'N/A'}</span>
        </div>

        {/* Overall Document Risk Level */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Document Risk</span>
          <div className="text-4xl font-serif font-black text-red-700 mt-1">
            {audit_report?.overall_risk_level || 'LOW'}
          </div>
          <span className="text-xs text-slate-500">Playbook: {audit_report?.playbook_name || 'N/A'}</span>
        </div>

        {/* Critic Grounding Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Critic Grounding Status</span>
          <div className="text-4xl font-serif font-black text-emerald-700 mt-1">
            {critic_report ? `${critic_report.grounded_verdicts} / ${critic_report.total_verdicts_checked}` : '0 / 0'}
          </div>
          <span className="text-xs text-emerald-800 font-semibold">
            {critic_report?.all_grounded ? '✓ 100% Playbook Grounded' : '⚠️ Flagged Verdicts Present'}
          </span>
        </div>
      </div>

      {/* Critic Grounding Detailed Results */}
      {critic_report && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Critic Agent Grounding Verification Trace
            </h3>
            <p className="text-xs text-slate-500">
              Semantic entailment check validating auditor claim against cited playbook vectors
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px] bg-slate-50">
                  <th className="py-3 px-4">Clause ID</th>
                  <th className="py-3 px-4">Grounding Status</th>
                  <th className="py-3 px-4">Grounded?</th>
                  <th className="py-3 px-4">Critic Verification Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {critic_report.results.map((res) => (
                  <tr key={res.clause_id} className="hover:bg-slate-50 transition-all">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {res.clause_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {res.is_grounded ? (
                        <span className="text-emerald-700 font-bold">✓ True</span>
                      ) : (
                        <span className="text-red-700 font-bold">✕ False</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Session Workflow State Machine Transitions
            </h3>
            <p className="text-xs text-slate-500">Chronological state machine audit log</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {history.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                  Step {idx + 1}
                </span>
                <span className="text-slate-700">
                  <strong className="text-slate-900">{entry.from_state}</strong> → <strong className="text-slate-900">{entry.to_state}</strong>
                </span>
                <span className="text-slate-400 text-[11px] ml-auto">
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
