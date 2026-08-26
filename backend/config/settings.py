# Global project configuration loading settings from environment variables via Pydantic Settings.
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve root .env path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    # 1. AWS Bedrock & AI Model Settings
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = "ap-south-1"
    
    BEDROCK_LLM_MODEL_ID: str = "anthropic.claude-3-haiku-20240307-v1:0"
    BEDROCK_EMBEDDING_MODEL_ID: str = "amazon.titan-embed-text-v1"
    EMBEDDING_DIMENSION: int = 1536
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 4096

    # 2. Database Connections
    DB_CONNECTION_URI: str = "sqlite:///data/clauseguard.db"
    DATABASE_URL: str = "sqlite:///data/clauseguard.db"

    # 3. Application & API Server Settings
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    DEFAULT_PLAYBOOK_NAME: str = "sample_vendor_msa"

    # 4. Storage & Directory Paths
    SESSION_STORAGE_DIR: Path = Path("data/sessions")
    CASE_STORAGE_DIR: Path = Path("data/cases")
    PLAYBOOK_STORAGE_DIR: Path = Path("backend/config/playbooks")

    @property
    def cors_origins_list(self) -> List[str]:
        """Returns list of allowed CORS origins."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
