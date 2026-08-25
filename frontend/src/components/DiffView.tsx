'use client';

import React from 'react';

interface DiffViewProps {
  originalText: string;
  proposedText: string;
  action?: string;
}

export default function DiffView({ originalText, proposedText, action = 'REPLACE' }: DiffViewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between text-slate-500 text-[11px] font-sans font-bold uppercase tracking-wider">
        <span>OOXML Redline Comparison</span>
        <span className="px-2.5 py-0.5 rounded bg-white text-slate-800 border border-slate-200 text-[10px]">
          Action: {action}
        </span>
      </div>

      {/* Original Language (Deletion / Redline Strike) */}
      {originalText && (
        <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-900">
          <div className="text-[10px] font-sans font-bold text-red-700 uppercase tracking-wider mb-1">
            - Original Contract Language (Target Deletion)
          </div>
          <p className="line-through leading-relaxed whitespace-pre-wrap font-sans">{originalText}</p>
        </div>
      )}

      {/* Proposed Language (Insertion / Green) */}
      {proposedText && (
        <div className="p-3 rounded-lg bg-emerald-50 border-l-4 border-emerald-600 text-emerald-950">
          <div className="text-[10px] font-sans font-bold text-emerald-800 uppercase tracking-wider mb-1">
            + Proposed Playbook Language (Tracked Insert)
          </div>
          <p className="font-semibold leading-relaxed whitespace-pre-wrap font-sans">{proposedText}</p>
        </div>
      )}
    </div>
  );
}
