'use client';

import React from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import AgentPipelineVisualizer from '@/components/AgentPipelineVisualizer';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Multi-Agent Architecture Breakdown */}
      <section id="architecture">
        <AgentPipelineVisualizer />
      </section>

      {/* Enterprise Capabilities Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl font-serif font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Institutional Grade Contract Intelligence
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            Engineered for corporate legal counsel, paralegals, and procurement teams requiring auditable reasoning and native document surgery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl bg-white border border-slate-200 space-y-4 hover:border-slate-300 transition-all shadow-xs">
            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Playbook Compliance</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Match every clause against versioned organizational playbooks using structure-aware FAISS retrieval and Bedrock Titan Embeddings.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-white border border-slate-200 space-y-4 hover:border-slate-300 transition-all shadow-xs">
            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 012.828 0L20 4.828a2 2 0 010 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Native OOXML Surgery</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Generates genuine Word tracked changes (<code className="text-slate-900 font-mono font-semibold">w:ins</code>, <code className="text-slate-900 font-mono font-semibold">w:del</code>) with author tags, timestamps, and inline legal comments.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-white border border-slate-200 space-y-4 hover:border-slate-300 transition-all shadow-xs">
            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Human-in-the-Loop Gate</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Review and decision authority remains strictly with human counsel. Approve, edit, or reject proposed redlines on a clause-by-clause basis.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 px-6 lg:px-12 bg-slate-900 border-t border-slate-800 text-center text-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-serif font-extrabold text-white tracking-tight sm:text-4xl">
            Ready to Audit Your Contracts?
          </h2>
          <p className="text-sm text-slate-300 font-sans">
            Upload your Master Services Agreement or vendor contract to start an automated risk analysis session.
          </p>
          <div>
            <Link
              href="/upload"
              className="px-8 py-4 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all inline-block"
            >
              Start Contract Audit Session →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
