'use client';

import React from 'react';

interface DiffViewProps {
  originalText: string;
  proposedText: string;
  action?: string;
}

export default function DiffView({ originalText, proposedText, action = 'REPLACE' }: DiffViewProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 p-4 font-mono text-xs space-y-2">
      <div className="flex items-center justify-between text-gray-500 text-[10px] font-sans font-semibold uppercase tracking-wider mb-1">
        <span>Edit Comparison</span>
        <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
          Action: {action}
        </span>
      </div>

      {/* Original Language (Deletion / Redline Strike) */}
      {originalText && (
        <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 text-red-800 dark:text-red-300">
          <div className="text-[10px] font-sans font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
            - Original Text (Target Removal)
          </div>
          <p className="line-through leading-relaxed whitespace-pre-wrap">{originalText}</p>
        </div>
      )}

      {/* Proposed Language (Insertion / Green) */}
      {proposedText && (
        <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-500 text-emerald-800 dark:text-emerald-300">
          <div className="text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            + Proposed Language (Redline Insert)
          </div>
          <p className="font-semibold leading-relaxed whitespace-pre-wrap">{proposedText}</p>
        </div>
      )}
    </div>
  );
}
