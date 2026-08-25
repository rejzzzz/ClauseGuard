'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { checkHealth } from '@/lib/api';

export default function TopHeader() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then((data) => {
        if (isMounted) setIsOnline(data && (data.status === 'ok' || data.status === 'healthy'));
      })
      .catch(() => {
        if (isMounted) setIsOnline(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-200 text-slate-800 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left: Breadcrumb / Workspace Context */}
      <div className="flex items-center space-x-3">
        <div className="md:hidden flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-sm">
            CG
          </div>
          <span className="font-serif font-extrabold text-slate-900 text-base">ClauseGuard</span>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-500">
          <span className="text-slate-900 font-semibold">Legal Counsel Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-semibold">Contract Compliance Engine</span>
        </div>
      </div>

      {/* Right: API Status & CTA */}
      <div className="flex items-center space-x-4">
        {/* Backend API Health Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <span className="text-slate-500 hidden sm:inline">Backend API:</span>
          {isOnline === null ? (
            <span className="text-amber-600 font-medium animate-pulse">Connecting...</span>
          ) : isOnline ? (
            <span className="flex items-center text-emerald-700 font-semibold space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>FastAPI Online</span>
            </span>
          ) : (
            <span className="flex items-center text-slate-500 font-semibold space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Standalone Demo</span>
            </span>
          )}
        </div>

        {/* Quick New Audit Button */}
        <Link
          href="/upload"
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Audit</span>
        </Link>
      </div>
    </header>
  );
}
