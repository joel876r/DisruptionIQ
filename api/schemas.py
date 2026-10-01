"""Pydantic data schemas for request and response validation.

Provides strong typing for Sol voice interaction and government scheme
application processing for Kalaignar Magalir Urimai Thittam.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Represents an individual message turn in a voice conversation."""

    role: str = Field(..., description="Role of the speaker: 'user' or 'model'")
    content: str = Field(..., description="Spoken or transcribed text content")


class ApplicationData(BaseModel):
    """Real government scheme application data collected via conversational Tamil."""

    applicant_name: Optional[str] = Field(default=None, description="பெயர் (Applicant Name)")
    age: Optional[int] = Field(default=None, description="வயது (Age >= 21)")
    ration_card_type: Optional[str] = Field(default="PHH - வறுமைக் கோட்டிற்கு கீழ்", description="குடும்ப அட்டை வகை")
    ration_card_number: Optional[str] = Field(default=None, description="ஸ்மார்ட் ரேஷன் கார்டு எண்")
    is_female_head: Optional[bool] = Field(default=True, description="குடும்பத் தலைவி உறுதி")
    annual_income: Optional[str] = Field(default="₹2.5 லட்சத்திற்குள்", description="ஆண்டு வருமானம்")
    occupation: Optional[str] = Field(default="விவசாயம் / சுயதொழில்", description="தொழில் விவரம்")
    electricity_units: Optional[str] = Field(default="3600 யூனிட்டுக்குள்", description="ஆண்டு மின் பயன்பாடு")
    land_extent: Optional[str] = Field(default="5 ஏக்கருக்குள்", description="நில அளவு")
    bank_name: Optional[str] = Field(default=None, description="வங்கி பெயர் (Bank Name for ₹1,000 DBT)")
    application_id: Optional[str] = Field(default=None, description="அரசு விண்ணப்ப பதிவு எண்")
    submission_status: str = Field(default="gathering", description="'gathering' | 'ready' | 'submitted'")
    applied_date: Optional[str] = Field(default=None, description="விண்ணப்பித்த தேதி")


class SolutionDetails(BaseModel):
    """Actionable solution details provided to the user once evaluated."""

    status: str = Field(default="checking", description="'eligible' | 'ineligible' | 'checking'")
    scheme_title: str = Field(default="கலைஞர் மகளிர் உரிமைத் திட்டம்", description="Official Tamil scheme title")
    monthly_benefit: str = Field(default="₹1,000", description="Monthly financial assistance amount")
    application_id: Optional[str] = Field(default=None, description="Official Scheme Application ID")
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
            "1. உங்கள் விண்ணப்ப எண் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது.",
            "2. உதவித்தொகை ₹1,000 உங்கள் வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படும்.",
            "3. எஸ்.எம்.எஸ் (SMS) மூலம் ஒப்புகை உறுதி செய்யப்படும்.",
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
        description="Current conversational step e.g. 'welcome', 'name', 'age', 'ration_card', 'income', 'bank'",
    )
    application_data: Optional[ApplicationData] = Field(
        default=None,
        description="Real scheme application data gathered so far",
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
        description="Active dialogue step",
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
    application: Optional[ApplicationData] = Field(
        default=None,
        description="Updated real government scheme application form",
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
