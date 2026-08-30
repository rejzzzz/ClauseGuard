'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { checkHealth } from '@/lib/api';

interface TopHeaderProps {
  onToggleMobile?: () => void;
}

export default function TopHeader({ onToggleMobile }: TopHeaderProps) {
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
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/90 text-slate-800 px-4 sm:px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left: Breadcrumb / Workspace Context & Mobile Menu Toggle */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs">
            CG
          </div>
          <span className="font-serif font-extrabold text-slate-900 text-base">ClauseGuard</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-slate-500 font-mono pl-3 border-l border-slate-200">
          <span className="text-slate-900 font-extrabold">Legal Counsel Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-extrabold">Contract Compliance Engine</span>
        </div>
      </div>

      {/* Right: API Status & CTA */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Backend API Health Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-mono">
          <span className="text-slate-500 font-medium hidden sm:inline">Backend API:</span>
          {isOnline === null ? (
            <span className="text-amber-600 font-bold animate-pulse">Connecting...</span>
          ) : isOnline ? (
            <span className="flex items-center text-emerald-700 font-extrabold space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>FastAPI Online</span>
            </span>
          ) : (
            <span className="flex items-center text-slate-600 font-bold space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Standalone Demo</span>
            </span>
          )}
        </div>

        {/* Quick New Audit Button */}
        <Link
          href="/upload"
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all hover-lift btn-tactile flex items-center space-x-1.5 sm:space-x-2"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden xs:inline">New Audit</span>
        </Link>
      </div>
    </header>
  );
}
