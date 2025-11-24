from fastapi import FastAPI
from .database import create_db_and_tables

# Initialize the FastAPI application
app = FastAPI(title="To-Do App Backend")

# Application startup event handler
@app.on_event("startup")
def on_startup():
    """Initializes the database connection and creates tables on startup."""
    create_db_and_tables()

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Hello World from FastAPI! The To-Do API is running."}

# Health check endpoint for deployment tools (like Coolify)
@app.get("/health")
def health_check():
    return {"status": "ok"}