'use client';

import React from 'react';
import { AgentChatMessage } from '@/lib/types';

interface AgentChatLogProps {
  messages: AgentChatMessage[];
}

function getRoleBadge(role: string) {
  switch (role.toLowerCase()) {
    case 'orchestrator':
      return {
        bg: 'bg-slate-900',
        text: 'text-white',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
        label: 'ORCHESTRATOR',
        icon: '✨',
      };
    case 'auditor':
    case 'paralegal':
      return {
        bg: 'bg-amber-600',
        text: 'text-white',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'AUDITOR / PARALEGAL',
        icon: '🔍',
      };
    case 'drafter':
    case 'redliner':
      return {
        bg: 'bg-emerald-700',
        text: 'text-white',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'DRAFTER / REDLINER',
        icon: '✍️',
      };
    case 'critic':
    case 'validator':
      return {
        bg: 'bg-indigo-700',
        text: 'text-white',
        badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        label: 'CRITIC / GROUNDING',
        icon: '🛡️',
      };
    case 'user':
    default:
      return {
        bg: 'bg-slate-800',
        text: 'text-white',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        label: 'LEAD COUNSEL',
        icon: '👤',
      };
  }
}

export default function AgentChatLog({ messages }: AgentChatLogProps) {
  if (messages.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <p className="text-xs text-slate-500 font-mono">No execution traces found for selected agent filter.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-5 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200/80">
      {messages.map((msg) => {
        const badge = getRoleBadge(msg.agentRole);
        const isUser = msg.agentRole.toLowerCase() === 'user';

        return (
          <div key={msg.id} className="relative flex items-start space-x-4 group">
            {/* Timeline Avatar Node */}
            <div
              className={`w-8 h-8 rounded-xl ${badge.bg} ${badge.text} font-bold text-xs flex items-center justify-center shrink-0 shadow-xs z-10 -ml-7.5 ring-4 ring-slate-50 transition-transform group-hover:scale-105`}
            >
              <span className="text-xs">{badge.icon}</span>
            </div>

            {/* Message Body Card */}
            <div
              className={`flex-1 p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-2xs ${
                isUser
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-white text-slate-900 border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                      isUser ? 'bg-slate-800 text-slate-200 border-slate-700' : badge.badgeBg
                    }`}
                  >
                    {badge.label}
                  </span>
                  <span className={`text-xs font-serif font-bold ${isUser ? 'text-slate-100' : 'text-slate-900'}`}>
                    {msg.agentName}
                  </span>
                </div>
                <span className={`text-[11px] font-mono ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>

              <p className={`text-xs sm:text-sm leading-relaxed font-sans ${isUser ? 'text-slate-200' : 'text-slate-700'}`}>
                {msg.message}
              </p>

              {/* Optional Clause or Citation Badges */}
              {(msg.clauseId || msg.citationId) && (
                <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-slate-100/30">
                  {msg.clauseId && (
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                        isUser ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      Clause: {msg.clauseId}
                    </span>
                  )}
                  {msg.citationId && (
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                        isUser ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      Citation: {msg.citationId}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
