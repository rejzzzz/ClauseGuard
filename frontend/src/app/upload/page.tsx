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
    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 bg-slate-50 text-slate-900">
      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs inline-block">
          New Audit Session
        </span>
        <h1 className="text-3xl font-serif font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Start a Contract Audit Session
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-sans">
          Upload any vendor contract, NDA, or Master Services Agreement (.docx or .pdf) to initiate structure-aware playbook auditing, vector grounding checks, and OOXML redlining.
        </p>
      </div>

      {/* Upload Form Card */}
      <UploadCard onUploadSuccess={handleUploadSuccess} />

      {/* Helper Footer Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-center text-xs text-slate-500 pt-6 border-t border-slate-200">
        <div>
          <span className="font-semibold text-slate-900 block">1. Structure Parsing</span>
          <span>Automatic clause tree segmentation</span>
        </div>
        <div>
          <span className="font-semibold text-slate-900 block">2. Vector Search</span>
          <span>FastMCP Playbook rule matching</span>
        </div>
        <div>
          <span className="font-semibold text-slate-900 block">3. OOXML Redline</span>
          <span>Native Word tracked changes</span>
        </div>
      </div>
    </div>
  );
}
