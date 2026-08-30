'use client';

import React, { useState, useEffect } from 'react';
import { fetchCaseTimeline, updateTimelineEvent, triggerTimelineExtraction } from '@/lib/api';
import { TimelineEventItem } from '@/lib/types';

interface Props {
  caseId: string;
}

export default function CaseTimelineView({ caseId }: Props) {
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadTimeline() {
      setLoading(true);
      try {
        const catFilter = selectedCategory === 'all' ? undefined : selectedCategory;
        const data = await fetchCaseTimeline(caseId, catFilter);
        if (!ignore) {
          setEvents(data);
        }
      } catch (err) {
        console.warn('Failed to load timeline:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (caseId) {
      loadTimeline();
    }

    return () => {
      ignore = true;
    };
  }, [caseId, selectedCategory]);

  async function handleToggleDisputed(evt: TimelineEventItem) {
    try {
      const updated = await updateTimelineEvent(caseId, evt.id, {
        is_disputed: !evt.is_disputed
      });
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      alert('Failed to update event: ' + String(err));
    }
  }

  async function handleExtractTimeline() {
    setExtracting(true);
    try {
      const res = await triggerTimelineExtraction(caseId);
      alert(res.message);
      const catFilter = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await fetchCaseTimeline(caseId, catFilter);
      setEvents(data);
    } catch (err) {
      alert('Timeline extraction failed: ' + String(err));
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-5 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="font-serif font-bold text-slate-900 text-sm">
            Incident Timeline Graph ({events.length})
          </h2>
        </div>

        <button
          onClick={handleExtractTimeline}
          disabled={extracting}
          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
        >
          {extracting ? 'Extracting...' : '⚡ Re-extract Facts'}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px] font-semibold">
        {['all', 'notice', 'payment', 'agreement', 'litigation', 'breach', 'general'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg transition-all capitalize whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline Feed */}
      <div className="space-y-4 overflow-y-auto max-h-[480px] flex-1 pr-1">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading timeline events...
          </div>
        ) : events.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Node dot */}
                <div
                  className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                    evt.is_disputed
                      ? 'border-red-500 bg-red-100'
                      : evt.category === 'payment'
                      ? 'border-emerald-500'
                      : evt.category === 'notice'
                      ? 'border-indigo-500'
                      : 'border-slate-400'
                  }`}
                />

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-white transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-xs text-slate-900">
                        {evt.event_date_raw || (evt.event_date ? new Date(evt.event_date).toLocaleDateString() : 'Undated')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                          evt.category === 'payment'
                            ? 'bg-emerald-100 text-emerald-800'
                            : evt.category === 'notice'
                            ? 'bg-indigo-100 text-indigo-800'
                            : evt.category === 'breach'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {evt.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleDisputed(evt)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                        evt.is_disputed
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-700'
                      }`}
                    >
                      {evt.is_disputed ? '⚠ Disputed Fact' : 'Mark Disputed'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-serif">
                    {evt.event_summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                    <span>
                      {evt.page_number ? `Source: Page ${evt.page_number}` : 'Extracted from doc'}
                    </span>
                    <span>Confidence: {(evt.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-400 italic">
            No timeline events extracted yet. Upload documents and click &quot;Re-extract Facts&quot;.
          </div>
        )}
      </div>

    </div>
  );
}
