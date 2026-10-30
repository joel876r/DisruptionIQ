# DisruptionIQ — From Delivery Delays to Recovery Plans

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57.svg?logo=sqlite&logoColor=white)](https://sqlite.org)
[![Pytest](https://img.shields.io/badge/Pytest-8+-0A9EDC.svg?logo=pytest&logoColor=white)](https://pytest.org)

> **DisruptionIQ** is a multi-company B2B SaaS platform that transforms fragmented logistics delays into coordinated, auditable, and constraint-validated recovery plans.

---

## 🌟 Core Innovations & Architecture

Logistics teams frequently receive fragmented updates regarding supplier delays, shipment disruptions, and inventory shortages. Detecting a delay is simple; understanding downstream order commitments, evaluating feasible trade-offs, preventing double-allocation of limited buffer inventory, and obtaining authorized executive approval is complex.

### 1. Multi-Company Tenant Data Isolation
- Strictly isolated tenant architecture: Every company record (`Supplier`, `Warehouse`, `Product`, `Inventory`, `CustomerOrder`, `Shipment`, `Disruption`, `RecoveryPlan`, `AuditLog`) is partitioned by `company_id`.
- Tenant identity is derived exclusively from authenticated server-side JWT claims—never trusting client-supplied tenant query parameters or browser headers.
- Verified with automated tests proving tenant **Horizon Freight Corp (HORIZON)** cannot inspect or mutate records belonging to **Apex Global Logistics (APEX)**.

### 2. Backend Role-Based Access Control (RBAC) & Separation of Duties
Enforces 5 distinct roles with server-side authorization dependencies:
- **Operations Analyst**: Ingests carrier data, inspects disruptions, and prepares recovery plans.
- **Supply Chain Manager**: Reviews order impact, manages recovery plans, and approves eligible stock transfer / split plans.
- **Warehouse Operator**: Reports floor stock incidents and damaged goods; views authorized warehouse stock.
- **Procurement Approver**: Authorizes alternative-supplier procurement and high-value sourcing contracts.
- **Administrator**: Manages tenant configuration, user roles, and initiates demo database resets.

> **Separation of Duties Guarantee:** A user **CANNOT approve their own recovery plan**. Server returns HTTP 400 with `Separation of duties violation: You cannot approve a recovery plan that you authored` if author matches approver.

### 3. Linked Relational Data Model & Usable Stock
Relational trace: `Supplier → Shipment → Warehouse → Inventory → Customer Order`.
- Usable inventory is calculated deterministically:
  $$\text{Usable Stock} = \max(0, \text{Physical} - \text{Reserved} - \text{Damaged} - \text{Expired})$$
- Product rules enforce shelf life, minimum remaining shelf-life days, and cold-chain temperature SLAs (e.g. Essential Medical insulin requiring 2°C–8°C storage).

### 4. Coordinated Recovery Decision Engine
- **Recovery Arena**: Multi-option comparison evaluating:
  1. *Do Nothing* (Contract SLA default penalties)
  2. *Stock Transfer* (Dedicated express sprinter from network hub)
  3. *Expedited Freight* (Charter direct transit)
  4. *Alternative Supplier* (Pre-qualified backup supplier)
  5. *Split Fulfillment* (Satisfy VIP commitments first, defer lower tiers)
- **Deadline Auction**: Transparent, deterministic resource allocation prioritizing orders by urgency, priority, and contractual penalty exposure.
- **Recovery Firewall**: Pre-approval and pre-execution validation ensuring stock is uncommitted, unexpired, and available in the shared cross-disruption reservation ledger.
- **Uncomfortable Truth Engine**: Explicitly computes and flags unfulfillable demand, displaying the exact shortfall and additional hours required. Never fabricates fake solutions.
- **Evidence Ledger**: Immutable JSON calculation trace documenting data provenance, assumed rates, and formulas.

### 5. Two Repeatable Benchmark Disruption Scenarios
1. **Scenario 1: Cold-Chain Port Quarantine & Sensor Excursion (Antwerp Hub)**
   - Shipment `TRK-APX-8801` carrying 500 units of `MED-INSULIN-100` delayed by 48.0 hours.
   - Puts University Hospital Zurich (VIP) and Charité Berlin orders at critical delivery risk.
2. **Scenario 2: Typhoon Detour & Competing Warehouse Demands (Air Cargo Hub)**
   - Shipment `TRK-APX-9204` carrying `SEMI-CHIP-A9` delayed by 72.0 hours.
   - Frankfurt (`WH-FRA`) and Milan (`WH-MIL`) warehouses compete for the exact same 150 units of buffer stock in Rotterdam (`WH-ROT`). The Recovery Firewall prevents double-allocation.

### 6. AI Operational Briefing Co-Pilot
- Uses official Google GenAI SDK (`gemini-3.5-flash-lite`) to produce concise 3-sentence executive summaries of deterministic engine outputs.
- Automatically falls back to deterministic rule-based templates if the API key is missing or unreachable. Never hallucinates stock, prices, or dates.

### 7. Offline-First Field Incident Reporting
- Built using **Dexie.js** and browser **IndexedDB**.
- Floor operators can record stock damage or delivery discrepancies offline.
- Features sync statuses: `PENDING_SYNC`, `SYNCING`, `SYNCED`, `FAILED` with client UUID idempotency tokens.

---

## 👥 Hackathon Judge Credentials & Demo Roles

| Tenant Company | User Name | Role | Email | Password |
|---|---|---|---|---|
| **Apex Global Logistics** | Alex Chen | Operations Analyst | `analyst@apex.com` | `password123` |
| **Apex Global Logistics** | Sarah Jenkins | Supply Chain Manager | `manager@apex.com` | `password123` |
| **Apex Global Logistics** | Marco Rossi | Warehouse Operator | `warehouse@apex.com` | `password123` |
| **Apex Global Logistics** | Elena Rostova | Procurement Approver | `procurement@apex.com` | `password123` |
| **Apex Global Logistics** | David Vance | Administrator | `admin@apex.com` | `password123` |
| **Horizon Freight Corp (Tenant 2)** | Liam Murphy | Operations Analyst | `analyst@horizon.com` | `password123` |

> A **1-Click Demo Switcher** is present directly in the UI header and login screen for instantaneous role testing.

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
# Activate virtual environment
.\.venv\Scripts\activate

# Install dependencies (already present in repo virtualenv)
pip install -r requirements.txt

# Run database migration & seed benchmark synthetic data
python -m backend.seed

# Start backend server on port 8000
python main.py
```

### 3. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Run Vite development server
npm run dev

# Or build production unified bundle (served directly from FastAPI on port 8000)
npm run build
```

---

## 🧪 Automated Test Suite

Run the full system-level verification suite:
```bash
python test_direct.py
```

**Verified Test Results (10/10 Passed):**
1. `[1/10]` Login & bcrypt password verification.
2. `[2/10]` Multi-tenant cross-company data isolation (Apex records invisible to Horizon).
3. `[3/10]` Supply chain impact tracing (`Supplier → Shipment → WH → Inv → Orders`).
4. `[4/10]` Deterministic explainable risk ranking engine.
5. `[5/10]` Recovery Arena & Recovery Firewall feasibility validation.
6. `[6/10]` Separation of Duties (blocked self-approval).
7. `[7/10]` Manager authorization & shared reservation ledger.
8. `[8/10]` Simulated execution & idempotency (persistent inventory update without real-world API calls).
9. `[9/10]` Carrier webhook idempotency & duplicate rejection.
10. `[10/10]` CSV data bulk import with quarantine error reports.

---

## 📂 Repository File Structure

```
Sol/
├── backend/
│   ├── models.py            # SQLAlchemy relational models (Tenants, Supply Chain, Ledger)
│   ├── database.py          # SQLite connection, pragmas, and session management
│   ├── auth.py              # bcrypt password hashing, JWT bearer tokens, RBAC dependencies
│   ├── routes.py            # Complete REST endpoints with tenant scoping
│   ├── schemas.py           # Pydantic v2 schemas and validation contracts
│   ├── risk_engine.py       # Deterministic multi-factor risk scoring engine
│   ├── recovery_engine.py   # Recovery Arena, Deadline Auction & Recovery Firewall
│   ├── import_engine.py     # CSV/JSON bulk import and Carrier Webhook processor
│   ├── ai_service.py        # Google GenAI briefing with deterministic fallback
│   └── seed.py              # Realistic multi-tenant benchmark dataset generator
├── src/
│   ├── components/          # Navbar, Sidebar, RiskBadge, ConfirmModal, NotificationDrawer
│   ├── pages/               # 10 dedicated full-stack application pages
│   ├── services/
│   │   ├── api.js           # Centralized API client with JWT handling
│   │   └── offlineDb.js     # Dexie.js IndexedDB offline field report storage
│   ├── App.jsx              # React Router configuration & notification polling
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind custom styling and accessible status palettes
├── tests/
│   └── test_disruption_iq.py # Pytest automated test suite
├── test_direct.py           # Standalone end-to-end 10-test verification runner
├── main.py                  # FastAPI server entry point mounting React dist
├── config.py                # Environment and configuration settings
├── package.json             # Frontend dependencies & scripts
├── requirements.txt         # Backend Python dependencies
└── README.md                # Comprehensive documentation
```

---

## 🛡️ License & Acknowledgments
Built for practical logistics resilience demonstrations under the DisruptionIQ specifications. Prioritizes deterministic mathematical correctness, clean code, accessibility, and zero-leakage multi-tenant security.
