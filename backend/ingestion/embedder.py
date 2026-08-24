# Embedding utility wrapping Amazon Bedrock Titan Embeddings.
import json
import boto3
from typing import List

class BedrockEmbedder:
    """
    Client wrapper for Amazon Bedrock Titan Embeddings.
    """
    def __init__(self, region_name: str = "us-east-1", model_id: str = "amazon.titan-embed-text-v1"):
        self.client = boto3.client(
            service_name="bedrock-runtime",
            region_name=region_name
        )
        self.model_id = model_id
        
    def embed_text(self, text: str) -> List[float]:
        """
        Generates a vector embedding for a single text block.
        """
        cleaned_text = text.replace("\r", " ").replace("\n", " ").strip()
        body = json.dumps({"inputText": cleaned_text})
        
        response = self.client.invoke_model(
            body=body,
            modelId=self.model_id,
            accept="application/json",
            contentType="application/json"
        )
        
        response_body = json.loads(response.get("body").read())
        return response_body.get("embedding")
        
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a list of text blocks.
        """
        return [self.embed_text(t) for t in texts]
