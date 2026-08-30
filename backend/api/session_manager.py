# Session store managing active audit sessions, file paths, state machine persistence, and Supabase DB sync.
import uuid
import threading
from pathlib import Path
from typing import Dict, Optional, List

from backend.config.settings import settings
from backend.agents.orchestrator.state_machine import SessionContext, AuditStateMachine
from backend.db.base import SessionLocal, init_db
from backend.db.repository import (
    db_save_session, 
    db_get_session, 
    db_list_sessions, 
    db_delete_session
)


class SessionManager:
    """
    Thread-safe session store managing review session contexts and syncing with database repository.
    """
    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or settings.SESSION_STORAGE_DIR
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._sessions: Dict[str, SessionContext] = {}
        self._lock = threading.Lock()
        try:
            init_db()
        except Exception:
            pass

    def create_session(
        self,
        contract_path: str,
        contract_name: str,
        playbook_name: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> SessionContext:
        """
        Creates and stores a new review session context in memory and database.
        """
        sid = session_id or f"session_{uuid.uuid4().hex[:8]}"
        pb_name = playbook_name or settings.DEFAULT_PLAYBOOK_NAME
        context = SessionContext(
            session_id=sid,
            contract_path=contract_path,
            contract_name=contract_name,
            playbook_name=pb_name
        )
        session_dir = self.get_session_dir(sid)
        session_dir.mkdir(parents=True, exist_ok=True)

        with self._lock:
            self._sessions[sid] = context

        # Persist to database
        try:
            with SessionLocal() as db:
                db_save_session(db, context)
        except Exception as e:
            print(f"[SessionManager] Warning: DB sync failed on create_session: {e}")

        return context

    def get_session(self, session_id: str) -> Optional[SessionContext]:
        """
        Retrieves session context by ID from memory cache or database.
        """
        with self._lock:
            if session_id in self._sessions:
                return self._sessions[session_id]

        # Query database fallback
        try:
            with SessionLocal() as db:
                ctx = db_get_session(db, session_id)
                if ctx:
                    with self._lock:
                        self._sessions[session_id] = ctx
                    return ctx
        except Exception as e:
            print(f"[SessionManager] Warning: DB query failed on get_session: {e}")

        return None

    def update_session(self, context: SessionContext) -> SessionContext:
        """
        Updates an existing session context in memory cache and database.
        """
        with self._lock:
            self._sessions[context.session_id] = context

        # Sync to database
        try:
            with SessionLocal() as db:
                db_save_session(db, context)
        except Exception as e:
            print(f"[SessionManager] Warning: DB sync failed on update_session: {e}")

        return context

    def list_sessions(self) -> List[SessionContext]:
        """
        Returns a list of all active session contexts from database or memory cache.
        """
        try:
            with SessionLocal() as db:
                db_sessions = db_list_sessions(db)
                if db_sessions:
                    with self._lock:
                        for s in db_sessions:
                            self._sessions[s.session_id] = s
                    return db_sessions
        except Exception as e:
            print(f"[SessionManager] Warning: DB query failed on list_sessions: {e}")

        with self._lock:
            return list(self._sessions.values())

    def delete_session(self, session_id: str) -> bool:
        """
        Removes session context from memory cache and database.
        """
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]

        try:
            with SessionLocal() as db:
                return db_delete_session(db, session_id)
        except Exception as e:
            print(f"[SessionManager] Warning: DB delete failed on delete_session: {e}")
            return False

    def get_session_dir(self, session_id: str) -> Path:
        """
        Returns the dedicated storage directory for a given session.
        """
        clean_sid = session_id.strip()
        s_dir = self.base_dir / clean_sid
        s_dir.mkdir(parents=True, exist_ok=True)
        return s_dir

    def save_uploaded_file(self, session_id: str, filename: str, content: bytes) -> Path:
        """
        Saves uploaded contract file bytes into the session storage directory.
        """
        s_dir = self.get_session_dir(session_id)
        clean_filename = filename.strip()
        file_path = s_dir / clean_filename
        file_path.write_bytes(content)
        return file_path


# Global singleton instance for app-wide session management
session_manager = SessionManager()
