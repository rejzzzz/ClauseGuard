'use client';

import React, { useState } from 'react';
import AgentChatLog from '@/components/AgentChatLog';
import { MOCK_AGENT_CHAT_LOGS } from '@/lib/mockData';
import { AgentChatMessage } from '@/lib/types';

export default function ChatsPage() {
  const [messages, setMessages] = useState<AgentChatMessage[]>(MOCK_AGENT_CHAT_LOGS);
  const [inputText, setInputText] = useState('');

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

  return (
    <div className="flex-1 space-y-6 bg-slate-50 text-slate-900 flex flex-col h-[calc(100vh-10rem)] w-full pb-4">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 shrink-0">
        <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
          Multi-Agent Reasoning Log
        </span>
        <h1 className="text-3xl font-serif font-extrabold tracking-tight mt-2 text-slate-900">
          Agent Conversation & Tool Handoffs
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-sans">
          Inspect execution traces across Orchestrator, Paralegal, Drafter, and Critic agents.
        </p>
      </div>

      {/* Chat Messages Log Scrollable Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AgentChatLog messages={messages} />
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={handleSendMessage} className="shrink-0 flex gap-3 pt-3 border-t border-slate-200">
        <input
          type="text"
          placeholder="Input custom legal audit guidance or query agent reasoning trace..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all hover-lift btn-tactile shrink-0"
        >
          Send Guidance
        </button>
      </form>
    </div>
  );
}
