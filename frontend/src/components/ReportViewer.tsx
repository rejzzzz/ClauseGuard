'use client';

import React from 'react';
import { AuditReportResponse } from '@/lib/types';

interface ReportViewerProps {
  reportData: AuditReportResponse;
}

export default function ReportViewer({ reportData }: ReportViewerProps) {
  const { audit_report, critic_report, history } = reportData;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Clauses Evaluated */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Clauses Evaluated</span>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            {audit_report?.total_clauses ?? 0}
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Contract: {audit_report?.contract_name || 'N/A'}</span>
        </div>

        {/* Overall Document Risk Level */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Overall Document Risk</span>
          <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
            {audit_report?.overall_risk_level || 'LOW'}
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Playbook: {audit_report?.playbook_name || 'N/A'}</span>
        </div>

        {/* Critic Grounding Score */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Critic Grounding Status</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {critic_report ? `${critic_report.grounded_verdicts} / ${critic_report.total_verdicts_checked}` : '0 / 0'}
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            {critic_report?.all_grounded ? '✓ 100% Playbook Grounded' : '⚠️ Flagged Verdicts Present'}
          </span>
        </div>
      </div>

      {/* Critic Grounding Detailed Results */}
      {critic_report && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Critic Agent Grounding Verification Trace
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Clause ID</th>
                  <th className="py-2.5 px-3">Grounding Status</th>
                  <th className="py-2.5 px-3">Grounded?</th>
                  <th className="py-2.5 px-3">Critic Verification Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {critic_report.results.map((res) => (
                  <tr key={res.clause_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="py-3 px-3 font-mono font-semibold text-gray-900 dark:text-white">
                      {res.clause_id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[10px]">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {res.is_grounded ? (
                        <span className="text-emerald-600 font-bold">✓ True</span>
                      ) : (
                        <span className="text-red-600 font-bold">✕ False</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
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
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Session Workflow History & State Machine Transitions
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {history.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
                  Step {idx + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">{entry.from_state}</strong> → <strong className="text-blue-600 dark:text-blue-400">{entry.to_state}</strong>
                </span>
                <span className="text-gray-400 text-[10px] ml-auto">
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
