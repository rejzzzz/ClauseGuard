'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listCases, createCase, deleteCase } from '@/lib/api';
import { CaseItem } from '@/lib/types';

export default function CasesDashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('litigation');

  useEffect(() => {
    let ignore = false;
    async function fetchCases() {
      setLoading(true);
      try {
        const data = await listCases();
        if (!ignore) {
          setCases(data);
        }
      } catch {
        console.info('Backend API offline — standalone demo mode active');
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchCases();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreateCase(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await createCase({
        title: newTitle.trim(),
        description: newDesc.trim(),
        case_type: newType,
        status: 'ACTIVE'
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      router.push(`/cases/${created.id}`);
    } catch (err) {
      alert('Failed to create case matter: ' + String(err));
    }
  }

  async function handleDeleteCase(caseId: string, title: string) {
    if (!confirm(`Are you sure you want to delete case "${title}" and all its documents, chats, and timeline events?`)) return;
    try {
      await deleteCase(caseId);
      setCases((prev) => prev.filter((c) => c.id !== caseId));
    } catch (err) {
      alert('Failed to delete case: ' + String(err));
    }
  }

  // Filtering
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' || c.case_type.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const totalDocs = cases.reduce((acc, c) => acc + (c.document_count || 0), 0);
  const totalThreads = cases.reduce((acc, c) => acc + (c.thread_count || 0), 0);
  const totalEvents = cases.reduce((acc, c) => acc + (c.event_count || 0), 0);

  return (
    <div className="space-y-8 pb-12 w-full">
      
      {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
                Case Matters Workbench
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 text-white">
                {cases.length} Matters
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Investigate case documents, run multi-thread AI research, and analyze chronological incident timelines.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Create Case Matter</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">Total Matters</div>
            <div className="text-3xl font-serif font-extrabold text-slate-900">{cases.length}</div>
            <div className="text-xs text-slate-500 font-mono">Active Legal Investigations</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">Case Documents</div>
            <div className="text-3xl font-serif font-extrabold text-emerald-600">{totalDocs}</div>
            <div className="text-xs text-slate-500 font-mono">Ingested Pleadings & Evidence</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">Research Threads</div>
            <div className="text-3xl font-serif font-extrabold text-indigo-600">{totalThreads}</div>
            <div className="text-xs text-slate-500 font-mono">Multi-Thread AI Sessions</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">Timeline Incidents</div>
            <div className="text-3xl font-serif font-extrabold text-amber-600">{totalEvents}</div>
            <div className="text-xs text-slate-500 font-mono">Extracted Chronological Facts</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            {['all', 'litigation', 'corporate', 'contract_review'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All Matters' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search case matters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Case Matters Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
            Loading case matters...
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase bg-slate-100 text-slate-700">
                      {c.case_type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h2 className="font-serif text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {c.title}
                  </h2>
                  <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {c.description || 'No detailed overview provided for this case matter.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="font-extrabold text-slate-800">{c.document_count}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Docs</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="font-extrabold text-slate-800">{c.thread_count}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Threads</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="font-extrabold text-slate-800">{c.event_count}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Events</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`/cases/${c.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs text-center transition-colors"
                    >
                      Open Case Workbench →
                    </Link>
                    <button
                      onClick={() => handleDeleteCase(c.id, c.title)}
                      title="Delete Case Matter"
                      className="ml-2 p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
            <div className="text-slate-400 text-sm font-semibold">No case matters found matching your search.</div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              + Create First Case Matter
            </button>
          </div>
        )}

      {/* New Case Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-slate-900">Create New Case Matter</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
                  Matter Title / Case Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Corp v. XYZ Ltd"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
                  Matter Description / Background
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide an overview of the dispute, claims, or investigation goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
                  Case Classification
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="litigation">Litigation & Dispute</option>
                  <option value="corporate">Corporate Transaction</option>
                  <option value="contract_review">Contract Audit</option>
                  <option value="general">General Legal Investigation</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                >
                  Create & Launch Workbench
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
