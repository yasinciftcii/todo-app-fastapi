from fastapi.testclient import TestClient
from main import app # FastAPI uygulamamızı içe aktarıyoruz

# Test istemcisini oluşturuyoruz
client = TestClient(app)

def test_read_root():
    """Test the root '/' endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World from FastAPI! The To-Do API is running."}

def test_health_check():
    """Test the '/health' endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}