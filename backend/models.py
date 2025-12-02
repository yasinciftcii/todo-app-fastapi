from typing import Optional
from sqlmodel import SQLModel, Field

# 1. Base Model (Database Table + Pydantic Schema)
class TodoCore(SQLModel):
    """Shared properties for creating and reading todos."""
    title: str = Field(index=True)
    description: Optional[str] = None
    is_completed: bool = Field(default=False)

# 2. Database Model
class Todo(TodoCore, table=True):
    """The actual SQL table model."""
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_uid: str = Field(index=True)

# 3. Pydantic Schema for Creation
class TodoCreate(TodoCore):
    """Schema used when a client creates a new todo. Excludes 'id'."""
    pass

# 4. Pydantic Schema for Reading (Response)
class TodoRead(TodoCore):
    """Schema used when sending todo data back to the client. Requires 'id'."""
    id: int
    owner_uid: str


# 5. Pydantic Schema for Updating (Partial Update)
class TodoUpdate(SQLModel):
    """Schema used for updating a todo item (all fields are optional)."""
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None