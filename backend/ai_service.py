"""AI-Assisted Operational Briefing and Decision Support for DisruptionIQ.

Uses official Google GenAI SDK to generate concise, executive-level summaries of
deterministic engine calculations. Seamlessly falls back to deterministic rule-based
briefings if the API key is missing or the external service is unreachable.
"""

from __future__ import annotations

import os
import json
import logging
from typing import Dict, Any, Optional
from backend.models import Disruption, RecoveryPlan

logger = logging.getLogger("disruptioniq.ai")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")


class AiBriefingService:
    """Generates natural language summaries of deterministic recovery data."""

    @staticmethod
    def generate_briefing(
        disruption: Disruption,
        plans: list[RecoveryPlan],
        affected_orders_count: int,
        financial_exposure: float,
    ) -> Dict[str, Any]:
        """Synthesize operational briefing with AI or deterministic fallback."""
        best_plan = next((p for p in plans if p.is_feasible and p.strategy_type.value != "DO_NOTHING"), None)
        recommended_action = best_plan.title if best_plan else "Review manual sourcing options"
        uncomfortable_msg = best_plan.uncomfortable_truth if best_plan and best_plan.uncomfortable_truth else "No critical inventory deficits detected."

        fallback_briefing = {
            "summary": (
                f"Disruption {disruption.code} ('{disruption.title}') has introduced a {disruption.estimated_delay_hours:.1f}h "
                f"upstream delay affecting {affected_orders_count} customer orders with an estimated exposure of ₹{financial_exposure:,.2f}."
            ),
            "key_bottleneck": (
                f"Inbound transit delay on shipment {disruption.shipment.tracking_number if disruption.shipment else 'N/A'} "
                f"exceeds local safety buffer at destination warehouse."
            ),
            "recommended_action": recommended_action,
            "tradeoff_analysis": (
                f"Evaluating {len(plans)} strategic options in the Recovery Arena: "
                + "; ".join(f"{p.strategy_type.value} (Est. Cost: ₹{p.estimated_cost:,.0f}, Orders Protected: {p.orders_protected_count})" for p in plans)
            ),
            "uncomfortable_truth": uncomfortable_msg,
            "is_ai_generated": False,
        }

        if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("your_"):
            return fallback_briefing

        # Attempt Google GenAI call with deterministic prompt grounding
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)

            system_instruction = (
                "You are DisruptionIQ's Logistics AI Co-Pilot. "
                "Analyze the provided deterministic supply chain data and produce a concise 3-sentence operational briefing. "
                "You MUST NOT invent inventory numbers, prices, or dates. Rely strictly on provided inputs. "
                "Output pure valid JSON with keys: summary, key_bottleneck, recommended_action, tradeoff_analysis, uncomfortable_truth."
            )

            context_payload = {
                "disruption_code": disruption.code,
                "disruption_title": disruption.title,
                "delay_hours": disruption.estimated_delay_hours,
                "affected_orders_count": affected_orders_count,
                "financial_exposure": financial_exposure,
                "candidate_plans": [
                    {
                        "strategy": p.strategy_type.value,
                        "cost": p.estimated_cost,
                        "hours": p.estimated_time_hours,
                        "protected_orders": p.orders_protected_count,
                        "uncomfortable_truth": p.uncomfortable_truth,
                    }
                    for p in plans
                ],
            }

            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=[
                    system_instruction,
                    f"DATA:\n{json.dumps(context_payload)}",
                ],
            )

            if response and response.text:
                cleaned = response.text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned.removeprefix("```json").removesuffix("```").strip()
                elif cleaned.startswith("```"):
                    cleaned = cleaned.removeprefix("```").removesuffix("```").strip()

                data = json.loads(cleaned)
                data["is_ai_generated"] = True
                return data

        except Exception as e:
            logger.warning(f"AI briefing generation failed, falling back to deterministic template: {e}")

        return fallback_briefing
