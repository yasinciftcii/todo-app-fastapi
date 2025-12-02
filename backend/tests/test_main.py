from fastapi.testclient import TestClient
from sqlmodel import Session
from models import Todo, TodoCreate
from typing import Callable, Any


# 1. ROOT Endpoint Tests
def test_read_root(client: TestClient):
    """Test the root '/' endpoint."""
    response = client.get("/")
    assert response.status_code == 200

# 2. CRUD Tests (Authorization Required)
# Note: We use pytest fixtures by including their names (client, user_uid, session, etc.) in test functions.

# HELPER FUNCTION TO CREATE TEST TOKEN
# Instead of a real Firebase Token, we override Firebase authentication logic in the backend.

# auth.py'deki get_current_user bağımlılığını geçersiz kılan fonksiyonlar
def override_get_current_user(uid: str):
    """Forces the application to recognize a specific user UID."""
    from auth import get_current_user, User
    from main import app

    # Function to override get_current_user to return a user with the specified UID
    def user_override():
        return User(uid=uid, email=f"test_{uid}@test.com")

    # Set the override
    app.dependency_overrides[get_current_user] = user_override
    
    # After setting the override, cleanup should be done.
    # However, here the testClient fixture already does cleanup at the end, so this is not necessary.

def test_create_todo_authorized(client: TestClient, user_uid: str):
    """Test creating a todo with a valid user."""
    override_get_current_user(user_uid)
    
    response = client.post(
        "/todos/",
        json={"title": "Test Görevim", "description": "Pytest için", "is_completed": False}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Görevim"
    # Critical Check: Is the To-Do assigned to the correct user?
    assert data["owner_uid"] == user_uid


def test_read_todos_isolation(client: TestClient, user_uid: str, other_uid: str, session: Session):
    """Test that users only see their own todos."""
    
    # 1. Create two todos for two different users (Directly writing to DB)
    todo1 = Todo(title="User1 Todo", owner_uid=user_uid, description="A", is_completed=False)
    todo2 = Todo(title="User2 Todo", owner_uid=other_uid, description="B", is_completed=False)
    session.add(todo1)
    session.add(todo2)
    session.commit()

    # 2. Query with Test User (user_uid)
    override_get_current_user(user_uid)
    response = client.get("/todos/")
    
    assert response.status_code == 200
    data = response.json()
    # Critical Check: Only 1 todo should be returned (belonging to user_uid)
    assert len(data) == 1 
    assert data[0]["title"] == "User1 Todo"
    
    # 3. Query with Another User (other_uid)
    override_get_current_user(other_uid)
    response = client.get("/todos/")
    
    assert response.status_code == 200
    data = response.json()
    # Critical Check: Only 1 todo should be returned (belonging to other_uid)
    assert len(data) == 1
    assert data[0]["title"] == "User2 Todo"


def test_update_todo_unauthorized(client: TestClient, user_uid: str, other_uid: str):
    """Test that a user cannot update another user's todo."""
    
    # 1. Create a todo belonging to another user (Authorization check)
    override_get_current_user(other_uid)
    create_resp = client.post(
        "/todos/",
        json={"title": "Hacklenecek Todo", "owner_uid": other_uid, "is_completed": False}
    )
    todo_id = create_resp.json()["id"]

    # 2. Try to update with user_uid
    override_get_current_user(user_uid)
    response = client.put(
        f"/todos/{todo_id}",
        json={"is_completed": True}
    )
    
    # Critical Check: Should return an authorization error
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized to modify this todo"