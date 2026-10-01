"""API routing endpoints for Sol / சொல் voice interaction.

Defines RESTful endpoints for health verification, initial welcome greeting,
and voice-to-reasoning conversation turns with intelligent state tracking.
"""

from __future__ import annotations

import logging
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status

from api.schemas import ChatRequest, ChatResponse, HealthResponse, SolutionDetails, WelcomeResponse
from config import settings
from services.gemini_service import gemini_service

logger = logging.getLogger("sol.api.routes")
router = APIRouter(tags=["Voice Interaction"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Returns the active operational status and version of the Sol backend.",
)
async def health_check() -> HealthResponse:
    """Verify backend operational status.

    Returns:
        HealthResponse containing status, app name, and version.
    """
    return HealthResponse(
        status="healthy",
        app=settings.PROJECT_NAME,
        version=settings.VERSION,
    )


@router.get(
    "/welcome",
    response_model=WelcomeResponse,
    status_code=status.HTTP_200_OK,
    summary="Initial voice greeting endpoint",
    description="Provides the mandated Tamil greeting to trigger SpeechSynthesis on user arrival.",
)
async def get_welcome_message() -> WelcomeResponse:
    """Retrieve the official welcome greeting in Tamil.

    Returns:
        WelcomeResponse with the exact phrase:
        'வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?'
    """
    greeting = gemini_service.get_welcome_greeting()
    return WelcomeResponse(
        message=greeting,
        language="ta-IN",
        current_step="welcome",
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Voice reasoning dialogue endpoint",
    description=(
        "Processes transcribed Tamil voice input via the Gemini reasoning engine "
        "with multi-turn context tracking, avoiding repetitive questions and providing solutions."
    ),
)
async def chat_interaction(payload: ChatRequest) -> ChatResponse:
    """Process user voice transcription and return conversational response.

    Args:
        payload: ChatRequest containing user message transcript, message history, and current step.

    Returns:
        ChatResponse with Tamil spoken answer, passed criteria, and actionable solution.

    Raises:
        HTTPException: If an unrecoverable processing error occurs.
    """
    try:
        history_list: List[Dict[str, str]] = [
            {"role": msg.role, "content": msg.content}
            for msg in (payload.history or [])
        ]

        turn_result = gemini_service.process_voice_turn(
            user_message=payload.message,
            history=history_list,
            current_step=payload.current_step,
        )

        solution_obj = None
        if turn_result.get("solution"):
            solution_obj = SolutionDetails(**turn_result["solution"])

        return ChatResponse(
            reply=turn_result["reply"],
            language="ta-IN",
            session_id=payload.session_id,
            current_step=turn_result["current_step"],
            passed_criteria=turn_result["passed_criteria"],
            is_eligible=turn_result["is_eligible"],
            solution=solution_obj,
        )
    except Exception as exc:
        logger.error("Unhandled error in /chat route: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating speech reasoning response.",
        ) from exc
