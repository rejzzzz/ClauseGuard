# Unit tests for FAISS indexing and retrieval.
import shutil
from pathlib import Path
from backend.retrieval.vector_store import LocalVectorStore

def test_local_vector_store():
    store = LocalVectorStore(dimension=4)
    
    docs = [
        {"text": "Apple is a fruit.", "metadata": {"category": "fruit"}},
        {"text": "Delaware governs this contract.", "metadata": {"category": "jurisdiction"}},
    ]
    embeddings = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
    ]
    
    store.add_documents(docs, embeddings)
    assert len(store.documents) == 2
    
    results = store.search([0.1, 0.9, 0.0, 0.0], top_k=1)
    assert len(results) == 1
    assert results[0][0]["metadata"]["category"] == "jurisdiction"
    assert results[0][1] > 0.8
    
    temp_dir = Path("temp_test_faiss")
    try:
        store.save(temp_dir)
        
        new_store = LocalVectorStore(dimension=4)
        new_store.load(temp_dir)
        
        assert len(new_store.documents) == 2
        results_new = new_store.search([0.1, 0.9, 0.0, 0.0], top_k=1)
        assert results_new[0][0]["metadata"]["category"] == "jurisdiction"
    finally:
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
