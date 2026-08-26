'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<'redline' | 'reasoning'>('redline');

  return (
    <div className="w-full bg-slate-50 text-slate-900 pt-16 pb-24 px-6 lg:px-12 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-xs hover-lift cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Strands Multi-Agent Architecture · Amazon Bedrock</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-[1.14] text-slate-900">
            Autonomous Contract Auditing & Tracked-Changes Redlining
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-sans font-normal leading-relaxed">
            ClauseGuard pairs specialized AI legal agents with deterministic OOXML document surgery. Parse contracts, score playbook compliance, ground citations against vector indices, and export native Microsoft Word tracked changes.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/upload"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover-lift text-center btn-tactile flex items-center justify-center space-x-2"
            >
              <span>Start Contract Audit Session</span>
              <span className="text-emerald-400">→</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300/90 text-slate-800 font-semibold text-sm transition-all text-center shadow-xs hover-lift btn-tactile"
            >
              Explore Analytics Dashboard
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-3 gap-8 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0">
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-black text-slate-900">5</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Specialized Agents</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-black text-emerald-700">100%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">OOXML Tracked Changes</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-black text-slate-900">FAISS</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Playbook Grounding</div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Word Document Redline Preview Canvas */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl bg-white border border-slate-300/80 shadow-2xl overflow-hidden glass-modal hover-lift">
            {/* Window Header */}
            <div className="px-6 py-4 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block"></span>
                <span className="text-xs font-mono text-slate-700 ml-2 font-bold tracking-tight">
                  Limitation_of_Liability.docx
                </span>
              </div>
              <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('redline')}
                  className={`px-4 py-1.5 rounded-lg transition-all btn-tactile ${
                    activeTab === 'redline' 
                      ? 'bg-slate-900 text-white shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tracked Changes
                </button>
                <button
                  onClick={() => setActiveTab('reasoning')}
                  className={`px-4 py-1.5 rounded-lg transition-all btn-tactile ${
                    activeTab === 'reasoning' 
                      ? 'bg-slate-900 text-white shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Critic Citation
                </button>
              </div>
            </div>

            {/* Paper Document Body */}
            <div className="p-8 space-y-6 bg-white">
              {activeTab === 'redline' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-ping"></span>
                      <span>Clause 4.1 — Risk Level: High</span>
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 text-red-800 border border-red-200 shadow-2xs">
                      DEVIATION DETECTED
                    </span>
                  </div>

                  <div className="p-6 rounded-xl bg-slate-50/90 border border-slate-200 space-y-4 leading-relaxed">
                    <div>
                      <span className="text-slate-500 block mb-1.5 font-bold text-xs uppercase tracking-wider font-mono">
                        Original Contract Clause:
                      </span>
                      <p className="text-slate-700 font-sans text-sm leading-relaxed">
                        &quot;In no event shall Vendor be liable for any indirect, consequential, or punitive damages, and aggregate liability shall be <span className="bg-red-100/90 text-red-800 line-through px-1.5 py-0.5 rounded font-mono font-medium">unlimited</span>.&quot;
                      </p>
                    </div>
                    <div className="border-t border-slate-200/90 pt-4">
                      <span className="text-emerald-800 block mb-1.5 font-bold text-xs uppercase tracking-wider font-mono">
                        Proposed OOXML Redline:
                      </span>
                      <p className="text-slate-900 font-sans text-sm leading-relaxed">
                        &quot;In no event shall Vendor be liable for any indirect or consequential damages. <span className="bg-emerald-100 text-emerald-950 font-semibold px-2 py-0.5 rounded-md border border-emerald-300/80 shadow-2xs">Aggregate liability under this Agreement shall not exceed total fees paid in preceding 12 months</span>.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                      <span>Critic Citation Grounding Check</span>
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      SCORE: 0.96 (PASSED)
                    </span>
                  </div>

                  <div className="p-6 rounded-xl bg-slate-50/90 border border-slate-200 space-y-3 text-slate-700">
                    <div className="text-xs font-mono text-slate-900 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                      Citation ID: RULE-LIMITATION-LIABILITY-01
                    </div>
                    <p className="text-slate-700 text-sm italic font-serif leading-relaxed pt-1">
                      &quot;Vendor contracts must cap overall aggregate liability at 1x total annual contract value. Uncapped liability exceptions require CFO approval.&quot;
                    </p>
                    <div className="pt-3 text-emerald-800 font-semibold text-xs flex items-center space-x-2 border-t border-slate-200/80">
                      <svg className="w-4 h-4 text-emerald-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Entailment check verified against FastMCP FAISS vector store.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/90">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">
                  Human Decision Gate
                </span>
                <Link
                  href="/upload"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm hover-lift btn-tactile"
                >
                  Try Live Audit →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
