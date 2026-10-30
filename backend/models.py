"""SQLAlchemy relational models for DisruptionIQ multi-company supply chain recovery platform.

Implements strict company (tenant) isolation, role enforcement, product shelf-life constraints,
usable stock calculation, and comprehensive audit and recovery ledgers.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Enum,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class UserRole(str, enum.Enum):
    OPERATIONS_ANALYST = "Operations Analyst"
    SUPPLY_CHAIN_MANAGER = "Supply Chain Manager"
    WAREHOUSE_OPERATOR = "Warehouse Operator"
    PROCUREMENT_APPROVER = "Procurement Approver"
    ADMINISTRATOR = "Administrator"


class DisruptionSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DisruptionStatus(str, enum.Enum):
    DETECTED = "DETECTED"
    INVESTIGATING = "INVESTIGATING"
    RECOVERY_PROPOSED = "RECOVERY_PROPOSED"
    RECOVERING = "RECOVERING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class RecoveryPlanStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVALIDATED = "REVALIDATED"
    SIMULATED_EXECUTION = "SIMULATED_EXECUTION"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    STALE = "STALE"


class StrategyType(str, enum.Enum):
    DO_NOTHING = "DO_NOTHING"
    STOCK_TRANSFER = "STOCK_TRANSFER"
    EXPEDITE_FREIGHT = "EXPEDITE_FREIGHT"
    ALTERNATIVE_SUPPLIER = "ALTERNATIVE_SUPPLIER"
    SPLIT_FULFILLMENT = "SPLIT_FULFILLMENT"


class ProductCriticality(str, enum.Enum):
    ORDINARY = "ORDINARY"
    HIGH_VALUE = "HIGH_VALUE"
    ESSENTIAL_MEDICAL = "ESSENTIAL_MEDICAL"
    TIME_CRITICAL = "TIME_CRITICAL"


class OrderPriority(str, enum.Enum):
    STANDARD = "STANDARD"
    PRIORITY = "PRIORITY"
    CRITICAL = "CRITICAL"


# ---------------------------------------------------------
# Core Tenant & Auth Models
# ---------------------------------------------------------

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    code = Column(String(30), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    suppliers = relationship("Supplier", back_populates="company", cascade="all, delete-orphan")
    warehouses = relationship("Warehouse", back_populates="company", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.OPERATIONS_ANALYST)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="users")
    created_plans = relationship("RecoveryPlan", back_populates="creator", foreign_keys="RecoveryPlan.created_by_id")
    approvals = relationship("Approval", back_populates="approver", foreign_keys="Approval.approver_id")


# ---------------------------------------------------------
# Supply Chain Entities
# ---------------------------------------------------------

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False)
    contact_email = Column(String(150), nullable=True)
    location = Column(String(150), nullable=False)
    reliability_score = Column(Float, default=0.95, nullable=False)  # 0.0 - 1.0
    lead_time_days = Column(Integer, default=5, nullable=False)
    is_alternative_backup = Column(Boolean, default=False, nullable=False)
    expedite_premium_rate = Column(Float, default=1.35, nullable=False)  # multiplier for express

    company = relationship("Company", back_populates="suppliers")
    shipments = relationship("Shipment", back_populates="supplier")

    __table_args__ = (
        UniqueConstraint("company_id", "code", name="uq_company_supplier_code"),
    )


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False)
    location = Column(String(150), nullable=False)
    capacity_pallets = Column(Integer, default=10000, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    company = relationship("Company", back_populates="warehouses")
    inventories = relationship("Inventory", back_populates="warehouse", cascade="all, delete-orphan")
    incoming_shipments = relationship("Shipment", back_populates="destination_warehouse")

    __table_args__ = (
        UniqueConstraint("company_id", "code", name="uq_company_warehouse_code"),
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    sku = Column(String(50), nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    criticality = Column(Enum(ProductCriticality), default=ProductCriticality.ORDINARY, nullable=False)
    unit_cost = Column(Float, default=10.0, nullable=False)
    selling_price = Column(Float, default=20.0, nullable=False)

    # Expiry & Life constraints
    shelf_life_days = Column(Integer, nullable=True)
    min_remaining_shelf_life_days = Column(Integer, default=30, nullable=False)
    handling_restrictions = Column(String(255), nullable=True)  # e.g. "Cold Chain 2-8C", "Hazardous"

    company = relationship("Company", back_populates="products")
    inventories = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")
    order_lines = relationship("OrderLine", back_populates="product")

    __table_args__ = (
        UniqueConstraint("company_id", "sku", name="uq_company_product_sku"),
    )


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    tracking_number = Column(String(80), nullable=False, index=True)
    carrier = Column(String(100), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True)
    destination_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    origin_location = Column(String(150), nullable=False)
    departure_date = Column(DateTime, nullable=True)
    scheduled_eta = Column(DateTime, nullable=False)
    actual_eta = Column(DateTime, nullable=True)
    status = Column(String(50), default="IN_TRANSIT", nullable=False)  # IN_TRANSIT, DELAYED, DELIVERED, EXCEPTION
    delay_hours = Column(Float, default=0.0, nullable=False)
    delay_reason = Column(String(255), nullable=True)
    product_sku = Column(String(50), nullable=True)
    quantity = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    supplier = relationship("Supplier", back_populates="shipments")
    destination_warehouse = relationship("Warehouse", back_populates="incoming_shipments")

    __table_args__ = (
        UniqueConstraint("company_id", "tracking_number", name="uq_company_shipment_tracking"),
    )


class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_number = Column(String(80), default="BATCH-MAIN", nullable=False)

    physical_quantity = Column(Integer, default=0, nullable=False)
    reserved_quantity = Column(Integer, default=0, nullable=False)
    damaged_quantity = Column(Integer, default=0, nullable=False)
    expired_quantity = Column(Integer, default=0, nullable=False)
    safety_stock = Column(Integer, default=0, nullable=False)

    manufacturing_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    warehouse = relationship("Warehouse", back_populates="inventories")
    product = relationship("Product", back_populates="inventories")

    __table_args__ = (
        UniqueConstraint("company_id", "warehouse_id", "product_id", "batch_number", name="uq_company_wh_prod_batch"),
    )

    @property
    def usable_quantity(self) -> int:
        """Usable quantity calculated deterministically:
        physical - reserved - damaged - expired.
        Ensures stock is not treated as usable if damaged, expired or already committed.
        """
        usable = self.physical_quantity - self.reserved_quantity - self.damaged_quantity - self.expired_quantity
        return max(0, usable)


class CustomerOrder(Base):
    __tablename__ = "customer_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(String(80), nullable=False, index=True)
    customer_name = Column(String(150), nullable=False)
    customer_tier = Column(String(50), default="TIER_1", nullable=False)  # TIER_1, TIER_2, VIP
    order_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    promised_delivery_date = Column(DateTime, nullable=False, index=True)
    destination_city = Column(String(100), nullable=False)
    priority = Column(Enum(OrderPriority), default=OrderPriority.STANDARD, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, AT_RISK, FULFILLED, DELAYED, CANCELLED
    risk_score = Column(Float, default=0.0, nullable=False)
    risk_reasons = Column(Text, nullable=True)  # JSON string of explainable factors
    total_value = Column(Float, default=0.0, nullable=False)

    order_lines = relationship("OrderLine", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("company_id", "order_number", name="uq_company_order_number"),
    )


class OrderLine(Base):
    __tablename__ = "order_lines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("customer_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    fulfilled_quantity = Column(Integer, default=0, nullable=False)
    allocated_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)

    order = relationship("CustomerOrder", back_populates="order_lines")
    product = relationship("Product", back_populates="order_lines")


# ---------------------------------------------------------
# Disruptions, Recovery Plans, Firewall & Outcomes
# ---------------------------------------------------------

class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(80), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    disruption_type = Column(String(80), nullable=False)  # LATE_SHIPMENT, SUPPLIER_HALT, STOCKOUT, PORT_CONGESTION
    severity = Column(Enum(DisruptionSeverity), default=DisruptionSeverity.MEDIUM, nullable=False)
    status = Column(Enum(DisruptionStatus), default=DisruptionStatus.DETECTED, nullable=False)

    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id", ondelete="SET NULL"), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)

    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    estimated_delay_hours = Column(Float, default=24.0, nullable=False)
    details = Column(Text, nullable=True)
    source_type = Column(String(50), default="CARRIER_WEBHOOK", nullable=False)  # CARRIER_WEBHOOK, CSV_IMPORT, FIELD_REPORT

    supplier = relationship("Supplier")
    shipment = relationship("Shipment")
    warehouse = relationship("Warehouse")
    product = relationship("Product")
    recovery_plans = relationship("RecoveryPlan", back_populates="disruption", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("company_id", "code", name="uq_company_disruption_code"),
    )


class RecoveryPlan(Base):
    __tablename__ = "recovery_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    disruption_id = Column(Integer, ForeignKey("disruptions.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    strategy_type = Column(Enum(StrategyType), default=StrategyType.STOCK_TRANSFER, nullable=False)
    status = Column(Enum(RecoveryPlanStatus), default=RecoveryPlanStatus.DRAFT, nullable=False)

    estimated_cost = Column(Float, default=0.0, nullable=False)
    estimated_time_hours = Column(Float, default=0.0, nullable=False)
    orders_protected_count = Column(Integer, default=0, nullable=False)
    residual_risk_score = Column(Float, default=0.0, nullable=False)

    uncomfortable_truth = Column(Text, nullable=True)  # Explains unfulfilled demand, missing days/stock
    evidence_data = Column(Text, nullable=True)  # Structured JSON ledger of assumptions, calculations
    is_feasible = Column(Boolean, default=True, nullable=False)
    infeasibility_reasons = Column(Text, nullable=True)

    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    disruption = relationship("Disruption", back_populates="recovery_plans")
    creator = relationship("User", back_populates="created_plans", foreign_keys=[created_by_id])
    actions = relationship("RecoveryAction", back_populates="recovery_plan", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="recovery_plan", cascade="all, delete-orphan")
    outcome = relationship("RecoveryOutcome", back_populates="recovery_plan", uselist=False, cascade="all, delete-orphan")


class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    recovery_plan_id = Column(Integer, ForeignKey("recovery_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False)  # TRANSFER_STOCK, EXPEDITE_ORDER, SOURCE_ALTERNATIVE, SPLIT_SHIPMENT

    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    target_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    alternative_supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True)
    estimated_cost = Column(Float, default=0.0, nullable=False)
    execution_status = Column(String(50), default="PENDING", nullable=False)  # PENDING, SIMULATED, FAILED

    recovery_plan = relationship("RecoveryPlan", back_populates="actions")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    recovery_plan_id = Column(Integer, ForeignKey("recovery_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    approver_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    decision = Column(String(30), nullable=False)  # APPROVED, REJECTED, MODIFICATION_REQUESTED
    decision_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    recovery_plan = relationship("RecoveryPlan", back_populates="approvals")
    approver = relationship("User", back_populates="approvals", foreign_keys=[approver_id])


class RecoveryOutcome(Base):
    __tablename__ = "recovery_outcomes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    recovery_plan_id = Column(Integer, ForeignKey("recovery_plans.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    success_level = Column(String(30), nullable=False)  # SUCCESS, PARTIAL_SUCCESS, FAILED
    actual_cost = Column(Float, default=0.0, nullable=False)
    actual_time_hours = Column(Float, default=0.0, nullable=False)
    orders_protected = Column(Integer, default=0, nullable=False)
    delivery_commitments_missed = Column(Integer, default=0, nullable=False)
    notes = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    recovery_plan = relationship("RecoveryPlan", back_populates="outcome")


# ---------------------------------------------------------
# Shared Reservation Ledger (Firewall) & Field Incidents
# ---------------------------------------------------------

class InventoryReservation(Base):
    """Shared reservation ledger across disruptions to prevent double allocation."""
    __tablename__ = "inventory_reservations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    recovery_plan_id = Column(Integer, ForeignKey("recovery_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String(30), default="ACTIVE", nullable=False)  # ACTIVE, RELEASED, COMMITTED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class IncidentEvent(Base):
    """Offline and online field incident reports."""
    __tablename__ = "incident_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    client_event_id = Column(String(100), nullable=False, index=True)  # Idempotency token from IndexedDB
    report_type = Column(String(80), nullable=False)  # STOCK_SHORTAGE, DAMAGED_GOODS, CARRIER_DELAY, URGENT_REQUEST
    description = Column(Text, nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=0, nullable=False)
    severity = Column(Enum(DisruptionSeverity), default=DisruptionSeverity.MEDIUM, nullable=False)
    sync_status = Column(String(30), default="SYNCED", nullable=False)  # SYNCED, RECONCILED, FAILED
    reported_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reported_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("company_id", "client_event_id", name="uq_company_client_event"),
    )


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # DISRUPTION, HIGH_RISK_ORDER, APPROVAL_PENDING, OUTCOME
    severity = Column(String(30), default="INFO", nullable=False)  # INFO, WARNING, CRITICAL, SUCCESS
    is_read = Column(Boolean, default=False, nullable=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_name = Column(String(150), nullable=False)
    action = Column(String(100), nullable=False)  # LOGIN, IMPORT_DATA, CREATE_PLAN, APPROVE_PLAN, REJECT_PLAN, SIMULATE_EXECUTION
    target_type = Column(String(80), nullable=False)  # RecoveryPlan, Disruption, Inventory, Webhook
    target_id = Column(String(80), nullable=True)
    details_json = Column(Text, nullable=True)  # Snapshot of before/after
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
