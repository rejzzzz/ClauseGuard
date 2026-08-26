# API tests for Case CRUD endpoints.
import pytest
from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)


def test_cases_api_lifecycle():
    # 1. Create case
    create_payload = {
        "title": "Alpha Corp v. Beta Ltd",
        "description": "Commercial contract breach",
        "case_type": "corporate",
        "status": "ACTIVE"
    }
    create_res = client.post("/api/cases", json=create_payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["title"] == "Alpha Corp v. Beta Ltd"
    case_id = created_data["id"]

    # 2. Get case
    get_res = client.get(f"/api/cases/{case_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == case_id
    assert get_res.json()["case_type"] == "corporate"

    # 3. List cases
    list_res = client.get("/api/cases?status=ACTIVE")
    assert list_res.status_code == 200
    cases_list = list_res.json()
    assert any(c["id"] == case_id for c in cases_list)

    # 4. Update case
    patch_res = client.patch(f"/api/cases/{case_id}", json={"status": "ARCHIVED", "title": "Alpha Corp v. Beta Ltd (Settled)"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "ARCHIVED"
    assert patch_res.json()["title"] == "Alpha Corp v. Beta Ltd (Settled)"

    # 5. Delete case
    del_res = client.delete(f"/api/cases/{case_id}")
    assert del_res.status_code == 204

    # 6. Verify 404 after delete
    get_after_del = client.get(f"/api/cases/{case_id}")
    assert get_after_del.status_code == 404


def test_get_nonexistent_case_404():
    res = client.get("/api/cases/case_nonexistent_999")
    assert res.status_code == 404
