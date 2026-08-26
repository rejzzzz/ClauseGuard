'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOCK_PAST_DOCUMENTS } from '@/lib/mockData';

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'New Audit Session',
      href: '/upload',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      label: 'Analytics Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Past Document Vault',
      href: '/documents',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Agent Reasoning Logs',
      href: '/chats',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 h-screen bg-white border-r border-slate-200/90 text-slate-700 flex flex-col justify-between z-40 overflow-y-auto hidden md:flex shrink-0">
      <div>
        {/* Brand Header */}
        <Link href="/" className="h-20 flex items-center px-6 border-b border-slate-200/80 space-x-3.5 hover:bg-slate-50/80 transition-colors group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-base shadow-sm group-hover:bg-slate-800 transition-colors">
            CG
          </div>
          <div>
            <div className="font-serif font-extrabold text-slate-900 tracking-tight text-base group-hover:text-slate-700">
              ClauseGuard
            </div>
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider -mt-0.5">
              Legal Counsel Suite
            </div>
          </div>
        </Link>

        {/* Action Button */}
        <div className="px-5 pt-6 pb-3">
          <Link
            href="/upload"
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all hover-lift btn-tactile"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Start New Audit</span>
          </Link>
        </div>

        {/* Core Workspace Navigation */}
        <div className="px-4 py-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Workspace Tools
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/upload' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Recent Audit Sessions & Case Matters */}
        <div className="px-4 py-5 border-t border-slate-100 space-y-2">
          <div className="px-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Recent Matters & Audits
            </span>
            <Link href="/documents" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-1">
            {MOCK_PAST_DOCUMENTS.slice(0, 4).map((doc) => {
              const isSessionActive = pathname?.includes(doc.sessionId);
              return (
                <Link
                  key={doc.id}
                  href={`/review/${doc.sessionId}`}
                  className={`block px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isSessionActive
                      ? 'bg-slate-100 font-bold text-slate-900 border-l-2 border-slate-900'
                      : 'hover:bg-slate-50/80 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-serif text-xs font-bold text-slate-800 max-w-[135px]">
                      {doc.contractName.split('.')[0]}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${
                        doc.overallRisk === 'CRITICAL' || doc.overallRisk === 'HIGH'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : doc.overallRisk === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {doc.overallRisk[0]}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    {doc.playbookName.split(' ')[0]} · {doc.clauseCount} clauses
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Engine Status */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Legal Engine Ready</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono leading-tight">
          Bedrock · FastMCP FAISS · OOXML Redlines
        </p>
      </div>
    </aside>
  );
}
