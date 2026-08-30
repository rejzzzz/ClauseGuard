'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CaseDocumentUploader from '@/components/CaseDocumentUploader';
import CaseThreadChat from '@/components/CaseThreadChat';
import CaseTimelineView from '@/components/CaseTimelineView';
import { getCase, listCaseDocuments, deleteCase } from '@/lib/api';
import { CaseItem, CaseDocumentItem } from '@/lib/types';

export default function CaseWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [caseItem, setCaseItem] = useState<CaseItem | null>(null);
  const [documents, setDocuments] = useState<CaseDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workspace' | 'docs' | 'timeline'>('workspace');

  const loadCaseData = React.useCallback(async () => {
    if (!caseId) return;
    try {
      const [c, docs] = await Promise.all([
        getCase(caseId),
        listCaseDocuments(caseId)
      ]);
      setCaseItem(c);
      setDocuments(docs);
    } catch (err) {
      console.warn('Failed to load case data:', err);
    }
  }, [caseId]);

  useEffect(() => {
    if (!caseId) return;
    let ignore = false;

    async function init() {
      setLoading(true);
      try {
        const [c, docs] = await Promise.all([
          getCase(caseId),
          listCaseDocuments(caseId)
        ]);
        if (!ignore) {
          setCaseItem(c);
          setDocuments(docs);
        }
      } catch (err) {
        console.warn('Failed to load case data:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, [caseId]);

  async function handleDeleteCase() {
    if (!caseItem) return;
    if (!confirm(`Delete case matter "${caseItem.title}" and all associated files?`)) return;
    try {
      await deleteCase(caseId);
      router.push('/cases');
    } catch (err) {
      alert('Failed to delete case: ' + String(err));
    }
  }

  if (loading && !caseItem) {
    return (
      <div className="py-16 text-center text-slate-400 font-mono text-sm animate-pulse">
        Loading Case Workbench...
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="text-lg font-serif font-bold text-slate-800">Case Matter Not Found</div>
        <p className="text-xs text-slate-500">Case matter &apos;{caseId}&apos; does not exist or was deleted.</p>
        <Link href="/cases" className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs inline-block">
          ← Return to Case Matters
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Case Workspace Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase bg-slate-100 text-slate-700">
                {caseItem.case_type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {caseItem.status}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {caseItem.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-tight mt-2">
              {caseItem.title}
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-3xl">
              {caseItem.description || 'Legal investigation and case document research workspace.'}
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center space-x-2 shrink-0">
            <Link
              href="/upload"
              className="py-2.5 px-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <span>⚡ Contract Audit Tool</span>
            </Link>
            <button
              onClick={handleDeleteCase}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
              title="Delete Matter"
            >
              🗑
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="flex items-center space-x-6 border-t border-slate-100 pt-3 text-xs font-mono text-slate-500">
          <div>
            <span className="font-bold text-slate-900">{documents.length}</span> Documents Ingested
          </div>
          <div>•</div>
          <div>
            <span className="font-bold text-slate-900">{caseItem.thread_count}</span> Chat Threads
          </div>
          <div>•</div>
          <div>
            <span className="font-bold text-slate-900">{caseItem.event_count}</span> Incident Facts
          </div>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="flex lg:hidden items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex-1 py-2 rounded-lg ${activeTab === 'workspace' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'}`}
        >
          Research Chat
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex-1 py-2 rounded-lg ${activeTab === 'docs' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'}`}
        >
          Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2 rounded-lg ${activeTab === 'timeline' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'}`}
        >
          Timeline
        </button>
      </div>

      {/* Desktop 3-Panel Legal Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: Case Document Vault */}
        <div className={`lg:col-span-3 ${activeTab === 'docs' || activeTab === 'workspace' ? 'block' : 'hidden lg:block'}`}>
          <CaseDocumentUploader
            caseId={caseId}
            documents={documents}
            onDocumentChange={loadCaseData}
          />
        </div>

        {/* Center Panel: Multi-Thread AI Research Chat */}
        <div className={`lg:col-span-6 ${activeTab === 'workspace' ? 'block' : 'hidden lg:block'}`}>
          <CaseThreadChat caseId={caseId} />
        </div>

        {/* Right Panel: Incident Timeline View */}
        <div className={`lg:col-span-3 ${activeTab === 'timeline' || activeTab === 'workspace' ? 'block' : 'hidden lg:block'}`}>
          <CaseTimelineView caseId={caseId} />
        </div>

      </div>
    </div>
  );
}
