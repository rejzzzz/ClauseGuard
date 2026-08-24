# Unit tests for AgentFactory and SDK model resolution
import pytest
from unittest.mock import patch, MagicMock
from backend.agents.base.agent_factory import AgentFactory

def test_resolve_model_id_aliases():
    assert AgentFactory.resolve_model_id("claude-sonnet") == "anthropic.claude-3-5-sonnet-20240620-v1:0"
    assert AgentFactory.resolve_model_id("claude-haiku") == "anthropic.claude-3-haiku-20240307-v1:0"
    assert AgentFactory.resolve_model_id("titan-embed") == "amazon.titan-embed-text-v1"
    assert AgentFactory.resolve_model_id("custom-model-arn") == "custom-model-arn"

def test_create_agent_config_defaults():
    config = AgentFactory.create_agent_config("Auditor")
    assert config["agent_role"] == "Auditor"
    assert config["model_id"] == "anthropic.claude-3-5-sonnet-20240620-v1:0"
    assert config["parameters"]["temperature"] == 0.1
    assert config["parameters"]["max_tokens"] == 4096

def test_create_agent_config_custom_overrides():
    config = AgentFactory.create_agent_config(
        agent_role="Redliner",
        model_alias="claude-haiku",
        extra_params={"temperature": 0.5, "top_p": 0.95}
    )
    assert config["agent_role"] == "Redliner"
    assert config["model_id"] == "anthropic.claude-3-haiku-20240307-v1:0"
    assert config["parameters"]["temperature"] == 0.5
    assert config["parameters"]["top_p"] == 0.95

@patch("boto3.client")
def test_get_bedrock_client_success(mock_boto_client):
    mock_boto_client.return_value = MagicMock()
    client = AgentFactory.get_bedrock_client(region_name="us-west-2")
    assert client is not None
    mock_boto_client.assert_called_once_with("bedrock-runtime", region_name="us-west-2")
