'use client';

import React, { useState } from 'react';

export default function AgentPipelineVisualizer() {
  const [selectedAgent, setSelectedAgent] = useState<string>('orchestrator');

  const agents = [
    {
      id: 'orchestrator',
      name: 'Orchestrator Agent',
      role: 'Lead Counsel & State Machine',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      description: 'Manages workflow session states, plans clause parsing, delegates tasks to paralegal/drafter sub-agents, and governs human-in-the-loop gates.',
      tools: ['dispatch_to_auditor', 'dispatch_to_redliner', 'transition_state', 'trigger_hitl_gate'],
    },
    {
      id: 'ingestion',
      name: 'Ingestion Agent',
      role: 'Document Parser & Segmenter',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      description: 'Parses raw .docx and .pdf files into a structural outline tree. Chunks content at clause boundaries rather than arbitrary token counts.',
      tools: ['docx_parser', 'pdf_parser', 'clause_tree_segmenter', 'titan_embedder'],
    },
    {
      id: 'auditor',
      name: 'Auditor Agent',
      role: 'Paralegal & Playbook Classifier',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      description: 'Searches company playbook rules via MCP server, identifies deviations, and scores clause severity (Low, Medium, High, Critical).',
      tools: ['playbook_search', 'verdict_schema_validator', 'faiss_vector_query'],
    },
    {
      id: 'redliner',
      name: 'Redliner Agent',
      role: 'Drafter & OOXML Engine',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      description: 'Formulates structured edit instructions and executes deterministic python-docx XML surgery to insert native Word tracked changes (w:ins / w:del).',
      tools: ['clause_bank_lookup', 'docx_redline_engine', 'diff_generator'],
    },
    {
      id: 'critic',
      name: 'Critic Agent',
      role: 'Validator & Citation Grounder',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      description: 'Performs semantic entailment checks on auditor verdicts against cited playbook text to prevent hallucinations or false compliance claims.',
      tools: ['grounding_check_evaluator', 'vector_citation_verifier'],
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-16 px-6 lg:px-12 bg-white border-t border-b border-slate-200">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          Multi-Agent Architecture
        </span>
        <h2 className="text-3xl font-serif font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          5 Specialized Legal Reasoning Agents
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed font-sans">
          Each agent operates with strict reasoning boundaries, dedicated FastMCP tools, and explicit citation traces to ensure maximum legal auditability.
        </p>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {agents.map((agent) => {
          const isSelected = selectedAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-6 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-900'
              }`}
            >
              <div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border font-mono ${
                  isSelected ? 'bg-slate-800 text-slate-200 border-slate-700' : agent.badgeColor
                }`}>
                  {agent.role.split('&')[0]}
                </span>
                <h3 className={`text-base font-serif font-bold mt-4 mb-2 ${isSelected ? 'text-white' : 'text-slate-900'}`}>{agent.name}</h3>
                <p className={`text-xs leading-relaxed line-clamp-3 font-sans ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>{agent.description}</p>
              </div>

              <div className={`mt-5 pt-3 border-t text-[11px] font-medium flex items-center justify-between ${
                isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <span>{agent.tools.length} Tools</span>
                <span className={isSelected ? 'text-white font-bold' : 'text-slate-700 font-semibold'}>
                  {isSelected ? 'Active' : 'Inspect →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Details Panel */}
      {selectedAgent && (
        <div className="mt-8 p-8 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
          {(() => {
            const current = agents.find((a) => a.id === selectedAgent);
            if (!current) return null;
            return (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <span className="px-3 py-1 rounded text-xs font-bold border font-mono bg-slate-200 text-slate-800 border-slate-300">
                      {current.role}
                    </span>
                    <h4 className="text-2xl font-serif font-extrabold text-slate-900 mt-2">{current.name}</h4>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Framework: <span className="font-semibold text-slate-800">Strands Agents SDK (.as_tool)</span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed font-sans">{current.description}</p>

                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                    Available FastMCP Tools & Functions:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {current.tools.map((tool) => (
                      <span key={tool} className="px-3 py-1 rounded bg-white border border-slate-300 font-mono text-xs text-slate-800 shadow-2xs">
                        {tool}()
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
