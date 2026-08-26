# SQLAlchemy database configuration and engine initialization for Supabase PostgreSQL.
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Ensure .env is loaded
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)

# Resolve connection URI
raw_uri = (
    os.getenv("DB_CONNECTION_URI") or 
    os.getenv("DB_CONNECTION_STRING") or 
    os.getenv("DATABASE_URL") or 
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
    Initializes all database tables defined in models.py.
    """
    import backend.db.models as _models  # noqa: F401
    Base.metadata.create_all(bind=engine)
