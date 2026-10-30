"""Synthetic Seed Data Generator for DisruptionIQ.

Seeds two fully isolated logistics companies:
1. Apex Global Logistics (APEX) - Primary demo company
2. Horizon Freight Corp (HORIZON) - Secondary tenant for cross-company isolation verification

Includes complete realistic supply chain graphs, multi-tier orders, products with medical/shelf-life
rules, inventory with damaged/expired units, and two benchmark disruption scenarios.
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.database import SessionLocal, init_db
from backend.models import (
    Company,
    User,
    UserRole,
    Supplier,
    Warehouse,
    Product,
    ProductCriticality,
    Inventory,
    CustomerOrder,
    OrderLine,
    OrderPriority,
    Shipment,
    Disruption,
    DisruptionSeverity,
    DisruptionStatus,
    RecoveryPlan,
    RecoveryPlanStatus,
    StrategyType,
    RecoveryAction,
    Approval,
    RecoveryOutcome,
    Notification,
    AuditLog,
)
from backend.auth import hash_password


def seed_database(db: Session, force: bool = False) -> None:
    """Populate realistic multi-company synthetic supply chain data."""
    # Check if already seeded
    if not force and db.query(Company).filter(Company.code == "APEX").first():
        return
    
    if force:
        from backend.database import Base, engine
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    now = datetime.utcnow()

    # 1. Companies
    apex = Company(name="Apex Global Logistics", code="APEX")
    horizon = Company(name="Horizon Freight Corp", code="HORIZON")
    db.add_all([apex, horizon])
    db.flush()

    # 2. Users for Apex (All 5 Roles)
    apex_users = [
        User(
            company_id=apex.id,
            email="analyst@apex.com",
            full_name="Alex Chen",
            role=UserRole.OPERATIONS_ANALYST,
            hashed_password=hash_password("password123"),
        ),
        User(
            company_id=apex.id,
            email="manager@apex.com",
            full_name="Sarah Jenkins",
            role=UserRole.SUPPLY_CHAIN_MANAGER,
            hashed_password=hash_password("password123"),
        ),
        User(
            company_id=apex.id,
            email="warehouse@apex.com",
            full_name="Marco Rossi",
            role=UserRole.WAREHOUSE_OPERATOR,
            hashed_password=hash_password("password123"),
        ),
        User(
            company_id=apex.id,
            email="procurement@apex.com",
            full_name="Elena Rostova",
            role=UserRole.PROCUREMENT_APPROVER,
            hashed_password=hash_password("password123"),
        ),
        User(
            company_id=apex.id,
            email="admin@apex.com",
            full_name="David Vance",
            role=UserRole.ADMINISTRATOR,
            hashed_password=hash_password("password123"),
        ),
    ]
    db.add_all(apex_users)

    # Users for Horizon (Tenant Isolation Testing)
    horizon_users = [
        User(
            company_id=horizon.id,
            email="analyst@horizon.com",
            full_name="Liam Murphy",
            role=UserRole.OPERATIONS_ANALYST,
            hashed_password=hash_password("password123"),
        ),
        User(
            company_id=horizon.id,
            email="manager@horizon.com",
            full_name="Clara Oswald",
            role=UserRole.SUPPLY_CHAIN_MANAGER,
            hashed_password=hash_password("password123"),
        ),
        User(
            company_id=horizon.id,
            email="admin@horizon.com",
            full_name="Arthur Pendelton",
            role=UserRole.ADMINISTRATOR,
            hashed_password=hash_password("password123"),
        ),
    ]
    db.add_all(horizon_users)
    db.flush()

    # 3. Suppliers for Apex
    s1 = Supplier(
        company_id=apex.id,
        name="PharmaCore Bio Supplies",
        code="SUP-PHARMA-01",
        contact_email="dispatch@pharmacore.com",
        location="Basel, Switzerland",
        reliability_score=0.98,
        lead_time_days=4,
        is_alternative_backup=False,
        expedite_premium_rate=1.30,
    )
    s2 = Supplier(
        company_id=apex.id,
        name="Nordic Express BioTech",
        code="SUP-NORDIC-02",
        contact_email="rush@nordicbio.se",
        location="Uppsala, Sweden",
        reliability_score=0.95,
        lead_time_days=2,
        is_alternative_backup=True,
        expedite_premium_rate=1.45,
    )
    s3 = Supplier(
        company_id=apex.id,
        name="Pacific Micro Electronics",
        code="SUP-PACIFIC-03",
        contact_email="sales@pacificmicro.tw",
        location="Hsinchu, Taiwan",
        reliability_score=0.91,
        lead_time_days=9,
        is_alternative_backup=False,
        expedite_premium_rate=1.40,
    )
    s4 = Supplier(
        company_id=apex.id,
        name="Vanguard Component Sourcing",
        code="SUP-VANGUARD-04",
        contact_email="contracts@vanguard-semi.de",
        location="Dresden, Germany",
        reliability_score=0.93,
        lead_time_days=3,
        is_alternative_backup=True,
        expedite_premium_rate=1.25,
    )
    db.add_all([s1, s2, s3, s4])

    # Horizon Supplier (Isolated)
    s_hz = Supplier(
        company_id=horizon.id,
        name="Horizon Maritime Logistics",
        code="SUP-HZ-01",
        contact_email="ops@horizonmaritime.co.uk",
        location="Southampton, UK",
        reliability_score=0.88,
        lead_time_days=6,
        is_alternative_backup=False,
        expedite_premium_rate=1.35,
    )
    db.add(s_hz)
    db.flush()

    # 4. Warehouses for Apex
    wh_rot = Warehouse(
        company_id=apex.id,
        name="Rotterdam Central Hub",
        code="WH-ROT",
        location="Rotterdam, Netherlands",
        capacity_pallets=15000,
        latitude=51.9244,
        longitude=4.4777,
    )
    wh_fra = Warehouse(
        company_id=apex.id,
        name="Frankfurt Logistics Park",
        code="WH-FRA",
        location="Frankfurt, Germany",
        capacity_pallets=12000,
        latitude=50.1109,
        longitude=8.6821,
    )
    wh_mil = Warehouse(
        company_id=apex.id,
        name="Milan Distribution Center",
        code="WH-MIL",
        location="Milan, Italy",
        capacity_pallets=8500,
        latitude=45.4642,
        longitude=9.1900,
    )
    db.add_all([wh_rot, wh_fra, wh_mil])

    # Horizon Warehouse (Isolated)
    wh_hz = Warehouse(
        company_id=horizon.id,
        name="London Gateway Port",
        code="WH-LGW",
        location="London, UK",
        capacity_pallets=20000,
        latitude=51.5074,
        longitude=0.1278,
    )
    db.add(wh_hz)
    db.flush()

    # 5. Products for Apex
    p_insulin = Product(
        company_id=apex.id,
        sku="MED-INSULIN-100",
        name="Ultra-Pure Insulin Glargine 100U",
        category="Cold Chain Pharmaceuticals",
        criticality=ProductCriticality.ESSENTIAL_MEDICAL,
        unit_cost=45.0,
        selling_price=120.0,
        shelf_life_days=180,
        min_remaining_shelf_life_days=45,
        handling_restrictions="Cold Chain 2°C - 8°C. Do not freeze.",
    )
    p_stent = Product(
        company_id=apex.id,
        sku="MED-STENT-DES",
        name="Drug-Eluting Cardiac Stent System",
        category="Surgical Implants",
        criticality=ProductCriticality.ESSENTIAL_MEDICAL,
        unit_cost=320.0,
        selling_price=850.0,
        shelf_life_days=365,
        min_remaining_shelf_life_days=60,
        handling_restrictions="Dry sterile environment. Class III Medical.",
    )
    p_chip = Product(
        company_id=apex.id,
        sku="SEMI-CHIP-A9",
        name="Automotive Grade Microcontroller A9",
        category="Semiconductors",
        criticality=ProductCriticality.HIGH_VALUE,
        unit_cost=85.0,
        selling_price=240.0,
        shelf_life_days=None,
        min_remaining_shelf_life_days=0,
        handling_restrictions="ESD Sensitive (JEDEC Level 3).",
    )
    p_battery = Product(
        company_id=apex.id,
        sku="BATT-48V-LFP",
        name="Lithium Iron Phosphate Battery Pack 48V",
        category="Energy Storage",
        criticality=ProductCriticality.ORDINARY,
        unit_cost=150.0,
        selling_price=350.0,
        shelf_life_days=720,
        min_remaining_shelf_life_days=90,
        handling_restrictions="Dangerous Goods Class 9 (UN3480).",
    )
    p_vaccine = Product(
        company_id=apex.id,
        sku="MED-VAX-MRNA",
        name="Ultra-Chilled mRNA Formulation -70C",
        category="Cold Chain Pharmaceuticals",
        criticality=ProductCriticality.ESSENTIAL_MEDICAL,
        unit_cost=65.0,
        selling_price=180.0,
        shelf_life_days=90,
        min_remaining_shelf_life_days=30,
        handling_restrictions="Dry Ice Temperature -70°C to -80°C strictly required.",
    )
    p_sensor = Product(
        company_id=apex.id,
        sku="SEMI-LIDAR-OPT",
        name="Automotive LiDAR Optical Sensor Transceiver",
        category="Semiconductors",
        criticality=ProductCriticality.HIGH_VALUE,
        unit_cost=420.0,
        selling_price=950.0,
        shelf_life_days=None,
        min_remaining_shelf_life_days=0,
        handling_restrictions="Optical precision cleanroom packaging.",
    )
    p_actuator = Product(
        company_id=apex.id,
        sku="ROBOT-SERVO-5K",
        name="High-Torque Robotic Joint Servo Actuator",
        category="Industrial Robotics",
        criticality=ProductCriticality.HIGH_VALUE,
        unit_cost=580.0,
        selling_price=1350.0,
        shelf_life_days=None,
        min_remaining_shelf_life_days=0,
        handling_restrictions="Precision calibrated gear train.",
    )
    p_transducer = Product(
        company_id=apex.id,
        sku="AERO-TRANS-VIB",
        name="Turbine Vibration Piezoelectric Transducer",
        category="Aerospace Avionics",
        criticality=ProductCriticality.HIGH_VALUE,
        unit_cost=850.0,
        selling_price=2200.0,
        shelf_life_days=None,
        min_remaining_shelf_life_days=0,
        handling_restrictions="Aero Grade FAA 8130-3 Dual Airworthiness.",
    )
    db.add_all([p_insulin, p_stent, p_chip, p_battery, p_vaccine, p_sensor, p_actuator, p_transducer])

    # Horizon Product (Isolated)
    p_hz = Product(
        company_id=horizon.id,
        sku="HZ-CONTAINER-LOCK",
        name="Electronic Seal GPS Container Lock",
        category="Maritime Hardware",
        criticality=ProductCriticality.ORDINARY,
        unit_cost=35.0,
        selling_price=90.0,
        shelf_life_days=None,
        min_remaining_shelf_life_days=0,
    )
    db.add(p_hz)
    db.flush()

    # 6. Inventory Records
    # Demonstrating usable stock = physical - reserved - damaged - expired
    inv_rot_insulin = Inventory(
        company_id=apex.id,
        warehouse_id=wh_rot.id,
        product_id=p_insulin.id,
        batch_number="BATCH-INS-2026A",
        physical_quantity=400,
        reserved_quantity=100,
        damaged_quantity=20,
        expired_quantity=0,
        safety_stock=50,
        expiry_date=now + timedelta(days=120),
    )
    inv_fra_insulin = Inventory(
        company_id=apex.id,
        warehouse_id=wh_fra.id,
        product_id=p_insulin.id,
        batch_number="BATCH-INS-2026B",
        physical_quantity=50,
        reserved_quantity=45,
        damaged_quantity=5,
        expired_quantity=0,
        safety_stock=20,
        expiry_date=now + timedelta(days=90),
    )
    inv_rot_chip = Inventory(
        company_id=apex.id,
        warehouse_id=wh_rot.id,
        product_id=p_chip.id,
        batch_number="BATCH-CHIP-44X",
        physical_quantity=150,  # Limited stock competing between WH-FRA and WH-MIL
        reserved_quantity=0,
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=25,
        expiry_date=None,
    )
    inv_fra_chip = Inventory(
        company_id=apex.id,
        warehouse_id=wh_fra.id,
        product_id=p_chip.id,
        batch_number="BATCH-CHIP-44Y",
        physical_quantity=10,
        reserved_quantity=10,  # Stockout situation
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=20,
        expiry_date=None,
    )
    inv_mil_chip = Inventory(
        company_id=apex.id,
        warehouse_id=wh_mil.id,
        product_id=p_chip.id,
        batch_number="BATCH-CHIP-44Z",
        physical_quantity=5,
        reserved_quantity=5,   # Critical shortage
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=15,
        expiry_date=None,
    )
    inv_mil_stent = Inventory(
        company_id=apex.id,
        warehouse_id=wh_mil.id,
        product_id=p_stent.id,
        batch_number="BATCH-STENT-09",
        physical_quantity=80,
        reserved_quantity=20,
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=10,
        expiry_date=now + timedelta(days=240),
    )
    # Milan Alternative Buffer for Insulin (Enables the flagship Stock Transfer scenario!)
    inv_mil_insulin = Inventory(
        company_id=apex.id,
        warehouse_id=wh_mil.id,
        product_id=p_insulin.id,
        batch_number="BATCH-INS-2026M",
        physical_quantity=320,
        reserved_quantity=100,
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=50,
        expiry_date=now + timedelta(days=150),
    )
    # Additional High-Value Stock Lines
    inv_fra_vaccine = Inventory(
        company_id=apex.id,
        warehouse_id=wh_fra.id,
        product_id=p_vaccine.id,
        batch_number="BATCH-VAX-77A",
        physical_quantity=450,
        reserved_quantity=150,
        damaged_quantity=20,
        expired_quantity=0,
        safety_stock=80,
        expiry_date=now + timedelta(days=60),
    )
    inv_rot_vaccine = Inventory(
        company_id=apex.id,
        warehouse_id=wh_rot.id,
        product_id=p_vaccine.id,
        batch_number="BATCH-VAX-77B",
        physical_quantity=800,
        reserved_quantity=200,
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=100,
        expiry_date=now + timedelta(days=75),
    )
    inv_rot_sensor = Inventory(
        company_id=apex.id,
        warehouse_id=wh_rot.id,
        product_id=p_sensor.id,
        batch_number="BATCH-LIDAR-01",
        physical_quantity=240,
        reserved_quantity=40,
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=30,
        expiry_date=None,
    )
    inv_fra_sensor = Inventory(
        company_id=apex.id,
        warehouse_id=wh_fra.id,
        product_id=p_sensor.id,
        batch_number="BATCH-LIDAR-02",
        physical_quantity=35,
        reserved_quantity=35,  # Shortage
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=25,
        expiry_date=None,
    )
    inv_rot_actuator = Inventory(
        company_id=apex.id,
        warehouse_id=wh_rot.id,
        product_id=p_actuator.id,
        batch_number="BATCH-ROBOT-88",
        physical_quantity=160,
        reserved_quantity=50,
        damaged_quantity=5,
        expired_quantity=0,
        safety_stock=20,
        expiry_date=None,
    )
    inv_mil_actuator = Inventory(
        company_id=apex.id,
        warehouse_id=wh_mil.id,
        product_id=p_actuator.id,
        batch_number="BATCH-ROBOT-89",
        physical_quantity=90,
        reserved_quantity=10,
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=15,
        expiry_date=None,
    )
    inv_rot_transducer = Inventory(
        company_id=apex.id,
        warehouse_id=wh_rot.id,
        product_id=p_transducer.id,
        batch_number="BATCH-AERO-04",
        physical_quantity=120,
        reserved_quantity=20,
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=15,
        expiry_date=None,
    )
    inv_fra_transducer = Inventory(
        company_id=apex.id,
        warehouse_id=wh_fra.id,
        product_id=p_transducer.id,
        batch_number="BATCH-AERO-05",
        physical_quantity=15,
        reserved_quantity=15,  # Zero usable stock
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=10,
        expiry_date=None,
    )
    inv_rot_battery = Inventory(
        company_id=apex.id,
        warehouse_id=wh_rot.id,
        product_id=p_battery.id,
        batch_number="BATCH-BATT-99",
        physical_quantity=380,
        reserved_quantity=60,
        damaged_quantity=10,
        expired_quantity=0,
        safety_stock=40,
        expiry_date=now + timedelta(days=400),
    )
    inv_fra_battery = Inventory(
        company_id=apex.id,
        warehouse_id=wh_fra.id,
        product_id=p_battery.id,
        batch_number="BATCH-BATT-98",
        physical_quantity=210,
        reserved_quantity=80,
        damaged_quantity=0,
        expired_quantity=0,
        safety_stock=30,
        expiry_date=now + timedelta(days=350),
    )
    db.add_all([
        inv_rot_insulin, inv_fra_insulin, inv_mil_insulin,
        inv_rot_chip, inv_fra_chip, inv_mil_chip,
        inv_mil_stent,
        inv_fra_vaccine, inv_rot_vaccine,
        inv_rot_sensor, inv_fra_sensor,
        inv_rot_actuator, inv_mil_actuator,
        inv_rot_transducer, inv_fra_transducer,
        inv_rot_battery, inv_fra_battery,
    ])

    # Horizon Inventory (Isolated)
    inv_hz = Inventory(
        company_id=horizon.id,
        warehouse_id=wh_hz.id,
        product_id=p_hz.id,
        batch_number="HZ-BATCH-01",
        physical_quantity=600,
        reserved_quantity=50,
        damaged_quantity=10,
        expired_quantity=0,
        safety_stock=100,
    )
    db.add(inv_hz)
    db.flush()

    # 7. Shipments
    # Scenario 1 Shipment: PharmaCore to Rotterdam Hub (Delayed due to cold-chain port halt)
    shipment_insulin = Shipment(
        company_id=apex.id,
        tracking_number="TRK-APX-8801",
        carrier="Kuehne+Nagel Pharma Logistics",
        supplier_id=s1.id,
        destination_warehouse_id=wh_rot.id,
        origin_location="Basel, Switzerland",
        departure_date=now - timedelta(days=2),
        scheduled_eta=now + timedelta(hours=12),
        actual_eta=now + timedelta(hours=60),
        status="DELAYED",
        delay_hours=48.0,
        delay_reason="Refrigerated container sensor fault & customs secondary audit at port",
        product_sku=p_insulin.sku,
        quantity=500,
    )
    # Scenario 2 Shipment: Pacific Micro to Frankfurt (Semiconductor port congestion)
    shipment_chips = Shipment(
        company_id=apex.id,
        tracking_number="TRK-APX-9204",
        carrier="Maersk Air Cargo",
        supplier_id=s3.id,
        destination_warehouse_id=wh_fra.id,
        origin_location="Hsinchu, Taiwan",
        departure_date=now - timedelta(days=4),
        scheduled_eta=now + timedelta(hours=8),
        actual_eta=now + timedelta(hours=80),
        status="DELAYED",
        delay_hours=72.0,
        delay_reason="Typhoon evasion detour & ground handling strike at airfreight hub",
        product_sku=p_chip.sku,
        quantity=300,
    )
    # On-time Shipment
    shipment_stents = Shipment(
        company_id=apex.id,
        tracking_number="TRK-APX-4100",
        carrier="DHL Global Forwarding",
        supplier_id=s2.id,
        destination_warehouse_id=wh_mil.id,
        origin_location="Uppsala, Sweden",
        departure_date=now - timedelta(days=1),
        scheduled_eta=now + timedelta(days=1),
        status="IN_TRANSIT",
        delay_hours=0.0,
        product_sku=p_stent.sku,
        quantity=120,
    )
    db.add_all([shipment_insulin, shipment_chips, shipment_stents])
    db.flush()

    # 8. Customer Orders
    # Order 1: University Hospital Zurich - Critical Insulin promise
    order1 = CustomerOrder(
        company_id=apex.id,
        order_number="ORD-2026-901",
        customer_name="Zurich University Hospital Center",
        customer_tier="VIP",
        order_date=now - timedelta(days=1),
        promised_delivery_date=now + timedelta(hours=24),  # Due before delayed shipment arrives!
        destination_city="Zurich, Switzerland",
        priority=OrderPriority.CRITICAL,
        status="AT_RISK",
        risk_score=92.5,
        risk_reasons=json.dumps([
            "Shipment TRK-APX-8801 delayed by 48.0h beyond promised delivery window",
            "Product MED-INSULIN-100 is ESSENTIAL_MEDICAL with strict temperature SLA",
            "Destination hospital VIP tier contract carries penalty clause (₹4,15,000/day)",
            "Local usable stock in Frankfurt is insufficient (available: 0, required: 150)",
        ]),
        total_value=18000.0,
    )
    # Order 2: Charite Berlin Medical Supply
    order2 = CustomerOrder(
        company_id=apex.id,
        order_number="ORD-2026-902",
        customer_name="Charité Medical Purchasing Berlin",
        customer_tier="TIER_1",
        order_date=now - timedelta(days=2),
        promised_delivery_date=now + timedelta(hours=36),
        destination_city="Berlin, Germany",
        priority=OrderPriority.PRIORITY,
        status="AT_RISK",
        risk_score=78.0,
        risk_reasons=json.dumps([
            "Delayed upstream shipment TRK-APX-8801",
            "Promised delivery within 36 hours; current delay is 48 hours",
            "Frankfurt warehouse local buffer exhausted",
        ]),
        total_value=12000.0,
    )
    # Order 3: Munich Automotive Powertrain GmbH (Competing for SEMI-CHIP-A9)
    order3 = CustomerOrder(
        company_id=apex.id,
        order_number="ORD-2026-903",
        customer_name="Bavaria Auto Systems Munich",
        customer_tier="VIP",
        order_date=now - timedelta(days=3),
        promised_delivery_date=now + timedelta(hours=28),
        destination_city="Munich, Germany",
        priority=OrderPriority.CRITICAL,
        status="AT_RISK",
        risk_score=89.0,
        risk_reasons=json.dumps([
            "Upstream microcontrollers delayed by 72.0h via Maersk Air Cargo",
            "High assembly line penalty risk (₹20,75,000/shift stopped)",
            "Competes directly with Milan order ORD-2026-904 for Rotterdam buffer",
        ]),
        total_value=24000.0,
    )
    # Order 4: Lombardy Industrial Automation Milan (Competing for SEMI-CHIP-A9)
    order4 = CustomerOrder(
        company_id=apex.id,
        order_number="ORD-2026-904",
        customer_name="Lombardy Robotics & Drives Milan",
        customer_tier="TIER_1",
        order_date=now - timedelta(days=2),
        promised_delivery_date=now + timedelta(hours=48),
        destination_city="Milan, Italy",
        priority=OrderPriority.PRIORITY,
        status="AT_RISK",
        risk_score=74.5,
        risk_reasons=json.dumps([
            "Shipment TRK-APX-9204 delayed by 72.0h",
            "Milan warehouse zero unallocated stock",
            "Rotterdam buffer of 150 units insufficient to satisfy both Munich (100) and Milan (90)",
        ]),
        total_value=21600.0,
    )
    # Order 5: Standard safe order (Fulfilled on time)
    order5 = CustomerOrder(
        company_id=apex.id,
        order_number="ORD-2026-888",
        customer_name="Milan Cardio Clinic",
        customer_tier="TIER_1",
        order_date=now - timedelta(days=4),
        promised_delivery_date=now + timedelta(days=3),
        destination_city="Milan, Italy",
        priority=OrderPriority.STANDARD,
        status="PENDING",
        risk_score=15.0,
        risk_reasons=json.dumps(["Local warehouse stock verified and on-time shipment arriving"]),
        total_value=17000.0,
    )
    db.add_all([order1, order2, order3, order4, order5])
    db.flush()

    # Order Lines
    ol1 = OrderLine(
        company_id=apex.id,
        order_id=order1.id,
        product_id=p_insulin.id,
        quantity=150,
        fulfilled_quantity=0,
        allocated_warehouse_id=wh_fra.id,
    )
    ol2 = OrderLine(
        company_id=apex.id,
        order_id=order2.id,
        product_id=p_insulin.id,
        quantity=100,
        fulfilled_quantity=0,
        allocated_warehouse_id=wh_fra.id,
    )
    ol3 = OrderLine(
        company_id=apex.id,
        order_id=order3.id,
        product_id=p_chip.id,
        quantity=100,
        fulfilled_quantity=0,
        allocated_warehouse_id=wh_fra.id,
    )
    ol4 = OrderLine(
        company_id=apex.id,
        order_id=order4.id,
        product_id=p_chip.id,
        quantity=90,
        fulfilled_quantity=0,
        allocated_warehouse_id=wh_mil.id,
    )
    ol5 = OrderLine(
        company_id=apex.id,
        order_id=order5.id,
        product_id=p_stent.id,
        quantity=20,
        fulfilled_quantity=20,
        allocated_warehouse_id=wh_mil.id,
    )
    db.add_all([ol1, ol2, ol3, ol4, ol5])
    db.flush()

    # 9. Disruptions
    # Disruption 1: Cold Chain Delay on Pharma
    d1 = Disruption(
        company_id=apex.id,
        code="DIS-2026-001",
        title="Cold-Chain Port Quarantine & Sensor Alarm at Antwerp",
        disruption_type="LATE_SHIPMENT",
        severity=DisruptionSeverity.CRITICAL,
        status=DisruptionStatus.RECOVERY_PROPOSED,
        supplier_id=s1.id,
        shipment_id=shipment_insulin.id,
        warehouse_id=wh_rot.id,
        product_id=p_insulin.id,
        detected_at=now - timedelta(hours=6),
        estimated_delay_hours=48.0,
        details="Refrigerated container trailer sensor flagged temperature excursion to 9.2°C during port clearance. Secondary QA release mandated before transport.",
        source_type="CARRIER_WEBHOOK",
    )
    # Disruption 2: Airfreight Detour on Critical Semiconductor Chips
    d2 = Disruption(
        company_id=apex.id,
        code="DIS-2026-002",
        title="Typhoon Detour & Ground Handling Gridlock at Air Cargo Hub",
        disruption_type="LATE_SHIPMENT",
        severity=DisruptionSeverity.HIGH,
        status=DisruptionStatus.INVESTIGATING,
        supplier_id=s3.id,
        shipment_id=shipment_chips.id,
        warehouse_id=wh_fra.id,
        product_id=p_chip.id,
        detected_at=now - timedelta(hours=3),
        estimated_delay_hours=72.0,
        details="Flight 840 diverted through Anchorage due to Typhoon Malakas. Scheduled connection to Frankfurt delayed by 72 hours; assembly lines at risk.",
        source_type="CARRIER_WEBHOOK",
    )
    db.add_all([d1, d2])
    db.flush()

    # 10. Pre-computed Feasible Recovery Plans for Disruption 1 (Cold Chain)
    analyst_user = apex_users[0]  # Alex Chen
    manager_user = apex_users[1]  # Sarah Jenkins

    # Plan A: Rapid Stock Transfer from Rotterdam Hub (Available usable: 280)
    plan_transfer = RecoveryPlan(
        company_id=apex.id,
        disruption_id=d1.id,
        title="Stock Transfer from Rotterdam Hub (Dedicated Temperature-Controlled Sprinter)",
        strategy_type=StrategyType.STOCK_TRANSFER,
        status=RecoveryPlanStatus.AWAITING_APPROVAL,
        estimated_cost=2450.0,
        estimated_time_hours=14.0,
        orders_protected_count=2,
        residual_risk_score=12.0,
        uncomfortable_truth="Fully covers both Zurich (150) and Berlin (100) hospital orders. Consumes 250 units of 280 usable stock in Rotterdam, leaving only 30 units safety margin until next batch arrives.",
        evidence_data=json.dumps({
            "source_warehouse": "WH-ROT",
            "target_warehouse": "WH-FRA",
            "quantity_transferred": 250,
            "transport_mode": "Dedicated Pharma Sprinter 2-8°C with dual telemetry",
            "cost_breakdown": {"freight_rush": 1800.0, "dry_ice_validation": 350.0, "expedited_handling": 300.0},
            "sla_margin_hours": 10.0,
        }),
        is_feasible=True,
        created_by_id=analyst_user.id,
    )
    db.add(plan_transfer)
    db.flush()

    action_transfer = RecoveryAction(
        company_id=apex.id,
        recovery_plan_id=plan_transfer.id,
        action_type="TRANSFER_STOCK",
        source_warehouse_id=wh_rot.id,
        target_warehouse_id=wh_fra.id,
        product_id=p_insulin.id,
        quantity=250,
        estimated_cost=2450.0,
        execution_status="PENDING",
    )
    db.add(action_transfer)

    # Plan B: Alternative Supplier (Nordic Express BioTech in Sweden)
    plan_alt = RecoveryPlan(
        company_id=apex.id,
        disruption_id=d1.id,
        title="Emergency Sourcing via Nordic Express BioTech",
        strategy_type=StrategyType.ALTERNATIVE_SUPPLIER,
        status=RecoveryPlanStatus.DRAFT,
        estimated_cost=6200.0,
        estimated_time_hours=32.0,
        orders_protected_count=1,
        residual_risk_score=38.0,
        uncomfortable_truth="Nordic Express lead time of 32 hours arrives too late for Zurich VIP order (promised in 24h). Only Berlin order (promised in 36h) is protected. Zurich delivery will miss deadline by 8 hours.",
        evidence_data=json.dumps({
            "alternative_supplier": "SUP-NORDIC-02",
            "procurement_premium": "45% surcharge",
            "quantity_ordered": 250,
            "lead_time_hours": 32.0,
        }),
        is_feasible=True,
        created_by_id=analyst_user.id,
    )
    # Plan C: Do Nothing (Baseline benchmark)
    plan_do_nothing = RecoveryPlan(
        company_id=apex.id,
        disruption_id=d1.id,
        title="Do Nothing (Wait for Delayed Antwerp Container)",
        strategy_type=StrategyType.DO_NOTHING,
        status=RecoveryPlanStatus.DRAFT,
        estimated_cost=30000.0,  # SLA default penalties
        estimated_time_hours=48.0,
        orders_protected_count=0,
        residual_risk_score=95.0,
        uncomfortable_truth="Zero recovery action taken. Both Zurich and Berlin hospital deliveries will fail SLAs. Estimated customer contract penalties exceed ₹24,90,000, and hospital trust severely damaged.",
        evidence_data=json.dumps({"sla_penalty_zurich": 20000.0, "sla_penalty_berlin": 10000.0, "protected_orders": 0}),
        is_feasible=True,
        created_by_id=analyst_user.id,
    )
    db.add_all([plan_alt, plan_do_nothing])
    db.flush()

    # 11. Historical Synthetic Outcome (For History-Informed Ranking Intelligence)
    # Seed a past recovery outcome demonstrating that Stock Transfers have a 94% success rate vs 62% for expedited airfreight
    past_plan = RecoveryPlan(
        company_id=apex.id,
        disruption_id=d1.id,
        title="Historical Reference: Stock Transfer Munich to Frankfurt (Batch Q3)",
        strategy_type=StrategyType.STOCK_TRANSFER,
        status=RecoveryPlanStatus.COMPLETED,
        estimated_cost=2200.0,
        estimated_time_hours=12.0,
        orders_protected_count=3,
        residual_risk_score=10.0,
        uncomfortable_truth="Historical archive run.",
        is_feasible=True,
        created_by_id=analyst_user.id,
    )
    db.add(past_plan)
    db.flush()

    past_outcome = RecoveryOutcome(
        company_id=apex.id,
        recovery_plan_id=past_plan.id,
        success_level="SUCCESS",
        actual_cost=2280.0,
        actual_time_hours=13.0,
        orders_protected=3,
        delivery_commitments_missed=0,
        notes="Transferred via chilled sprinter on time. 100% customer delivery promises kept.",
        evaluated_at=now - timedelta(days=14),
    )
    db.add(past_outcome)

    # 12. Notifications
    notif1 = Notification(
        company_id=apex.id,
        title="Critical Disruption Detected: Cold-Chain Port Quarantine",
        message="Shipment TRK-APX-8801 carrying MED-INSULIN-100 delayed by 48h at Antwerp. 2 hospital orders at critical risk.",
        notification_type="DISRUPTION",
        severity="CRITICAL",
        is_read=False,
        link="/disruptions",
    )
    notif2 = Notification(
        company_id=apex.id,
        title="Recovery Plan Awaiting Approval",
        message="Plan 'Stock Transfer from Rotterdam Hub' created by Alex Chen is ready for Supply Chain Manager review.",
        notification_type="APPROVAL_PENDING",
        severity="WARNING",
        is_read=False,
        link="/approvals",
    )
    db.add_all([notif1, notif2])

    # 13. Audit Log Initial Entries
    audit1 = AuditLog(
        company_id=apex.id,
        actor_id=apex_users[0].id,
        actor_name="Alex Chen (Operations Analyst)",
        action="IMPORT_DATA",
        target_type="Shipment",
        target_id="TRK-APX-8801",
        details_json=json.dumps({"source": "Carrier Webhook", "status": "DELAYED", "delay_hours": 48.0}),
    )
    audit2 = AuditLog(
        company_id=apex.id,
        actor_id=apex_users[0].id,
        actor_name="Alex Chen (Operations Analyst)",
        action="CREATE_PLAN",
        target_type="RecoveryPlan",
        target_id=str(plan_transfer.id),
        details_json=json.dumps({"strategy": "STOCK_TRANSFER", "estimated_cost": 2450.0, "protected_orders": 2}),
    )
    db.add_all([audit1, audit2])

    db.commit()
    print("DisruptionIQ synthetic database successfully seeded for APEX and HORIZON!")


if __name__ == "__main__":
    import sys
    force_seed = "--force" in sys.argv
    init_db()
    db = SessionLocal()
    seed_database(db, force=force_seed)
    db.close()
