'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_METRICS, MOCK_PAST_DOCUMENTS } from '@/lib/mockData';

const FULL_RISK_CATEGORIES = [
  { category: 'Liability & Loss Caps', score: 92, status: 'COMPLIANT' },
  { category: 'Intellectual Property Rights', score: 98, status: 'COMPLIANT' },
  { category: 'Indemnification Scope', score: 68, status: 'DEVIATION' },
  { category: 'Termination Notice Period', score: 88, status: 'COMPLIANT' },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-5 bg-slate-50 text-slate-900 pb-10 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="px-3 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs inline-block">
            Executive Legal Intelligence
          </span>
          <h1 className="text-2xl font-serif font-extrabold tracking-tight mt-1 text-slate-900 sm:text-3xl">
            Contract Audit Dashboard
          </h1>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            Real-time compliance performance metrics, risk tier distribution, and active review sessions.
          </p>
        </div>

        <Link
          href="/upload"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all text-center self-start sm:self-auto hover-lift btn-tactile flex items-center space-x-2 shrink-0"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Upload New Contract</span>
        </Link>
      </div>

      {/* Top Integrated Row: Ultra-Compact 2x2 Metrics + Slim Full-Text Domain Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Side: 2x2 Ultra-Compact Metric Tiles (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 h-full">
          {/* Metric 1 */}
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase font-mono">
              <span>Total Audits</span>
              <span className="text-emerald-700 font-mono text-[9px]">+12%</span>
            </div>
            <div className="text-lg sm:text-xl font-serif font-extrabold text-slate-900 my-0.5">{MOCK_METRICS.totalAudits}</div>
            <div className="text-[9px] text-slate-400 font-sans truncate">MSAs & Vendor NDAs</div>
          </div>

          {/* Metric 2 */}
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase font-mono">
              <span>Compliance</span>
              <span className="text-emerald-700 font-mono text-[9px]">High</span>
            </div>
            <div className="text-lg sm:text-xl font-serif font-extrabold text-emerald-700 my-0.5">{MOCK_METRICS.compliancePassRate}%</div>
            <div className="text-[9px] text-slate-400 font-sans truncate">Playbook match</div>
          </div>

          {/* Metric 3 */}
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase font-mono">
              <span>Redlines</span>
              <span className="text-slate-700 font-mono text-[9px]">OOXML</span>
            </div>
            <div className="text-lg sm:text-xl font-serif font-extrabold text-slate-900 my-0.5">{MOCK_METRICS.totalRedlines}</div>
            <div className="text-[9px] text-slate-400 font-mono truncate">Tracked edits</div>
          </div>

          {/* Metric 4 */}
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase font-mono">
              <span>Critical Flags</span>
              <span className="text-red-700 font-mono text-[9px]">Action</span>
            </div>
            <div className="text-lg sm:text-xl font-serif font-extrabold text-red-700 my-0.5">{MOCK_METRICS.criticalFlags}</div>
            <div className="text-[9px] text-slate-400 font-sans truncate">Uncapped risk</div>
          </div>
        </div>

        {/* Right Side: Slim Full-Text Playbook Domain Compliance Panel (7 cols) */}
        <div className="lg:col-span-7 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-serif font-bold text-slate-900">Playbook Domain Compliance</h2>
              <p className="text-[10px] text-slate-400">Pass rate across core legal risk categories</p>
            </div>
            <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              Avg 86.5%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 flex-1 items-center">
            {FULL_RISK_CATEGORIES.map((cat) => (
              <div key={cat.category} className="space-y-1 py-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 font-serif leading-none truncate max-w-[170px]">{cat.category}</span>
                  <span
                    className={`font-mono font-extrabold text-[11px] ml-1 shrink-0 ${
                      cat.status === 'HIGH_RISK'
                        ? 'text-red-700'
                        : cat.status === 'DEVIATION'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {cat.score}%
                  </span>
                </div>

                {/* 4px Mini Progress Bar */}
                <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.status === 'HIGH_RISK'
                        ? 'bg-red-600'
                        : cat.status === 'DEVIATION'
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${cat.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Contract Audits Table (Full 100% Width Below) */}
      <div className="w-full p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Recent Contract Audits</h2>
            <p className="text-xs text-slate-500">Contracts audited across active legal playbooks</p>
          </div>
          <Link href="/documents" className="text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
            View All Documents →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="text-[11px] font-semibold text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Contract Name</th>
                <th className="py-3 px-4">Playbook Standard</th>
                <th className="py-3 px-4">Overall Risk</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_PAST_DOCUMENTS.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center space-x-3">
                      <span className="p-1 rounded bg-slate-100 text-slate-700 text-[10px] uppercase font-mono border border-slate-200 shrink-0">
                        {doc.fileType}
                      </span>
                      <span className="font-serif text-xs font-bold text-slate-900">{doc.contractName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">{doc.playbookName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        doc.overallRisk === 'CRITICAL' || doc.overallRisk === 'HIGH'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : doc.overallRisk === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {doc.overallRisk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/review/${doc.sessionId}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all inline-block shadow-2xs hover-lift"
                    >
                      Review Workspace
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
