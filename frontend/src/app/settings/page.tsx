'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFont, FONT_PRESETS } from '@/lib/FontContext';

type SettingsTab = 'typography' | 'appearance' | 'playbook' | 'account';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('typography');
  const [density, setDensity] = useState<'relaxed' | 'compact'>('relaxed');
  const [redlineStyle, setRedlineStyle] = useState<'balanced' | 'strict' | 'conservative'>('balanced');
  const [vectorGroundingRequired, setVectorGroundingRequired] = useState(true);

  const {
    currentPreset,
    setPresetById,
    customSans,
    customSerif,
    customMono,
    setCustomSans,
    setCustomSerif,
    setCustomMono,
    isCustom,
  } = useFont();

  const sansOptions = [
    { label: 'Inter (OpenAI & Linear Gold Standard)', value: 'var(--font-inter)' },
    { label: 'Plus Jakarta Sans (Corporate SaaS)', value: 'var(--font-plus-jakarta-sans)' },
    { label: 'DM Sans (Clean Geometric)', value: 'var(--font-dm-sans)' },
    { label: 'Outfit (Ultra-Sleek Tech)', value: 'var(--font-outfit)' },
    { label: 'Manrope (Razor-Sharp Precision)', value: 'var(--font-manrope)' },
  ];

  const headingOptions = [
    { label: 'Outfit (Ultra-Modern Tech Sans)', value: 'var(--font-outfit)' },
    { label: 'Inter (Pure Minimalist Sans)', value: 'var(--font-inter)' },
    { label: 'Manrope (Sharp Geometric Sans)', value: 'var(--font-manrope)' },
    { label: 'Lora (Sturdy Digital Legal Serif)', value: 'var(--font-lora)' },
    { label: 'Source Serif 4 (Adobe Editorial Serif)', value: 'var(--font-source-serif-4)' },
    { label: 'Playfair Display (High-Contrast Serif)', value: 'var(--font-playfair-display)' },
  ];

  const monoOptions = [
    { label: 'JetBrains Mono (Developer Favorite)', value: 'var(--font-jetbrains-mono)' },
    { label: 'Space Mono (Modern Tech)', value: 'var(--font-space-mono)' },
  ];

  return (
    <div className="flex-1 space-y-6 pb-12 w-full">
      {/* Category Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('typography')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'typography'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🎨</span>
          <span>Typography & Fonts</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'appearance'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>☀️</span>
          <span>Appearance & Density</span>
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'playbook'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>⚖️</span>
          <span>Playbook Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'account'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>👤</span>
          <span>Account & Counsel Info</span>
        </button>
      </div>

      {/* Main Studio Panel */}
      <main className="flex-1 min-w-0 space-y-8">
          {/* TAB 1: TYPOGRAPHY & FONTS */}
          {activeTab === 'typography' && (
            <div className="space-y-8">
              {/* Presets */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-serif font-extrabold text-slate-900">
                    Typography Presets
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Select a curated font combination to immediately re-theme the legal counsel suite.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {FONT_PRESETS.map((preset) => {
                    const isSelected = !isCustom && currentPreset.id === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setPresetById(preset.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900'
                            : 'bg-white/80 border-slate-200/90 hover:border-slate-400 shadow-2xs hover-lift'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif font-bold text-base text-slate-900">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed font-sans">
                          {preset.description}
                        </p>
                        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[10px]">Headings:</span>
                            <span className="font-serif font-bold text-slate-800">{preset.serif}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[10px]">Body / UI:</span>
                            <span className="font-sans font-medium text-slate-800">{preset.sans}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Variable Controls */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-serif font-bold text-slate-900">
                    Granular Font Overrides
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Independently select custom typeface variables.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      Headings & Titles
                    </label>
                    <select
                      value={customSerif}
                      onChange={(e) => setCustomSerif(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {headingOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      Body & UI Controls
                    </label>
                    <select
                      value={customSans}
                      onChange={(e) => setCustomSans(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {sansOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      Code & Metadata
                    </label>
                    <select
                      value={customMono}
                      onChange={(e) => setCustomMono(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {monoOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Real-time Component Sandbox */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-serif font-bold text-slate-900">
                    Live Component Sandbox
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Real-time render check of active typography on actual ClauseGuard elements.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 text-[10px] font-mono font-extrabold uppercase">
                        DEVIATION · HIGH RISK
                      </span>
                      <span className="text-xs font-mono text-slate-400">Clause §8.2</span>
                    </div>
                    <h4 className="font-serif text-base font-extrabold text-slate-900">
                      Uncapped Indemnification & Consequential Loss Waiver
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      &quot;Vendor agrees to indemnify and hold harmless Client against all third-party claims without limitation.&quot;
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="font-mono font-bold text-slate-500">Playbook Rule #14</span>
                      <button className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px]">
                        Accept Redline
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Compliance Rate</div>
                        <div className="text-2xl font-serif font-extrabold text-emerald-600 mt-0.5">94.2%</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Critic Grounding</div>
                        <div className="text-2xl font-serif font-extrabold text-indigo-600 mt-0.5">98.5%</div>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                      <span className="font-serif font-bold text-xs text-slate-900 block">Master Services Agreement (Acme Corp).docx</span>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">Ingested 14 clauses · Session: sess_9482</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE & DENSITY */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-serif font-extrabold text-slate-900">
                  Appearance & Interface Density
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Customize theme modes and layout compactness for high-density legal auditing.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider mb-3">
                    Color Theme Mode
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border-2 border-slate-900 bg-white cursor-pointer shadow-sm">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs mb-3">
                        ☀️
                      </div>
                      <span className="font-bold text-sm text-slate-900 block">Light Mode (Default)</span>
                      <span className="text-xs text-slate-500 font-sans block mt-1">Institutional slate contrast</span>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-300 flex items-center justify-center font-bold text-xs mb-3">
                        🌙
                      </div>
                      <span className="font-bold text-sm text-slate-700 block">Dark Mode</span>
                      <span className="text-xs text-slate-400 font-sans block mt-1">Coming in v2.5 release</span>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs mb-3">
                        💻
                      </div>
                      <span className="font-bold text-sm text-slate-700 block">System Sync</span>
                      <span className="text-xs text-slate-400 font-sans block mt-1">Automatic OS detection</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider mb-3">
                    Interface Layout Density
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setDensity('relaxed')}
                      className={`p-5 rounded-2xl border cursor-pointer ${
                        density === 'relaxed'
                          ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-2xs'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-sm text-slate-900 block">Relaxed Spacing</span>
                      <span className="text-xs text-slate-500 font-sans block mt-1">Standard padding and comfortable touch targets</span>
                    </div>

                    <div
                      onClick={() => setDensity('compact')}
                      className={`p-5 rounded-2xl border cursor-pointer ${
                        density === 'compact'
                          ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-2xs'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-sm text-slate-900 block">Compact Enterprise View</span>
                      <span className="text-xs text-slate-500 font-sans block mt-1">High-density data tables and tight clause card margins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLAYBOOK & RULES */}
          {activeTab === 'playbook' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-serif font-extrabold text-slate-900">
                  Playbook & Redlining Rules
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Configure default risk tolerance and FastMCP vector search grounding rules.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider mb-3">
                    Redline Recommendation Aggressiveness
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => setRedlineStyle('conservative')}
                      className={`p-4 rounded-2xl border text-left ${
                        redlineStyle === 'conservative'
                          ? 'border-slate-900 bg-white ring-2 ring-slate-900'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 block">Conservative</span>
                      <span className="text-[11px] text-slate-500 font-sans block mt-0.5">Only flag severe deviations</span>
                    </button>

                    <button
                      onClick={() => setRedlineStyle('balanced')}
                      className={`p-4 rounded-2xl border text-left ${
                        redlineStyle === 'balanced'
                          ? 'border-slate-900 bg-white ring-2 ring-slate-900'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 block">Balanced (Recommended)</span>
                      <span className="text-[11px] text-slate-500 font-sans block mt-0.5">Standard market fallback positions</span>
                    </button>

                    <button
                      onClick={() => setRedlineStyle('strict')}
                      className={`p-4 rounded-2xl border text-left ${
                        redlineStyle === 'strict'
                          ? 'border-slate-900 bg-white ring-2 ring-slate-900'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 block">Strict Compliance</span>
                      <span className="text-[11px] text-slate-500 font-sans block mt-0.5">Zero tolerance for missing clauses</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Require FastMCP Vector Grounding</span>
                    <span className="text-xs text-slate-500 font-sans block">Reject any AI suggestion that lacks verified playbook vector citations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={vectorGroundingRequired}
                    onChange={(e) => setVectorGroundingRequired(e.target.checked)}
                    className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT & COUNSEL INFO */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-serif font-extrabold text-slate-900">
                  Account & Legal Counsel Info
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Manage lead attorney metadata and institutional organization credentials.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                      Lead Attorney Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Senior Legal Counsel"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                      Counsel Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="counsel@clauseguard.io"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                      Legal Entity / Firm Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Institutional Legal Services LLC"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                      Jurisdiction & Bar Registration
                    </label>
                    <input
                      type="text"
                      defaultValue="NY Bar #849201 / Commercial Contracts"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800">
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
    </div>
  );
}
