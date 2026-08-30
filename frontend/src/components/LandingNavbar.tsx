'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ApiStatusBadge from '@/components/ApiStatusBadge';

export default function LandingNavbar() {
  return (
    <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50 px-4 sm:px-6 lg:px-10 flex items-center justify-between transition-all">
      {/* Shared Brand Logo */}
      <Logo />

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        <a href="#architecture" className="hover:text-slate-900 transition-colors">
          5-Agent Architecture
        </a>
        <a href="#features" className="hover:text-slate-900 transition-colors">
          Capabilities
        </a>
      </nav>

      {/* Right Action Cluster */}
      <div className="flex items-center space-x-4">
        {/* Shared Reusable Backend API Health Status Indicator */}
        <ApiStatusBadge />

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
