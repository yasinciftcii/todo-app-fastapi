from fastapi import FastAPI, Depends, HTTPException
from database import create_db_and_tables, get_session
from typing import List
from sqlmodel import SQLModel, Session, select
from models import Todo, TodoCreate, TodoRead, TodoUpdate
from typing import Optional
from contextlib import asynccontextmanager
from auth import initialize_firebase, get_current_user, User
from exceptions import TodoNotFound, AuthorizationError
from fastapi.middleware.cors import CORSMiddleware


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

# CORS Integration

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],    # Allow All Methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],    # Allow All Headers (Authorization vb.)
)

# 1. CREATE
@app.post("/todos/", response_model=TodoRead)
def create_todo(*, session: Session = Depends(get_session), todo: TodoCreate, current_user: User = Depends(get_current_user)):
    """Creates a new todo item in the database."""
    todo_with_owner = Todo.model_validate(todo, update={"owner_uid": current_user.uid})
    
    # Add new todo to the session and commit
    session.add(todo_with_owner)
    session.commit()
    session.refresh(todo_with_owner)
    
    return todo_with_owner

# 2. READ All
@app.get("/todos/", response_model=List[TodoRead])
def read_todos(*, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Retrieves all todo items."""
    # Use SQLModel's select command to fetch all Todo records
    todos = session.exec(select(Todo).where(Todo.owner_uid == current_user.uid)).all()
    return todos

# 3. READ One (Retrieve a specific To-Do by ID)
@app.get("/todos/{todo_id}", response_model=TodoRead)
def read_todo(*, session: Session = Depends(get_session), todo_id: int):
    """Retrieves a single todo item by its ID."""
    todo = session.get(Todo, todo_id)
    if not todo:
        raise TodoNotFound(todo_id)
    return todo

# 4. UPDATE
class TodoUpdate(SQLModel):
    """Schema used for updating a todo item (all fields are optional)."""
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

@app.put("/todos/{todo_id}", response_model=TodoRead)
def update_todo(*, session: Session = Depends(get_session), todo_id: int, todo: TodoUpdate, current_user: User = Depends(get_current_user)):
    """Updates an existing todo item."""
    db_todo = session.get(Todo, todo_id)
    
    if not db_todo:
        raise TodoNotFound(todo_id)

    if db_todo.owner_uid != current_user.uid:
        raise AuthorizationError()

    todo_data = todo.model_dump(exclude_unset=True)

    for key, value in todo_data.items():
        setattr(db_todo, key, value)

    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo

# 5. DELETE
@app.delete("/todos/{todo_id}")
def delete_todo(*, session: Session = Depends(get_session), todo_id: int, current_user: User = Depends(get_current_user)):
    """Deletes a todo item by its ID."""
    todo = session.get(Todo, todo_id)
    
    if not todo:
        raise TodoNotFound(todo_id)

    if todo.owner_uid != current_user.uid:
        raise AuthorizationError()

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