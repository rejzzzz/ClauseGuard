'use client';

import React from 'react';
import { AgentChatMessage } from '@/lib/types';

interface AgentChatLogProps {
  messages: AgentChatMessage[];
}

export default function AgentChatLog({ messages }: AgentChatLogProps) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start space-x-3 transition-all hover:border-slate-300"
        >
          {/* Avatar Icon */}
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {msg.agentRole[0]}
          </div>

          {/* Message Content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 font-serif">{msg.agentName}</span>
              <span className="text-[11px] font-mono text-slate-400">{msg.timestamp}</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">{msg.message}</p>

            {/* Optional Clause or Citation Badges */}
            {(msg.clauseId || msg.citationId) && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {msg.clauseId && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-800">
                    Clause: {msg.clauseId}
                  </span>
                )}
                {msg.citationId && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-800">
                    Citation: {msg.citationId}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
