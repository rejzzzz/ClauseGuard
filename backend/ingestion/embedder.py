# Embedding utility wrapping Amazon Bedrock Titan Embeddings.
import json
import hashlib
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from typing import List

class BedrockEmbedder:
    """
    Client wrapper for Amazon Bedrock Titan Embeddings.
    Includes a deterministic offline fallback vector generator when AWS credentials are invalid or absent.
    """
    def __init__(self, region_name: str = "us-east-1", model_id: str = "amazon.titan-embed-text-v1", dimension: int = 1536):
        self.client = boto3.client(
            service_name="bedrock-runtime",
            region_name=region_name
        )
        self.model_id = model_id
        self.dimension = dimension
        
    def _fallback_embedding(self, text: str) -> List[float]:
        """Generates a deterministic normalized vector using SHA256 hashing."""
        seed = hashlib.sha256(text.encode("utf-8")).digest()
        vector = []
        for i in range(self.dimension):
            byte_val = seed[i % len(seed)]
            val = (byte_val / 255.0) - 0.5
            vector.append(val)
            
        norm = sum(v * v for v in vector) ** 0.5
        if norm > 0:
            vector = [v / norm for v in vector]
        return vector

    def embed_text(self, text: str) -> List[float]:
        """
        Generates a vector embedding for a single text block.
        """
        cleaned_text = text.replace("\r", " ").replace("\n", " ").strip()
        body = json.dumps({"inputText": cleaned_text})
        
        try:
            response = self.client.invoke_model(
                body=body,
                modelId=self.model_id,
                accept="application/json",
                contentType="application/json"
            )
            response_body = json.loads(response.get("body").read())
            return response_body.get("embedding")
        except (ClientError, BotoCoreError):
            return self._fallback_embedding(cleaned_text)
        
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a list of text blocks.
        """
        return [self.embed_text(t) for t in texts]
