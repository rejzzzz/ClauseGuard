import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from backend.config.settings import settings

# Resolve connection URI from settings
raw_uri = (
    settings.DB_CONNECTION_URI or 
    settings.DATABASE_URL or 
    "sqlite:///data/clauseguard.db"
)

# Normalize postgres:// to postgresql:// for SQLAlchemy 2.0
if raw_uri.startswith("postgres://"):
    raw_uri = raw_uri.replace("postgres://", "postgresql://", 1)

DATABASE_URI = raw_uri

class Base(DeclarativeBase):
    pass

# Engine args
engine_args = {"pool_pre_ping": True}
if "sqlite" in DATABASE_URI:
    engine_args = {"connect_args": {"check_same_thread": False}}

engine = create_engine(DATABASE_URI, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency yielding a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initializes all database tables defined in models.py and applies lightweight migrations.
    """
    import backend.db.models as _models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    
    # Lightweight column migration for existing sessions table
    try:
        with engine.begin() as conn:
            if "sqlite" in DATABASE_URI:
                table_check = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'")).first()
                if table_check:
                    res = conn.execute(text("PRAGMA table_info(sessions)")).fetchall()
                    col_names = [r[1] for r in res] if res else []
                    if "case_id" not in col_names:
                        conn.execute(text("ALTER TABLE sessions ADD COLUMN case_id VARCHAR(64)"))
            else:
                conn.execute(text("ALTER TABLE sessions ADD COLUMN IF NOT EXISTS case_id VARCHAR(64)"))
    except Exception as e:
        print(f"[init_db] Migration warning: {e}")

