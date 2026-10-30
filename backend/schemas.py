"""Pydantic schemas and API contracts for DisruptionIQ.

Provides strict data validation for input payloads and structured output serialization.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from backend.models import (
    UserRole,
    DisruptionSeverity,
    DisruptionStatus,
    RecoveryPlanStatus,
    StrategyType,
    ProductCriticality,
    OrderPriority,
)


# ---------------------------------------------------------
# Auth Schemas
# ---------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    company_id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}


class CompanyResponse(BaseModel):
    id: int
    name: str
    code: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    company: CompanyResponse


# ---------------------------------------------------------
# Supply Chain Entities
# ---------------------------------------------------------

class SupplierResponse(BaseModel):
    id: int
    company_id: int
    name: str
    code: str
    contact_email: Optional[str] = None
    location: str
    reliability_score: float
    lead_time_days: int
    is_alternative_backup: bool
    expedite_premium_rate: float

    model_config = {"from_attributes": True}


class WarehouseResponse(BaseModel):
    id: int
    company_id: int
    name: str
    code: str
    location: str
    capacity_pallets: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    id: int
    company_id: int
    sku: str
    name: str
    category: str
    criticality: ProductCriticality
    unit_cost: float
    selling_price: float
    shelf_life_days: Optional[int] = None
    min_remaining_shelf_life_days: int
    handling_restrictions: Optional[str] = None

    model_config = {"from_attributes": True}


class InventoryResponse(BaseModel):
    id: int
    company_id: int
    warehouse_id: int
    warehouse_name: Optional[str] = None
    warehouse_code: Optional[str] = None
    product_id: int
    product_sku: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: str
    physical_quantity: int
    reserved_quantity: int
    damaged_quantity: int
    expired_quantity: int
    safety_stock: int
    usable_quantity: int
    expiry_date: Optional[datetime] = None
    unit_cost: Optional[float] = None
    total_value: Optional[float] = None

    model_config = {"from_attributes": True}


class ShipmentResponse(BaseModel):
    id: int
    company_id: int
    tracking_number: str
    carrier: str
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    destination_warehouse_id: int
    destination_warehouse_code: Optional[str] = None
    origin_location: str
    departure_date: Optional[datetime] = None
    scheduled_eta: datetime
    actual_eta: Optional[datetime] = None
    status: str
    delay_hours: float
    delay_reason: Optional[str] = None
    product_sku: Optional[str] = None
    quantity: int

    model_config = {"from_attributes": True}


class OrderLineResponse(BaseModel):
    id: int
    product_id: int
    product_sku: Optional[str] = None
    product_name: Optional[str] = None
    quantity: int
    fulfilled_quantity: int
    allocated_warehouse_id: Optional[int] = None

    model_config = {"from_attributes": True}


class CustomerOrderResponse(BaseModel):
    id: int
    company_id: int
    order_number: str
    customer_name: str
    customer_tier: str
    order_date: datetime
    promised_delivery_date: datetime
    destination_city: str
    priority: OrderPriority
    status: str
    risk_score: float
    risk_reasons: Optional[List[str]] = None
    total_value: float
    order_lines: List[OrderLineResponse] = []

    model_config = {"from_attributes": True}


# ---------------------------------------------------------
# Disruptions & Recovery Plans
# ---------------------------------------------------------

class DisruptionResponse(BaseModel):
    id: int
    company_id: int
    code: str
    title: str
    disruption_type: str
    severity: DisruptionSeverity
    status: DisruptionStatus
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    shipment_id: Optional[int] = None
    shipment_tracking: Optional[str] = None
    warehouse_id: Optional[int] = None
    warehouse_code: Optional[str] = None
    product_id: Optional[int] = None
    product_sku: Optional[str] = None
    detected_at: datetime
    estimated_delay_hours: float
    details: Optional[str] = None
    source_type: str
    affected_orders_count: int = 0
    recovery_plans_count: int = 0

    model_config = {"from_attributes": True}


class RecoveryActionResponse(BaseModel):
    id: int
    action_type: str
    source_warehouse_id: Optional[int] = None
    target_warehouse_id: Optional[int] = None
    product_id: int
    quantity: int
    alternative_supplier_id: Optional[int] = None
    estimated_cost: float
    execution_status: str

    model_config = {"from_attributes": True}


class ApprovalResponse(BaseModel):
    id: int
    recovery_plan_id: int
    approver_id: int
    approver_name: Optional[str] = None
    decision: str
    decision_notes: Optional[str] = None
    decided_at: datetime

    model_config = {"from_attributes": True}


class RecoveryPlanResponse(BaseModel):
    id: int
    company_id: int
    disruption_id: int
    disruption_code: Optional[str] = None
    disruption_title: Optional[str] = None
    title: str
    strategy_type: StrategyType
    status: RecoveryPlanStatus
    estimated_cost: float
    estimated_time_hours: float
    orders_protected_count: int
    residual_risk_score: float
    uncomfortable_truth: Optional[str] = None
    evidence_data: Optional[Dict[str, Any]] = None
    is_feasible: bool
    infeasibility_reasons: Optional[str] = None
    created_by_id: int
    creator_name: Optional[str] = None
    created_at: datetime
    actions: List[RecoveryActionResponse] = []
    approvals: List[ApprovalResponse] = []

    @field_validator("evidence_data", mode="before")
    def parse_evidence_json(cls, v):
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except Exception:
                return {"raw": v}
        return v

    model_config = {"from_attributes": True}


class RecoveryPlanCreate(BaseModel):
    disruption_id: int
    title: str
    strategy_type: StrategyType
    estimated_cost: float
    estimated_time_hours: float
    orders_protected_count: int = 0
    residual_risk_score: float = 0.0
    uncomfortable_truth: Optional[str] = None
    evidence_data: Optional[Dict[str, Any]] = None
    actions: List[Dict[str, Any]] = []


class ApprovalRequest(BaseModel):
    decision: str = Field(..., description="APPROVED or REJECTED or MODIFICATION_REQUESTED")
    decision_notes: Optional[str] = None


class SimulateExecutionRequest(BaseModel):
    force_revalidation: bool = True
    notes: Optional[str] = None


class RecoveryOutcomeResponse(BaseModel):
    id: int
    recovery_plan_id: int
    plan_title: Optional[str] = None
    strategy_type: Optional[str] = None
    success_level: str
    actual_cost: float
    actual_time_hours: float
    orders_protected: int
    delivery_commitments_missed: int
    notes: Optional[str] = None
    evaluated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------
# Webhook, Field Incident & Audit
# ---------------------------------------------------------

class CarrierWebhookPayload(BaseModel):
    tracking_number: str
    carrier: str
    event_code: str  # DELAY, EXCEPTION, PORT_CONGESTION, TEMPERATURE_EXCURSION
    delay_hours: float
    reason: str
    location: str
    timestamp: Optional[datetime] = None


class IncidentEventCreate(BaseModel):
    client_event_id: str
    report_type: str
    description: str
    warehouse_id: Optional[int] = None
    product_id: Optional[int] = None
    quantity: int = 0
    severity: DisruptionSeverity = DisruptionSeverity.MEDIUM


class IncidentEventResponse(BaseModel):
    id: int
    client_event_id: str
    report_type: str
    description: str
    warehouse_id: Optional[int] = None
    product_id: Optional[int] = None
    quantity: int
    severity: DisruptionSeverity
    sync_status: str
    reported_by_id: Optional[int] = None
    reported_at: datetime

    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    severity: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_name: str
    action: str
    target_type: str
    target_id: Optional[str] = None
    details_json: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------
# Dashboard & Intelligence
# ---------------------------------------------------------

class DashboardSummaryResponse(BaseModel):
    active_disruptions_count: int
    critical_disruptions_count: int
    orders_at_risk_count: int
    financial_exposure: float
    pending_approvals_count: int
    recoveries_completed_count: int
    recoveries_failed_count: int
    active_reservations_count: int
    recent_events: List[NotificationResponse] = []


class AiBriefingResponse(BaseModel):
    summary: str
    key_bottleneck: str
    recommended_action: str
    tradeoff_analysis: str
    uncomfortable_truth: str
    is_ai_generated: bool
