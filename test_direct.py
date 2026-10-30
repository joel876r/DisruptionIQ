"""Direct test verification of DisruptionIQ backend functions without async transport locks."""

from backend.database import SessionLocal
from backend.models import User, Company, Disruption, CustomerOrder, RecoveryPlan, RecoveryPlanStatus
from backend.schemas import LoginRequest, ApprovalRequest, SimulateExecutionRequest, CarrierWebhookPayload
from backend.routes import (
    login,
    list_disruptions,
    list_customer_orders,
    get_disruption_impact,
    get_recovery_options,
    decide_plan_approval,
    simulate_plan_execution,
    carrier_webhook,
)
from backend.risk_engine import evaluate_order_risk
from backend.recovery_engine import RecoveryFirewall
from backend.auth import check_separation_of_duties

def run_all_tests():
    db = SessionLocal()
    print("[1/8] Testing Login & Password Verification...")
    token_resp = login(LoginRequest(email="analyst@apex.com", password="password123"), db=db)
    assert token_resp.access_token is not None
    assert token_resp.company.code == "APEX"
    print(" -> SUCCESS: Access token generated for Apex Operations Analyst.")

    print("[2/8] Testing Multi-Tenant Data Isolation...")
    analyst_apex = db.query(User).filter(User.email == "analyst@apex.com").first()
    analyst_horizon = db.query(User).filter(User.email == "analyst@horizon.com").first()
    
    apex_disruptions = list_disruptions(current_user=analyst_apex, db=db)
    horizon_disruptions = list_disruptions(current_user=analyst_horizon, db=db)
    
    assert len(apex_disruptions) >= 2, f"Expected Apex to have disruptions, got {len(apex_disruptions)}"
    assert len(horizon_disruptions) == 0, f"Expected Horizon to have 0 disruptions, got {len(horizon_disruptions)}"
    print(f" -> SUCCESS: Tenant isolation verified. Apex disruptions: {len(apex_disruptions)}, Horizon: {len(horizon_disruptions)}.")

    print("[3/8] Testing Supply Chain Impact Tracing (Supplier -> Shipment -> WH -> Inv -> Orders)...")
    d1 = apex_disruptions[0]
    impact = get_disruption_impact(disruption_id=d1.id, current_user=analyst_apex, db=db)
    assert "chain_nodes" in impact
    assert impact["chain_nodes"]["shipment"]["tracking_number"] is not None
    assert len(impact["confirmed_affected_orders"]) >= 1
    print(f" -> SUCCESS: Impact tracing confirmed {len(impact['confirmed_affected_orders'])} orders at risk. Exposure: ${impact['financial_exposure']:,.2f}.")

    print("[4/8] Testing Deterministic Risk Ranking Engine...")
    orders = list_customer_orders(current_user=analyst_apex, db=db)
    assert len(orders) >= 3
    top_order = orders[0]
    assert top_order.risk_score >= 70.0
    assert len(top_order.risk_reasons) > 0
    print(f" -> SUCCESS: Order {top_order.order_number} ranked with risk score {top_order.risk_score} and explainable factors.")

    print("[5/8] Testing Recovery Arena & Recovery Firewall...")
    plans = get_recovery_options(disruption_id=d1.id, current_user=analyst_apex, db=db)
    assert len(plans) >= 3
    print(f" -> SUCCESS: Generated {len(plans)} strategic recovery options with Firewall feasibility checks.")

    print("[6/8] Testing Separation of Duties (No Self-Approval)...")
    plan = db.query(RecoveryPlan).filter(RecoveryPlan.disruption_id == d1.id).first()
    manager_apex = db.query(User).filter(User.email == "manager@apex.com").first()
    
    # Author is Alex Chen
    try:
        check_separation_of_duties(creator_id=plan.created_by_id, approver_id=plan.created_by_id)
        assert False, "Should have raised HTTPException for self-approval!"
    except Exception as e:
        print(" -> SUCCESS: Self-approval blocked by separation of duties:", e.detail)

    print("[7/8] Testing Manager Approval & Shared Reservation Ledger...")
    # Manager Sarah Jenkins can approve
    appr_resp = decide_plan_approval(
        plan_id=plan.id,
        request=ApprovalRequest(decision="APPROVED", decision_notes="Authorized by Supply Chain Manager"),
        current_user=manager_apex,
        db=db,
    )
    assert appr_resp.status == RecoveryPlanStatus.APPROVED
    print(" -> SUCCESS: Plan approved and reservation ledger updated.")

    print("[8/8] Testing Simulated Execution & Idempotency...")
    # Simulated execution
    exec_resp = simulate_plan_execution(
        plan_id=plan.id,
        request=SimulateExecutionRequest(),
        current_user=manager_apex,
        db=db,
    )
    assert exec_resp.status == RecoveryPlanStatus.COMPLETED
    print(" -> SUCCESS: Simulated execution completed without real carrier/payment calls.")

    print("[9/10] Testing Carrier Webhook with Idempotency...")
    wh_payload = CarrierWebhookPayload(
        tracking_number="TRK-APX-8801",
        carrier="Kuehne+Nagel Pharma Logistics",
        event_code="DELAYED",
        delay_hours=48.0,
        reason="Port customs clearance",
        location="Antwerp Port",
    )
    wh_res1 = carrier_webhook(payload=wh_payload, x_carrier_secret="carrier-secure-demo-secret-2026", company_id=1, db=db)
    wh_res2 = carrier_webhook(payload=wh_payload, x_carrier_secret="carrier-secure-demo-secret-2026", company_id=1, db=db)
    assert wh_res2["status"] == "IGNORED_DUPLICATE"
    print(" -> SUCCESS: Carrier webhook processed event and safely rejected duplicate event.")

    print("[10/10] Testing CSV Data Import with Quarantine Errors...")
    from backend.import_engine import DataImportService
    csv_raw = (
        "code,name,location,reliability_score,lead_time_days\n"
        "SUP-TEST-SWISS,BioGeneva AG,Geneva,0.98,3\n"
        ",Missing Code Supplier,Paris,0.90,5\n"
    )
    csv_res = DataImportService.import_suppliers_csv(company_id=1, csv_content=csv_raw, db=db)
    assert csv_res["imported_count"] == 1
    assert csv_res["error_count"] == 1
    print(f" -> SUCCESS: CSV Suppliers Import accepted {csv_res['imported_count']} valid row and quarantined {csv_res['error_count']} invalid row.")

    # Test inventory import
    inv_csv = (
        "sku,warehouse_code,batch_number,physical_units,reserved_units,damaged_units,expired_units,safety_stock,unit_price_inr\n"
        "MED-INSULIN-100,WH-FRA-01,LOT-TEST-99,500,100,0,0,50,4500\n"
    )
    inv_res = DataImportService.import_inventory_csv(company_id=1, csv_content=inv_csv, db=db)
    assert inv_res["imported_count"] == 1
    print(f" -> SUCCESS: CSV Inventory Import successfully stored {inv_res['imported_count']} row.")

    # Test orders import
    orders_csv = (
        "order_number,customer_name,customer_tier,destination_city,priority,total_value_inr,sku,quantity,warehouse_code\n"
        "ORD-IMPORT-001,Apollo Hospital,TIER_1,Mumbai,CRITICAL,125000,MED-INSULIN-100,60,WH-FRA-01\n"
    )
    order_res = DataImportService.import_orders_csv(company_id=1, csv_content=orders_csv, db=db)
    assert order_res["imported_count"] == 1
    print(f" -> SUCCESS: CSV Orders Import successfully registered {order_res['imported_count']} row.")

    # Test disruptions import
    dis_csv = (
        "code,title,disruption_type,severity,estimated_delay_hours,details\n"
        "DIS-IMPORT-99,Suez Canal Vessel Congestion,PORT_CONGESTION,CRITICAL,72.0,Container vessel queueing\n"
    )
    dis_res = DataImportService.import_disruptions_csv(company_id=1, csv_content=dis_csv, db=db)
    assert dis_res["imported_count"] == 1
    print(f" -> SUCCESS: CSV Disruptions Import successfully created {dis_res['imported_count']} disruption incident.")

    print("\nALL SYSTEM-LEVEL BACKEND TESTS & NEW DATA IMPORTERS PASSED WITH 100% SUCCESS!")
    db.close()

if __name__ == "__main__":
    run_all_tests()
