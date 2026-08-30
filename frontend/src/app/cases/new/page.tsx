'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCase } from '@/lib/api';

export default function NewCasePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState('litigation');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const created = await createCase({
        title: title.trim(),
        description: description.trim(),
        case_type: caseType,
        status: 'ACTIVE'
      });
      router.push(`/cases/${created.id}`);
    } catch (err) {
      alert('Failed to create case: ' + String(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-serif font-extrabold text-slate-900">
          Start New Case Matter
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Initialize a new case container to upload pleadings, run research chats, and extract incident timelines.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
            Case Matter Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. State v. John Doe / Vendor Contract Dispute"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
            Matter Description / Summary
          </label>
          <textarea
            rows={4}
            placeholder="Summarize key facts, allegations, claims, or investigation directives..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
            Matter Category
          </label>
          <select
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="litigation">Litigation & Dispute Resolution</option>
            <option value="corporate">Corporate Transaction & M&A</option>
            <option value="contract_review">Contract Audit & Compliance</option>
            <option value="general">General Legal Investigation</option>
          </select>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="py-3 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center space-x-2"
          >
            <span>{submitting ? 'Creating Case...' : 'Launch Case Workbench →'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
