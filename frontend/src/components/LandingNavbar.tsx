'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { checkHealth } from '@/lib/api';

export default function LandingNavbar() {
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
    <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between transition-all">
      {/* Brand Logo & Name */}
      <Link href="/" className="flex items-center space-x-3.5 group">
        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-base shadow-sm group-hover:bg-slate-800 transition-all">
          CG
        </div>
        <div>
          <div className="font-serif font-extrabold text-slate-900 tracking-tight text-lg group-hover:text-slate-700 transition-all">
            ClauseGuard
          </div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase -mt-0.5">
            Multi-Agent Legal Technology
          </div>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        <a href="#architecture" className="hover:text-slate-900 transition-colors">
          5-Agent Architecture
        </a>
        <a href="#features" className="hover:text-slate-900 transition-colors">
          Capabilities
        </a>
        <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
          Dashboard
        </Link>
        <Link href="/documents" className="hover:text-slate-900 transition-colors">
          Past Audits
        </Link>
      </nav>

      {/* Right Action Cluster */}
      <div className="flex items-center space-x-4">
        {/* Backend API Health Status Indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <span className="text-slate-500">API Status:</span>
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

        {/* CTA Launch Audit */}
        <Link
          href="/upload"
          className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
        >
          Launch Audit Session →
        </Link>
      </div>
    </header>
  );
}
