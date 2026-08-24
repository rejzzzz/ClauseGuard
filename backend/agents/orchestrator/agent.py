# Orchestrator agent that decomposes tasks, coordinates sub-agents, and manages HITL gates.
from pathlib import Path
from typing import List, Dict, Any, Optional

from backend.agents.orchestrator.state_machine import (
    AuditStateMachine,
    SessionContext,
    SessionStateEnum,
    HumanDecisionEnum,
    ClauseHumanDecision
)
from backend.agents.orchestrator.tools import (
    dispatch_to_ingestion,
    dispatch_to_auditor,
    dispatch_to_critic,
    dispatch_to_redliner
)
from backend.redlining.docx_redline_engine import apply_tracked_redlines

class OrchestratorAgent:
    """
    Lead Counsel Orchestrator Agent responsible for orchestrating the multi-agent 
    pipeline execution and managing Human-In-The-Loop (HITL) approval gates.
    """
    def __init__(self, model_name: str = "claude-sonnet"):
        self.model_name = model_name

    def run_audit_pipeline(
        self, 
        contract_path: str, 
        playbook_name: str = "sample_vendor_msa", 
        session_id: Optional[str] = None
    ) -> SessionContext:
        """
        Executes the automated multi-agent audit pipeline:
        INGESTION -> AUDIT -> CRITIC -> REDLINE -> AWAITING_HUMAN
        """
        c_path = Path(contract_path)
        contract_name = c_path.stem
        
        ctx = SessionContext(
            session_id=session_id or f"session_{contract_name}",
            contract_path=str(c_path),
            contract_name=contract_name,
            playbook_name=playbook_name
        )
        sm = AuditStateMachine(ctx)

        # Stage 1: Ingestion
        sm.transition_to(SessionStateEnum.INGESTED)
        ctx.chunks = dispatch_to_ingestion(str(c_path))

        # Stage 2: Auditor Agent
        sm.transition_to(SessionStateEnum.AUDITING)
        ctx.audit_report = dispatch_to_auditor(
            chunks=ctx.chunks, 
            playbook_name=playbook_name, 
            contract_name=contract_name
        )

        # Stage 3: Critic Agent Grounding Verification
        sm.transition_to(SessionStateEnum.CRITIQUED)
        ctx.critic_report = dispatch_to_critic(
            audit_report=ctx.audit_report, 
            playbook_name=playbook_name
        )

        # Stage 4: Redliner Agent Edit Generation
        sm.transition_to(SessionStateEnum.REDLINING)
        ctx.redline_package = dispatch_to_redliner(
            audit_report=ctx.audit_report, 
            chunks=ctx.chunks
        )

        # Stage 5: Awaiting Human Gate
        sm.transition_to(SessionStateEnum.AWAITING_HUMAN)
        return ctx

    def apply_human_review(
        self, 
        session: SessionContext, 
        decisions: List[Dict[str, Any]]
    ) -> SessionContext:
        """
        Applies HITL human review decisions (APPROVE, REJECT, EDIT) to session redlines.
        """
        sm = AuditStateMachine(session)
        if session.current_state != SessionStateEnum.AWAITING_HUMAN:
            raise ValueError(f"Cannot apply human review in state '{session.current_state.value}'. Must be AWAITING_HUMAN.")

        if not session.redline_package:
            return session

        new_edits = []
        for edit in session.redline_package.edits:
            cid = edit.clause_id
            # Find matching decision if present
            matching_dec = next((d for d in decisions if d.get("clause_id") == cid), None)
            
            if matching_dec:
                action_str = str(matching_dec.get("action", "APPROVE")).upper()
                action = HumanDecisionEnum(action_str)
                custom_text = matching_dec.get("custom_text")
                sm.record_human_decision(clause_id=cid, action=action, custom_text=custom_text)
                
                if action == HumanDecisionEnum.REJECT:
                    # Skip rejected edit
                    continue
                elif action == HumanDecisionEnum.EDIT and custom_text:
                    # Update proposed edit with custom human text
                    edit.proposed_text = custom_text
                    new_edits.append(edit)
                else:
                    # Approved edit
                    new_edits.append(edit)
            else:
                # Default behavior: keep proposed edit
                new_edits.append(edit)

        session.redline_package.edits = new_edits
        session.redline_package.total_edits = len(new_edits)
        return session

    def finalize_review(
        self, 
        session: SessionContext, 
        output_path: Optional[str] = None
    ) -> str:
        """
        Applies approved redline edits to the document via python-docx OOXML engine 
        and transitions session state to FINALIZED.
        """
        sm = AuditStateMachine(session)
        if session.current_state != SessionStateEnum.AWAITING_HUMAN:
            raise ValueError(f"Cannot finalize session in state '{session.current_state.value}'. Must be AWAITING_HUMAN.")

        in_path = Path(session.contract_path)
        if output_path:
            out_path = Path(output_path)
        else:
            out_path = in_path.parent / f"{in_path.stem}_redlined.docx"

        edits_data = []
        if session.redline_package:
            for edit in session.redline_package.edits:
                edits_data.append({
                    "original_text": edit.original_text,
                    "proposed_text": edit.proposed_text,
                    "action": edit.action.value
                })

        if in_path.suffix.lower() == ".docx":
            apply_tracked_redlines(in_path, out_path, edits_data)
        else:
            # Fallback for mock/test non-docx paths
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text("Finalized contract summary")

        sm.transition_to(SessionStateEnum.FINALIZED, metadata={"output_path": str(out_path)})
        session.final_docx_path = str(out_path)
        return str(out_path)
