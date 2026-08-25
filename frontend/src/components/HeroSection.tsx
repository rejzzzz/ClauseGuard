'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<'redline' | 'reasoning'>('redline');

  return (
    <div className="w-full bg-slate-50 text-slate-900 pt-14 pb-20 px-6 lg:px-12 border-b border-slate-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Strands Multi-Agent Architecture · Amazon Bedrock</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-[1.12] text-slate-900">
            Autonomous Contract Auditing & Tracked-Changes Redlining
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-sans font-normal leading-relaxed">
            ClauseGuard pairs specialized AI legal agents with deterministic OOXML document surgery. Parse contracts, score playbook compliance, ground citations against vector indices, and export native Microsoft Word tracked changes.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-3">
            <Link
              href="/upload"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all text-center"
            >
              Start Contract Audit Session →
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs transition-all text-center shadow-xs"
            >
              Explore Analytics Dashboard
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200 max-w-md mx-auto lg:mx-0">
            <div>
              <div className="text-3xl font-serif font-black text-slate-900">5</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Specialized Agents</div>
            </div>
            <div>
              <div className="text-3xl font-serif font-black text-emerald-700">100%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">OOXML Tracked Changes</div>
            </div>
            <div>
              <div className="text-3xl font-serif font-black text-slate-900">FAISS</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Playbook Grounding</div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Word Document Redline Preview Canvas */}
        <div className="lg:col-span-5">
          <div className="rounded-xl bg-white border border-slate-300 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                <span className="text-xs font-mono text-slate-700 ml-2 font-semibold">Limitation_of_Liability.docx</span>
              </div>
              <div className="flex bg-white p-0.5 rounded border border-slate-200 text-[11px] font-medium">
                <button
                  onClick={() => setActiveTab('redline')}
                  className={`px-3 py-1 rounded transition-all ${
                    activeTab === 'redline' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tracked Changes
                </button>
                <button
                  onClick={() => setActiveTab('reasoning')}
                  className={`px-3 py-1 rounded transition-all ${
                    activeTab === 'reasoning' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Critic Citation
                </button>
              </div>
            </div>

            {/* Paper Document Body */}
            <div className="p-6 space-y-4 font-sans text-xs bg-white">
              {activeTab === 'redline' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider font-mono">
                      Clause 4.1 — Risk Level: High
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                      DEVIATION DETECTED
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 leading-relaxed">
                    <div>
                      <span className="text-slate-500 block mb-1 font-bold text-[10px] uppercase font-mono">Original Contract Clause:</span>
                      <p className="text-slate-700 font-sans">
                        &quot;In no event shall Vendor be liable for any indirect, consequential, or punitive damages, and aggregate liability shall be <span className="bg-red-100 text-red-800 line-through px-1 rounded font-mono">unlimited</span>.&quot;
                      </p>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <span className="text-emerald-700 block mb-1 font-bold text-[10px] uppercase font-mono">Proposed OOXML Redline:</span>
                      <p className="text-slate-900 font-sans">
                        &quot;In no event shall Vendor be liable for any indirect or consequential damages. <span className="bg-emerald-100 text-emerald-900 font-semibold px-1 rounded">Aggregate liability under this Agreement shall not exceed total fees paid in preceding 12 months</span>.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider font-mono">
                      Critic Citation Grounding Check
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      SCORE: 0.96 (PASSED)
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-slate-700">
                    <div className="text-[11px] font-mono text-slate-900 font-bold">
                      Citation ID: RULE-LIMITATION-LIABILITY-01
                    </div>
                    <p className="text-slate-600 text-xs italic font-serif">
                      &quot;Vendor contracts must cap overall aggregate liability at 1x total annual contract value. Uncapped liability exceptions require CFO approval.&quot;
                    </p>
                    <div className="pt-2 text-emerald-800 font-medium text-[11px] flex items-center space-x-1.5">
                      <svg className="w-4 h-4 text-emerald-700 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Entailment check verified against FastMCP FAISS vector store.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Human Decision Gate</span>
                <Link
                  href="/upload"
                  className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-all"
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
