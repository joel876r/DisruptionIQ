"""Data Import and Carrier Webhook Ingestion Engine for DisruptionIQ.

Handles:
- Bulk CSV and JSON data imports with validation, transaction safety, and quarantine reports.
- Full entity coverage: Suppliers, Products, Shipments, Inventory, Customer Orders, Disruptions.
- Authenticated and idempotent carrier webhook processing.
- Automatic disruption detection and downstream risk triggering.
"""

from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.models import (
    Supplier,
    Warehouse,
    Product,
    ProductCriticality,
    Inventory,
    Shipment,
    CustomerOrder,
    OrderLine,
    OrderPriority,
    Disruption,
    DisruptionSeverity,
    DisruptionStatus,
    Notification,
    AuditLog,
)
from backend.schemas import CarrierWebhookPayload


class DataImportService:
    """Validates and imports supply chain data while maintaining strict tenant isolation."""

    @staticmethod
    def _get_val(row: Dict[str, Any], *aliases: str, default: str = "") -> str:
        for k, v in row.items():
            if k is not None:
                clean_k = str(k).strip().lower()
                for alias in aliases:
                    if clean_k == alias.lower():
                        return str(v).strip() if v is not None else default
        return default

    @classmethod
    def import_suppliers_csv(cls, company_id: int, csv_content: str, db: Session) -> Dict[str, Any]:
        reader = csv.DictReader(io.StringIO(csv_content))
        imported, errors = 0, []

        for row_idx, row in enumerate(reader, start=1):
            try:
                code = cls._get_val(row, "code", "supplier_code", "id")
                name = cls._get_val(row, "name", "supplier_name", "company")
                location = cls._get_val(row, "location", "city", "country", default="Global Hub")

                if not code or not name:
                    errors.append({"row": row_idx, "error": "Missing required fields: code, name"})
                    continue

                existing = db.query(Supplier).filter(
                    Supplier.company_id == company_id,
                    Supplier.code == code,
                ).first()

                rel_score = float(cls._get_val(row, "reliability_score", "reliability", default="0.95"))
                lead_days = int(cls._get_val(row, "lead_time_days", "lead_time", default="5"))
                is_backup = cls._get_val(row, "is_alternative_backup", "is_backup", default="false").lower() == "true"

                if existing:
                    existing.name = name
                    existing.location = location
                    existing.contact_email = cls._get_val(row, "contact_email", "email")
                    existing.reliability_score = rel_score
                    existing.lead_time_days = lead_days
                    existing.is_alternative_backup = is_backup
                else:
                    new_sup = Supplier(
                        company_id=company_id,
                        code=code,
                        name=name,
                        location=location,
                        contact_email=cls._get_val(row, "contact_email", "email"),
                        reliability_score=rel_score,
                        lead_time_days=lead_days,
                        is_alternative_backup=is_backup,
                    )
                    db.add(new_sup)
                imported += 1
            except Exception as e:
                errors.append({"row": row_idx, "error": str(e)})

        db.commit()
        return {"success": True, "imported_count": imported, "error_count": len(errors), "quarantine_errors": errors}

    @classmethod
    def import_products_csv(cls, company_id: int, csv_content: str, db: Session) -> Dict[str, Any]:
        reader = csv.DictReader(io.StringIO(csv_content))
        imported, errors = 0, []

        for row_idx, row in enumerate(reader, start=1):
            try:
                sku = cls._get_val(row, "sku", "product_sku", "product_code")
                name = cls._get_val(row, "name", "product_name", "title")
                category = cls._get_val(row, "category", default="General Logistics")

                if not sku or not name:
                    errors.append({"row": row_idx, "error": "Missing required SKU or name"})
                    continue

                crit_str = cls._get_val(row, "criticality", default="ORDINARY").upper()
                criticality = getattr(ProductCriticality, crit_str, ProductCriticality.ORDINARY)

                unit_cost = float(cls._get_val(row, "unit_cost", "cost", default="10.0"))
                selling_price = float(cls._get_val(row, "selling_price", "price", default="20.0"))

                existing = db.query(Product).filter(
                    Product.company_id == company_id,
                    Product.sku == sku,
                ).first()

                if existing:
                    existing.name = name
                    existing.category = category
                    existing.criticality = criticality
                    existing.unit_cost = unit_cost
                    existing.selling_price = selling_price
                else:
                    shelf_life = cls._get_val(row, "shelf_life_days")
                    new_prod = Product(
                        company_id=company_id,
                        sku=sku,
                        name=name,
                        category=category,
                        criticality=criticality,
                        unit_cost=unit_cost,
                        selling_price=selling_price,
                        shelf_life_days=int(shelf_life) if shelf_life else None,
                        min_remaining_shelf_life_days=int(cls._get_val(row, "min_remaining_shelf_life_days", default="30")),
                        handling_restrictions=cls._get_val(row, "handling_restrictions"),
                    )
                    db.add(new_prod)
                imported += 1
            except Exception as e:
                errors.append({"row": row_idx, "error": str(e)})

        db.commit()
        return {"success": True, "imported_count": imported, "error_count": len(errors), "quarantine_errors": errors}

    @classmethod
    def import_shipments_csv(cls, company_id: int, csv_content: str, db: Session) -> Dict[str, Any]:
        reader = csv.DictReader(io.StringIO(csv_content))
        imported, errors = 0, []

        for row_idx, row in enumerate(reader, start=1):
            try:
                trk = cls._get_val(row, "tracking_number", "tracking", "trk_no")
                carrier = cls._get_val(row, "carrier", default="Express Freight")
                wh_code = cls._get_val(row, "destination_warehouse_code", "warehouse_code", "warehouse", default="WH-FRA-01")

                if not trk:
                    errors.append({"row": row_idx, "error": "Missing tracking_number"})
                    continue

                warehouse = db.query(Warehouse).filter(
                    Warehouse.company_id == company_id,
                    Warehouse.code == wh_code,
                ).first()
                if not warehouse:
                    warehouse = Warehouse(
                        company_id=company_id,
                        code=wh_code,
                        name=f"{wh_code} Distribution Center",
                        location="Regional Logistics Hub",
                        capacity_pallets=10000,
                        latitude=50.1109,
                        longitude=8.6821,
                    )
                    db.add(warehouse)
                    db.flush()

                scheduled_eta = datetime.utcnow() + timedelta(days=2)
                eta_str = cls._get_val(row, "scheduled_eta", "eta")
                if eta_str:
                    try:
                        scheduled_eta = datetime.fromisoformat(eta_str.replace("Z", "+00:00"))
                    except Exception:
                        pass

                delay_hours = float(cls._get_val(row, "delay_hours", default="0.0"))
                sku = cls._get_val(row, "product_sku", "sku")
                quantity = int(float(cls._get_val(row, "quantity", "qty", default="0")))

                existing = db.query(Shipment).filter(
                    Shipment.company_id == company_id,
                    Shipment.tracking_number == trk,
                ).first()

                if existing:
                    existing.carrier = carrier
                    existing.delay_hours = delay_hours
                    existing.status = cls._get_val(row, "status", default=existing.status)
                else:
                    new_shipment = Shipment(
                        company_id=company_id,
                        tracking_number=trk,
                        carrier=carrier,
                        destination_warehouse_id=warehouse.id,
                        origin_location=cls._get_val(row, "origin_location", default="Origin Port"),
                        scheduled_eta=scheduled_eta,
                        status=cls._get_val(row, "status", default="IN_TRANSIT"),
                        delay_hours=delay_hours,
                        product_sku=sku,
                        quantity=quantity,
                    )
                    db.add(new_shipment)
                imported += 1
            except Exception as e:
                errors.append({"row": row_idx, "error": str(e)})

        db.commit()
        return {"success": True, "imported_count": imported, "error_count": len(errors), "quarantine_errors": errors}

    @classmethod
    def import_inventory_csv(cls, company_id: int, csv_content: str, db: Session) -> Dict[str, Any]:
        reader = csv.DictReader(io.StringIO(csv_content))
        imported, errors = 0, []

        for row_idx, row in enumerate(reader, start=1):
            try:
                sku = cls._get_val(row, "sku", "product_sku", "product_code")
                wh_code = cls._get_val(row, "warehouse_code", "warehouse", "wh_code", "depot_code", default="WH-FRA-01")
                batch = cls._get_val(row, "batch_number", "batch", "lot_number", default="BATCH-MAIN")
                prod_name = cls._get_val(row, "product_name", "name", default="")
                category = cls._get_val(row, "category", default="Critical Logistics")

                if not sku:
                    errors.append({"row": row_idx, "error": "Missing required SKU"})
                    continue

                # Auto-ensure Warehouse exists
                warehouse = db.query(Warehouse).filter(
                    Warehouse.company_id == company_id,
                    Warehouse.code == wh_code,
                ).first()
                if not warehouse:
                    warehouse = Warehouse(
                        company_id=company_id,
                        code=wh_code,
                        name=f"{wh_code} Distribution Center",
                        location="Regional Logistics Hub",
                        capacity_pallets=10000,
                        latitude=50.1109,
                        longitude=8.6821,
                    )
                    db.add(warehouse)
                    db.flush()

                # Parse quantities
                try:
                    phys_qty = int(float(cls._get_val(row, "physical_units", "physical_quantity", "physical_stock", "units", default="0")))
                except Exception:
                    phys_qty = 0
                try:
                    res_qty = int(float(cls._get_val(row, "reserved_units", "reserved_quantity", default="0")))
                except Exception:
                    res_qty = 0
                try:
                    dam_qty = int(float(cls._get_val(row, "damaged_units", "damaged_quantity", default="0")))
                except Exception:
                    dam_qty = 0
                try:
                    exp_qty = int(float(cls._get_val(row, "expired_units", "expired_quantity", default="0")))
                except Exception:
                    exp_qty = 0
                try:
                    safety_stock = int(float(cls._get_val(row, "safety_stock", default="20")))
                except Exception:
                    safety_stock = 20
                try:
                    unit_price = float(cls._get_val(row, "unit_price_inr", "unit_cost", "unit_price", default="2500.0"))
                except Exception:
                    unit_price = 2500.0

                # Auto-ensure Product exists
                product = db.query(Product).filter(
                    Product.company_id == company_id,
                    Product.sku == sku,
                ).first()
                if not product:
                    product = Product(
                        company_id=company_id,
                        sku=sku,
                        name=prod_name if prod_name else f"Product {sku}",
                        category=category,
                        criticality=ProductCriticality.CRITICAL,
                        unit_cost=unit_price * 0.7,
                        selling_price=unit_price,
                        min_remaining_shelf_life_days=30,
                    )
                    db.add(product)
                    db.flush()
                elif prod_name and not product.name:
                    product.name = prod_name

                # Check existing inventory record
                inv = db.query(Inventory).filter(
                    Inventory.company_id == company_id,
                    Inventory.warehouse_id == warehouse.id,
                    Inventory.product_id == product.id,
                    Inventory.batch_number == batch,
                ).first()

                if inv:
                    inv.physical_quantity = phys_qty
                    inv.reserved_quantity = res_qty
                    inv.damaged_quantity = dam_qty
                    inv.expired_quantity = exp_qty
                    inv.safety_stock = safety_stock
                    inv.updated_at = datetime.utcnow()
                else:
                    inv = Inventory(
                        company_id=company_id,
                        warehouse_id=warehouse.id,
                        product_id=product.id,
                        batch_number=batch,
                        physical_quantity=phys_qty,
                        reserved_quantity=res_qty,
                        damaged_quantity=dam_qty,
                        expired_quantity=exp_qty,
                        safety_stock=safety_stock,
                    )
                    db.add(inv)

                imported += 1
            except Exception as e:
                errors.append({"row": row_idx, "error": str(e)})

        db.commit()
        return {"success": True, "imported_count": imported, "error_count": len(errors), "quarantine_errors": errors}

    @classmethod
    def import_orders_csv(cls, company_id: int, csv_content: str, db: Session) -> Dict[str, Any]:
        reader = csv.DictReader(io.StringIO(csv_content))
        imported, errors = 0, []

        for row_idx, row in enumerate(reader, start=1):
            try:
                order_num = cls._get_val(row, "order_number", "order_id", "order_no")
                customer_name = cls._get_val(row, "customer_name", "customer", default="Priority Client")
                tier = cls._get_val(row, "customer_tier", "tier", default="TIER_1")
                dest_city = cls._get_val(row, "destination_city", "destination", "city", default="Mumbai")
                priority_str = cls._get_val(row, "priority", default="CRITICAL").upper()
                priority = getattr(OrderPriority, priority_str, OrderPriority.CRITICAL)

                try:
                    total_val = float(cls._get_val(row, "total_value_inr", "total_value", "value", default="45000.0"))
                except Exception:
                    total_val = 45000.0

                deadline_str = cls._get_val(row, "promised_delivery_date", "delivery_date", "deadline")
                deadline = datetime.utcnow() + timedelta(days=2)
                if deadline_str:
                    try:
                        deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
                    except Exception:
                        pass

                sku = cls._get_val(row, "sku", "product_sku", "product_code")
                wh_code = cls._get_val(row, "warehouse_code", "warehouse", default="WH-FRA-01")
                try:
                    qty = int(float(cls._get_val(row, "quantity", "qty", "units", default="50")))
                except Exception:
                    qty = 50

                if not order_num:
                    errors.append({"row": row_idx, "error": "Missing order_number"})
                    continue

                # Auto-find product and warehouse
                product = None
                if sku:
                    product = db.query(Product).filter(Product.company_id == company_id, Product.sku == sku).first()
                    if not product:
                        product = Product(
                            company_id=company_id,
                            sku=sku,
                            name=f"Product {sku}",
                            category="General Logistics",
                            criticality=ProductCriticality.CRITICAL,
                            unit_cost=1000.0,
                            selling_price=1800.0,
                        )
                        db.add(product)
                        db.flush()

                warehouse = db.query(Warehouse).filter(Warehouse.company_id == company_id, Warehouse.code == wh_code).first()

                order = db.query(CustomerOrder).filter(
                    CustomerOrder.company_id == company_id,
                    CustomerOrder.order_number == order_num,
                ).first()

                if order:
                    order.customer_name = customer_name
                    order.customer_tier = tier
                    order.destination_city = dest_city
                    order.priority = priority
                    order.total_value = total_val
                    order.promised_delivery_date = deadline
                else:
                    order = CustomerOrder(
                        company_id=company_id,
                        order_number=order_num,
                        customer_name=customer_name,
                        customer_tier=tier,
                        destination_city=dest_city,
                        priority=priority,
                        total_value=total_val,
                        promised_delivery_date=deadline,
                        status="AT_RISK",
                        risk_score=75.0,
                        risk_reasons=json.dumps(["Imported customer order with active delivery deadline"]),
                    )
                    db.add(order)
                    db.flush()

                # Order line
                if product:
                    existing_line = db.query(OrderLine).filter(
                        OrderLine.order_id == order.id,
                        OrderLine.product_id == product.id,
                    ).first()
                    if not existing_line:
                        line = OrderLine(
                            company_id=company_id,
                            order_id=order.id,
                            product_id=product.id,
                            quantity=qty,
                            allocated_warehouse_id=warehouse.id if warehouse else None,
                        )
                        db.add(line)

                imported += 1
            except Exception as e:
                errors.append({"row": row_idx, "error": str(e)})

        db.commit()
        return {"success": True, "imported_count": imported, "error_count": len(errors), "quarantine_errors": errors}

    @classmethod
    def import_disruptions_csv(cls, company_id: int, csv_content: str, db: Session) -> Dict[str, Any]:
        reader = csv.DictReader(io.StringIO(csv_content))
        imported, errors = 0, []

        for row_idx, row in enumerate(reader, start=1):
            try:
                code = cls._get_val(row, "code", "disruption_code", "incident_id")
                if not code:
                    code = f"DIS-IMP-{datetime.utcnow().strftime('%M%S')}-{row_idx}"

                title = cls._get_val(row, "title", "name", default="Supply Chain Disruption Event")
                disruption_type = cls._get_val(row, "disruption_type", "type", default="LATE_SHIPMENT")
                sev_str = cls._get_val(row, "severity", default="HIGH").upper()
                severity = getattr(DisruptionSeverity, sev_str, DisruptionSeverity.HIGH)

                try:
                    delay_hours = float(cls._get_val(row, "estimated_delay_hours", "delay_hours", default="24.0"))
                except Exception:
                    delay_hours = 24.0

                details = cls._get_val(row, "details", "description", default="Identified transit bottleneck affecting downstream shipments")
                sku = cls._get_val(row, "product_sku", "sku")
                wh_code = cls._get_val(row, "warehouse_code", "wh_code")

                product = db.query(Product).filter(Product.company_id == company_id, Product.sku == sku).first() if sku else None
                warehouse = db.query(Warehouse).filter(Warehouse.company_id == company_id, Warehouse.code == wh_code).first() if wh_code else None

                existing = db.query(Disruption).filter(
                    Disruption.company_id == company_id,
                    Disruption.code == code,
                ).first()

                if existing:
                    existing.title = title
                    existing.disruption_type = disruption_type
                    existing.severity = severity
                    existing.estimated_delay_hours = delay_hours
                    existing.details = details
                else:
                    dis = Disruption(
                        company_id=company_id,
                        code=code,
                        title=title,
                        disruption_type=disruption_type,
                        severity=severity,
                        status=DisruptionStatus.DETECTED,
                        estimated_delay_hours=delay_hours,
                        details=details,
                        source_type="CSV_IMPORT",
                        product_id=product.id if product else None,
                        warehouse_id=warehouse.id if warehouse else None,
                    )
                    db.add(dis)

                imported += 1
            except Exception as e:
                errors.append({"row": row_idx, "error": str(e)})

        db.commit()
        return {"success": True, "imported_count": imported, "error_count": len(errors), "quarantine_errors": errors}


class CarrierWebhookService:
    """Processes incoming carrier webhook events with idempotency and automatic disruption detection."""

    @staticmethod
    def process_webhook_event(company_id: int, payload: CarrierWebhookPayload, db: Session) -> Dict[str, Any]:
        # 1. Lookup shipment by tracking number within company tenant
        shipment = db.query(Shipment).filter(
            Shipment.company_id == company_id,
            Shipment.tracking_number == payload.tracking_number,
        ).first()

        if not shipment:
            return {
                "status": "QUARANTINED",
                "message": f"Shipment with tracking number '{payload.tracking_number}' not found for this tenant.",
            }

        # 2. Idempotency check: if delay_hours and status are identical to last recorded update, avoid duplicate disruption
        is_duplicate = (
            shipment.status == payload.event_code and
            abs(shipment.delay_hours - payload.delay_hours) < 0.1
        )
        if is_duplicate:
            return {
                "status": "IGNORED_DUPLICATE",
                "message": f"Event for {payload.tracking_number} with status {payload.event_code} and delay {payload.delay_hours}h already processed.",
            }

        # 3. Update shipment status and delay
        shipment.status = "DELAYED" if payload.delay_hours > 0 else payload.event_code
        shipment.delay_hours = payload.delay_hours
        shipment.delay_reason = f"[{payload.carrier}] {payload.reason} at {payload.location}"

        # 4. If delay exceeds 6 hours, trigger or update Disruption
        disruption_created = False
        if payload.delay_hours >= 6.0:
            existing_disruption = db.query(Disruption).filter(
                Disruption.company_id == company_id,
                Disruption.shipment_id == shipment.id,
            ).first()

            if existing_disruption:
                existing_disruption.estimated_delay_hours = payload.delay_hours
                existing_disruption.details = f"Updated via carrier webhook: {payload.reason} ({payload.location})"
            else:
                code = f"DIS-WH-{shipment.tracking_number[-4:]}"
                # Find matching product
                product = db.query(Product).filter(
                    Product.company_id == company_id,
                    Product.sku == shipment.product_sku,
                ).first() if shipment.product_sku else None

                new_disruption = Disruption(
                    company_id=company_id,
                    code=code,
                    title=f"Carrier Alert: {payload.carrier} Delay on {shipment.tracking_number}",
                    disruption_type="LATE_SHIPMENT",
                    severity=DisruptionSeverity.CRITICAL if payload.delay_hours >= 48 else DisruptionSeverity.HIGH,
                    status=DisruptionStatus.DETECTED,
                    supplier_id=shipment.supplier_id,
                    shipment_id=shipment.id,
                    warehouse_id=shipment.destination_warehouse_id,
                    product_id=product.id if product else None,
                    estimated_delay_hours=payload.delay_hours,
                    details=f"{payload.reason} at {payload.location}. Carrier: {payload.carrier}.",
                    source_type="CARRIER_WEBHOOK",
                )
                db.add(new_disruption)
                disruption_created = True

            # Create in-app notification
            notif = Notification(
                company_id=company_id,
                title=f"Carrier Delay Alert: {shipment.tracking_number}",
                message=f"{payload.carrier} reported {payload.delay_hours:.1f}h delay: {payload.reason}",
                notification_type="DISRUPTION",
                severity="CRITICAL" if payload.delay_hours >= 48 else "WARNING",
                link="/disruptions",
            )
            db.add(notif)

        # 5. Record in Audit Log
        audit = AuditLog(
            company_id=company_id,
            actor_name=f"Carrier Webhook ({payload.carrier})",
            action="CARRIER_EVENT_INGESTED",
            target_type="Shipment",
            target_id=shipment.tracking_number,
            details_json=json.dumps({
                "delay_hours": payload.delay_hours,
                "reason": payload.reason,
                "location": payload.location,
                "disruption_created": disruption_created,
            }),
        )
        db.add(audit)

        db.commit()
        return {
            "status": "PROCESSED",
            "tracking_number": shipment.tracking_number,
            "delay_hours": shipment.delay_hours,
            "disruption_created": disruption_created,
        }
