from typing import Optional
from sqlmodel import SQLModel, Field

# 1. Base Model (Database Table + Pydantic Schema)
class TodoBase(SQLModel):
    """Shared properties for creating and reading todos."""
    title: str = Field(index=True)
    description: Optional[str] = None
    is_completed: bool = Field(default=False)

# 2. Database Model
class Todo(TodoBase, table=True):
    """The actual SQL table model."""
    id: Optional[int] = Field(default=None, primary_key=True)

# 3. Pydantic Schema for Creation
class TodoCreate(TodoBase):
    """Schema used when a client creates a new todo. Excludes 'id'."""
    pass

# 4. Pydantic Schema for Reading (Response)
class TodoRead(TodoBase):
    """Schema used when sending todo data back to the client. Requires 'id'."""
    id: int