# Shared model initialization and Strands Agent client generation.
import os
from typing import Dict, Any, Optional

class AgentFactory:
    """
    Factory for creating and initializing Amazon Bedrock foundation models
    and Strands Agent configurations for multi-agent contract auditing.
    """
    MODEL_MAP = {
        "claude-sonnet": "anthropic.claude-3-5-sonnet-20240620-v1:0",
        "claude-haiku": "anthropic.claude-3-haiku-20240307-v1:0",
        "titan-embed": "amazon.titan-embed-text-v1",
    }

    DEFAULT_PARAMS = {
        "temperature": 0.1,
        "max_tokens": 4096,
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
        region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        
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
            region = region_name or os.getenv("AWS_DEFAULT_REGION", "us-east-1")
            return boto3.client("bedrock-runtime", region_name=region)
        except Exception:
            return None
