---
name: disruptioniq-unique-features
description: >-
  Comprehensive architectural guide and operational reference for DisruptionIQ's
  standout winning features beyond standard supply chain management tools: The Recovery
  Arena, Supply Chain Butterfly Effect Map, Uncomfortable Truth Engine, Recovery Regret
  Meter, The Deadline Auction, The Recovery Firewall, Disruption Fingerprint, Excel Pipeline
  Converter, and Offline-First Dexie.js Incident Synchronization.
---

# DisruptionIQ: Standout Features & Intelligent Decision Engines

This skill documents the advanced architectural innovations and proprietary decision engines built into **DisruptionIQ**, elevating it from a standard logistics monitoring dashboard into a high-consequence **Supply Chain Resilience & Coordinated Recovery Operating System**.

---

## 1. 🧠 The Recovery Arena — Simulate Before You Decide

### Concept & Purpose
Most logistics platforms simply display late shipments in a red card and suggest an action. **The Recovery Arena** treats supply chain recovery as a high-stakes simulation game where operations analysts and managers test the consequences of competing strategies before spending a single Rupee or moving a single pallet.

### Mathematical Framework & Multi-Objective Optimization
The Recovery Arena generates and benchmarks candidate recovery trajectories side-by-side against **Do Nothing**:

| Strategy Type | Action Type | Primary Trade-Off | Cost Profile |
| :--- | :--- | :--- | :--- |
| **`STOCK_TRANSFER`** | Inter-Depot Rebalancing | High speed, draws from regional reserves | Low to Medium (₹) |
| **`EXPEDITE_FREIGHT`** | Dedicated Air / Hotshot Courier | Recovers maximum transit hours | High Freight Surcharge (₹) |
| **`ALTERNATIVE_SUPPLIER`** | Secondary Procurement | Bypasses primary supplier bottleneck | High lead time (Re-qualification) |
| **`SPLIT_FULFILLMENT`** | Multi-Drop Staggered Delivery | Satisfies acute emergency portion first | Double handling overhead |
| **`DO_NOTHING`** | Zero Intervention | Preserves cash; guarantees customer SLA default | Massive Contract Penalties (₹) |

### Dynamic Objective Re-Ranking
The platform provides a manager decision selector that dynamically recalculates rankings and updates the `★ RECOMMENDED` badge:
1. **`🎯 Balanced Resilience`**: Optimizes cost-per-protected-order while minimizing residual disruption risk.
2. **`💰 Minimize Direct Cost`**: Prioritizes lowest financial expenditure out of pocket.
3. **`🛡️ Maximize Orders Protected`**: Zero customer order compromise; prioritizes tier-1 hospitals and critical assembly lines.
4. **`⚡ Fastest Delivery`**: Prioritizes minimum transit lead time regardless of cost premium.

### Evidence Ledger
Every generated plan is backed by a cryptographically verifiable **Evidence Ledger** in JSON format, capturing exact assumptions, transit hours saved, and cost breakdown formulas.

---

## 2. 🦋 Supply Chain Butterfly Effect Map

### Concept & Purpose
Judges and logistics executives often struggle to understand how an isolated upstream delay (e.g. a 48-hour customs sensor check at the Port of Antwerp) cascades across continents into an ICU medication shortage in Zurich. **The Butterfly Effect Engine** renders the topological and geographic propagation chain.

### 5-Stage Echelon Topological Trace
```
[ Upstream Supplier ]
       │ Dispatched on schedule
       ▼
[ Disrupted Transit Node ] ──> Port of Antwerp: 48h customs inspection hold
       │ Shipment #TRK-APX-8801 delayed
       ▼
[ Destination Warehouse ] ──> Frankfurt Central DC: Buffer depletes to 0 units in 18h
       │ Local usable stock shortfall
       ▼
[ Affected Inventory ] ──> Insulin Glargine 100U: 250 units committed vs 0 usable
       │ Severe contractual exposure
       ▼
[ Customer Commitments ] ──> University Hospital Zurich: ₹4,15,000/day SLA Default
```

### Real-World OpenStreetMap Geo-Cartography
* Uses public OpenStreetMap vector tile servers with zero commercial API keys and zero watermarks.
* Applies a high-contrast dark CSS inversion matrix (`filter: invert(100%) hue-rotate(180deg) brightness(82%) contrast(95%);`) to `.leaflet-tile-pane`, keeping route polylines and pulsing alert beacons in vibrant red and electric lime `#dcf836`.
* **Milan Recovery Line Toggle:** An interactive toggle on the map renders the green bypass trajectory from Milan Southern DC to Frankfurt, demonstrating spatial re-routing.

---

## 3. ⚠️ The Uncomfortable Truth Engine

### Concept & Purpose
Ordinary AI chatbots and analytics dashboards attempt to please the user by hallucinating optimistic recovery scenarios. DisruptionIQ introduces **The Uncomfortable Truth Engine**, which operates on strict deterministic physics and finite inventory math.

### Deterministic Constraint Verification
When physical warehouse stock, lead times, or transit velocities make complete recovery impossible, the system states the exact truth:
* **Shortage Quantification:** Explains why 220 usable units in Milan cannot satisfy a 250-unit demand without leaving 30 units short.
* **Physics & Lead Time Boundaries:** Flags that an alternative supplier in Munich with a 6-day lead time cannot solve a delivery due in 28 hours.
* **Cost Exposure:** Highlights the harsh financial default penalty (e.g. ₹24,90,000 in customer contract penalties if Do Nothing is selected).

---

## 4. 🔮 The Recovery Regret Meter

### Concept & Purpose
Solving one problem often triggers a secondary crisis elsewhere (e.g. pulling safety stock from Milan leaves Italian hospitals vulnerable to the next demand spike). **The Recovery Regret Meter** evaluates the downstream collateral damage of a proposed decision before approval.

### Scoring & Analysis
* **Regret Index (0% to 100%):**
  * `0% - 25% (Low Regret)`: Safe trade-off; critical emergency solved with ample remaining safety buffers.
  * `26% - 60% (Moderate Regret)`: Elevated financial premium or depleted discretionary budget.
  * `61% - 100% (High Regret)`: Extreme collateral damage; customer contract default or permanent trust impairment.
* **Sacrificed Inventory Metrics:** Displays exact units transferred and remaining buffer days at the source depot.
* **Secondary Order Exposure:** Warns whether other customer accounts drop below safe inventory thresholds.

---

## 5. ⚖️ The Deadline Auction (Scarcity Allocator)

### Concept & Purpose
When a delayed shipment leaves only 150 units available against 330 units of competing customer demand, a simple first-come-first-serve rule is catastrophic. **The Deadline Auction** applies constrained optimization to determine which customer orders receive scarce inventory.

### Configurable Allocation Policies
1. **Life-Safety & SLA Penalty Severity:**
   $$Score_i = (CriticalityWeight_i \times 0.5) + (DailyPenalty_i \times 0.3) + \left(\frac{1}{HoursUntilDue_i} \times 0.2\right)$$
   Prioritizes pediatric ICU hospitals and VIP production lines facing massive hourly shutdown penalties.
2. **Earliest Due Date First (EDF):**
   Prioritizes immediate deadlines regardless of contract size.
3. **Proportional Fair Share Quota:**
   Distributes available buffer proportionally across all active customer orders so no account suffers a complete stockout.

### Transparent Rationale Output
The auction produces a detailed decision ledger showing:
* **Winning Allocations:** 100% Demand satisfied with penalty averted in ₹.
* **Partial Allocations:** Partial fulfillment to prevent line shutdown.
* **Losing Allocations & Deficit:** Explains why secondary accounts lost out and triggers automated backup sourcing notifications.

---

## 6. 🛡️ The Recovery Firewall

### Concept & Purpose
In fast-moving logistics operations, two analysts frequently attempt to allocate the same remaining warehouse stock to resolve different disruptions. **The Recovery Firewall** serves as an operational safety gate.

### Real Usable Stock Calculation
$$\text{Truly Usable Stock} = \text{Physical Count} - \text{Firewall Reserved} - \text{Damaged / Quarantined} - \text{Expired Lots}$$

### Cross-Disruption Reservation Locking
* Before an analyst can request plan approval, the Firewall verifies that usable stock $\ge$ required quantity.
* Upon manager authorization, the Firewall creates an `InventoryReservation` record locking the allocated units.
* If a competing recovery plan attempts to draw from the same stock, the Firewall instantly blocks it with an `INVENTORY_CONFLICT` status and forces alternative routing.

---

## 7. 🔍 Disruption Fingerprint (Pattern Recognition)

### Concept & Purpose
Logistics bottlenecks are rarely one-off flukes. **Disruption Fingerprint** analyzes historical telemetry to detect recurring carrier, lane, and port failure patterns.

### Operational Application
* Identifies carrier volatility (e.g. *4th customs hold this quarter with TransEuro Logistics at Port of Antwerp*).
* Computes carrier reliability indexes and average clearance durations.
* Feeds empirical probability into risk scoring algorithms to differentiate transient delays from systemic operational failures.

---

## 8. 📊 Excel & Multi-Format Data Pipeline Converter

### Concept & Purpose
Logistics teams work in Excel spreadsheets (`.xlsx`, `.xls`, `.csv`). DisruptionIQ features an integrated **Data Pipeline Converter** (`/converter`):
* **Drag-and-Drop Ingestion:** Accepts native Excel spreadsheets up to 50MB.
* **In-Browser Sheet Parsing:** Extracts sheets, headers, and rows without external server dependencies.
* **Universal Blob Exporters:** 1-click **Download as CSV** (with UTF-8 Byte Order Mark for Microsoft Excel compatibility) and **Download as JSON**.
* **Direct Database Ingestion:** Imports validated rows directly into the tenant's SQLite inventory database with automatic quarantine of corrupt rows.

---

## 9. 📴 Offline-First Field Reporting (Dexie.js & IndexedDB)

### Concept & Purpose
Warehouse operators and dock workers frequently operate in refrigerated cold-rooms or basement depots with zero cellular connectivity.
* **Client-Side Storage:** Built on Dexie.js wrapping the browser's IndexedDB.
* **Sync Lifecycle States:** `PENDING_SYNC` → `SYNCING` → `SYNCED` / `FAILED`.
* **Optimistic Local UI:** Incidents are captured instantly with photo metadata and local timestamps, and automatically reconcile with the central FastAPI server when connectivity resumes.

---

## 10. 🔒 Multi-Tenant Cryptographic Isolation & Separation of Duties

### Enterprise Governance Enforcements
* **Tenant Scoping:** Every single database table is indexed by `company_id`. The tenant identity is extracted exclusively from the authenticated JWT bearer token and verified on every read, update, import, and simulation.
* **Separation of Duties:** Built into `backend/auth.py`. If an Operations Analyst drafts a recovery plan, the backend rejects any approval attempt from that same user ID with `HTTP 403 Forbidden` (`Separation of duties violation: You cannot approve a recovery plan that you authored`).
