'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_PAST_DOCUMENTS } from '@/lib/mockData';
import { PastDocumentItem } from '@/lib/types';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<PastDocumentItem | null>(null);

  const filteredDocs = MOCK_PAST_DOCUMENTS.filter((doc) => {
    const matchesSearch = doc.contractName.toLowerCase().includes(searchQuery.toLowerCase()) || doc.playbookName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = selectedRisk === 'ALL' || doc.overallRisk === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="flex-1 space-y-8 bg-slate-50 text-slate-900 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            Document Repository
          </span>
          <h1 className="text-3xl font-serif font-extrabold tracking-tight mt-2 text-slate-900 sm:text-4xl">
            Past Contract Audits & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Access previous contract audit sessions, redlined Word files, and Critic grounding trace logs.
          </p>
        </div>

        <Link
          href="/upload"
          className="px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all text-center self-start sm:self-auto"
        >
          + New Audit Session
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search by contract name or playbook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium shrink-0">Filter Risk:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedRisk === risk
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Document</th>
                <th className="py-4 px-6">Playbook</th>
                <th className="py-4 px-6">Upload Date</th>
                <th className="py-4 px-6">Clauses</th>
                <th className="py-4 px-6">Overall Risk</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-4.5 px-6 font-semibold text-slate-900">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-mono text-[10px] uppercase font-bold shrink-0">
                        {doc.fileType}
                      </div>
                      <div className="truncate max-w-xs">
                        <div className="truncate font-serif text-sm">{doc.contractName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {doc.sessionId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-slate-700 font-medium">{doc.playbookName}</td>
                  <td className="py-4.5 px-6 text-slate-500 font-mono">{doc.uploadDate}</td>
                  <td className="py-4.5 px-6 text-slate-700">
                    {doc.clauseCount} clauses ({doc.deviationsCount} deviations)
                  </td>
                  <td className="py-4.5 px-6">
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
                  <td className="py-4.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3.5">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all border border-slate-200"
                      >
                        Quick Inspect
                      </button>
                      <Link
                        href={`/review/${doc.sessionId}`}
                        className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all inline-block"
                      >
                        Open Workspace
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Inspection Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-8 space-y-6 shadow-2xl relative text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-serif font-bold text-slate-900">Document Overview</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Filename:</span>
                <span className="font-semibold text-slate-900 font-serif text-sm">{selectedDoc.contractName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Target Playbook:</span>
                <span className="font-semibold text-slate-800">{selectedDoc.playbookName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Critic Grounding Score:</span>
                <span className="font-bold text-emerald-700">{selectedDoc.criticScore}% Verified</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Total Deviations:</span>
                <span className="font-bold text-red-700">{selectedDoc.deviationsCount} Clauses Flagged</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3.5 pt-3">
              <Link
                href={`/reports/${selectedDoc.sessionId}`}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all"
              >
                Export Audit Report JSON
              </Link>
              <Link
                href={`/review/${selectedDoc.sessionId}`}
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all"
              >
                Launch Review Workspace →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
