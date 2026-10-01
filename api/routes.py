"""API routing endpoints for Sol / சொல் voice interaction.

Defines RESTful endpoints for health verification, initial welcome greeting,
Google Tamil text-to-speech streaming, and official government scheme
application submissions for Kalaignar Magalir Urimai Thittam.
"""

from __future__ import annotations

import io
import logging
import urllib.parse
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Query, Response, status

from api.schemas import ApplicationData, ChatRequest, ChatResponse, HealthResponse, SolutionDetails, WelcomeResponse
from config import settings
from services.gemini_service import gemini_service

logger = logging.getLogger("sol.api.routes")
router = APIRouter(tags=["Voice Interaction & Application"])


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
    description="Provides the mandated Tamil greeting to trigger speech synthesis on user arrival.",
)
async def get_welcome_message() -> WelcomeResponse:
    """Retrieve the official welcome greeting in Tamil.

    Returns:
        WelcomeResponse with the exact phrase:
        'வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?'
    """
    greeting = gemini_service.get_welcome_greeting()
    encoded_audio_url = f"/api/tts?text={urllib.parse.quote(greeting)}"
    return WelcomeResponse(
        message=greeting,
        language="ta-IN",
        current_step="welcome",
        audio_url=encoded_audio_url,
    )


@router.get(
    "/tts",
    summary="Google Tamil Neural Text-to-Speech Streaming",
    description="Generates authentic, fluent, human Tamil speech in memory using Google TTS.",
)
async def stream_tamil_speech(text: str = Query(..., description="Tamil text to speak")) -> Response:
    """Generate and stream real Google Tamil speech audio directly in MP3 format.

    Args:
        text: Spoken Tamil message string.

    Returns:
        Audio/mpeg streaming response.
    """
    try:
        from gtts import gTTS
        fp = io.BytesIO()
        tts = gTTS(text=text, lang="ta")
        tts.write_to_fp(fp)
        fp.seek(0)
        return Response(content=fp.getvalue(), media_type="audio/mpeg")
    except Exception as exc:
        logger.warning("Google TTS generation exception: %s", exc)
        # Return empty response if TTS unavailable so client falls back to Web Speech
        return Response(content=b"", media_type="audio/mpeg")


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Voice reasoning dialogue & application submission endpoint",
    description=(
        "Processes transcribed Tamil voice input, collects real applicant fields, "
        "and submits official applications for Kalaignar Magalir Urimai Thittam."
    ),
)
async def chat_interaction(payload: ChatRequest) -> ChatResponse:
    """Process user voice transcription, update scheme application data, and return voice response.

    Args:
        payload: ChatRequest containing user message, conversation history, current step, and application data.

    Returns:
        ChatResponse with Tamil spoken answer, passed criteria, real application data, audio URL, and solution.

    Raises:
        HTTPException: If an unrecoverable processing error occurs.
    """
    try:
        history_list: List[Dict[str, str]] = [
            {"role": msg.role, "content": msg.content}
            for msg in (payload.history or [])
        ]

        app_dict = payload.application_data.model_dump() if payload.application_data else None

        turn_result = gemini_service.process_voice_turn(
            user_message=payload.message,
            history=history_list,
            current_step=payload.current_step,
            app_data=app_dict,
        )

        solution_obj = None
        if turn_result.get("solution"):
            solution_obj = SolutionDetails(**turn_result["solution"])

        app_obj = None
        if turn_result.get("application"):
            app_obj = ApplicationData(**turn_result["application"])

        reply_text = turn_result["reply"]
        audio_url = f"/api/tts?text={urllib.parse.quote(reply_text)}"

        return ChatResponse(
            reply=reply_text,
            language="ta-IN",
            session_id=payload.session_id,
            current_step=turn_result["current_step"],
            passed_criteria=turn_result["passed_criteria"],
            is_eligible=turn_result["is_eligible"],
            solution=solution_obj,
            application=app_obj,
            audio_url=audio_url,
        )
    except Exception as exc:
        logger.error("Unhandled error in /chat route: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating speech reasoning response.",
        ) from exc
