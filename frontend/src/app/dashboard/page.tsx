'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_METRICS, MOCK_RISK_CATEGORIES, MOCK_PAST_DOCUMENTS } from '@/lib/mockData';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-10 bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs inline-block">
            Executive Legal Intelligence
          </span>
          <h1 className="text-3xl font-serif font-extrabold tracking-tight mt-2 text-slate-900 sm:text-4xl">
            Contract Audit Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Real-time compliance performance metrics, risk tier distribution, and active review sessions.
          </p>
        </div>

        <Link
          href="/upload"
          className="px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all text-center self-start sm:self-auto"
        >
          + Upload New Contract
        </Link>
      </div>

      {/* Top Key Performance Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="p-7 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Audits</span>
            <span className="text-emerald-700 font-semibold">+12% this month</span>
          </div>
          <div className="text-3xl font-serif font-black text-slate-900">{MOCK_METRICS.totalAudits}</div>
          <div className="text-[11px] text-slate-500 font-sans">Master Services & Vendor Agreements</div>
        </div>

        {/* Metric 2 */}
        <div className="p-7 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Compliance Pass Rate</span>
            <span className="text-emerald-700 font-semibold">High Compliance</span>
          </div>
          <div className="text-3xl font-serif font-black text-emerald-700">{MOCK_METRICS.compliancePassRate}%</div>
          <div className="text-[11px] text-slate-500 font-sans">Matched standard playbook criteria</div>
        </div>

        {/* Metric 3 */}
        <div className="p-7 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Redlines Generated</span>
            <span className="text-slate-900 font-semibold">OOXML Engine</span>
          </div>
          <div className="text-3xl font-serif font-black text-slate-900">{MOCK_METRICS.totalRedlines}</div>
          <div className="text-[11px] text-slate-500 font-mono">Tracked changes inserted</div>
        </div>

        {/* Metric 4 */}
        <div className="p-7 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Critical Flags</span>
            <span className="text-red-700 font-semibold">Action Required</span>
          </div>
          <div className="text-3xl font-serif font-black text-red-700">{MOCK_METRICS.criticalFlags}</div>
          <div className="text-[11px] text-slate-500 font-sans">Uncapped liability & broad indemnities</div>
        </div>
      </div>

      {/* Main Grid: Recent Activity + Category Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Recent Audit Sessions (8 cols) */}
        <div className="lg:col-span-8 p-7 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">Recent Contract Audits</h2>
              <p className="text-xs text-slate-500">Contracts audited across active legal playbooks</p>
            </div>
            <Link href="/documents" className="text-xs font-semibold text-slate-900 hover:underline">
              View All Documents →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-5">Contract Name</th>
                  <th className="py-4 px-5">Playbook</th>
                  <th className="py-4 px-5">Risk Level</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_PAST_DOCUMENTS.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-4.5 px-5 font-semibold text-slate-900">
                      <div className="flex items-center space-x-3">
                        <span className="p-1.5 rounded bg-slate-100 text-slate-700 text-[10px] uppercase font-mono border border-slate-200">
                          {doc.fileType}
                        </span>
                        <span className="truncate max-w-[200px] font-serif text-sm">{doc.contractName}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 text-slate-600 truncate max-w-[150px] font-medium">{doc.playbookName}</td>
                    <td className="py-4.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
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
                    <td className="py-4.5 px-5">
                      <span className="px-2.5 py-1 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-5 text-right">
                      <Link
                        href={`/review/${doc.sessionId}`}
                        className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition-all inline-block shadow-2xs"
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

        {/* Category Risk Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-7 rounded-xl bg-white border border-slate-200 space-y-5 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-serif font-bold text-slate-900">Playbook Compliance Domain</h2>
            <p className="text-xs text-slate-500">Pass rate across core legal risk categories</p>
          </div>

          <div className="space-y-5 pt-1">
            {MOCK_RISK_CATEGORIES.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.category}</span>
                  <span
                    className={`font-mono font-bold ${
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
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
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
    </div>
  );
}
