"""Configuration module for DisruptionIQ backend.

Loads environment variables, CORS policies, JWT signing keys, and Gemini AI configuration.
"""

from __future__ import annotations

import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application configuration settings loaded from environment variables."""

    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "DisruptionIQ")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    DESCRIPTION: str = (
        "From Delivery Delays to Recovery Plans — Multi-Company Supply Chain Resilience Platform"
    )

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./disruption_iq.db")

    # Security & Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "disruption-iq-super-secure-production-ready-secret-key-2026")
    CARRIER_WEBHOOK_SECRET: str = os.getenv("CARRIER_WEBHOOK_SECRET", "carrier-secure-demo-secret-2026")

    # Gemini API Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
