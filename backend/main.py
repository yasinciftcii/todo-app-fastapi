from fastapi import FastAPI

# Initialize the FastAPI application
app = FastAPI(title="To-Do App Backend")

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Hello World from FastAPI! The To-Do API is running."}

# Health check endpoint for deployment tools (like Coolify)
@app.get("/health")
def health_check():
    return {"status": "ok"}