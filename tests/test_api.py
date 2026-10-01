"""Unit tests for Sol / சொல் FastAPI routes using pytest and TestClient.

Tests health check, welcome greeting, chat dialogue reasoning, and CORS settings.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from main import app
from services.gemini_service import WELCOME_MESSAGE

client = TestClient(app)


def test_health_check_endpoint() -> None:
    """Test unit 1: Verify the /health and /api/health endpoints return 200 OK and valid schema."""
    response = client.get("/api/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "healthy"
    assert "Sol" in data["app"]
    assert "சொல்" in data["app"]
    assert "version" in data

    # Also verify route at root /health
    root_response = client.get("/health")
    assert root_response.status_code == 200
    assert root_response.json()["status"] == "healthy"


def test_welcome_message_endpoint() -> None:
    """Test unit 2: Verify the /welcome endpoint returns the mandated Tamil opening greeting."""
    response = client.get("/api/welcome")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "message" in data
    # Mandated prompt requirement:
    # "Start the first interaction with 'வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?'"
    assert data["message"] == "வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?"
    assert data["language"] == "ta-IN"

    # Also verify root /welcome
    root_response = client.get("/welcome")
    assert root_response.status_code == 200
    assert root_response.json()["message"] == WELCOME_MESSAGE


def test_chat_interaction_dialogue() -> None:
    """Test unit 3: Verify the /chat endpoint processes user messages and returns Tamil replies."""
    payload = {
        "message": "கலைஞர் மகளிர் உரிமைத் திட்டம் பற்றி சொல்லுங்கள்",
        "history": [],
        "session_id": "test-session-123",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "reply" in data
    assert isinstance(data["reply"], str)
    assert len(data["reply"]) > 0
    assert data["language"] == "ta-IN"
    assert data["session_id"] == "test-session-123"

    # Multi-turn interaction test: provide age input
    followup_payload = {
        "message": "எனக்கு 28 வயது ஆகிறது",
        "history": [
            {"role": "user", "content": "கலைஞர் மகளிர் உரிமைத் திட்டம் பற்றி சொல்லுங்கள்"},
            {"role": "model", "content": data["reply"]},
        ],
        "session_id": "test-session-123",
    }
    followup_response = client.post("/api/chat", json=followup_payload)
    assert followup_response.status_code == 200
    followup_data = followup_response.json()
    assert len(followup_data["reply"]) > 0


def test_cors_headers_configured() -> None:
    """Test unit 4: Verify CORS preflight headers are properly exposed for web speech clients."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/api/chat", headers=headers)
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
