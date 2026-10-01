"""Gemini reasoning engine service for Sol / சொல்.

Integrates the official google-genai Python SDK with structured system prompts
to assist rural Indian women in conversational Tamil for the Kalaignar Magalir
Urimai Thittam scheme.
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional
from config import settings

logger = logging.getLogger("sol.services.gemini")

# Official Welcome Message constant mandated by the project directive
WELCOME_MESSAGE: str = "வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?"


class GeminiVoiceService:
    """Service class encapsulating interaction with Google GenAI API."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None) -> None:
        """Initialize the Gemini client with API credentials and system instructions.

        Args:
            api_key: Optional Google Gemini API key. Defaults to settings.GEMINI_API_KEY.
            model_name: Optional Gemini model name. Defaults to settings.GEMINI_MODEL.
        """
        self.api_key: str = api_key or settings.GEMINI_API_KEY
        self.model_name: str = model_name or settings.GEMINI_MODEL
        self.client = None

        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai

                self.client = genai.Client(api_key=self.api_key)
                logger.info("Successfully initialized official Google GenAI Client with model %s", self.model_name)
            except Exception as exc:  # pylint: disable=broad-except
                logger.warning("Could not initialize Google GenAI Client: %s. Using local conversational fallback.", exc)
        else:
            logger.info("No active GEMINI_API_KEY detected. Operating in high-fidelity mock/fallback mode.")

    def get_system_prompt(self) -> str:
        """Construct the complete system prompt enforcing voice parameters and scheme rules.

        Returns:
            The complete system instruction string.
        """
        return f"{settings.SOL_SYSTEM_INSTRUCTION}\n\n{settings.KMUT_SCHEME_CRITERIA}"

    def get_welcome_greeting(self) -> str:
        """Return the official initial greeting in Tamil.

        Returns:
            The greeting string: 'வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?'
        """
        return WELCOME_MESSAGE

    def _fallback_tamil_engine(self, user_message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """Provide a reliable, rule-based Tamil conversational response when API is unavailable.

        Simulates the sequential eligibility questions for Kalaignar Magalir Urimai Thittam.

        Args:
            user_message: The spoken input transcript from the user in Tamil.
            history: Previous conversation turns.

        Returns:
            A concise Tamil response (maximum 2 sentences, 1 question at a time).
        """
        text = user_message.lower().strip()
        turn_count = len(history) if history else 0

        # Greetings or start of conversation
        if not text or any(w in text for w in ["வணக்கம்", "ஹலோ", "hello", "hi", "start", "சொல்"]):
            if turn_count == 0:
                return WELCOME_MESSAGE
            return "கலைஞர் மகளிர் உரிமைத் திட்டத்திற்கு உங்களுக்கு 21 வயது பூர்த்தியாகிவிட்டதா?"

        # Checking Age
        if any(w in text for w in ["வயது", "age", "ஆமாம்", "ஆம்", "yes", "21", "22", "30", "40", "50", "இருபது", "முப்பது"]):
            if turn_count <= 2:
                return "நல்லது. உங்கள் குடும்பத்தின் ஆண்டு வருமானம் இரண்டரை லட்ச ரூபாய்க்குள் உள்ளதா?"

        # Checking Income
        if any(w in text for w in ["வருமானம்", "லட்சம்", "குறைவு", "income", "ஆமா", "உள்ள"]):
            return "சரிங்க. உங்கள் வீட்டில் ஆண்டு மின்சார பயன்பாடு 3600 யூனிட்டிற்குள் இருக்கிறதா?"

        # Checking Electricity
        if any(w in text for w in ["யூனிட்", "மின்சாரம்", "கரண்ட்", "current", "unit", "ஆமாங்க"]):
            return "நன்றி. உங்கள் குடும்பத்திற்கு 5 ஏக்கருக்குள் நன்செய் நிலம் அல்லது 10 ஏக்கருக்குள் புன்செய் நிலம் மட்டுமே உள்ளதா?"

        # Checking Land
        if any(w in text for w in ["நிலம்", "ஏக்கர்", "இல்லை", "land", "குறைவுதான்"]):
            return "உங்கள் குடும்ப ரேஷன் கார்டில் நீங்கள் குடும்பத் தலைவியாக உள்ளீர்களா?"

        # Checking Ration card / Final Eligibility
        if any(w in text for w in ["ரேஷன்", "கார்டு", "தலைவி", "card", "ration"]):
            return "வாழ்த்துகள்! நீங்கள் கலைஞர் மகளிர் உரிமைத் திட்டத்தின் மாத உதவித்தொகை ₹1,000 பெற தகுதியுடையவர். உங்கள் அருகிலுள்ள இ-சேவை மையத்தில் விண்ணப்பிக்கலாம்."

        # Default gentle conversational prompt
        return "கலைஞர் மகளிர் உரிமைத் திட்டத்தின் கீழ் மாதம் ஆயிரம் ரூபாய் பெற உங்கள் விவரங்களை சரிபார்க்கலாம். உங்கள் வயது 21க்கு மேல் உள்ளதா?"

    def generate_response(self, user_message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """Generate a response using Gemini GenAI SDK or fallback engine.

        Ensures responses strictly abide by:
        1. Simple, conversational Tamil only.
        2. Maximum of 2 sentences.
        3. Only one eligibility question at a time for Kalaignar Magalir Urimai Thittam.

        Args:
            user_message: The transcribed voice input from the user.
            history: Optional list of previous chat messages with 'role' ('user'/'model') and 'parts'.

        Returns:
            The Tamil voice response string.
        """
        user_message_clean = (user_message or "").strip()
        if not user_message_clean:
            return WELCOME_MESSAGE

        if self.client:
            try:
                from google.genai import types

                # Build contents array with history and current message
                contents = []
                if history:
                    for turn in history:
                        role = "model" if turn.get("role") in ["model", "assistant"] else "user"
                        text_val = turn.get("text") or turn.get("content") or ""
                        if text_val:
                            contents.append(
                                types.Content(
                                    role=role,
                                    parts=[types.Part.from_text(text=text_val)],
                                )
                            )

                # Add current turn
                contents.append(
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=user_message_clean)],
                    )
                )

                config = types.GenerateContentConfig(
                    system_instruction=self.get_system_prompt(),
                    temperature=0.2,
                    max_output_tokens=150,
                )

                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=contents,
                    config=config,
                )

                if response and response.text:
                    cleaned_reply = response.text.strip()
                    logger.debug("Gemini response: %s", cleaned_reply)
                    return cleaned_reply

            except Exception as exc:  # pylint: disable=broad-except
                logger.error("Error communicating with Gemini API: %s. Using local fallback.", exc)

        return self._fallback_tamil_engine(user_message_clean, history)


# Singleton instance for dependency injection
gemini_service = GeminiVoiceService()
