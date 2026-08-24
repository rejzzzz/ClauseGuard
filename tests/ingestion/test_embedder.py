# Unit tests for Titan Embeddings wrapper and fallback.
from backend.ingestion.embedder import BedrockEmbedder

def test_embedder_fallback():
    embedder = BedrockEmbedder(dimension=1536)
    vector = embedder._fallback_embedding("Sample contract clause text")
    assert len(vector) == 1536
    assert isinstance(vector[0], float)

def test_embed_chunks():
    embedder = BedrockEmbedder(dimension=64)
    chunks = [
        {"text": "[Section 1]\nParagraph 1 text", "metadata": {"heading_title": "Section 1"}},
        {"text": "[Section 2]\nParagraph 2 text", "metadata": {"heading_title": "Section 2"}},
    ]
    embedded = embedder.embed_chunks(chunks)
    assert len(embedded) == 2
    assert "embedding" in embedded[0]
    assert len(embedded[0]["embedding"]) == 64
