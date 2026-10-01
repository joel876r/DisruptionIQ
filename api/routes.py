"""API routing endpoints for Sol / சொல் voice interaction.

Defines RESTful endpoints for health verification, initial welcome greeting,
and voice-to-reasoning conversation turns.
"""

from __future__ import annotations

import logging
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status

from api.schemas import ChatRequest, ChatResponse, HealthResponse, WelcomeResponse
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
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Voice reasoning dialogue endpoint",
    description=(
        "Processes transcribed Tamil voice input via the Gemini reasoning engine "
        "and produces a concise Tamil response (max 2 sentences, 1 question at a time)."
    ),
)
async def chat_interaction(payload: ChatRequest) -> ChatResponse:
    """Process user voice transcription and return conversational response.

    Args:
        payload: ChatRequest containing user message transcript and message history.

    Returns:
        ChatResponse with Tamil spoken answer and language tag.

    Raises:
        HTTPException: If an unrecoverable processing error occurs.
    """
    try:
        # Convert schema history into dictionaries for the reasoning engine
        history_list: List[Dict[str, str]] = [
            {"role": msg.role, "content": msg.content}
            for msg in (payload.history or [])
        ]

        reply_text = gemini_service.generate_response(
            user_message=payload.message,
            history=history_list,
        )

        return ChatResponse(
            reply=reply_text,
            language="ta-IN",
            session_id=payload.session_id,
        )
    except Exception as exc:
        logger.error("Unhandled error in /chat route: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating speech reasoning response.",
        ) from exc
