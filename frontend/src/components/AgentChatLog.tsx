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
          className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start space-x-4 transition-all duration-200 hover:border-slate-300 hover-lift glass-card"
        >
          {/* Avatar Icon */}
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            {msg.agentRole[0]}
          </div>

          {/* Message Content */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-serif">{msg.agentName}</span>
              <span className="text-xs font-mono text-slate-400">{msg.timestamp}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{msg.message}</p>

            {/* Optional Clause or Citation Badges */}
            {(msg.clauseId || msg.citationId) && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {msg.clauseId && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200 font-mono text-xs text-slate-800 font-semibold shadow-2xs">
                    Clause: {msg.clauseId}
                  </span>
                )}
                {msg.citationId && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200 font-mono text-xs text-slate-800 font-semibold shadow-2xs">
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
