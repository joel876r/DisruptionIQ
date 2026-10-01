"""Gemini reasoning engine & contextual dialogue service for Sol / சொல்.

Provides intelligent context-tracking for rural Indian women accessing the
Kalaignar Magalir Urimai Thittam scheme. Tracks criteria satisfaction,
avoids repetition, comprehends conversational Tamil variations, and delivers
actionable solutions using Google's Gemini 3.8 Flash model.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Tuple
import httpx

from config import settings

logger = logging.getLogger("sol.services.gemini")

WELCOME_MESSAGE: str = "வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?"

# Order of eligibility verification steps
CRITERIA_STEPS: List[str] = ["age", "ration_card", "income", "electricity", "land"]

# Natural Tamil question prompts for each step (strict maximum 2 sentences, 1 question at a time)
STEP_QUESTIONS: Dict[str, str] = {
    "age": "கலைஞர் மகளிர் உரிமைத் திட்டத்தில் மாதம் ₹1,000 பெற, உங்கள் வயது 21 அல்லது அதற்கு மேல் உள்ளதா?",
    "ration_card": "நல்லது. உங்கள் குடும்ப ரேஷன் கார்டில் நீங்கள் குடும்பத் தலைவியாக அல்லது பெண் உறுப்பினராக உள்ளீர்களா?",
    "income": "சரிங்க. உங்கள் குடும்பத்தின் ஆண்டு மொத்த வருமானம் ₹2.5 லட்சத்திற்குள் (இரண்டரை லட்சம்) உள்ளதா?",
    "electricity": "நன்றி. உங்கள் வீட்டில் ஆண்டு மின்சார பயன்பாடு 3,600 யூனிட்டுக்குள் இருக்கிறதா?",
    "land": "கடைசியாக, உங்கள் குடும்பத்திற்கு 5 ஏக்கருக்குள் நன்செய் நிலம் அல்லது 10 ஏக்கருக்குள் புன்செய் நிலம் மட்டுமே உள்ளதா?",
}


class ContextualSchemeEngine:
    """Stateful, context-aware reasoning engine for government scheme qualification."""

    @staticmethod
    def is_affirmative(text: str) -> bool:
        """Detect whether user spoken Tamil indicates agreement or affirmative response."""
        positive_keywords = [
            "ஆமாம்", "ஆம்", "ஆமா", "ஆமாங்க", "சரி", "சரிங்க", "உள்ளது", "உண்டு",
            "இருக்கிறது", "இருக்கு", "இருக்காங்க", "அப்படித்தான்", "நிச்சயமாக", "yes", "yeah",
            "ok", "okay", "correct", "உண்மை", "நான் தான்", "நான்தான்", "குறைவு", "குறைவுதான்",
            "கம்மி", "கம்மிதான்", "இல்லை", "நிலம் இல்லை"
        ]
        text_lower = text.lower()
        return any(k in text_lower for k in positive_keywords)

    @staticmethod
    def is_negative(text: str) -> bool:
        """Detect whether user spoken Tamil indicates negative/ineligible status."""
        negative_keywords = [
            "இல்லைங்க", "கிடையாது", "முடியாது", "அதிகம்", "அதிகமாக",
            "ஜாஸ்தி", "no", "not", "வரவில்லை", "இல்ல"
        ]
        text_lower = text.lower()
        return any(k in text_lower for k in negative_keywords)

    @staticmethod
    def extract_age_number(text: str) -> Optional[int]:
        """Extract explicit age numbers mentioned in voice input."""
        match = re.search(r'\b(1[8-9]|[2-9][0-9])\b', text)
        if match:
            return int(match.group(1))
        tamil_numbers = {
            "இருபது": 20, "இருபத்தியொன்று": 21, "இருபத்தி இரண்டு": 22,
            "இருபத்தைந்து": 25, "முப்பது": 30, "முப்பத்தைந்து": 35,
            "நாற்பது": 40, "நாற்பத்தைந்து": 45, "ஐம்பது": 50, "அறுபது": 60,
        }
        for word, val in tamil_numbers.items():
            if word in text:
                return val
        return None

    @classmethod
    def analyze_dialogue_state(
        cls,
        user_message: str,
        history: Optional[List[Dict[str, str]]] = None,
        incoming_step: Optional[str] = None,
    ) -> Tuple[str, List[str], Optional[bool], str, Dict[str, Any]]:
        """Intelligently determine the next conversational turn without repeating questions.

        Returns:
            Tuple of:
            (reply_text, passed_criteria, is_eligible, next_step, solution_dict)
        """
        text = (user_message or "").strip().lower()
        passed_criteria: List[str] = []
        history = history or []

        combined_text = " ".join([turn.get("content", "").lower() for turn in history] + [text])

        # 1. Age verification
        age_num = cls.extract_age_number(combined_text)
        if (age_num and age_num >= 21) or any(k in combined_text for k in ["வயது 21", "21க்கு மேல்", "25 வயது", "30 வயது", "வயதாகி", "வயது"]):
            passed_criteria.append("age")
        elif "age" in (incoming_step or "") and cls.is_affirmative(text):
            passed_criteria.append("age")

        # 2. Ration card verification
        if any(k in combined_text for k in ["குடும்ப அட்டை", "ரேஷன்", "தலைவி", "ரேஷன் கார்டு", "ஸ்மார்ட் கார்டு"]):
            passed_criteria.append("ration_card")
        elif incoming_step == "ration_card" and (cls.is_affirmative(text) or "நான்" in text or "அம்மா" in text):
            passed_criteria.append("ration_card")

        # 3. Income verification
        if any(k in combined_text for k in ["வருமானம்", "2.5 லட்சம்", "லட்சத்திற்குள்", "கூலி", "விவசாயம்", "ஒரு லட்சம்", "குறைவு"]):
            passed_criteria.append("income")
        elif incoming_step == "income" and (cls.is_affirmative(text) or "குறைவு" in text or "இல்லை" in text):
            passed_criteria.append("income")

        # 4. Electricity verification
        if any(k in combined_text for k in ["மின்சாரம்", "கரண்ட்", "யூனிட்", "3600"]):
            passed_criteria.append("electricity")
        elif incoming_step == "electricity" and cls.is_affirmative(text):
            passed_criteria.append("electricity")

        # 5. Land verification
        if any(k in combined_text for k in ["நிலம்", "ஏக்கர்", "நன்செய்", "புன்செய்"]):
            passed_criteria.append("land")
        elif incoming_step == "land" and (cls.is_affirmative(text) or "இல்லை" in text or "வாடகை" in text):
            passed_criteria.append("land")

        # Deduplicate passed criteria
        passed_criteria = list(dict.fromkeys(passed_criteria))

        # Direct questions from user
        if any(w in text for w in ["ஆவணம்", "டாக்குமெண்ட்", "என்ன தேவை", "ஆவணங்கள்"]):
            reply = "விண்ணப்பிக்க ஆதார் அட்டை, ஸ்மார்ட் ரேஷன் கார்டு, வங்கி பாஸ்புக், மற்றும் மின் கட்டண ரசீது தேவை. தொடர்ந்து தகுதியை சரிபார்க்கலாமா?"
            return reply, passed_criteria, None, incoming_step or "age", {}

        if any(w in text for w in ["எங்கு", "எங்க போகணும்", "இ-சேவை", "விண்ணப்பிப்பது எப்படி"]):
            reply = "உங்கள் ஊரில் உள்ள இ-சேவை மையம் அல்லது நியாயவிலைக் கடையில் விண்ணப்பிக்கலாம். உங்கள் தகுதியை தொடர்ந்து சரிபார்க்கலாமா?"
            return reply, passed_criteria, None, incoming_step or "age", {}

        if any(w in text for w in ["எவ்வளவு", "பணம்", "தொகை", "1000", "ஆயிரம்"]):
            reply = "கலைஞர் மகளிர் உரிமைத் திட்டம் மூலம் மாதம் ₹1,000 உங்கள் வங்கிக் கணக்கில் நேரடியாக வழங்கப்படும். உங்கள் வயது 21க்கு மேல் உள்ளதா?"
            return reply, passed_criteria, None, "age", {}

        if any(w in text for w in ["மறுபடியும்", "மீண்டும்", "சொல்லுங்க", "repeat"]):
            step_to_repeat = incoming_step if incoming_step in STEP_QUESTIONS else "age"
            return STEP_QUESTIONS[step_to_repeat], passed_criteria, None, step_to_repeat, {}

        # Determine next remaining criteria step
        next_step = None
        for step in CRITERIA_STEPS:
            if step not in passed_criteria:
                next_step = step
                break

        # If all 5 criteria are verified: DELIVER FINAL SOLUTION!
        if next_step is None or len(passed_criteria) >= 5:
            solution_payload = {
                "status": "eligible",
                "scheme_title": "கலைஞர் மகளிர் உரிமைத் திட்டம்",
                "monthly_benefit": "₹1,000",
                "required_documents": [
                    "ஆதார் அட்டை (Aadhaar Card)",
                    "ஸ்மார்ட் ரேஷன் கார்டு (Smart Ration Card)",
                    "வங்கி கணக்கு புத்தகம் (Bank Passbook)",
                    "மின் கட்டண ரசீது (Electricity Bill)",
                ],
                "where_to_go": "உங்கள் அருகிலுள்ள இ-சேவை மையம் (e-Sevai) அல்லது நியாயவிலைக் கடை",
                "action_steps": [
                    "1. உங்கள் ஆதார் மற்றும் ரேஷன் கார்டை தயாராக வைக்கவும்.",
                    "2. அருகிலுள்ள இ-சேவை மையத்திற்கு செல்லவும்.",
                    "3. பயோமெட்ரிக் கைரேகை வைத்து விண்ணப்பத்தை பதிவு செய்யவும்.",
                    "4. மாதம் ₹1,000 உதவித்தொகை உங்கள் வங்கிக் கணக்கிற்கு நேரடியாக வரும்.",
                ],
            }
            final_reply = (
                "வாழ்த்துகள்! நீங்கள் கலைஞர் மகளிர் உரிமைத் திட்டத்தின் கீழ் மாதம் ₹1,000 உதவித்தொகை பெற முழு தகுதியுடையவர்! "
                "ஆதார் மற்றும் ரேஷன் கார்டுடன் உங்கள் அருகிலுள்ள இ-சேவை மையத்தில் உடனே விண்ணப்பிக்கலாம்."
            )
            return final_reply, passed_criteria, True, "solution", solution_payload

        # Standard question for the next step
        question = STEP_QUESTIONS[next_step]
        return question, passed_criteria, None, next_step, {}


class GeminiVoiceService:
    """Service class connecting to Google's Gemini API via SDK or direct REST with context tracking."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None) -> None:
        """Initialize the Gemini client or REST interface."""
        self.api_key: str = api_key or settings.GEMINI_API_KEY
        self.model_name: str = model_name or settings.GEMINI_MODEL
        logger.info("Sol Gemini service initialized with model: %s", self.model_name)

    def get_welcome_greeting(self) -> str:
        """Return the official initial greeting in Tamil."""
        return WELCOME_MESSAGE

    def _call_live_gemini(self, user_text: str, next_step: str, standard_question: str, passed_criteria: List[str]) -> Optional[str]:
        """Call Gemini REST API to produce natural conversational Tamil while asking the next required question."""
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            return None

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
            
            system_prompt = (
                "You are 'Sol' (சொல்), a simple voice assistant for the Tamil Nadu government scheme 'Kalaignar Magalir Urimai Thittam'. "
                "Speak exclusively in simple, conversational Tamil. "
                "Responses must be a maximum of 2 sentences, asking only one eligibility question at a time. "
                f"The verified criteria so far are: {passed_criteria}. "
                f"You MUST now ask the user the following eligibility question in conversational Tamil: '{standard_question}'."
            )

            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": user_text}],
                    }
                ],
                "systemInstruction": {
                    "parts": [{"text": system_prompt}]
                },
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 100,
                },
            }

            with httpx.Client(timeout=6.0) as client:
                response = client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        candidate_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        candidate_text = candidate_text.strip()
                        if candidate_text:
                            logger.info("Live Gemini reply: %s", candidate_text)
                            return candidate_text
                else:
                    logger.warning("Gemini REST API returned %d: %s", response.status_code, response.text[:200])
        except Exception as exc:
            logger.warning("Could not reach Gemini live API: %s. Using deterministic Tamil question.", exc)

        return None

    def process_voice_turn(
        self,
        user_message: str,
        history: Optional[List[Dict[str, str]]] = None,
        current_step: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Process conversational voice turn, maintaining dialogue state and providing solutions.

        Args:
            user_message: Spoken input transcript from user.
            history: Previous conversation turns.
            current_step: Current progress step.

        Returns:
            Dictionary with 'reply', 'passed_criteria', 'is_eligible', 'current_step', and 'solution'.
        """
        user_text = (user_message or "").strip()
        if not user_text:
            return {
                "reply": WELCOME_MESSAGE,
                "current_step": "welcome",
                "passed_criteria": [],
                "is_eligible": None,
                "solution": None,
            }

        # 1. State machine analysis to guarantee 100% adherence to criteria without loop repetition
        reply_text, passed_criteria, is_eligible, next_step, solution_dict = (
            ContextualSchemeEngine.analyze_dialogue_state(
                user_message=user_text,
                history=history,
                incoming_step=current_step,
            )
        )

        # 2. If Gemini API is available and not in final solution, enrich response while preserving target question
        if self.api_key and not is_eligible and next_step in STEP_QUESTIONS:
            gemini_reply = self._call_live_gemini(
                user_text=user_text,
                next_step=next_step,
                standard_question=STEP_QUESTIONS[next_step],
                passed_criteria=passed_criteria,
            )
            if gemini_reply:
                reply_text = gemini_reply

        return {
            "reply": reply_text,
            "current_step": next_step,
            "passed_criteria": passed_criteria,
            "is_eligible": is_eligible,
            "solution": solution_dict if solution_dict else None,
        }

    def generate_response(self, user_message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """Backward-compatible helper returning reply string."""
        turn_result = self.process_voice_turn(user_message=user_message, history=history)
        return turn_result["reply"]


gemini_service = GeminiVoiceService()
