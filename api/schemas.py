"""Pydantic data schemas for request and response validation.

Provides strong typing and validation for Sol voice interaction endpoints.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Represents an individual message turn in a voice conversation."""

    role: str = Field(..., description="Role of the speaker: 'user' or 'model'")
    content: str = Field(..., description="Spoken or transcribed text content")


class ChatRequest(BaseModel):
    """Request payload for processing voice transcripts."""

    message: str = Field(..., description="The user's spoken input transcript in Tamil")
    history: Optional[List[ChatMessage]] = Field(
        default_factory=list,
        description="Prior conversation history between user and Sol",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Optional session identifier for tracking conversation flow",
    )


class ChatResponse(BaseModel):
    """Response payload returned by the voice assistant."""

    reply: str = Field(
        ...,
        description="Sol's spoken response in simple Tamil (max 2 sentences, 1 question)",
    )
    language: str = Field(
        default="ta-IN",
        description="BCP-47 language tag for Tamil speech synthesis",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session identifier preserved for continuous interaction",
    )


class WelcomeResponse(BaseModel):
    """Response payload for initial voice greeting."""

    message: str = Field(
        ...,
        description="Official opening greeting: 'வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?'",
    )
    language: str = Field(
        default="ta-IN",
        description="BCP-47 language tag for Tamil speech synthesis",
    )


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(..., description="Service status indicator")
    app: str = Field(..., description="Application name")
    version: str = Field(..., description="Application semantic version")
