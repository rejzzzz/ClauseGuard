'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  listCaseThreads,
  createCaseThread,
  fetchThreadMessages,
  sendThreadMessage
} from '@/lib/api';
import { ChatThreadItem, ThreadMessageItem, CitationItem } from '@/lib/types';

interface Props {
  caseId: string;
}

export default function CaseThreadChat({ caseId }: Props) {
  const [threads, setThreads] = useState<ChatThreadItem[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  // Citation Modal state
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);
  
  // New thread state
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchThreads() {
      try {
        const data = await listCaseThreads(caseId);
        if (ignore) return;
        setThreads(data);
        if (data.length > 0) {
          setActiveThreadId((prev) => prev ?? data[0].id);
        } else {
          // Auto-create initial thread if none exist
          const defaultThread = await createCaseThread(caseId, 'General Case Research', 'Initial research session');
          if (ignore) return;
          setThreads([defaultThread]);
          setActiveThreadId(defaultThread.id);
        }
      } catch (err) {
        console.warn('Failed to load threads:', err);
      }
    }

    if (caseId) {
      fetchThreads();
    }

    return () => {
      ignore = true;
    };
  }, [caseId]);

  useEffect(() => {
    if (!activeThreadId || !caseId) return;
    const threadId = activeThreadId;
    let ignore = false;

    async function fetchMessages() {
      try {
        const msgs = await fetchThreadMessages(caseId, threadId);
        if (!ignore) {
          setMessages(msgs);
        }
      } catch (err) {
        console.warn('Failed to load messages:', err);
      }
    }

    fetchMessages();

    return () => {
      ignore = true;
    };
  }, [caseId, activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!newThreadTitle.trim()) return;
    try {
      const newThread = await createCaseThread(caseId, newThreadTitle.trim());
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
      setNewThreadTitle('');
      setIsCreatingThread(false);
    } catch (err) {
      alert('Failed to create thread: ' + String(err));
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMsgs = await sendThreadMessage(caseId, activeThreadId, textToSend, 'Senior Counsel', 'user');
      setMessages((prev) => [...prev, ...newMsgs]);
    } catch (err) {
      alert('Failed to send message: ' + String(err));
    } finally {
      setSending(false);
    }
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col h-[650px] overflow-hidden">
      
      {/* Top Thread Bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-x-auto pr-2">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeThreadId === t.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              # {t.title}
            </button>
          ))}

          {isCreatingThread ? (
            <form onSubmit={handleCreateThread} className="flex items-center space-x-1">
              <input
                type="text"
                autoFocus
                placeholder="Thread title..."
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="px-2 py-1 rounded bg-slate-800 text-xs text-white border border-slate-700 focus:outline-none"
              />
              <button type="submit" className="text-xs text-emerald-400 font-bold px-1.5">
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingThread(false)}
                className="text-xs text-slate-400 font-bold px-1"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingThread(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-colors flex items-center space-x-1"
            >
              <span>+ New Thread</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-400 shrink-0 hidden sm:block">
          {activeThread ? `#${activeThread.title}` : 'Select Thread'}
        </div>
      </div>

      {/* Messages Transcript Window */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.length > 0 ? (
          messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    {m.agent_name || (isUser ? 'Lawyer' : 'Assistant')}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Citations Badges */}
                  {m.citations_json && m.citations_json.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      <span className="text-[9px] font-mono uppercase font-bold text-slate-400 mr-1 self-center">
                        Citations:
                      </span>
                      {m.citations_json.map((cit, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCitation(cit)}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold hover:bg-indigo-100 transition-colors flex items-center space-x-1"
                        >
                          <span>📄 {cit.filename}</span>
                          {cit.page_number && <span>(p.{cit.page_number})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="text-xs font-semibold text-slate-600">Start the Research Conversation</div>
            <p className="text-[11px] text-slate-400 max-w-sm">
              Ask questions about case evidence, legal claims, or contradictions. The assistant will cite exact document pages.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          placeholder={sending ? 'AI Assistant searching case vector DB...' : 'Type a query or instruction for this thread...'}
          disabled={sending || !activeThreadId}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors"
        >
          {sending ? 'Searching...' : 'Send →'}
        </button>
      </form>

      {/* Citation Detail Inspector Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-base">📄</span>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">{activeCitation.filename}</h3>
                  <div className="text-[10px] font-mono text-slate-400">
                    {activeCitation.page_number ? `Page ${activeCitation.page_number}` : 'Document Excerpt'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-serif italic text-slate-800 leading-relaxed max-h-60 overflow-y-auto">
              &quot;{activeCitation.text_excerpt}&quot;
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
              <span>Chunk ID: {activeCitation.chunk_id || 'N/A'}</span>
              <button
                onClick={() => setActiveCitation(null)}
                className="py-1.5 px-3 rounded-lg bg-slate-900 text-white font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
