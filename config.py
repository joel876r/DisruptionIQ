"""Configuration module for Sol / சொல் backend.

Handles environment variable loading, default values, and CORS policy configuration.
"""

from __future__ import annotations

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()


class Settings:
    """Application configuration settings loaded from environment variables."""

    PROJECT_NAME: str = "Sol / சொல்"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "Zero-UI Voice Assistant helping rural Indian women access "
        "the Kalaignar Magalir Urimai Thittam scheme via conversational Tamil."
    )

    # Gemini API Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS Settings: explicitly allowed frontend origins
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]

    # Required System Prompt for Sol Voice Reasoning Engine
    SOL_SYSTEM_INSTRUCTION: str = (
        "You are 'Sol' (சொல்), a simple voice assistant. "
        "Speak exclusively in simple, conversational Tamil. "
        "Start the first interaction with 'வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?'. "
        "Responses must be a maximum of 2 sentences, asking only one eligibility question at a time "
        "for the 'Kalaignar Magalir Urimai Thittam' scheme."
    )

    # Official Scheme Knowledge base for Kalaignar Magalir Urimai Thittam (KMUT)
    KMUT_SCHEME_CRITERIA: str = (
        "Scheme Details (கலைஞர் மகளிர் உரிமைத் திட்டம்):\n"
        "- Monthly assistance of ₹1,000 for eligible women heads of families in Tamil Nadu.\n"
        "- Criteria to evaluate sequentially (ask only one question per turn in simple Tamil):\n"
        "  1. Is the applicant a woman aged 21 or older?\n"
        "  2. Is the family's annual income less than ₹2.5 Lakhs (ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள்)?\n"
        "  3. Is family electricity consumption under 3,600 units/year (மின் பயன்பாடு 3600 யூனிட்)?\n"
        "  4. Does the family own less than 5 acres wetland or 10 acres dryland?\n"
        "  5. Is she the designated female head on the family ration card (குடும்ப அட்டை)?\n"
        "- Once all criteria are met, warmly confirm eligibility and advise visiting the nearest e-Sevai / ration center.\n"
        "- If ineligible, explain kindly and gently in simple spoken Tamil."
    )


settings = Settings()
