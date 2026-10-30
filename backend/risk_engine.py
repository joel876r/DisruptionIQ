"""Deterministic and explainable Risk Ranking Engine for DisruptionIQ.

Calculates normalized risk scores [0.0 - 100.0] based exclusively on deterministic supply chain rules:
1. Delivery deadline urgency
2. Upstream shipment delays
3. Local usable inventory shortfall
4. Order priority and tier penalty exposure
5. Product criticality (e.g. Essential Medical vs Ordinary)
6. Expiry and minimum shelf-life violations

Never delegates authoritative calculation to an opaque LLM.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from backend.models import (
    CustomerOrder,
    OrderPriority,
    ProductCriticality,
    Inventory,
    Shipment,
    Disruption,
)


def evaluate_order_risk(order: CustomerOrder, db: Session) -> Tuple[float, List[str]]:
    """Deterministically calculate risk score and explainable reasons for a customer order."""
    now = datetime.utcnow()
    factors = []
    total_score = 0.0

    # 1. Delivery Deadline Urgency (Weight: up to 35 pts)
    hours_to_promise = (order.promised_delivery_date - now).total_seconds() / 3600.0
    if hours_to_promise <= 0:
        total_score += 35.0
        factors.append(f"DELIVERY OVERDUE: Promised window lapsed by {abs(hours_to_promise):.1f} hours (+35.0 pts)")
    elif hours_to_promise < 24:
        total_score += 30.0
        factors.append(f"URGENT DEADLINE: Due in only {hours_to_promise:.1f} hours (< 24h window) (+30.0 pts)")
    elif hours_to_promise < 48:
        total_score += 20.0
        factors.append(f"NEAR-TERM DEADLINE: Due in {hours_to_promise:.1f} hours (< 48h window) (+20.0 pts)")
    elif hours_to_promise < 72:
        total_score += 10.0
        factors.append(f"APPROACHING DEADLINE: Due in {hours_to_promise:.1f} hours (< 72h window) (+10.0 pts)")
    else:
        factors.append(f"STANDARD TIMELINE: Due in {hours_to_promise:.1f} hours (+0 pts)")

    # 2. Order Priority & Customer Tier (Weight: up to 15 pts)
    if order.priority == OrderPriority.CRITICAL:
        total_score += 15.0
        factors.append("CRITICAL ORDER: Executive priority contract with immediate escalation (+15.0 pts)")
    elif order.priority == OrderPriority.PRIORITY:
        total_score += 10.0
        factors.append("PRIORITY ORDER: Tier-1 expedited customer commitment (+10.0 pts)")
    else:
        total_score += 3.0
        factors.append("STANDARD ORDER: Normal fulfillment SLA (+3.0 pts)")

    if order.customer_tier == "VIP":
        total_score += 5.0
        factors.append("VIP CUSTOMER: Contractual late-delivery penalty clause active (+5.0 pts)")

    # 3. Product Criticality & Usable Stock Shortfall (Weight: up to 35 pts)
    for line in order.order_lines:
        prod = line.product
        if not prod:
            continue

        if prod.criticality == ProductCriticality.ESSENTIAL_MEDICAL:
            total_score += 15.0
            factors.append(f"ESSENTIAL MEDICAL PRODUCT: SKU '{prod.sku}' requires continuous cold-chain compliance (+15.0 pts)")
        elif prod.criticality == ProductCriticality.HIGH_VALUE:
            total_score += 10.0
            factors.append(f"HIGH VALUE PRODUCT: SKU '{prod.sku}' assembly line dependency (+10.0 pts)")

        # Check local usable stock at allocated warehouse
        if line.allocated_warehouse_id:
            inv = db.query(Inventory).filter(
                Inventory.company_id == order.company_id,
                Inventory.warehouse_id == line.allocated_warehouse_id,
                Inventory.product_id == prod.id,
            ).first()

            usable = inv.usable_quantity if inv else 0
            shortfall = line.quantity - line.fulfilled_quantity - usable

            if shortfall > 0:
                shortage_pts = 20.0
                total_score += shortage_pts
                factors.append(
                    f"LOCAL STOCK DEFICIT: Warehouse requires {line.quantity} units of '{prod.sku}', "
                    f"only {usable} usable units available (shortfall: {shortfall}) (+{shortage_pts:.0f} pts)"
                )
            else:
                factors.append(f"STOCK AVAILABLE: {usable} usable units on hand for required {line.quantity}")

            # Check Shelf-Life / Expiry risk
            if inv and inv.expiry_date:
                days_left = (inv.expiry_date - now).days
                if days_left < prod.min_remaining_shelf_life_days:
                    total_score += 10.0
                    factors.append(
                        f"EXPIRY CONSTRAINT: Batch expires in {days_left} days (minimum required: "
                        f"{prod.min_remaining_shelf_life_days} days). Stock cannot be safely dispensed! (+10.0 pts)"
                    )

    # 4. Upstream Active Disruptions (Weight: up to 20 pts)
    active_disruptions = db.query(Disruption).filter(
        Disruption.company_id == order.company_id,
        Disruption.status.in_(["DETECTED", "INVESTIGATING", "RECOVERY_PROPOSED"]),
    ).all()

    for d in active_disruptions:
        for line in order.order_lines:
            if d.product_id == line.product_id or d.warehouse_id == line.allocated_warehouse_id:
                delay_impact = min(20.0, (d.estimated_delay_hours / 48.0) * 15.0)
                total_score += delay_impact
                factors.append(
                    f"UPSTREAM DISRUPTION '{d.code}': Inbound delay of {d.estimated_delay_hours:.1f}h "
                    f"directly impacts order SKU '{line.product.sku}' (+{delay_impact:.1f} pts)"
                )
                break

    normalized_score = round(min(100.0, max(0.0, total_score)), 1)
    return normalized_score, factors


def classify_risk_level(score: float) -> str:
    """Classify risk level based on normalized score."""
    if score >= 80.0:
        return "CRITICAL"
    if score >= 60.0:
        return "HIGH"
    if score >= 35.0:
        return "MEDIUM"
    return "LOW"
