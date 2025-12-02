from typing import Generator
from sqlmodel import create_engine, Session, SQLModel
import os

# 1. DATABASE CONFIGURATION
# Load database URL from environment variable or use a default local connection string
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:12345@localhost:5432/todo_db"
)

# 2. CREATE ENGINE
# The engine manages the connection pool to the database
engine = create_engine(DATABASE_URL, echo=True)

# 3. INITIALIZE DB TABLES
def create_db_and_tables():
    """Creates database tables defined by SQLModel classes."""
    
    SQLModel.metadata.create_all(engine)

# 4. SESSION DEPENDENCY
def get_session() -> Generator[Session, None, None]:
    """Dependency that provides a new database session."""
    with Session(engine) as session:
        yield session