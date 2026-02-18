from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CategoryBase(SQLModel):
    """Base properties for a Category (client-facing)."""
    name: str = Field(index=True)


class Category(CategoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_uid: str = Field(index=True)

    todos: List["Todo"] = Relationship(back_populates="category")


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int
    owner_uid: str


class CategoryUpdate(SQLModel):
    name: Optional[str] = None


class TodoBase(SQLModel):
    title: str = Field(index=True)
    description: Optional[str] = None
    is_completed: bool = Field(default=False)

    priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM)
    due_date: Optional[datetime] = None
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")


class Todo(TodoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_uid: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    category: Optional[Category] = Relationship(back_populates="todos")


class TodoCreate(TodoBase):
    pass


class TodoRead(TodoBase):
    id: int
    owner_uid: str
    created_at: datetime
    category: Optional[CategoryRead] = None


class TodoUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[PriorityLevel] = None
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None
