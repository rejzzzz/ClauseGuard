'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  onClick?: () => void;
  compact?: boolean;
}

export default function Logo({ onClick, compact = false }: LogoProps) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center space-x-3 group shrink-0">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-sm sm:text-base shadow-xs group-hover:bg-slate-800 transition-colors">
        CG
      </div>
      {!compact && (
        <div>
          <div className="font-serif font-extrabold text-slate-900 tracking-tight text-sm sm:text-base group-hover:text-slate-700 leading-none">
            ClauseGuard
          </div>
          <div className="text-[9px] sm:text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider mt-0.5">
            Legal Counsel Suite
          </div>
        </div>
      )}
    </Link>
  );
}
