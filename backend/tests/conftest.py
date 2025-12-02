import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from typing import Generator
import pytest
from sqlmodel import create_engine, Session, SQLModel
from fastapi.testclient import TestClient

from main import app
from database import get_session
from models import Todo
from test_config import TEST_DATABASE_URL, TEST_USER_UID, TEST_OTHER_UID

# 1. Test Database Engine
@pytest.fixture(name="session")
def session_fixture():
    """Provides an isolated database session for each test."""
    # SQLite test database engine (check_same_thread required)
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Create all tables
    SQLModel.metadata.create_all(engine)
    
    # Start the session
    with Session(engine) as session:
        yield session # Run the test
        
    # Cleanup: Drop all tables after the test
    SQLModel.metadata.drop_all(engine)

# 2. Test Dependency (Uses this session instead of the main DB in tests)
@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Provides a test client with overridden dependencies."""
    
    # Override the get_session dependency
    def get_session_override():
        return session

    # Override the dependency on the app
    app.dependency_overrides[get_session] = get_session_override
    
    # Start the test client
    with TestClient(app) as client:
        yield client # Run the test

    # Cleanup: Remove dependency overrides
    app.dependency_overrides.clear()

# 3. Test User UIDs
@pytest.fixture(name="user_uid")
def user_uid_fixture():
    """Provides the UID of the main test user."""
    return TEST_USER_UID

@pytest.fixture(name="other_uid")
def other_uid_fixture():
    """Provides the UID of the secondary test user."""
    return TEST_OTHER_UID