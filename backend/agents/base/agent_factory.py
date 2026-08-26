import os
from typing import Dict, Any, Optional
from backend.config.settings import settings

class AgentFactory:
    """
    Factory for creating and initializing Amazon Bedrock foundation models
    and Strands Agent configurations for multi-agent contract auditing.
    """
    MODEL_MAP = {
        "claude-sonnet": "anthropic.claude-3-5-sonnet-20240620-v1:0",
        "claude-haiku": settings.BEDROCK_LLM_MODEL_ID,
        "titan-embed": settings.BEDROCK_EMBEDDING_MODEL_ID,
    }

    DEFAULT_PARAMS = {
        "temperature": settings.LLM_TEMPERATURE,
        "max_tokens": settings.LLM_MAX_TOKENS,
        "top_p": 0.9,
    }

    @classmethod
    def resolve_model_id(cls, model_alias: str) -> str:
        """
        Resolves a human-friendly model alias to full Amazon Bedrock Model ID.
        """
        return cls.MODEL_MAP.get(model_alias.lower(), model_alias)

    @classmethod
    def create_agent_config(
        cls, 
        agent_role: str, 
        model_alias: str = "claude-sonnet", 
        extra_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates configuration dictionary for Strands/Bedrock Agent client initialization.
        """
        model_id = cls.resolve_model_id(model_alias)
        region = settings.AWS_DEFAULT_REGION
        
        config = {
            "agent_role": agent_role,
            "model_id": model_id,
            "region_name": region,
            "parameters": {**cls.DEFAULT_PARAMS, **(extra_params or {})}
        }
        return config

    @classmethod
    def get_bedrock_client(cls, region_name: Optional[str] = None):
        """
        Initializes boto3 Bedrock runtime client. Returns None if boto3 runtime is unavailable.
        """
        try:
            import boto3
            region = region_name or settings.AWS_DEFAULT_REGION
            return boto3.client("bedrock-runtime", region_name=region)
        except Exception:
            return None
