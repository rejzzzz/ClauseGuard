'use client';

import React from 'react';

interface DiffViewProps {
  originalText: string;
  proposedText: string;
  action?: string;
}

export default function DiffView({ originalText, proposedText, action = 'REPLACE' }: DiffViewProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 p-5 sm:p-6 font-mono text-xs space-y-4 shadow-2xs">
      <div className="flex items-center justify-between text-slate-500 text-[11px] font-sans font-bold uppercase tracking-wider">
        <span>OOXML Redline Comparison</span>
        <span className="px-3 py-1 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-mono font-bold shadow-2xs">
          Action: {action}
        </span>
      </div>

      {/* Original Language (Deletion / Redline Strike) */}
      {originalText && (
        <div className="p-4 rounded-xl bg-red-50/90 border-l-4 border-red-500 text-red-950 space-y-1 shadow-2xs">
          <div className="text-[11px] font-mono font-bold text-red-800 uppercase tracking-wider mb-1">
            - Original Contract Language (Target Deletion)
          </div>
          <p className="line-through leading-relaxed whitespace-pre-wrap font-sans text-sm">{originalText}</p>
        </div>
      )}

      {/* Proposed Language (Insertion / Green) */}
      {proposedText && (
        <div className="p-4 rounded-xl bg-emerald-50/90 border-l-4 border-emerald-600 text-emerald-950 space-y-1 shadow-2xs">
          <div className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider mb-1">
            + Proposed Playbook Language (Tracked Insert)
          </div>
          <p className="font-semibold leading-relaxed whitespace-pre-wrap font-sans text-sm text-emerald-950">{proposedText}</p>
        </div>
      )}
    </div>
  );
}
