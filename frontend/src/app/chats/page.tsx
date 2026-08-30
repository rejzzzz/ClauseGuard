'use client';

import React, { useState } from 'react';
import AgentChatLog from '@/components/AgentChatLog';
import { MOCK_AGENT_CHAT_LOGS } from '@/lib/mockData';
import { AgentChatMessage } from '@/lib/types';

export default function ChatsPage() {
  const [messages, setMessages] = useState<AgentChatMessage[]>(MOCK_AGENT_CHAT_LOGS);
  const [inputText, setInputText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      agentRole: 'User',
      agentName: 'Legal Counsel (You)',
      avatarColor: 'bg-slate-900',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: inputText.trim(),
    };

    const orchestratorReply: AgentChatMessage = {
      id: `msg-${Date.now() + 1}`,
      agentRole: 'Orchestrator',
      agentName: 'Orchestrator (Lead Counsel)',
      avatarColor: 'bg-slate-900',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: `Acknowledged custom instruction: "${inputText.trim()}". Dispatching rule update query to Auditor Agent...`,
    };

    setMessages((prev) => [...prev, userMsg, orchestratorReply]);
    setInputText('');
  };

  const filteredMessages = filterRole === 'all'
    ? messages
    : messages.filter((m) => {
        if (filterRole === 'auditor') return m.agentRole.toLowerCase() === 'auditor' || m.agentRole.toLowerCase() === 'paralegal';
        if (filterRole === 'drafter') return m.agentRole.toLowerCase() === 'drafter' || m.agentRole.toLowerCase() === 'redliner';
        if (filterRole === 'critic') return m.agentRole.toLowerCase() === 'critic' || m.agentRole.toLowerCase() === 'validator';
        return m.agentRole.toLowerCase() === filterRole.toLowerCase();
      });

  const filterOptions = [
    { id: 'all', label: 'All Traces', icon: '⚡' },
    { id: 'Orchestrator', label: 'Orchestrator', icon: '✨' },
    { id: 'auditor', label: 'Auditor', icon: '🔍' },
    { id: 'drafter', label: 'Drafter', icon: '✍️' },
    { id: 'critic', label: 'Critic', icon: '🛡️' },
    { id: 'User', label: 'Counsel (User)', icon: '👤' },
  ];

  return (
    <div className="flex-1 space-y-6 bg-slate-50 text-slate-900 flex flex-col h-[calc(100vh-10rem)] w-full pb-4">
      {/* Header & Role Filter Bar */}
      <div className="border-b border-slate-200 pb-5 shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              Multi-Agent Reasoning Log
            </span>
            <h1 className="text-3xl font-serif font-extrabold tracking-tight mt-2 text-slate-900">
              Agent Conversation & Tool Handoffs
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Inspect multi-agent execution steps across Orchestrator, Auditor, Drafter, and Critic agents.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase mr-1">Filter Steps:</span>
          {filterOptions.map((opt) => {
            const isSelected = filterRole === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFilterRole(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Log Scrollable Container */}
      <div className="flex-1 overflow-y-auto pr-2 py-2">
        <AgentChatLog messages={filteredMessages} />
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={handleSendMessage} className="shrink-0 flex gap-3 pt-3 border-t border-slate-200">
        <input
          type="text"
          placeholder="Input custom legal audit guidance or query agent reasoning trace..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs font-sans"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all hover-lift btn-tactile shrink-0 flex items-center space-x-2"
        >
          <span>Send Guidance</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  );
}
