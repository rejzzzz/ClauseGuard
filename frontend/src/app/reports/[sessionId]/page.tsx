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
        setLoading(true);
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
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-gray-500 font-medium">
          <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          Loading structured audit summary report...
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <h3 className="font-bold text-red-800 text-lg mb-2">Report Not Found</h3>
          <p className="text-sm text-red-600 mb-4">{errorMessage || 'Requested audit report does not exist.'}</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            Return to Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Audit & Risk Summary Report
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Session ID: {sessionId}
          </p>
        </div>

        <Link
          href={`/review/${sessionId}`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition shadow-sm"
        >
          ← Return to Clause Review Workspace
        </Link>
      </div>

      <ReportViewer reportData={reportData} />
    </div>
  );
}
