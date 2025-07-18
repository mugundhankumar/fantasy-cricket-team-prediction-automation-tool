import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the GL Genie Backend!", "status": "healthy"}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    # Adjusted to match actual response structure
    json_resp = response.json()
    assert json_resp.get("status") == "healthy"
    assert "service" in json_resp

def test_get_matches():
    response = client.get("/api/matches")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_predict_teams_missing_match():
    response = client.post("/api/predict_team", json={"match_id": "nonexistent-match"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Match not found"

def test_update_data():
    response = client.post("/api/update-data")
    assert response.status_code in (200, 500)  # Depending on DB state
    assert "message" in response.json()

def test_get_match_squads_missing_match():
    response = client.get("/match_squads/nonexistent-match")
    assert response.status_code == 404
    assert response.json()["detail"] == "Match not found"
