'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import ApiStatusBadge from '@/components/ApiStatusBadge';

interface TopHeaderProps {
  onToggleMobile?: () => void;
}

export default function TopHeader({ onToggleMobile }: TopHeaderProps) {
  const pathname = usePathname();
  const isSettingsPage = pathname.startsWith('/settings');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/90 text-slate-800 px-4 sm:px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left: Mobile Menu Toggle / Mobile Brand Logo or Desktop Workspace Context */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Logo (SidebarNav is collapsed on mobile) */}
        <div className="md:hidden">
          <Logo />
        </div>

        {/* Desktop Workspace Context & Page Title */}
        <div className="hidden md:flex items-center space-x-2.5 font-mono text-xs text-slate-500">
          {isSettingsPage ? (
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold shrink-0">
                Settings Studio
              </span>
              <h1 className="text-xs font-serif font-extrabold text-slate-900 tracking-tight">
                Workspace & Typography Preferences
              </h1>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 font-mono">
              <span className="text-slate-900 font-extrabold">Legal Counsel Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-extrabold">Contract Compliance Engine</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: API Status & User Profile Dropdown */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Shared Reusable Backend API Health Status */}
        <ApiStatusBadge />



        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100/80 transition-all focus:outline-none"
            aria-label="User Profile & Settings Menu"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center relative shadow-2xs">
              LC
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <span className="hidden md:block text-xs font-bold text-slate-800">Lead Counsel</span>
            <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profile & Settings Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Profile Card */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-serif font-bold text-sm flex items-center justify-center shadow-xs">
                    LC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Lead Legal Counsel</p>
                    <p className="text-[11px] text-slate-500 font-mono">counsel@clauseguard.io</p>
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 flex items-center justify-between">
                    <span>Settings & Typography</span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">⚙️ Studio</span>
                  </div>
                </Link>
              </div>

              {/* Theme Preference */}
              <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-700">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light Theme</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>

              {/* Footer info */}
              <div className="px-4 py-2 border-t border-slate-100 text-[10px] font-mono text-slate-400 flex justify-between">
                <span>ClauseGuard v2.4</span>
                <span>FastMCP Grounded</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
