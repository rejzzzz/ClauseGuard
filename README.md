# ClauseGuard
### Autonomous Multi-Agent Contract Auditing & Redlining System

ClauseGuard is an autonomous multi-agent system that audits vendor contracts against a company's legal playbook and automatically generates redlined documents. It streamlines contract review into a review-and-approve workflow.

---

## Core Problem

Manual contract review is a time-consuming, repetitive task. Reviewing a single Master Services Agreement (MSA) against corporate policy can take several hours, even though the majority of the work consists of pattern-matching against standard playbook rules.

ClauseGuard automates the preliminary auditing and drafting. It parses the contract, identifies deviations from the playbook, generates tracked-change redlines directly in the `.docx` file, and provides a structured review package for the final decision-maker.

## Key Features

- **Multi-Agent Orchestration:** Divides work among specialized agents (Orchestrator, Auditor, Redliner, Critic) using the Strands Agents SDK.
- **Native Tracked Changes:** Mutates the `.docx` file directly to insert Microsoft Word tracked changes (`w:ins`/`w:del`) and comments.
- **Auditable Reasoning Traces:** Returns structured evidence for each decision (`{verdict, evidence, playbook_citation, confidence}`).
- **Human-in-the-Loop Gate:** Pauses execution for review, allowing the user to approve, reject, or edit suggestions.
- **Structure-Aware Chunking:** Segments contracts by logical sections rather than arbitrary token boundaries, optimizing retrieval accuracy.

## Architecture

ClauseGuard uses the Strands Agents SDK to orchestrate the multi-agent system:

1. **Orchestrator:** Delegates tasks via `.as_tool()`, manages state, and gates final approval.
2. **Auditor:** Retrieves playbook rules via MCP and classifies contract clauses.
3. **Redliner:** Generates replacement/insertion language based on pre-approved playbook fallbacks.
4. **Critic:** Validates cited references against the vector store to prevent hallucinations.

## Technical Stack

- **Agent Framework:** strands-agents SDK
- **Models:** Amazon Bedrock (Claude Sonnet / Haiku)
- **Tool Protocol:** Model Context Protocol (MCP)
- **Vector Search:** FAISS + Bedrock Titan Embeddings
- **Document Processing:** python-docx, lxml
- **API Backend:** FastAPI, Pydantic v2
- **Frontend:** Next.js, Tailwind CSS

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js
- AWS credentials with Amazon Bedrock access

### Installation & Run

**Backend:**
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

## License
Licensed under the MIT License. See the LICENSE file for details.
