'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getAuditReport } from '@/lib/api';
import { AuditReportResponse } from '@/lib/types';
import ReportViewer from '@/components/ReportViewer';

interface ReportPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [reportData, setReportData] = useState<AuditReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getAuditReport(sessionId);
        setReportData(data);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load audit report.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
          Loading structured audit summary report...
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-slate-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <h3 className="font-serif font-bold text-red-800 text-xl">Report Not Found</h3>
          <p className="text-sm text-red-600 font-sans">{errorMessage || 'Requested audit report does not exist.'}</p>
          <Link href="/upload" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold inline-block shadow-sm">
            Return to Upload Vault
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full space-y-8 bg-slate-50 text-slate-900 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-slate-900">
            Audit & Risk Summary Report
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Session ID: {sessionId}
          </p>
        </div>

        <Link
          href={`/review/${sessionId}`}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover-lift btn-tactile"
        >
          ← Return to Clause Review Workspace
        </Link>
      </div>

      <ReportViewer reportData={reportData} />
    </div>
  );
}
