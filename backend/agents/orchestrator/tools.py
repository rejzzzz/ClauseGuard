# Tools exposed to the Orchestrator, such as agent-to-agent delegation functions.
from pathlib import Path
from typing import List, Dict, Any

from backend.ingestion.pipeline import ingest_contract
from backend.agents.auditor.agent import AuditorAgent
from backend.agents.auditor.verdict_schema import ContractAuditReport
from backend.agents.critic.agent import CriticAgent
from backend.agents.critic.critic_schema import ContractCriticReport
from backend.agents.redliner.agent import RedlinerAgent
from backend.agents.redliner.edit_schema import RedlinePackage

def dispatch_to_ingestion(file_path: str) -> List[Dict[str, Any]]:
    """
    Delegates contract document parsing and chunking to the Ingestion component.
    """
    path = Path(file_path)
    return ingest_contract(path)

def dispatch_to_auditor(
    chunks: List[Dict[str, Any]], 
    playbook_name: str = "sample_vendor_msa", 
    contract_name: str = "contract"
) -> ContractAuditReport:
    """
    Delegates clause analysis and risk classification to the Auditor Agent.
    """
    agent = AuditorAgent()
    return agent.audit_contract(chunks, playbook_name=playbook_name, contract_name=contract_name)

def dispatch_to_critic(
    audit_report: ContractAuditReport, 
    playbook_name: str = "sample_vendor_msa"
) -> ContractCriticReport:
    """
    Delegates citation grounding verification to the Critic Agent.
    """
    agent = CriticAgent()
    return agent.validate_audit_report(audit_report, playbook_name=playbook_name)

def dispatch_to_redliner(
    audit_report: ContractAuditReport, 
    chunks: List[Dict[str, Any]]
) -> RedlinePackage:
    """
    Delegates structured edit generation to the Redliner Agent.
    """
    agent = RedlinerAgent()
    return agent.generate_redline_package(audit_report, chunks)
