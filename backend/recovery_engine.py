"""Coordinated Recovery Engine & Recovery Firewall for DisruptionIQ.

Capabilities:
1. Recovery Arena: Multi-option trade-off evaluation (Do Nothing, Stock Transfer, Expedite, Alternative Supplier, Split).
2. Deadline Auction: Deterministic allocation of limited resources to orders by urgency and priority.
3. Recovery Firewall: Shared reservation ledger validation preventing double allocation, negative inventory, and expiry violations.
4. Uncomfortable Truth Engine: Explicitly detects and highlights unfulfillable demand.
5. Evidence Ledger: Structured audit trace of supporting data and assumptions.
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from backend.models import (
    Disruption,
    RecoveryPlan,
    RecoveryPlanStatus,
    StrategyType,
    RecoveryAction,
    Inventory,
    InventoryReservation,
    Warehouse,
    Product,
    Supplier,
    CustomerOrder,
    OrderLine,
    ProductCriticality,
    OrderPriority,
)


class RecoveryFirewall:
    """Pre-approval and pre-execution constraint validator.
    
    Verifies that inventory exists, is usable (not damaged, expired, or committed),
    and is not already reserved by any active recovery plan.
    """

    @staticmethod
    def validate_plan_feasibility(plan: RecoveryPlan, db: Session) -> Tuple[bool, List[str]]:
        """Validate proposed actions against current live state and shared reservations."""
        reasons = []
        is_feasible = True
        now = datetime.utcnow()

        for action in plan.actions:
            # Check source warehouse inventory if action requires stock
            if action.action_type in ["TRANSFER_STOCK", "SPLIT_SHIPMENT"] and action.source_warehouse_id:
                inv = db.query(Inventory).filter(
                    Inventory.company_id == plan.company_id,
                    Inventory.warehouse_id == action.source_warehouse_id,
                    Inventory.product_id == action.product_id,
                ).first()

                if not inv:
                    is_feasible = False
                    reasons.append(f"Source warehouse {action.source_warehouse_id} has no inventory record for product {action.product_id}.")
                    continue

                # Query all other active reservations for this warehouse & product
                other_reservations = db.query(InventoryReservation).filter(
                    InventoryReservation.company_id == plan.company_id,
                    InventoryReservation.warehouse_id == action.source_warehouse_id,
                    InventoryReservation.product_id == action.product_id,
                    InventoryReservation.status == "ACTIVE",
                    InventoryReservation.recovery_plan_id != plan.id,
                ).all()

                committed_in_other_plans = sum(r.quantity for r in other_reservations)
                truly_available = inv.usable_quantity - committed_in_other_plans

                if action.quantity > truly_available:
                    is_feasible = False
                    reasons.append(
                        f"FIREWALL REJECTION: Conflict for Product ID {action.product_id} at Warehouse ID {action.source_warehouse_id}. "
                        f"Requested {action.quantity} units, but only {truly_available} uncommitted usable units remain "
                        f"(Physical: {inv.physical_quantity}, Usable: {inv.usable_quantity}, Already Reserved by competing plans: {committed_in_other_plans})."
                    )

                # Check Expiry & Shelf-Life Constraint
                if inv.expiry_date:
                    prod = db.query(Product).filter(Product.id == action.product_id).first()
                    if prod and prod.min_remaining_shelf_life_days:
                        days_remaining = (inv.expiry_date - now).days
                        if days_remaining < prod.min_remaining_shelf_life_days:
                            is_feasible = False
                            reasons.append(
                                f"FIREWALL REJECTION: Shelf-life constraint violated for SKU '{prod.sku}'. "
                                f"Batch expires in {days_remaining} days; required shelf-life is {prod.min_remaining_shelf_life_days} days."
                            )

            # Check alternative supplier availability if action is sourcing
            elif action.action_type == "SOURCE_ALTERNATIVE":
                if not action.alternative_supplier_id:
                    is_feasible = False
                    reasons.append("FIREWALL REJECTION: Alternative sourcing action missing valid supplier ID.")
                else:
                    supplier = db.query(Supplier).filter(
                        Supplier.id == action.alternative_supplier_id,
                        Supplier.company_id == plan.company_id,
                    ).first()
                    if not supplier:
                        is_feasible = False
                        reasons.append(f"FIREWALL REJECTION: Supplier ID {action.alternative_supplier_id} not found in company records.")

        return is_feasible, reasons


class CoordinatedRecoveryEngine:
    """Generates and ranks feasible recovery options for an active disruption."""

    @staticmethod
    def generate_recovery_options(disruption: Disruption, user_id: int, db: Session) -> List[RecoveryPlan]:
        """Generate Recovery Arena plans comparing all 5 strategic options."""
        now = datetime.utcnow()
        company_id = disruption.company_id
        product_id = disruption.product_id
        warehouse_id = disruption.warehouse_id

        # Find affected product
        product = db.query(Product).filter(Product.id == product_id).first() if product_id else None
        if not product and disruption.shipment and disruption.shipment.product_sku:
            product = db.query(Product).filter(
                Product.company_id == company_id,
                Product.sku == disruption.shipment.product_sku,
            ).first()

        # Identify affected customer orders
        affected_orders = db.query(CustomerOrder).join(OrderLine).filter(
            CustomerOrder.company_id == company_id,
            OrderLine.product_id == (product.id if product else -1),
            CustomerOrder.status.in_(["AT_RISK", "PENDING"]),
        ).distinct().all()

        total_demand_needed = sum(
            line.quantity - line.fulfilled_quantity
            for order in affected_orders
            for line in order.order_lines
            if line.product_id == (product.id if product else -1)
        )

        plans = []

        # -------------------------------------------------------------
        # 1. DO NOTHING (Baseline Benchmark)
        # -------------------------------------------------------------
        sla_penalty = sum(
            (10000.0 if o.customer_tier == "VIP" else 3000.0) for o in affected_orders
        )
        plan_do_nothing = RecoveryPlan(
            company_id=company_id,
            disruption_id=disruption.id,
            title="Baseline: Do Nothing (Wait for Inbound Clearance)",
            strategy_type=StrategyType.DO_NOTHING,
            status=RecoveryPlanStatus.DRAFT,
            estimated_cost=round(sla_penalty, 2),
            estimated_time_hours=round(disruption.estimated_delay_hours, 1),
            orders_protected_count=0,
            residual_risk_score=95.0,
            uncomfortable_truth=(
                f"Full SLA default for {len(affected_orders)} affected orders. "
                f"Delivery delayed by {disruption.estimated_delay_hours:.1f} hours. "
                f"Total penalty exposure: ₹{sla_penalty:,.2f}."
            ),
            evidence_data=json.dumps({
                "strategy": "DO_NOTHING",
                "affected_orders_count": len(affected_orders),
                "unmitigated_delay_hours": disruption.estimated_delay_hours,
                "contract_penalty_risk": sla_penalty,
            }),
            is_feasible=True,
            created_by_id=user_id,
        )
        plans.append(plan_do_nothing)

        # -------------------------------------------------------------
        # 2. STOCK TRANSFER (Search network warehouses)
        # -------------------------------------------------------------
        other_inventories = db.query(Inventory).filter(
            Inventory.company_id == company_id,
            Inventory.product_id == (product.id if product else -1),
            Inventory.warehouse_id != warehouse_id,
        ).all()

        best_source_inv = None
        max_usable = 0
        for inv in other_inventories:
            # Check existing reservations
            res_sum = sum(
                r.quantity for r in db.query(InventoryReservation).filter(
                    InventoryReservation.warehouse_id == inv.warehouse_id,
                    InventoryReservation.product_id == inv.product_id,
                    InventoryReservation.status == "ACTIVE",
                ).all()
            )
            avail = inv.usable_quantity - res_sum
            if avail > max_usable:
                max_usable = avail
                best_source_inv = inv

        if best_source_inv and max_usable > 0:
            transfer_qty = min(total_demand_needed, max_usable)
            transfer_cost = 1200.0 + (transfer_qty * 5.0)
            transfer_hours = 14.0

            # Deadline auction allocation
            protected_orders = 0
            allocated_so_far = 0
            sorted_orders = sorted(
                affected_orders,
                key=lambda o: (0 if o.priority == OrderPriority.CRITICAL else 1, o.promised_delivery_date),
            )
            for ord_item in sorted_orders:
                req = sum(l.quantity for l in ord_item.order_lines if l.product_id == product.id)
                if allocated_so_far + req <= transfer_qty:
                    allocated_so_far += req
                    protected_orders += 1

            uncomfortable_text = None
            if transfer_qty < total_demand_needed:
                deficit = total_demand_needed - transfer_qty
                uncomfortable_text = (
                    f"UNCOMFORTABLE TRUTH: Source warehouse has only {max_usable} usable units. "
                    f"Shortfall of {deficit} units remains. {len(affected_orders) - protected_orders} order(s) cannot be fulfilled on time."
                )
            else:
                uncomfortable_text = f"Covers 100% of demand ({transfer_qty} units). Safely delivers {transfer_hours}h before SLA expiry."

            plan_transfer = RecoveryPlan(
                company_id=company_id,
                disruption_id=disruption.id,
                title=f"Stock Transfer from {best_source_inv.warehouse.name}",
                strategy_type=StrategyType.STOCK_TRANSFER,
                status=RecoveryPlanStatus.DRAFT,
                estimated_cost=round(transfer_cost, 2),
                estimated_time_hours=transfer_hours,
                orders_protected_count=protected_orders,
                residual_risk_score=15.0 if transfer_qty >= total_demand_needed else 45.0,
                uncomfortable_truth=uncomfortable_text,
                evidence_data=json.dumps({
                    "source_warehouse": best_source_inv.warehouse.name,
                    "usable_stock_available": max_usable,
                    "units_allocated": transfer_qty,
                    "transit_hours": transfer_hours,
                }),
                is_feasible=True,
                created_by_id=user_id,
            )
            action1 = RecoveryAction(
                company_id=company_id,
                action_type="TRANSFER_STOCK",
                source_warehouse_id=best_source_inv.warehouse_id,
                target_warehouse_id=warehouse_id,
                product_id=product.id,
                quantity=transfer_qty,
                estimated_cost=transfer_cost,
                execution_status="PENDING",
            )
            plan_transfer.actions.append(action1)
            plans.append(plan_transfer)

        # -------------------------------------------------------------
        # 3. ALTERNATIVE SUPPLIER (Backup supplier search)
        # -------------------------------------------------------------
        backup_supplier = db.query(Supplier).filter(
            Supplier.company_id == company_id,
            Supplier.is_alternative_backup == True,
        ).first()

        if backup_supplier and product:
            lead_hours = backup_supplier.lead_time_days * 24.0
            alt_cost = (total_demand_needed * product.unit_cost * backup_supplier.expedite_premium_rate) + 1500.0

            # Count orders protected based on lead time
            protected_orders = sum(
                1 for o in affected_orders
                if (o.promised_delivery_date - now).total_seconds() / 3600.0 >= lead_hours
            )

            uncomfortable_text = None
            if protected_orders < len(affected_orders):
                missed = len(affected_orders) - protected_orders
                uncomfortable_text = (
                    f"UNCOMFORTABLE TRUTH: Supplier lead time is {lead_hours:.0f}h ({backup_supplier.lead_time_days} days). "
                    f"{missed} order(s) promised earlier than {lead_hours:.0f}h will miss their delivery commitment."
                )
            else:
                uncomfortable_text = f"Alternative sourcing covers demand. Lead time of {lead_hours:.0f}h fits within all customer promise windows."

            plan_alt = RecoveryPlan(
                company_id=company_id,
                disruption_id=disruption.id,
                title=f"Emergency Sourcing via {backup_supplier.name}",
                strategy_type=StrategyType.ALTERNATIVE_SUPPLIER,
                status=RecoveryPlanStatus.DRAFT,
                estimated_cost=round(alt_cost, 2),
                estimated_time_hours=lead_hours,
                orders_protected_count=protected_orders,
                residual_risk_score=35.0 if protected_orders == len(affected_orders) else 65.0,
                uncomfortable_truth=uncomfortable_text,
                evidence_data=json.dumps({
                    "supplier_name": backup_supplier.name,
                    "lead_time_days": backup_supplier.lead_time_days,
                    "premium_rate": backup_supplier.expedite_premium_rate,
                    "quantity": total_demand_needed,
                }),
                is_feasible=True,
                created_by_id=user_id,
            )
            action2 = RecoveryAction(
                company_id=company_id,
                action_type="SOURCE_ALTERNATIVE",
                target_warehouse_id=warehouse_id,
                product_id=product.id,
                quantity=total_demand_needed,
                alternative_supplier_id=backup_supplier.id,
                estimated_cost=alt_cost,
                execution_status="PENDING",
            )
            plan_alt.actions.append(action2)
            plans.append(plan_alt)

        # -------------------------------------------------------------
        # 4. EXPEDITED FREIGHT (Charter / Express reroute)
        # -------------------------------------------------------------
        expedite_hours = max(8.0, round(disruption.estimated_delay_hours * 0.3, 1))
        expedite_cost = 4800.0
        exp_protected = len(affected_orders)

        plan_expedite = RecoveryPlan(
            company_id=company_id,
            disruption_id=disruption.id,
            title="Expedited Air Courier / Direct Dedicated Transit",
            strategy_type=StrategyType.EXPEDITE_FREIGHT,
            status=RecoveryPlanStatus.DRAFT,
            estimated_cost=expedite_cost,
            estimated_time_hours=expedite_hours,
            orders_protected_count=exp_protected,
            residual_risk_score=18.0,
            uncomfortable_truth=f"Recovers {disruption.estimated_delay_hours - expedite_hours:.1f} hours of delay at a high freight surcharge (₹{expedite_cost:,.2f}).",
            evidence_data=json.dumps({
                "mode": "Dedicated Direct Express",
                "transit_reduction_hours": disruption.estimated_delay_hours - expedite_hours,
                "cost": expedite_cost,
            }),
            is_feasible=True,
            created_by_id=user_id,
        )
        if product:
            action3 = RecoveryAction(
                company_id=company_id,
                action_type="EXPEDITE_ORDER",
                target_warehouse_id=warehouse_id,
                product_id=product.id,
                quantity=total_demand_needed,
                estimated_cost=expedite_cost,
                execution_status="PENDING",
            )
            plan_expedite.actions.append(action3)
        plans.append(plan_expedite)

        # -------------------------------------------------------------
        # 5. SPLIT FULFILLMENT (Partial delivery to VIPs first)
        # -------------------------------------------------------------
        vip_demand = sum(
            l.quantity
            for o in affected_orders if o.customer_tier == "VIP"
            for l in o.order_lines if l.product_id == (product.id if product else -1)
        )
        split_cost = 1800.0
        plan_split = RecoveryPlan(
            company_id=company_id,
            disruption_id=disruption.id,
            title="Split Fulfillment: Satisfy VIP Critical Commitments First",
            strategy_type=StrategyType.SPLIT_FULFILLMENT,
            status=RecoveryPlanStatus.DRAFT,
            estimated_cost=split_cost,
            estimated_time_hours=16.0,
            orders_protected_count=sum(1 for o in affected_orders if o.customer_tier == "VIP"),
            residual_risk_score=40.0,
            uncomfortable_truth=(
                f"Protects VIP Tier customers ({vip_demand} units). "
                f"Standard and Tier-1 customers will absorb partial delays until primary shipment arrives."
            ),
            evidence_data=json.dumps({
                "priority_group": "VIP",
                "units_expedited": vip_demand,
                "secondary_units_deferred": total_demand_needed - vip_demand,
            }),
            is_feasible=True,
            created_by_id=user_id,
        )
        plans.append(plan_split)

        # Validate each plan with the Recovery Firewall
        for p in plans:
            is_f, reasons = RecoveryFirewall.validate_plan_feasibility(p, db)
            p.is_feasible = is_f
            if not is_f:
                p.infeasibility_reasons = "; ".join(reasons)

        return plans
