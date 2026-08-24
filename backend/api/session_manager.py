# Session store managing active audit sessions, file paths, state machine persistence, and HITL state.
import uuid
import threading
from pathlib import Path
from typing import Dict, Optional, List

from backend.agents.orchestrator.state_machine import SessionContext, AuditStateMachine


class SessionManager:
    """
    Thread-safe session store managing review session contexts and uploaded/generated file paths.
    """
    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or Path("data/sessions")
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._sessions: Dict[str, SessionContext] = {}
        self._lock = threading.Lock()

    def create_session(
        self,
        contract_path: str,
        contract_name: str,
        playbook_name: str = "sample_vendor_msa",
        session_id: Optional[str] = None
    ) -> SessionContext:
        """
        Creates and stores a new review session context.
        """
        sid = session_id or f"session_{uuid.uuid4().hex[:8]}"
        context = SessionContext(
            session_id=sid,
            contract_path=contract_path,
            contract_name=contract_name,
            playbook_name=playbook_name
        )
        session_dir = self.get_session_dir(sid)
        session_dir.mkdir(parents=True, exist_ok=True)

        with self._lock:
            self._sessions[sid] = context
        return context

    def get_session(self, session_id: str) -> Optional[SessionContext]:
        """
        Retrieves session context by ID or returns None if not found.
        """
        with self._lock:
            return self._sessions.get(session_id)

    def update_session(self, context: SessionContext) -> SessionContext:
        """
        Updates an existing session context.
        """
        with self._lock:
            self._sessions[context.session_id] = context
        return context

    def list_sessions(self) -> List[SessionContext]:
        """
        Returns a list of all active session contexts.
        """
        with self._lock:
            return list(self._sessions.values())

    def delete_session(self, session_id: str) -> bool:
        """
        Removes session context from memory.
        """
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False

    def get_session_dir(self, session_id: str) -> Path:
        """
        Returns the dedicated storage directory for a given session.
        """
        s_dir = self.base_dir / session_id
        s_dir.mkdir(parents=True, exist_ok=True)
        return s_dir

    def save_uploaded_file(self, session_id: str, filename: str, content: bytes) -> Path:
        """
        Saves uploaded contract file bytes into the session storage directory.
        """
        s_dir = self.get_session_dir(session_id)
        file_path = s_dir / filename
        file_path.write_bytes(content)
        return file_path


# Global singleton instance for app-wide session management
session_manager = SessionManager()
