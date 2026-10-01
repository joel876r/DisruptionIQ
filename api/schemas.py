"""Pydantic data schemas for request and response validation.

Provides strong typing and validation for Sol voice interaction endpoints
with multi-step scheme state tracking and actionable solution payloads.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Represents an individual message turn in a voice conversation."""

    role: str = Field(..., description="Role of the speaker: 'user' or 'model'")
    content: str = Field(..., description="Spoken or transcribed text content")


class SchemeCriteriaState(BaseModel):
    """State tracking for Kalaignar Magalir Urimai Thittam criteria."""

    age_verified: Optional[bool] = Field(default=None, description="Age >= 21")
    ration_card_verified: Optional[bool] = Field(default=None, description="Woman head on smart ration card")
    income_verified: Optional[bool] = Field(default=None, description="Annual income <= 2.5 Lakhs")
    electricity_verified: Optional[bool] = Field(default=None, description="Electricity <= 3600 units/year")
    land_verified: Optional[bool] = Field(default=None, description="Wetland <= 5 acres or dryland <= 10 acres")


class SolutionDetails(BaseModel):
    """Actionable solution details provided to the user once evaluated."""

    status: str = Field(default="checking", description="'eligible' | 'ineligible' | 'checking'")
    scheme_title: str = Field(default="கலைஞர் மகளிர் உரிமைத் திட்டம்", description="Official Tamil scheme title")
    monthly_benefit: str = Field(default="₹1,000", description="Monthly financial assistance amount")
    required_documents: List[str] = Field(
        default_factory=lambda: [
            "ஆதார் அட்டை (Aadhaar Card)",
            "குடும்ப ஸ்மார்ட் ரேஷன் கார்டு (Smart Ration Card)",
            "வங்கி சேமிப்பு கணக்கு புத்தகம் (Bank Passbook)",
            "மின் கட்டண ரசீது (Electricity Bill)",
        ],
        description="Documents needed for submission",
    )
    where_to_go: str = Field(
        default="உங்கள் அருகிலுள்ள இ-சேவை மையம் (e-Sevai) அல்லது நியாயவிலைக் கடை",
        description="Location for application submission",
    )
    action_steps: List[str] = Field(
        default_factory=lambda: [
            "1. தேவையான 4 ஆவணங்களின் நகல்களை எடுக்கவும்.",
            "2. அருகிலுள்ள இ-சேவை மையத்திற்குச் செல்லவும்.",
            "3. விரல்ரேகை (Biometric) பதிவு செய்து விண்ணப்பிக்கவும்.",
            "4. உங்கள் வங்கிக் கணக்கில் மாதம் ₹1,000 நேரடியாக வரவு வைக்கப்படும்.",
        ],
        description="Step-by-step guidance for rural women",
    )


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
    current_step: Optional[str] = Field(
        default=None,
        description="Current conversational step e.g. 'welcome', 'age', 'income'",
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
    current_step: str = Field(
        default="welcome",
        description="Active dialogue step ('welcome', 'age', 'ration_card', 'income', 'electricity', 'land', 'solution')",
    )
    passed_criteria: List[str] = Field(
        default_factory=list,
        description="List of verified criteria keys",
    )
    is_eligible: Optional[bool] = Field(
        default=None,
        description="Final eligibility outcome if determined",
    )
    solution: Optional[SolutionDetails] = Field(
        default=None,
        description="Complete actionable solution details",
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
    current_step: str = Field(
        default="welcome",
        description="Initial dialogue step",
    )


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(..., description="Service status indicator")
    app: str = Field(..., description="Application name")
    version: str = Field(..., description="Application semantic version")
