'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { listCases } from '@/lib/api';
import { CaseItem } from '@/lib/types';

export default function ActiveCasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadActiveCases() {
      try {
        const data = await listCases('ACTIVE');
        setCases(data);
      } catch {
        console.info('Backend API offline — standalone demo mode active');
      } finally {
        setLoading(false);
      }
    }
    loadActiveCases();
  }, []);

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-8 bg-slate-50 text-slate-900 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold shadow-2xs inline-block">
            Active Litigation & Review Matters
          </span>
          <h1 className="text-3xl font-serif font-extrabold tracking-tight mt-2 text-slate-900 sm:text-4xl">
            Active Case Matters
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Manage all active legal investigations, contract disputes, and multi-thread litigation workbenches.
          </p>
        </div>

        <Link
          href="/cases/new"
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all hover-lift btn-tactile flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Start New Case</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 w-full">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search active cases by matter title, allegation, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="text-xs font-mono text-slate-500 shrink-0">
          Showing <span className="font-bold text-slate-900">{filteredCases.length}</span> active matters
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse">
          Loading active case matters...
        </div>
      ) : filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover-lift"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ACTIVE MATTER
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {c.case_type}
                  </span>
                </div>

                <h2 className="text-xl font-serif font-extrabold text-slate-900 leading-tight">
                  {c.title}
                </h2>

                <p className="text-xs text-slate-600 line-clamp-2 font-sans leading-relaxed">
                  {c.description || 'No summary description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs font-mono text-slate-500">
                  <span>📄 {c.document_count} docs</span>
                  <span>💬 {c.thread_count} threads</span>
                </div>

                <Link
                  href={`/cases/${c.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>Open Workbench</span>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold font-serif">
            ⚖️
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900">
            No Active Case Matters Found
          </h3>
          <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
            {searchQuery
              ? `No active cases matched "${searchQuery}". Try a different keyword.`
              : 'There are currently no active legal cases. Initialize a new case to upload pleadings, run research chats, and extract timelines.'}
          </p>
          <Link
            href="/cases/new"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800"
          >
            + Create New Case Matter
          </Link>
        </div>
      )}
    </div>
  );
}
