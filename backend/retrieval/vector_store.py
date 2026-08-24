# Local FAISS database abstraction handling indexing and query matching.
import pickle
from pathlib import Path
from typing import List, Dict, Any, Tuple
import numpy as np
import faiss

class LocalVectorStore:
    """
    Local FAISS-based vector database supporting text insertion,
    metadata association, and semantic similarity search.
    """
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        # Holds list of dictionaries: {"text": str, "metadata": Dict[str, Any]}
        self.documents: List[Dict[str, Any]] = []
        
    def add_documents(self, documents: List[Dict[str, Any]], embeddings: List[List[float]]):
        """
        Adds multiple documents and their corresponding embedding vectors to the store.
        """
        if not documents:
            return
            
        vectors = np.array(embeddings).astype('float32')
        # Normalize vectors to unit length for inner product (equivalent to cosine similarity)
        faiss.normalize_L2(vectors)
        
        self.index.add(vectors)
        self.documents.extend(documents)
        
    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """
        Executes a top-k semantic search.
        Returns a list of tuples containing (document_dict, similarity_score).
        """
        if self.index.ntotal == 0:
            return []
            
        vector = np.array([query_embedding]).astype('float32')
        faiss.normalize_L2(vector)
        
        scores, indices = self.index.search(vector, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1 or idx >= len(self.documents):
                continue
            results.append((self.documents[idx], float(score)))
            
        return results
        
    def save(self, path: Path):
        """
        Saves the FAISS index and metadata pickle mapping to a local directory.
        """
        path.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(path / "index.faiss"))
        with open(path / "metadata.pkl", "wb") as f:
            pickle.dump(self.documents, f)
            
    def load(self, path: Path):
        """
        Loads the FAISS index and metadata pickle mapping from a local directory.
        """
        if not (path / "index.faiss").exists() or not (path / "metadata.pkl").exists():
            raise FileNotFoundError(f"FAISS index or metadata missing in: {path}")
            
        self.index = faiss.read_index(str(path / "index.faiss"))
        with open(path / "metadata.pkl", "rb") as f:
            self.documents = pickle.load(f)
