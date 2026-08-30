'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 text-xs py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white text-slate-900 font-serif font-bold text-sm flex items-center justify-center">
              CG
            </div>
            <span className="font-serif font-extrabold text-white text-base">ClauseGuard</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Autonomous multi-agent contract auditing, vector-backed playbook citation grounding, and native OOXML tracked-changes redlining.
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            MIT Licensed · Strands Agents SDK & Amazon Bedrock
          </div>
        </div>

        {/* Links Column 1: Application */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Application</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link href="/upload" className="hover:text-white transition-colors">
                Audit Contract (.docx / .pdf)
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Analytics Dashboard
              </Link>
            </li>
            <li>
              <Link href="/documents" className="hover:text-white transition-colors">
                Past Documents Repository
              </Link>
            </li>
            <li>
              <Link href="/chats" className="hover:text-white transition-colors">
                Agent Reasoning Chat Log
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2: Multi-Agent System */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Multi-Agent Architecture</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Orchestrator Agent (Lead Counsel)</li>
            <li>Ingestion Agent (Document Segmenter)</li>
            <li>Auditor Agent (Paralegal)</li>
            <li>Redliner Agent (OOXML Drafter)</li>
            <li>Critic Agent (Grounding Validator)</li>
          </ul>
        </div>

        {/* Links Column 3: Tech Stack */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Core Infrastructure</h4>
          <ul className="space-y-2 text-slate-400 font-mono text-[11px]">
            <li>Strands Agents SDK + Tools</li>
            <li>Amazon Bedrock (Claude 3.5 Sonnet)</li>
            <li>FastMCP Playbook Vector Server</li>
            <li>FAISS Local Vector Database</li>
            <li>FastAPI Backend + Next.js 16 UI</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
        <div>© 2026 ClauseGuard Legal Technology. All rights reserved.</div>
        <div className="mt-2 sm:mt-0 font-mono">Build Version 0.1.0-alpha</div>
      </div>
    </footer>
  );
}
