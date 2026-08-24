# ClauseGuard — System Architecture

ClauseGuard is an autonomous multi-agent contract auditing & redlining system built on **Strands Agents SDK**, **Amazon Bedrock**, **MCP**, and **python-docx**.

---

## 1. Multi-Agent Hierarchy

The Orchestrator delegates to three specialist agents via `.as_tool()`. The Critic sits downstream of the Auditor as a grounding check before results reach the human.

```
                     ┌─────────────────────────────────────┐
                     │        ORCHESTRATOR                 │
                     │        (Lead Counsel)               │
                     │                                     │
                     │  - Task decomposition               │
                     │  - Session state machine            │
                     │  - HITL approval gate               │
                     └──────┬───────────┬───────────────┬──┘
                            │           │               │
                  .as_tool()│           │               │.as_tool()
                            │           │               │
              ┌──────────────▼──┐ ┌─────▼─────────┐ ┌───▼─────────────┐
              │  INGESTION      │ │  AUDITOR      │ │  REDLINER       │
              │  (Doc Parser)   │ │  (Paralegal)  │ │  (Drafter)      │
              │                 │ │               │ │                 │
              │  docx/pdf -> IR │ │  MCP playbook │ │  Edit generation│
              │  Clause-tree    │ │  search & risk│ │  OOXML tracked  │
              │  chunking       │ │  classify     │ │  changes        │
              └─────────────────┘ └───────┬───────┘ └─────────────────┘
                                          │
                                          │ verdicts + citations
                                          ▼
                                   ┌────────────────────┐
                                   │  CRITIC            │
                                   │  (Validator)       │
                                   │                    │
                                   │  Grounding check   │
                                   │  Hallucination     │
                                   │  detection         │
                                   └─────────┬──────────┘
                                             │
                                             │ validated results
                                             ▼
                                       back to ORCHESTRATOR
```

### Agent Definitions

| Agent | Model | Responsibility |
|-------|-------|----------------|
| **Orchestrator** ("Lead Counsel") | Claude Sonnet | Plans workflow, manages session state (`INGESTED → AUDITING → REDLINING → CRITIQUED → AWAITING_HUMAN → FINALIZED`), owns the HITL approval gate. |
| **Ingestion Agent** ("Document Parser") | Deterministic | Parses `.docx`/`.pdf` into a structured IR; segments clauses into a heading-aware tree. |
| **Auditor Agent** ("Paralegal") | Claude Haiku | Queries the Playbook MCP server, classifies clauses (`COMPLIANT`, `DEVIATION`, `MISSING_CLAUSE`, `AMBIGUOUS`), emits structured verdicts with playbook citations. |
| **Redliner Agent** ("Drafter") | Claude Sonnet | Generates replacement/insertion edits from pre-approved fallback language; calls the deterministic OOXML engine tool. |
| **Critic Agent** ("Validator") | Claude Haiku / Rule engine | Re-fetches cited playbook IDs, confirms semantic entailment, flags unsupported claims before the human review. |

---

## 2. End-to-End Pipeline

```
    Contract                             Playbook FAISS Index
    (.docx / .pdf)                     (persistent, versioned)
        │                                      │
        ▼                                      │
 ┌────────────────────────┐                    │
 │     INGESTION          │                    │
 │                        │                    │
 │  Parse → Structural IR │                    │
 │  Clause-tree Chunking  │                    │
 │  Embed → Contract      │                    │
 │  FAISS Index(transient)│                    │
 └───────────┬────────────┘                    │
             │                                 │
             ▼                                 ▼
 ┌──────────────────────────────────────────────┐
 │     AUDIT                                    │
 │                                              │
 │  MCP playbook_search ◄── Playbook Index      │
 │  Classify clauses & score severity           │
 │  Critic Agent grounding check                │
 └────────────────────┬─────────────────────────┘
                      │
                      ▼
 ┌──────────────────────────────────────────────┐
 │     REDLINE                                  │
 │                                              │
 │  Generate structured edit instructions       │
 │  OOXML Engine (w:ins / w:del / w:comment)    │
 └────────────────────┬─────────────────────────┘
                      │
                      ▼
 ┌──────────────────────────────────────────────┐
 │        HITL GATE                             │
 │                                              │
 │  Approve · Edit · Reject  (per-clause/bulk)  │
 └────────────────────┬─────────────────────────┘
                      │
                      ▼
              ✅ Finalized .docx
              + Audit Trail (JSON)
```

---

## 3. Core Architecture Patterns

| Pattern | Detail |
|---------|--------|
| **Dual Vector Indices** | Contract stores are transient & per-session (no cross-contract leakage). Playbook stores are persistent and version-tagged. |
| **Structure-Aware Chunking** | Chunks follow clause boundaries (heading paths, numbering), not fixed token windows. Each chunk carries `{clause_id, heading_path, defined_terms[]}`. |
| **Deterministic Redlining** | The LLM emits structured intent (`REPLACE`, `INSERT`, `DELETE`, `COMMENT`); a python-docx wrapper performs the actual OOXML surgery (`w:ins`, `w:del`, `w:comment`). |
| **HITL Gate** | Nothing reaches `FINALIZED` without explicit human confirmation — approve, edit, or reject per clause or in bulk. Enforced server-side. |
