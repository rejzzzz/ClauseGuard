'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import UploadCard from '@/components/UploadCard';
import { SessionInitResponse } from '@/lib/types';

export default function UploadPage() {
  const router = useRouter();

  const handleUploadSuccess = (res: SessionInitResponse) => {
    // Redirect to review workspace for the created session
    router.push(`/review/${res.session_id}`);
  };

  return (
    <div className="flex-1 space-y-8 bg-slate-50 text-slate-900 pb-12 w-full">
      {/* Page Header (Left-aligned, matching /dashboard, /cases, /documents, /chats) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs inline-block">
            Contract Auditor Tool
          </span>
          <h1 className="text-3xl font-serif font-extrabold tracking-tight mt-2 text-slate-900 sm:text-4xl">
            Start a Contract Audit Session
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Upload vendor contracts, NDAs, or Master Services Agreements (.docx or .pdf) for multi-agent auditing & OOXML redlining.
          </p>
        </div>
      </div>

      {/* Main Upload Card Container */}
      <div className="max-w-3xl mx-auto space-y-8 w-full pt-2">
        {/* Upload Form Card */}
        <UploadCard onUploadSuccess={handleUploadSuccess} />

        {/* Helper Footer Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-center text-xs text-slate-500 pt-6 border-t border-slate-200">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="font-bold text-slate-900 block text-sm">1. Structure Parsing</span>
            <span className="text-slate-500 text-[11px]">Automatic clause tree segmentation</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="font-bold text-slate-900 block text-sm">2. Vector Search</span>
            <span className="text-slate-500 text-[11px]">FastMCP Playbook rule matching</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="font-bold text-slate-900 block text-sm">3. OOXML Redline</span>
            <span className="text-slate-500 text-[11px]">Native Word tracked changes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
