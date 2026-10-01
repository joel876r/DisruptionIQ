"""Unit tests for Sol / சொல் FastAPI routes using pytest and TestClient.

Tests health check, welcome greeting, chat dialogue reasoning, CORS settings,
context state progression, and full scheme solution delivery.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from main import app
from services.gemini_service import WELCOME_MESSAGE

client = TestClient(app)


def test_health_check_endpoint() -> None:
    """Test 1: Verify the /health and /api/health endpoints return 200 OK and valid schema."""
    response = client.get("/api/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "healthy"
    assert "Sol" in data["app"]
    assert "சொல்" in data["app"]
    assert "version" in data

    root_response = client.get("/health")
    assert root_response.status_code == 200
    assert root_response.json()["status"] == "healthy"


def test_welcome_message_endpoint() -> None:
    """Test 2: Verify the /welcome endpoint returns the mandated Tamil opening greeting."""
    response = client.get("/api/welcome")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "message" in data
    # Mandated requirement:
    # "Start the first interaction with 'வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?'"
    assert data["message"] == "வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?"
    assert data["language"] == "ta-IN"

    root_response = client.get("/welcome")
    assert root_response.status_code == 200
    assert root_response.json()["message"] == WELCOME_MESSAGE


def test_chat_interaction_dialogue() -> None:
    """Test 3: Verify the /chat endpoint processes user messages and returns Tamil replies."""
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


def test_cors_headers_configured() -> None:
    """Test 4: Verify CORS preflight headers are properly exposed for web speech clients."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/api/chat", headers=headers)
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers


def test_age_verification_progression() -> None:
    """Test 5: Verify that stating age >= 21 marks age as verified and advances to ration_card."""
    payload = {
        "message": "எனக்கு 32 வயது ஆகிறது",
        "history": [],
        "current_step": "age",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "age" in data["passed_criteria"]
    assert data["current_step"] == "ration_card"
    # Ensure response is in Tamil and does not re-ask age
    assert "ரேஷன்" in data["reply"] or "குடும்ப" in data["reply"]


def test_full_eligibility_flow_to_solution() -> None:
    """Test 6: Verify that completing all criteria returns the final actionable solution payload."""
    payload = {
        "message": "நிலம் எதுவும் இல்லைங்க, வாடகை வீடுதான்",
        "history": [
            {"role": "user", "content": "எனக்கு 28 வயது"},
            {"role": "user", "content": "குடும்ப அட்டை தலைவி நான்தான்"},
            {"role": "user", "content": "ஆண்டு வருமானம் 1 லட்சம்"},
            {"role": "user", "content": "மின்சார பயன்பாடு 800 யூனிட்"},
        ],
        "current_step": "land",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_eligible"] is True
    assert data["solution"] is not None
    assert data["solution"]["status"] == "eligible"
    assert data["solution"]["monthly_benefit"] == "₹1,000"
    assert len(data["solution"]["required_documents"]) >= 4
    assert "இ-சேவை" in data["solution"]["where_to_go"]


def test_documents_inquiry_intent() -> None:
    """Test 7: Verify user inquiry regarding required documents yields clear Tamil guidance."""
    payload = {
        "message": "விண்ணப்பிக்க என்னென்ன ஆவணங்கள் தேவை?",
        "history": [],
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Must mention essential documents like Aadhaar, Ration card
    assert "ஆதார்" in data["reply"] or "ரேஷன்" in data["reply"]


def test_empty_message_resilience() -> None:
    """Test 8: Verify empty user input is handled gracefully without 500 error."""
    payload = {
        "message": "",
        "history": [],
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == WELCOME_MESSAGE


def test_multi_entity_context_understanding() -> None:
    """Test 9: Verify Sol extracts multiple details (name + age) from single context and advances to ration_card."""
    payload = {
        "message": "என் பெயர் செல்வி எனக்கு 35 வயது ஆகிறது",
        "history": [],
        "current_step": "name",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["current_step"] == "ration_card"
    assert "age" in data["passed_criteria"]
    assert data["application"] is not None
    assert "செல்வி" in (data["application"].get("applicant_name") or "")


def test_ration_card_response_avoids_inquiry_trap() -> None:
    """Test 10: Stating ration card number must record card and advance to income, not trigger document inquiry."""
    payload = {
        "message": "ரேஷன் கார்டு எண் 3324519 குடும்பத் தலைவி நான் தான்",
        "history": [],
        "current_step": "ration_card",
        "application_data": {
            "applicant_name": "செல்வி",
            "age": 35,
            "passed_criteria": ["age"],
        },
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["current_step"] == "income"
    assert "ration_card" in data["passed_criteria"]
    assert data["application"] is not None
    assert "3324519" in (data["application"].get("ration_card_number") or "")
