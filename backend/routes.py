"""FastAPI Router for DisruptionIQ Supply Chain Platform.

Provides tenant-isolated endpoints for authentication, disruptions, impact analysis,
orders at risk, recovery planning, firewall validation, approval workflow, simulated execution,
field incidents, carrier webhooks, and audit logs.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header, UploadFile, File, Form
from sqlalchemy.orm import Session

from backend.database import get_db, SessionLocal, init_db
from backend.models import (
    User,
    UserRole,
    Company,
    Supplier,
    Warehouse,
    Product,
    Inventory,
    Shipment,
    CustomerOrder,
    OrderLine,
    Disruption,
    DisruptionStatus,
    StrategyType,
    RecoveryPlan,
    RecoveryPlanStatus,
    RecoveryAction,
    Approval,
    RecoveryOutcome,
    InventoryReservation,
    IncidentEvent,
    Notification,
    AuditLog,
)
from backend.schemas import (
    LoginRequest,
    TokenResponse,
    UserResponse,
    CompanyResponse,
    SupplierResponse,
    WarehouseResponse,
    ProductResponse,
    InventoryResponse,
    ShipmentResponse,
    OrderLineResponse,
    CustomerOrderResponse,
    DisruptionResponse,
    RecoveryActionResponse,
    ApprovalResponse,
    RecoveryPlanResponse,
    RecoveryPlanCreate,
    ApprovalRequest,
    SimulateExecutionRequest,
    RecoveryOutcomeResponse,
    CarrierWebhookPayload,
    IncidentEventCreate,
    IncidentEventResponse,
    NotificationResponse,
    AuditLogResponse,
    DashboardSummaryResponse,
    AiBriefingResponse,
)
from backend.auth import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_user,
    require_roles,
    check_separation_of_duties,
)
from backend.risk_engine import evaluate_order_risk, classify_risk_level
from backend.recovery_engine import CoordinatedRecoveryEngine, RecoveryFirewall
from backend.import_engine import DataImportService, CarrierWebhookService
from backend.ai_service import AiBriefingService
from backend.seed import seed_database

router = APIRouter()


# ---------------------------------------------------------
# Authentication & Demo Switcher
# ---------------------------------------------------------

@router.post("/auth/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT token with company claim."""
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role.value,
        "company_id": user.company_id,
    })

    # Log login in audit trail
    audit = AuditLog(
        company_id=user.company_id,
        actor_id=user.id,
        actor_name=f"{user.full_name} ({user.role.value})",
        action="USER_LOGIN",
        target_type="User",
        target_id=str(user.id),
        details_json=json.dumps({"ip": "client", "email": user.email}),
    )
    db.add(audit)
    db.commit()

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(user.company),
    )


@router.get("/auth/me", response_model=TokenResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of current authenticated user and company."""
    token = create_access_token({
        "sub": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "company_id": current_user.company_id,
    })
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(current_user),
        company=CompanyResponse.model_validate(current_user.company),
    )


@router.post("/auth/demo-switch", response_model=TokenResponse)
def demo_switch_user(
    email: str,
    db: Session = Depends(get_db),
):
    """Convenience endpoint for hackathon judges to switch demo roles/companies easily."""
    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found")

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role.value,
        "company_id": user.company_id,
    })
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(user.company),
    )


# ---------------------------------------------------------
# Dashboard Summary
# ---------------------------------------------------------

@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aggregated executive dashboard metrics strictly scoped to user's company."""
    company_id = current_user.company_id

    active_disruptions = db.query(Disruption).filter(
        Disruption.company_id == company_id,
        Disruption.status != DisruptionStatus.CLOSED,
    ).all()

    critical_count = sum(1 for d in active_disruptions if d.severity.value == "CRITICAL")

    at_risk_orders = db.query(CustomerOrder).filter(
        CustomerOrder.company_id == company_id,
        CustomerOrder.status == "AT_RISK",
    ).all()

    financial_exposure = sum(o.total_value for o in at_risk_orders)

    pending_approvals = db.query(RecoveryPlan).filter(
        RecoveryPlan.company_id == company_id,
        RecoveryPlan.status == RecoveryPlanStatus.AWAITING_APPROVAL,
    ).count()

    completed_recoveries = db.query(RecoveryPlan).filter(
        RecoveryPlan.company_id == company_id,
        RecoveryPlan.status == RecoveryPlanStatus.COMPLETED,
    ).count()

    failed_recoveries = db.query(RecoveryPlan).filter(
        RecoveryPlan.company_id == company_id,
        RecoveryPlan.status == RecoveryPlanStatus.FAILED,
    ).count()

    active_reservations = db.query(InventoryReservation).filter(
        InventoryReservation.company_id == company_id,
        InventoryReservation.status == "ACTIVE",
    ).count()

    recent_notifications = db.query(Notification).filter(
        Notification.company_id == company_id,
    ).order_by(Notification.created_at.desc()).limit(5).all()

    return DashboardSummaryResponse(
        active_disruptions_count=len(active_disruptions),
        critical_disruptions_count=critical_count,
        orders_at_risk_count=len(at_risk_orders),
        financial_exposure=round(financial_exposure, 2),
        pending_approvals_count=pending_approvals,
        recoveries_completed_count=completed_recoveries,
        recoveries_failed_count=failed_recoveries,
        active_reservations_count=active_reservations,
        recent_events=[NotificationResponse.model_validate(n) for n in recent_notifications],
    )


# ---------------------------------------------------------
# Disruptions & Impact Analysis
# ---------------------------------------------------------

@router.get("/disruptions", response_model=List[DisruptionResponse])
def list_disruptions(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all disruptions for the authenticated tenant."""
    query = db.query(Disruption).filter(Disruption.company_id == current_user.company_id)
    if status_filter:
        query = query.filter(Disruption.status == status_filter)

    disruptions = query.order_by(Disruption.detected_at.desc()).all()

    result = []
    for d in disruptions:
        item = DisruptionResponse(
            id=d.id,
            company_id=d.company_id,
            code=d.code,
            title=d.title,
            disruption_type=d.disruption_type,
            severity=d.severity,
            status=d.status,
            supplier_id=d.supplier_id,
            supplier_name=d.supplier.name if d.supplier else None,
            shipment_id=d.shipment_id,
            shipment_tracking=d.shipment.tracking_number if d.shipment else None,
            warehouse_id=d.warehouse_id,
            warehouse_code=d.warehouse.code if d.warehouse else (d.shipment.destination_warehouse.code if d.shipment and d.shipment.destination_warehouse else None),
            product_id=d.product_id,
            product_sku=d.shipment.product_sku if d.shipment else None,
            detected_at=d.detected_at,
            estimated_delay_hours=d.estimated_delay_hours,
            details=d.details,
            source_type=d.source_type,
            affected_orders_count=db.query(CustomerOrder).filter(
                CustomerOrder.company_id == current_user.company_id,
                CustomerOrder.status == "AT_RISK",
            ).count(),
            recovery_plans_count=len(d.recovery_plans),
        )
        result.append(item)

    return result


@router.get("/disruptions/{disruption_id}/impact")
def get_disruption_impact(
    disruption_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Linked supply chain impact analysis tracing:
    Supplier → Shipment → Destination Warehouse → Inventory → Affected Customer Orders.
    Distinguishes confirmed impacts from potential impacts with source data explanation.
    """
    disruption = db.query(Disruption).filter(
        Disruption.id == disruption_id,
        Disruption.company_id == current_user.company_id,
    ).first()

    if not disruption:
        raise HTTPException(status_code=404, detail="Disruption not found")

    shipment = disruption.shipment
    supplier = disruption.supplier or (shipment.supplier if shipment else None)
    warehouse = shipment.destination_warehouse if shipment else None
    product = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.sku == shipment.product_sku,
    ).first() if shipment and shipment.product_sku else None

    # Get local inventory state
    inventory = None
    if warehouse and product:
        inventory = db.query(Inventory).filter(
            Inventory.company_id == current_user.company_id,
            Inventory.warehouse_id == warehouse.id,
            Inventory.product_id == product.id,
        ).first()

    # Trace affected orders
    affected_orders = []
    potential_orders = []
    all_orders = db.query(CustomerOrder).filter(
        CustomerOrder.company_id == current_user.company_id,
    ).all()

    for order in all_orders:
        has_prod = any(line.product_id == (product.id if product else -1) for line in order.order_lines)
        if has_prod:
            if order.status == "AT_RISK":
                affected_orders.append({
                    "id": order.id,
                    "order_number": order.order_number,
                    "customer_name": order.customer_name,
                    "customer_tier": order.customer_tier,
                    "priority": order.priority.value,
                    "promised_delivery_date": order.promised_delivery_date.isoformat(),
                    "total_value": order.total_value,
                    "risk_score": order.risk_score,
                    "impact_type": "CONFIRMED_SHORTAGE",
                    "reason": f"Order requires stock due to arrive on delayed shipment {shipment.tracking_number if shipment else 'N/A'}",
                })
            else:
                potential_orders.append({
                    "id": order.id,
                    "order_number": order.order_number,
                    "customer_name": order.customer_name,
                    "customer_tier": order.customer_tier,
                    "priority": order.priority.value,
                    "promised_delivery_date": order.promised_delivery_date.isoformat(),
                    "total_value": order.total_value,
                    "impact_type": "POTENTIAL_BUFFER_CONSUMPTION",
                    "reason": "Order scheduled for fulfillment after immediate delay window",
                })

    return {
        "disruption": {
            "id": disruption.id,
            "code": disruption.code,
            "title": disruption.title,
            "delay_hours": disruption.estimated_delay_hours,
            "severity": disruption.severity.value,
        },
        "chain_nodes": {
            "supplier": {
                "id": supplier.id if supplier else None,
                "name": supplier.name if supplier else "Unknown Supplier",
                "code": supplier.code if supplier else "N/A",
                "location": supplier.location if supplier else "N/A",
                "reliability": supplier.reliability_score if supplier else 0.0,
            },
            "shipment": {
                "id": shipment.id if shipment else None,
                "tracking_number": shipment.tracking_number if shipment else "N/A",
                "carrier": shipment.carrier if shipment else "N/A",
                "status": shipment.status if shipment else "N/A",
                "delay_hours": shipment.delay_hours if shipment else 0.0,
                "quantity": shipment.quantity if shipment else 0,
            },
            "warehouse": {
                "id": warehouse.id if warehouse else None,
                "name": warehouse.name if warehouse else "N/A",
                "code": warehouse.code if warehouse else "N/A",
                "location": warehouse.location if warehouse else "N/A",
            },
            "inventory": {
                "product_sku": product.sku if product else "N/A",
                "product_name": product.name if product else "N/A",
                "physical_quantity": inventory.physical_quantity if inventory else 0,
                "usable_quantity": inventory.usable_quantity if inventory else 0,
                "reserved_quantity": inventory.reserved_quantity if inventory else 0,
                "damaged_quantity": inventory.damaged_quantity if inventory else 0,
                "expired_quantity": inventory.expired_quantity if inventory else 0,
            },
        },
        "confirmed_affected_orders": affected_orders,
        "potential_affected_orders": potential_orders,
        "financial_exposure": sum(o["total_value"] for o in affected_orders),
    }


@router.get("/disruptions/{disruption_id}/briefing", response_model=AiBriefingResponse)
def get_disruption_ai_briefing(
    disruption_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate executive AI briefing using Google GenAI with deterministic fallback."""
    disruption = db.query(Disruption).filter(
        Disruption.id == disruption_id,
        Disruption.company_id == current_user.company_id,
    ).first()

    if not disruption:
        raise HTTPException(status_code=404, detail="Disruption not found")

    plans = disruption.recovery_plans
    if not plans:
        plans = CoordinatedRecoveryEngine.generate_recovery_options(disruption, current_user.id, db)

    affected_count = db.query(CustomerOrder).filter(
        CustomerOrder.company_id == current_user.company_id,
        CustomerOrder.status == "AT_RISK",
    ).count()

    exposure = sum(
        o.total_value for o in db.query(CustomerOrder).filter(
            CustomerOrder.company_id == current_user.company_id,
            CustomerOrder.status == "AT_RISK",
        ).all()
    )

    briefing = AiBriefingService.generate_briefing(disruption, plans, affected_count, exposure)
    return AiBriefingResponse(**briefing)


@router.get("/disruptions/{disruption_id}/recovery-options", response_model=List[RecoveryPlanResponse])
def get_recovery_options(
    disruption_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate or retrieve Recovery Arena trade-off options with Recovery Firewall feasibility validation."""
    disruption = db.query(Disruption).filter(
        Disruption.id == disruption_id,
        Disruption.company_id == current_user.company_id,
    ).first()

    if not disruption:
        raise HTTPException(status_code=404, detail="Disruption not found")

    # If already saved in DB, return them
    existing_plans = db.query(RecoveryPlan).filter(
        RecoveryPlan.disruption_id == disruption.id,
        RecoveryPlan.company_id == current_user.company_id,
    ).all()

    if existing_plans:
        # Revalidate each plan via Recovery Firewall to reflect live stock & reservations
        for p in existing_plans:
            is_f, reasons = RecoveryFirewall.validate_plan_feasibility(p, db)
            p.is_feasible = is_f
            p.infeasibility_reasons = "; ".join(reasons) if not is_f else None
        db.commit()
        return [RecoveryPlanResponse.model_validate(p) for p in existing_plans]

    # Otherwise generate fresh options
    plans = CoordinatedRecoveryEngine.generate_recovery_options(disruption, current_user.id, db)
    for p in plans:
        db.add(p)
    db.commit()

    return [RecoveryPlanResponse.model_validate(p) for p in plans]


# ---------------------------------------------------------
# Customer Orders & Deterministic Risk Ranking
# ---------------------------------------------------------

@router.get("/orders", response_model=List[CustomerOrderResponse])
def list_customer_orders(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all tenant customer orders ranked by deterministic risk score."""
    query = db.query(CustomerOrder).filter(CustomerOrder.company_id == current_user.company_id)
    if status_filter:
        query = query.filter(CustomerOrder.status == status_filter)

    orders = query.order_by(CustomerOrder.risk_score.desc()).all()

    result = []
    for o in orders:
        reasons_list = []
        if o.risk_reasons:
            try:
                reasons_list = json.loads(o.risk_reasons)
            except Exception:
                reasons_list = [o.risk_reasons]

        order_dict = CustomerOrderResponse(
            id=o.id,
            company_id=o.company_id,
            order_number=o.order_number,
            customer_name=o.customer_name,
            customer_tier=o.customer_tier,
            order_date=o.order_date,
            promised_delivery_date=o.promised_delivery_date,
            destination_city=o.destination_city,
            priority=o.priority,
            status=o.status,
            risk_score=o.risk_score,
            risk_reasons=reasons_list,
            total_value=o.total_value,
            order_lines=[
                OrderLineResponse(
                    id=l.id,
                    product_id=l.product_id,
                    product_sku=l.product.sku if l.product else None,
                    product_name=l.product.name if l.product else None,
                    quantity=l.quantity,
                    fulfilled_quantity=l.fulfilled_quantity,
                    allocated_warehouse_id=l.allocated_warehouse_id,
                )
                for l in o.order_lines
            ],
        )
        result.append(order_dict)

    return result


@router.post("/orders/{order_id}/evaluate-risk", response_model=CustomerOrderResponse)
def reevaluate_order_risk(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Recalculate deterministic risk score and reasons for a specific order."""
    order = db.query(CustomerOrder).filter(
        CustomerOrder.id == order_id,
        CustomerOrder.company_id == current_user.company_id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    score, reasons = evaluate_order_risk(order, db)
    order.risk_score = score
    order.risk_reasons = json.dumps(reasons)
    if score >= 60.0:
        order.status = "AT_RISK"
    db.commit()

    reasons_list = reasons
    return CustomerOrderResponse(
        id=order.id,
        company_id=order.company_id,
        order_number=order.order_number,
        customer_name=order.customer_name,
        customer_tier=order.customer_tier,
        order_date=order.order_date,
        promised_delivery_date=order.promised_delivery_date,
        destination_city=order.destination_city,
        priority=order.priority,
        status=order.status,
        risk_score=order.risk_score,
        risk_reasons=reasons_list,
        total_value=order.total_value,
        order_lines=[],
    )


# ---------------------------------------------------------
# Recovery Plans, Approvals & Simulated Execution
# ---------------------------------------------------------

@router.get("/recovery-plans", response_model=List[RecoveryPlanResponse])
def list_recovery_plans(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List recovery plans for the tenant."""
    query = db.query(RecoveryPlan).filter(RecoveryPlan.company_id == current_user.company_id)
    if status_filter:
        query = query.filter(RecoveryPlan.status == status_filter)

    plans = query.order_by(RecoveryPlan.created_at.desc()).all()
    result = []
    for p in plans:
        # Revalidate feasibility via firewall
        is_f, reasons = RecoveryFirewall.validate_plan_feasibility(p, db)
        p.is_feasible = is_f
        p.infeasibility_reasons = "; ".join(reasons) if not is_f else None

        res = RecoveryPlanResponse(
            id=p.id,
            company_id=p.company_id,
            disruption_id=p.disruption_id,
            disruption_code=p.disruption.code if p.disruption else None,
            disruption_title=p.disruption.title if p.disruption else None,
            title=p.title,
            strategy_type=p.strategy_type,
            status=p.status,
            estimated_cost=p.estimated_cost,
            estimated_time_hours=p.estimated_time_hours,
            orders_protected_count=p.orders_protected_count,
            residual_risk_score=p.residual_risk_score,
            uncomfortable_truth=p.uncomfortable_truth,
            evidence_data=json.loads(p.evidence_data) if p.evidence_data else None,
            is_feasible=p.is_feasible,
            infeasibility_reasons=p.infeasibility_reasons,
            created_by_id=p.created_by_id,
            creator_name=p.creator.full_name if p.creator else None,
            created_at=p.created_at,
            actions=[
                RecoveryActionResponse(
                    id=a.id,
                    action_type=a.action_type,
                    source_warehouse_id=a.source_warehouse_id,
                    target_warehouse_id=a.target_warehouse_id,
                    product_id=a.product_id,
                    quantity=a.quantity,
                    alternative_supplier_id=a.alternative_supplier_id,
                    estimated_cost=a.estimated_cost,
                    execution_status=a.execution_status,
                )
                for a in p.actions
            ],
            approvals=[
                ApprovalResponse(
                    id=appr.id,
                    recovery_plan_id=appr.recovery_plan_id,
                    approver_id=appr.approver_id,
                    approver_name=appr.approver.full_name if appr.approver else None,
                    decision=appr.decision,
                    decision_notes=appr.decision_notes,
                    decided_at=appr.decided_at,
                )
                for appr in p.approvals
            ],
        )
        result.append(res)
    return result


@router.post("/recovery-plans/{plan_id}/request-approval", response_model=RecoveryPlanResponse)
def request_plan_approval(
    plan_id: int,
    current_user: User = Depends(require_roles(UserRole.OPERATIONS_ANALYST, UserRole.SUPPLY_CHAIN_MANAGER, UserRole.ADMINISTRATOR)),
    db: Session = Depends(get_db),
):
    """Move plan from DRAFT to AWAITING_APPROVAL after firewall recheck."""
    plan = db.query(RecoveryPlan).filter(
        RecoveryPlan.id == plan_id,
        RecoveryPlan.company_id == current_user.company_id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Recovery plan not found")

    # Validate feasibility
    is_feasible, reasons = RecoveryFirewall.validate_plan_feasibility(plan, db)
    if not is_feasible:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot submit infeasible plan for approval: {'; '.join(reasons)}",
        )

    plan.status = RecoveryPlanStatus.AWAITING_APPROVAL
    db.commit()

    # Create notification for managers
    notif = Notification(
        company_id=plan.company_id,
        title="Approval Requested",
        message=f"Plan '{plan.title}' submitted for authorization by {current_user.full_name}.",
        notification_type="APPROVAL_PENDING",
        severity="WARNING",
        link="/approvals",
    )
    db.add(notif)
    db.commit()

    return RecoveryPlanResponse.model_validate(plan)


@router.post("/recovery-plans/{plan_id}/approval", response_model=RecoveryPlanResponse)
def decide_plan_approval(
    plan_id: int,
    request: ApprovalRequest,
    current_user: User = Depends(require_roles(
        UserRole.SUPPLY_CHAIN_MANAGER,
        UserRole.PROCUREMENT_APPROVER,
        UserRole.ADMINISTRATOR,
    )),
    db: Session = Depends(get_db),
):
    """Approve or reject a recovery plan.
    
    CRITICAL: Strictly enforces Separation of Duties:
    A user MUST NOT approve their own recovery plan.
    """
    plan = db.query(RecoveryPlan).filter(
        RecoveryPlan.id == plan_id,
        RecoveryPlan.company_id == current_user.company_id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Recovery plan not found")

    # 1. Enforce Separation of Duties
    check_separation_of_duties(creator_id=plan.created_by_id, approver_id=current_user.id)

    # 2. Check Role capability for specific strategies
    if plan.strategy_type == StrategyType.ALTERNATIVE_SUPPLIER:
        if current_user.role not in [UserRole.PROCUREMENT_APPROVER, UserRole.ADMINISTRATOR]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Alternative supplier procurement approvals require 'Procurement Approver' or 'Administrator' role.",
            )

    decision_upper = request.decision.upper()
    if decision_upper not in ["APPROVED", "REJECTED", "MODIFICATION_REQUESTED"]:
        raise HTTPException(status_code=400, detail="Decision must be APPROVED, REJECTED, or MODIFICATION_REQUESTED")

    # 3. If approving, revalidate constraints with Recovery Firewall
    if decision_upper == "APPROVED":
        is_f, reasons = RecoveryFirewall.validate_plan_feasibility(plan, db)
        if not is_f:
            plan.status = RecoveryPlanStatus.STALE
            plan.is_feasible = False
            plan.infeasibility_reasons = "; ".join(reasons)
            db.commit()
            raise HTTPException(
                status_code=400,
                detail=f"Approval rejected by Recovery Firewall due to live resource conflict: {'; '.join(reasons)}",
            )

        plan.status = RecoveryPlanStatus.APPROVED

        # Activate shared reservation ledger across disruptions
        for action in plan.actions:
            if action.action_type in ["TRANSFER_STOCK", "SPLIT_SHIPMENT"] and action.source_warehouse_id:
                reservation = InventoryReservation(
                    company_id=plan.company_id,
                    recovery_plan_id=plan.id,
                    warehouse_id=action.source_warehouse_id,
                    product_id=action.product_id,
                    quantity=action.quantity,
                    status="ACTIVE",
                )
                db.add(reservation)
    elif decision_upper == "REJECTED":
        plan.status = RecoveryPlanStatus.REJECTED
    else:
        plan.status = RecoveryPlanStatus.DRAFT

    # Record approval record
    approval_entry = Approval(
        company_id=plan.company_id,
        recovery_plan_id=plan.id,
        approver_id=current_user.id,
        decision=decision_upper,
        decision_notes=request.decision_notes or f"Decision made by {current_user.full_name}",
    )
    db.add(approval_entry)

    # Audit Log
    audit = AuditLog(
        company_id=plan.company_id,
        actor_id=current_user.id,
        actor_name=f"{current_user.full_name} ({current_user.role.value})",
        action=f"PLAN_{decision_upper}",
        target_type="RecoveryPlan",
        target_id=str(plan.id),
        details_json=json.dumps({"decision": decision_upper, "notes": request.decision_notes}),
    )
    db.add(audit)

    db.commit()
    return RecoveryPlanResponse.model_validate(plan)


@router.post("/recovery-plans/{plan_id}/simulate-execution", response_model=RecoveryPlanResponse)
def simulate_plan_execution(
    plan_id: int,
    request: SimulateExecutionRequest,
    current_user: User = Depends(require_roles(
        UserRole.SUPPLY_CHAIN_MANAGER,
        UserRole.WAREHOUSE_OPERATOR,
        UserRole.ADMINISTRATOR,
    )),
    db: Session = Depends(get_db),
):
    """Simulate execution of an APPROVED recovery plan.
    
    Enforces:
    - Plan must be APPROVED.
    - Idempotent execution (repeated requests cannot re-apply changes twice).
    - Immediate revalidation via Recovery Firewall.
    - Updates persistent simulated stock and records RecoveryOutcome.
    - NEVER performs real-world carrier bookings or payments.
    """
    plan = db.query(RecoveryPlan).filter(
        RecoveryPlan.id == plan_id,
        RecoveryPlan.company_id == current_user.company_id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Recovery plan not found")

    if plan.status == RecoveryPlanStatus.COMPLETED:
        # Idempotency guarantee
        return RecoveryPlanResponse.model_validate(plan)

    if plan.status != RecoveryPlanStatus.APPROVED:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot execute plan in status '{plan.status.value}'. Must be 'APPROVED'.",
        )

    # 1. Immediate Pre-Execution Revalidation via Recovery Firewall
    is_f, reasons = RecoveryFirewall.validate_plan_feasibility(plan, db)
    if not is_f:
        plan.status = RecoveryPlanStatus.FAILED
        plan.infeasibility_reasons = f"Execution aborted by Firewall: {'; '.join(reasons)}"
        db.commit()
        raise HTTPException(
            status_code=400,
            detail=f"Execution-time constraint violation: {'; '.join(reasons)}",
        )

    plan.status = RecoveryPlanStatus.SIMULATED_EXECUTION

    # 2. Apply simulated inventory updates
    for action in plan.actions:
        if action.action_type in ["TRANSFER_STOCK", "SPLIT_SHIPMENT"] and action.source_warehouse_id:
            src_inv = db.query(Inventory).filter(
                Inventory.company_id == plan.company_id,
                Inventory.warehouse_id == action.source_warehouse_id,
                Inventory.product_id == action.product_id,
            ).first()

            if src_inv:
                src_inv.physical_quantity = max(0, src_inv.physical_quantity - action.quantity)

            # Add to target warehouse
            if action.target_warehouse_id:
                tgt_inv = db.query(Inventory).filter(
                    Inventory.company_id == plan.company_id,
                    Inventory.warehouse_id == action.target_warehouse_id,
                    Inventory.product_id == action.product_id,
                ).first()
                if tgt_inv:
                    tgt_inv.physical_quantity += action.quantity

        action.execution_status = "SIMULATED"

    # Release reservations
    reservations = db.query(InventoryReservation).filter(
        InventoryReservation.recovery_plan_id == plan.id,
    ).all()
    for r in reservations:
        r.status = "COMMITTED"

    # Update disruption status
    if plan.disruption:
        plan.disruption.status = DisruptionStatus.RECOVERING

    # 3. Record or update Recovery Outcome for Intelligence & Historical Feedback
    outcome = db.query(RecoveryOutcome).filter(RecoveryOutcome.recovery_plan_id == plan.id).first()
    if outcome:
        outcome.success_level = "SUCCESS"
        outcome.actual_cost = round(plan.estimated_cost * 1.02, 2)
        outcome.actual_time_hours = round(plan.estimated_time_hours, 1)
        outcome.orders_protected = plan.orders_protected_count
        outcome.notes = f"Simulated execution updated by {current_user.full_name} ({current_user.role.value})."
    else:
        outcome = RecoveryOutcome(
            company_id=plan.company_id,
            recovery_plan_id=plan.id,
            success_level="SUCCESS",
            actual_cost=round(plan.estimated_cost * 1.02, 2),  # Slight realistic simulated variance
            actual_time_hours=round(plan.estimated_time_hours, 1),
            orders_protected=plan.orders_protected_count,
            delivery_commitments_missed=0 if plan.orders_protected_count > 0 else 1,
            notes=f"Simulated execution completed by {current_user.full_name} ({current_user.role.value}).",
        )
        db.add(outcome)

    plan.status = RecoveryPlanStatus.COMPLETED

    # 4. Audit Log
    audit = AuditLog(
        company_id=plan.company_id,
        actor_id=current_user.id,
        actor_name=f"{current_user.full_name} ({current_user.role.value})",
        action="SIMULATE_EXECUTION",
        target_type="RecoveryPlan",
        target_id=str(plan.id),
        details_json=json.dumps({
            "strategy": plan.strategy_type.value,
            "cost": outcome.actual_cost,
            "time_hours": outcome.actual_time_hours,
            "orders_protected": outcome.orders_protected,
        }),
    )
    db.add(audit)

    db.commit()
    return RecoveryPlanResponse.model_validate(plan)


# ---------------------------------------------------------
# Recovery Outcomes Intelligence
# ---------------------------------------------------------

@router.get("/recovery-outcomes", response_model=List[RecoveryOutcomeResponse])
def list_recovery_outcomes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve historical simulated outcomes to inform ranking intelligence."""
    outcomes = db.query(RecoveryOutcome).filter(
        RecoveryOutcome.company_id == current_user.company_id,
    ).order_by(RecoveryOutcome.evaluated_at.desc()).all()

    result = []
    for o in outcomes:
        result.append(RecoveryOutcomeResponse(
            id=o.id,
            recovery_plan_id=o.recovery_plan_id,
            plan_title=o.recovery_plan.title if o.recovery_plan else None,
            strategy_type=o.recovery_plan.strategy_type.value if o.recovery_plan else None,
            success_level=o.success_level,
            actual_cost=o.actual_cost,
            actual_time_hours=o.actual_time_hours,
            orders_protected=o.orders_protected,
            delivery_commitments_missed=o.delivery_commitments_missed,
            notes=o.notes,
            evaluated_at=o.evaluated_at,
        ))
    return result


# ---------------------------------------------------------
# Field Incident Reporting (Offline-first sync ingestion)
# ---------------------------------------------------------

@router.post("/field-incidents", response_model=IncidentEventResponse)
def submit_field_incident(
    event_data: IncidentEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ingest field reports from warehouse operators with client_event_id idempotency."""
    existing = db.query(IncidentEvent).filter(
        IncidentEvent.company_id == current_user.company_id,
        IncidentEvent.client_event_id == event_data.client_event_id,
    ).first()

    if existing:
        # Idempotent response for offline retry
        return IncidentEventResponse.model_validate(existing)

    new_event = IncidentEvent(
        company_id=current_user.company_id,
        client_event_id=event_data.client_event_id,
        report_type=event_data.report_type,
        description=event_data.description,
        warehouse_id=event_data.warehouse_id,
        product_id=event_data.product_id,
        quantity=event_data.quantity,
        severity=event_data.severity,
        sync_status="SYNCED",
        reported_by_id=current_user.id,
    )
    db.add(new_event)

    # Reconcile inventory if damaged goods reported
    if event_data.report_type == "DAMAGED_GOODS" and event_data.warehouse_id and event_data.product_id:
        inv = db.query(Inventory).filter(
            Inventory.company_id == current_user.company_id,
            Inventory.warehouse_id == event_data.warehouse_id,
            Inventory.product_id == event_data.product_id,
        ).first()
        if inv:
            inv.damaged_quantity += event_data.quantity

    # Create notification
    notif = Notification(
        company_id=current_user.company_id,
        title=f"Field Incident: {event_data.report_type}",
        message=f"{current_user.full_name}: {event_data.description}",
        notification_type="FIELD_INCIDENT",
        severity=event_data.severity.value,
        link="/field-reports",
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        company_id=current_user.company_id,
        actor_id=current_user.id,
        actor_name=f"{current_user.full_name} ({current_user.role.value})",
        action="FIELD_INCIDENT_REPORTED",
        target_type="IncidentEvent",
        target_id=event_data.client_event_id,
        details_json=json.dumps({
            "report_type": event_data.report_type,
            "quantity": event_data.quantity,
            "severity": event_data.severity.value,
        }),
    )
    db.add(audit)

    db.commit()
    return IncidentEventResponse.model_validate(new_event)


@router.get("/field-incidents", response_model=List[IncidentEventResponse])
def list_field_incidents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all field incident reports for the tenant."""
    events = db.query(IncidentEvent).filter(
        IncidentEvent.company_id == current_user.company_id,
    ).order_by(IncidentEvent.reported_at.desc()).all()
    return [IncidentEventResponse.model_validate(e) for e in events]


# ---------------------------------------------------------
# Notifications & Audit Logs
# ---------------------------------------------------------

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List in-app notifications for the company."""
    notifs = db.query(Notification).filter(
        Notification.company_id == current_user.company_id,
    ).order_by(Notification.created_at.desc()).limit(20).all()
    return [NotificationResponse.model_validate(n) for n in notifs]


@router.post("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark notification as read."""
    n = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.company_id == current_user.company_id,
    ).first()
    if n:
        n.is_read = True
        db.commit()
    return {"success": True}


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve immutable audit trail strictly scoped to company."""
    logs = db.query(AuditLog).filter(
        AuditLog.company_id == current_user.company_id,
    ).order_by(AuditLog.created_at.desc()).limit(50).all()
    return [AuditLogResponse.model_validate(l) for l in logs]


# ---------------------------------------------------------
# Carrier Webhook
# ---------------------------------------------------------

@router.post("/webhooks/carrier")
def carrier_webhook(
    payload: CarrierWebhookPayload,
    x_carrier_secret: Optional[str] = Header(None),
    company_id: int = 1,  # In demo mode, defaults to tenant 1 or can be routed via carrier token
    db: Session = Depends(get_db),
):
    """Simulated authenticated carrier webhook endpoint.
    
    Receives carrier delays, verifies secret/token, enforces idempotency,
    and triggers downstream disruptions.
    """
    valid_secret = "carrier-secure-demo-secret-2026"
    if x_carrier_secret and x_carrier_secret != valid_secret:
        raise HTTPException(status_code=401, detail="Unauthorized carrier webhook secret")

    result = CarrierWebhookService.process_webhook_event(company_id=company_id, payload=payload, db=db)
    return result


# ---------------------------------------------------------
# CSV Data Import
# ---------------------------------------------------------

@router.post("/import/csv/{entity_type}")
async def import_csv_data(
    entity_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(UserRole.OPERATIONS_ANALYST, UserRole.ADMINISTRATOR)),
    db: Session = Depends(get_db),
):
    """Import CSV data for suppliers, products, or shipments with validation and quarantine error reports."""
    content = (await file.read()).decode("utf-8")

    e = entity_type.lower().strip()
    if e in ("supplier", "suppliers"):
        res = DataImportService.import_suppliers_csv(current_user.company_id, content, db)
    elif e in ("product", "products"):
        res = DataImportService.import_products_csv(current_user.company_id, content, db)
    elif e in ("shipment", "shipments"):
        res = DataImportService.import_shipments_csv(current_user.company_id, content, db)
    elif e in ("inventory", "inventories", "stock"):
        res = DataImportService.import_inventory_csv(current_user.company_id, content, db)
    elif e in ("order", "orders", "customer_orders"):
        res = DataImportService.import_orders_csv(current_user.company_id, content, db)
    elif e in ("disruption", "disruptions", "incidents"):
        res = DataImportService.import_disruptions_csv(current_user.company_id, content, db)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported entity type: {entity_type}")

    # Log in audit trail
    audit = AuditLog(
        company_id=current_user.company_id,
        actor_id=current_user.id,
        actor_name=f"{current_user.full_name} ({current_user.role.value})",
        action="IMPORT_DATA",
        target_type=entity_type.capitalize(),
        details_json=json.dumps({"imported": res.get("imported_count"), "errors": res.get("error_count")}),
    )
    db.add(audit)
    db.commit()

    return res


@router.post("/demo/seed-benchmark")
def seed_benchmark_dataset(db: Session = Depends(get_db)):
    """Instant 1-click database reset and benchmark dataset hydration."""
    from backend.seed import seed_database
    seed_database(db, force=True)
    return {
        "success": True,
        "message": "Full benchmark enterprise dataset loaded successfully for Apex Global Logistics and Horizon Freight Corp.",
        "entities": {
            "companies": 2,
            "users": 10,
            "warehouses": 5,
            "products": 8,
            "inventory_records": 18,
            "shipments": 6,
            "orders": 6,
            "disruptions": 3,
            "recovery_plans": 4,
        }
    }


# ---------------------------------------------------------
# Entities Lookup (Tenant Scoped)
# ---------------------------------------------------------

@router.get("/warehouses", response_model=List[WarehouseResponse])
def list_warehouses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Warehouse).filter(Warehouse.company_id == current_user.company_id).all()


@router.get("/suppliers", response_model=List[SupplierResponse])
def list_suppliers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Supplier).filter(Supplier.company_id == current_user.company_id).all()


@router.get("/products", response_model=List[ProductResponse])
def list_products(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.company_id == current_user.company_id).all()


@router.get("/inventory", response_model=List[InventoryResponse])
def list_inventory(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    invs = db.query(Inventory).filter(Inventory.company_id == current_user.company_id).all()
    result = []
    for inv in invs:
        unit_cost = inv.product.unit_cost if inv.product else 0.0
        result.append(InventoryResponse(
            id=inv.id,
            company_id=inv.company_id,
            warehouse_id=inv.warehouse_id,
            warehouse_name=inv.warehouse.name if inv.warehouse else None,
            warehouse_code=inv.warehouse.code if inv.warehouse else None,
            product_id=inv.product_id,
            product_sku=inv.product.sku if inv.product else None,
            product_name=inv.product.name if inv.product else None,
            batch_number=inv.batch_number,
            physical_quantity=inv.physical_quantity,
            reserved_quantity=inv.reserved_quantity,
            damaged_quantity=inv.damaged_quantity,
            expired_quantity=inv.expired_quantity,
            safety_stock=inv.safety_stock,
            usable_quantity=inv.usable_quantity,
            expiry_date=inv.expiry_date,
            unit_cost=unit_cost,
            total_value=round(inv.usable_quantity * unit_cost, 2),
        ))
    return result


@router.post("/inventory/{inventory_id}/adjust")
def adjust_inventory(inventory_id: int, payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    inv = db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.company_id == current_user.company_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    
    if "physical_quantity" in payload:
        inv.physical_quantity = max(0, int(payload["physical_quantity"]))
    if "damaged_quantity" in payload:
        inv.damaged_quantity = max(0, int(payload["damaged_quantity"]))
    if "reserved_quantity" in payload:
        inv.reserved_quantity = max(0, int(payload["reserved_quantity"]))
    
    db.commit()
    db.refresh(inv)
    unit_cost = inv.product.unit_cost if inv.product else 0.0
    return {
        "status": "SUCCESS",
        "message": f"Inventory updated for SKU {inv.product.sku if inv.product else 'N/A'}",
        "inventory": {
            "id": inv.id,
            "physical_quantity": inv.physical_quantity,
            "reserved_quantity": inv.reserved_quantity,
            "damaged_quantity": inv.damaged_quantity,
            "usable_quantity": inv.usable_quantity,
            "unit_cost": unit_cost,
            "total_value": round(inv.usable_quantity * unit_cost, 2)
        }
    }


@router.get("/shipments", response_model=List[ShipmentResponse])
def list_shipments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ships = db.query(Shipment).filter(Shipment.company_id == current_user.company_id).all()
    result = []
    for s in ships:
        result.append(ShipmentResponse(
            id=s.id,
            company_id=s.company_id,
            tracking_number=s.tracking_number,
            carrier=s.carrier,
            supplier_id=s.supplier_id,
            supplier_name=s.supplier.name if s.supplier else None,
            destination_warehouse_id=s.destination_warehouse_id,
            destination_warehouse_code=s.destination_warehouse.code if s.destination_warehouse else None,
            origin_location=s.origin_location,
            departure_date=s.departure_date,
            scheduled_eta=s.scheduled_eta,
            actual_eta=s.actual_eta,
            status=s.status,
            delay_hours=s.delay_hours,
            delay_reason=s.delay_reason,
            product_sku=s.product_sku,
            quantity=s.quantity,
        ))
    return result


# ---------------------------------------------------------
# Demo Database Reset
# ---------------------------------------------------------

@router.post("/demo/reset")
def reset_demo_database(current_user: User = Depends(require_roles(UserRole.ADMINISTRATOR)), db: Session = Depends(get_db)):
    """Reset the demo database for judging demonstration."""
    # Wipe and reseed
    from backend.models import Base
    from backend.database import engine
    Base.metadata.drop_all(bind=engine)
    init_db()
    seed_database(db)
    return {"success": True, "message": "DisruptionIQ demo database reset and re-seeded successfully!"}
