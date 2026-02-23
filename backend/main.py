from fastapi import FastAPI, Depends, HTTPException
from database import create_db_and_tables, get_session
from typing import List
from sqlmodel import Session, select
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from models import (
    Todo, TodoCreate, TodoRead, TodoUpdate,
    Category, CategoryCreate, CategoryRead, CategoryUpdate
)

from auth import initialize_firebase, get_current_user, User
from exceptions import TodoNotFound, AuthorizationError


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application starting up...")
    initialize_firebase()
    create_db_and_tables()
    yield
    print("Application shutting down...")


app = FastAPI(title="To-Do App Backend", lifespan=lifespan)

app.router.redirect_slashes = False

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dotodo-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # Preview deployments like https://anything.vercel.app
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=False,  # Using Authorization header, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Category Endpoints
# -------------------------

@app.post("/categories", response_model=CategoryRead)
@app.post("/categories/", response_model=CategoryRead)
def create_category(
    category: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    name = (category.name or "").strip()
    if not name:
        raise HTTPException(status_code=422, detail="Category name cannot be empty")

    db_category = Category(name=name, owner_uid=current_user.uid)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category


@app.get("/categories", response_model=List[CategoryRead])
@app.get("/categories/", response_model=List[CategoryRead])
def read_categories(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Category).where(Category.owner_uid == current_user.uid)
    return session.exec(statement).all()


@app.put("/categories/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.owner_uid != current_user.uid:
        raise HTTPException(status_code=403, detail="Not allowed")

    if payload.name is not None:
        new_name = payload.name.strip()
        if not new_name:
            raise HTTPException(status_code=422, detail="Category name cannot be empty")
        category.name = new_name

    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@app.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a category and move its todos to Uncategorized (category_id=None)."""
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.owner_uid != current_user.uid:
        raise HTTPException(status_code=403, detail="Not allowed")

    todos_in_category = session.exec(
        select(Todo).where(
            Todo.owner_uid == current_user.uid,
            Todo.category_id == category_id
        )
    ).all()

    for t in todos_in_category:
        t.category_id = None
        session.add(t)

    session.delete(category)
    session.commit()
    return {"ok": True, "moved_todos": len(todos_in_category)}


# -------------------------
# Todo Endpoints
# -------------------------

@app.post("/todos", response_model=TodoRead)
@app.post("/todos/", response_model=TodoRead)
def create_todo(
    *,
    session: Session = Depends(get_session),
    todo: TodoCreate,
    current_user: User = Depends(get_current_user)
):
    todo_with_owner = Todo.model_validate(todo, update={"owner_uid": current_user.uid})
    session.add(todo_with_owner)
    session.commit()
    session.refresh(todo_with_owner)
    return todo_with_owner


@app.get("/todos", response_model=List[TodoRead])
@app.get("/todos/", response_model=List[TodoRead])
def read_todos(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = (
        select(Todo)
        .where(Todo.owner_uid == current_user.uid)
        .order_by(Todo.created_at.desc())
    )
    return session.exec(statement).all()


@app.get("/todos/{todo_id}", response_model=TodoRead)
def read_todo(
    *,
    session: Session = Depends(get_session),
    todo_id: int
):
    todo = session.get(Todo, todo_id)
    if not todo:
        raise TodoNotFound(todo_id)
    return todo


@app.put("/todos/{todo_id}", response_model=TodoRead)
def update_todo(
    *,
    session: Session = Depends(get_session),
    todo_id: int,
    todo: TodoUpdate,
    current_user: User = Depends(get_current_user)
):
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


@app.delete("/todos/{todo_id}")
def delete_todo(
    *,
    session: Session = Depends(get_session),
    todo_id: int,
    current_user: User = Depends(get_current_user)
):
    todo = session.get(Todo, todo_id)
    if not todo:
        raise TodoNotFound(todo_id)

    if todo.owner_uid != current_user.uid:
        raise AuthorizationError()

    session.delete(todo)
    session.commit()
    return {"ok": True}


@app.get("/")
def read_root():
    return {"message": "Hello World from FastAPI! The To-Do API is running."}


@app.get("/health")
def health_check():
    return {"status": "ok"}