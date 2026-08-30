# API tests for Case Chat Threads and Messages.
import pytest
from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)


def test_case_threads_and_messages_lifecycle():
    # 1. Create a parent case
    case_res = client.post("/api/cases", json={"title": "Thread Test Matter"})
    case_id = case_res.json()["id"]

    # 2. Create chat thread
    create_thread_payload = {
        "title": "Cross Examination Strategy",
        "description": "Witness 1 inconsistencies"
    }
    thread_res = client.post(f"/api/cases/{case_id}/threads", json=create_thread_payload)
    assert thread_res.status_code == 201
    thread_data = thread_res.json()
    assert thread_data["title"] == "Cross Examination Strategy"
    thread_id = thread_data["id"]

    # 3. List threads
    list_res = client.get(f"/api/cases/{case_id}/threads")
    assert list_res.status_code == 200
    threads = list_res.json()
    assert any(t["id"] == thread_id for t in threads)

    # 4. Get thread info
    get_res = client.get(f"/api/cases/{case_id}/threads/{thread_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == thread_id

    # 5. Update thread title
    patch_res = client.patch(
        f"/api/cases/{case_id}/threads/{thread_id}",
        json={"title": "Witness 1 Prep (Updated)"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Witness 1 Prep (Updated)"

    # 6. Post system message
    post_sys_res = client.post(
        f"/api/cases/{case_id}/threads/{thread_id}/messages",
        json={
            "role": "system",
            "agent_name": "System",
            "content": "Thread initialized for strategy analysis."
        }
    )
    assert post_sys_res.status_code == 201
    sys_msgs = post_sys_res.json()
    assert len(sys_msgs) == 1
    assert sys_msgs[0]["content"] == "Thread initialized for strategy analysis."

    # 7. Post user message (triggers AI reasoning and returns user + assistant message)
    post_user_res = client.post(
        f"/api/cases/{case_id}/threads/{thread_id}/messages",
        json={
            "role": "user",
            "agent_name": "Senior Counsel",
            "content": "What are the core arguments in this case?"
        }
    )
    assert post_user_res.status_code == 201
    user_and_assistant = post_user_res.json()
    assert len(user_and_assistant) == 2
    assert user_and_assistant[0]["role"] == "user"
    assert user_and_assistant[0]["content"] == "What are the core arguments in this case?"
    assert user_and_assistant[1]["role"] == "assistant"
    assert user_and_assistant[1]["agent_name"] == "Case Assistant"

    # 8. Get thread messages
    get_msgs_res = client.get(f"/api/cases/{case_id}/threads/{thread_id}/messages")
    assert get_msgs_res.status_code == 200
    all_msgs = get_msgs_res.json()
    assert len(all_msgs) == 3

    # 9. Delete thread
    del_res = client.delete(f"/api/cases/{case_id}/threads/{thread_id}")
    assert del_res.status_code == 204

    # Cleanup case
    client.delete(f"/api/cases/{case_id}")
