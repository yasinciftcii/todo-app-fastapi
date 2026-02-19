from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from main import app
from database import get_session
from auth import get_current_user, User
import pytest

# 1. Setup In-Memory SQLite Database for Testing
DATABASE_URL = "sqlite://" 
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# 2. Dependency Override: Database Session
def get_session_override():
    with Session(engine) as session:
        yield session

# 3. Dependency Override: Authentication
def get_current_user_override():
    return User(uid="test_user_123", email="test@example.com")

# 4. Apply Overrides
app.dependency_overrides[get_session] = get_session_override
app.dependency_overrides[get_current_user] = get_current_user_override

# 5. Initialize Test Client
client = TestClient(app)

# 6. Fixture to Create Tables Before Each Test
@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

# --- TESTS START HERE ---

def test_read_root():
    """Test the root endpoint to ensure API is running."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World from FastAPI! The To-Do API is running."}

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_create_todo(session):
    """Test creating a new todo item."""
    response = client.post(
        "/todos/",
        json={"title": "Test Task", "is_completed": False}
    )
    data = response.json()

    assert response.status_code == 200
    assert data["title"] == "Test Task"
    assert data["is_completed"] is False
    assert data["owner_uid"] == "test_user_123"
    assert "id" in data

def test_read_todos(session):
    """Test retrieving the list of todos."""
    client.post("/todos/", json={"title": "Task 1", "is_completed": False})
    client.post("/todos/", json={"title": "Task 2", "is_completed": True})

    response = client.get("/todos/")
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 2
    
    # 🎯 DÜZELTME BURADA: Index'e (0 veya 1) bağlı kalmak yerine 
    # listenin içinde bu başlıkların olup olmadığını kontrol ediyoruz.
    titles = [task["title"] for task in data]
    assert "Task 1" in titles
    assert "Task 2" in titles

def test_update_todo(session):
    """Test updating an existing todo."""
    create_res = client.post("/todos/", json={"title": "Old Title", "is_completed": False})
    todo_id = create_res.json()["id"]

    response = client.put(
        f"/todos/{todo_id}",
        json={"title": "New Title", "is_completed": True}
    )
    data = response.json()

    assert response.status_code == 200
    assert data["title"] == "New Title"
    assert data["is_completed"] is True

def test_delete_todo(session):
    """Test deleting a todo."""
    create_res = client.post("/todos/", json={"title": "Task to Delete", "is_completed": False})
    todo_id = create_res.json()["id"]

    del_res = client.delete(f"/todos/{todo_id}")
    assert del_res.status_code == 200
    assert del_res.json() == {"ok": True}

    get_res = client.get(f"/todos/{todo_id}")
    assert get_res.status_code == 404