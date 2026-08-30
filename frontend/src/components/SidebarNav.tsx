'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { listCases } from '@/lib/api';
import { CaseItem } from '@/lib/types';

interface SidebarNavProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function SidebarNav({ mobileOpen = false, onCloseMobile }: SidebarNavProps) {
  const pathname = usePathname();
  const [cases, setCases] = useState<CaseItem[]>([]);

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await listCases('ACTIVE');
        setCases(data.slice(0, 5));
      } catch (err) {
        console.warn('Backend offline or error listing cases:', err);
      }
    }
    loadCases();
  }, [pathname]);

  const navItems = [
    {
      label: 'Case Matters',
      href: '/cases',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
      label: 'Contract Auditor Tool',
      href: '/upload',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      label: 'Past Audit Vault',
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

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-slate-200/80">
          <Link href="/" onClick={onCloseMobile} className="flex items-center space-x-3.5 group">
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
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close Mobile Sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Button */}
        <div className="px-5 pt-6 pb-3">
          <Link
            href="/cases/new"
            onClick={onCloseMobile}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all hover-lift btn-tactile"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Start New Case</span>
          </Link>
        </div>

        {/* Core Workspace Navigation */}
        <div className="px-4 py-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Workspace Tools
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/cases' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
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

        {/* Active Case Matters */}
        <div className="px-4 py-4 border-t border-slate-100 space-y-2">
          <div className="px-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Active Case Matters
            </span>
            <Link
              href="/cases"
              onClick={onCloseMobile}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="space-y-1">
            {cases.length > 0 ? (
              cases.map((c) => {
                const isCaseActive = pathname?.includes(c.id);
                return (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    onClick={onCloseMobile}
                    className={`block px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      isCaseActive
                        ? 'bg-slate-100 font-bold text-slate-900 border-l-2 border-slate-900'
                        : 'hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate font-serif text-xs font-bold text-slate-800 max-w-[130px]">
                        {c.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 text-slate-700">
                        {c.document_count} docs
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                      {c.case_type} · {c.thread_count} threads
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="px-3 py-2 text-[11px] text-slate-400 italic">
                No active cases yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Engine Status */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Case Engine Active</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono leading-tight">
          Bedrock · Multi-Thread · Citations · Timeline
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 h-screen bg-white border-r border-slate-200/90 text-slate-700 flex-col justify-between z-40 overflow-y-auto hidden md:flex shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[80vw] h-full bg-white text-slate-700 shadow-2xl flex flex-col justify-between overflow-y-auto z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
