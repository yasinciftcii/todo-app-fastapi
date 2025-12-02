from fastapi import FastAPI
from database import create_db_and_tables, get_session
from typing import List
from sqlmodel import SQLModel, Session, select
from models import Todo, TodoCreate, TodoRead
from fastapi import Depends, HTTPException
from typing import Optional
from contextlib import asynccontextmanager
from auth import initialize_firebase, get_current_user, User


# LIFESPAN Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes DB connection and tables before the app starts, and handles cleanup."""
    print("Application starting up...")
    initialize_firebase()
    create_db_and_tables()
    yield
    print("Application shutting down...")

# Initialize the FastAPI application
app = FastAPI(title="To-Do App Backend", lifespan=lifespan)

# 1. CREATE
@app.post("/todos/", response_model=TodoRead)
def create_todo(*, session: Session = Depends(get_session), todo: TodoCreate):
    """Creates a new todo item in the database."""
    db_todo = Todo.model_validate(todo)
    
    # Add new todo to the session and commit
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    
    return db_todo

# 2. READ All
@app.get("/todos/", response_model=List[TodoRead])
def read_todos(*, session: Session = Depends(get_session)):
    """Retrieves all todo items."""
    # Use SQLModel's select command to fetch all Todo records
    todos = session.exec(select(Todo)).all()
    return todos

# 3. READ One (Retrieve a specific To-Do by ID)
@app.get("/todos/{todo_id}", response_model=TodoRead)
def read_todo(*, session: Session = Depends(get_session), todo_id: int):
    """Retrieves a single todo item by its ID."""
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo
# 4. UPDATE
class TodoUpdate(SQLModel):
    """Schema used for updating a todo item (all fields are optional)."""
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

@app.put("/todos/{todo_id}", response_model=TodoRead)
def update_todo(*, session: Session = Depends(get_session), todo_id: int, todo: TodoUpdate):
    """Updates an existing todo item."""
    db_todo = session.get(Todo, todo_id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    
    todo_data = todo.model_dump(exclude_unset=True)
    db_todo.model_validate(todo_data, update=True)

    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo

# 5. DELETE
@app.delete("/todos/{todo_id}")
def delete_todo(*, session: Session = Depends(get_session), todo_id: int):
    """Deletes a todo item by its ID."""
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    session.delete(todo)
    session.commit()
    return {"ok": True}

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Hello World from FastAPI! The To-Do API is running."}

# Health check endpoint for deployment tools
@app.get("/health")
def health_check():
    return {"status": "ok"}