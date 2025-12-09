from fastapi import HTTPException, status

# 404: Source not found
class TodoNotFound(HTTPException):
    def __init__(self, todo_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Todo item with ID {todo_id} not found."
        )

# 403: Unauthorized action
class AuthorizationError(HTTPException):
    def __init__(self, message: str = "Not authorized to perform this action."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=message
        )