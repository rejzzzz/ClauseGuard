# API tests for Case Documents upload, listing, inspection, and deletion.
import io
import pytest
from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)


def test_case_documents_lifecycle(tmp_path):
    # 1. Create a parent case
    case_res = client.post("/api/cases", json={"title": "Doc Test Matter"})
    assert case_res.status_code == 201
    case_id = case_res.json()["id"]

    # 2. Upload document (.pdf)
    dummy_pdf_content = b"%PDF-1.4 dummy pdf content for testing"
    upload_res = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("contract_agreement.pdf", dummy_pdf_content, "application/pdf")},
        data={"doc_category": "contract"}
    )
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    assert doc_data["filename"] == "contract_agreement.pdf"
    assert doc_data["doc_category"] == "contract"
    doc_id = doc_data["id"]

    # 3. List documents in case
    list_res = client.get(f"/api/cases/{case_id}/documents")
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) >= 1
    assert any(d["id"] == doc_id for d in docs)

    # 4. Get single document
    get_res = client.get(f"/api/cases/{case_id}/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == doc_id

    # 5. Delete document
    del_res = client.delete(f"/api/cases/{case_id}/documents/{doc_id}")
    assert del_res.status_code == 204

    # 6. Verify 404 after delete
    get_after_del = client.get(f"/api/cases/{case_id}/documents/{doc_id}")
    assert get_after_del.status_code == 404

    # Cleanup case
    client.delete(f"/api/cases/{case_id}")


def test_upload_unsupported_file_type():
    case_res = client.post("/api/cases", json={"title": "Bad File Matter"})
    case_id = case_res.json()["id"]

    bad_res = client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("malicious.exe", b"binary content", "application/octet-stream")}
    )
    assert bad_res.status_code == 400
    assert "Unsupported file type" in bad_res.json()["detail"]

    client.delete(f"/api/cases/{case_id}")
