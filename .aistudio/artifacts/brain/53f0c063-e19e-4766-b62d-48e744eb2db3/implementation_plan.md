# Implementation Plan — POC-001: Product Signal Intelligence OS
## Stepwise Validation, Product Discovery, Multi-Product Research & Opportunity Allocation

### 1. Objective & Architectural Framing
The purpose of POC-001 is **not** to turn an SS304 hose-clamp calculator into a multi-product calculator.

The objective is to build the foundation of a **Product Signal Intelligence OS** that can:
- Continuously discover products and market signals;
- Collect and preserve market, supplier, buyer, seller, and competitive evidence;
- Convert observations into comparable commercial opportunities;
- Evaluate sourcing, D2C, B2B, and other applicable channels;
- Run deterministic economics and scenario simulations;
- Compare products and opportunities;
- Identify shared market drivers, relationships, and correlations;
- Construct baskets of opportunities;
- Allocate scarce research effort and capital toward the most attractive, evidence-supported opportunities.

**The SS304 Worm-Drive Hose Clamp (DIN 3017) is Opportunity Signal #001**, not the architectural center of the application. The architecture remains strictly product-agnostic.

---

### 2. Core Architectural Principle: Capability-Based Architecture
The application is **capability-based**, not product-workflow-based. The system does not assume that every product requires the same analytical stages.

```
PRODUCT
   ↓
PRODUCT CAPABILITY PROFILE
   ↓
Applicable Analytical Capabilities
   ↓
Evidence ➔ Opportunity ➔ Channel ➔ Economics ➔ Simulation
   ↓
Comparison ➔ Relationships ➔ Portfolio ➔ Strategy
```

#### Examples of Dynamic Capability Profiles:
- **SS304 Hose Clamp**: `OVERVIEW`, `SUPPLY`, `SPECIFICATION_QUALITY`, `OFFER_DESIGN`, `D2C`, `B2B`, `ECONOMICS`, `SIMULATION`, `RELATIONSHIPS`, `STRATEGY`.
- **Industrial Lubricant**: `OVERVIEW`, `SUPPLY`, `SPECIFICATION_QUALITY`, `COMPLIANCE`, `OFFER_DESIGN`, `B2B`, `D2C`, `ECONOMICS`, `SIMULATION`, `RELATIONSHIPS`, `STRATEGY`.
- **Simple Commodity Fastener**: `OVERVIEW`, `SUPPLY`, `OFFER_DESIGN`, `D2C`, `B2B`, `ECONOMICS`, `SIMULATION`, `RELATIONSHIPS`, `STRATEGY` (technical metallurgy QA omitted).

No capability appears merely because it existed in the original SS304 workflow.

---

### 3. Product vs. Opportunity
The system strictly distinguishes:

1. **PRODUCT**: *What is the thing?*
   - Examples: SS304 worm-drive hose clamp, SS316 marine clamp, DIN 933 bolt, Brass ball valve.
2. **OPPORTUNITY**: *Why might this product be commercially attractive in a particular context?*
   - Examples:
     - SS304 Hose Clamp ➔ Amazon 20-pack D2C opportunity (`opp_ss304_d2c_20p`).
     - SS304 Hose Clamp ➔ Industrial distributor / workshop B2B opportunity (`opp_ss304_b2b_dist`).
     - DIN 933 Bolt ➔ Kolkata local-supply arbitrage opportunity (`opp_din933_howrah_arb`).
     - Brass Ball Valve ➔ Low-MOQ B2B plumbing distribution opportunity (`opp_brass_valve_plumb`).

Every opportunity carries its own:
- Thesis & commercial hypothesis
- Channel (`D2C`, `B2B`, `HYBRID`)
- Buyer persona & use case
- Supply & competitive thesis
- Evidence & observations
- Economic parameters & simulations
- Operational risk & lifecycle status
- Actionable decision

---

### 4. Disciplined Stepwise Progression (One Step at a Time)

```
[STEP 1: Audit]
      ↓
[STEP 2: Fix]
      ↓
[STEP 3: Product + Opportunity Abstraction]
      ↓
[STEP 4: Product Universe + Capability System]
      ↓
[STEP 5: Opportunity Discovery]
      ↓
[STEP 6: Multi-Product / Relationship Analysis]
      ↓
[STEP 7: Persistence & Reproducibility]
      ↓
[STEP 8: Research Agents]
      ↓
[STEP 9: Strategy & Capital Allocation]
```

**Execution Rule**: Every step requires:
1. Implementation of scoped targets only;
2. Empirical verification and test execution;
3. Frozen-core regression testing where applicable;
4. Explicit reporting with test metrics and defect status;
5. User sign-off before proceeding to the next step.

---

### Step Details & Deliverables

#### STEP 1 — Complete Implementation Audit (COMPLETED)
- **Goal**: Read-only inspection of the actual repository and codebase.
- **Findings Delivered**:
  - Endpoint & module inventory (14 server endpoints + 11 UI stages).
  - Interactivity inventory across all interactive controls.
  - Data flow map from external signals to frozen core and downstream UI.
  - Unfinished work list & broken endpoint list.
  - Ask-satisfaction matrix against architecture requirements.
  - Verified frozen core: passes 6/6 Contract tests and 60/60 Adversarial tests with ₹0 drift.

#### STEP 2 — Fix Existing State, Connectivity & Broken Endpoints (NEXT)
- **Goal**: Repair existing application defects before introducing new abstractions.
- **Scope**:
  1. **Executive Control Tower**: Replace hardcoded `simulateCapitalRunway(50000, 20, 499, 14.50, 10)` in `ExecutiveControlTower.tsx` with active scenario parameters from `pipelineState`.
  2. **Supplier / Quote State Boundary**: Ensure scraped/ingested suppliers in `SupplyDemandGeoMap.tsx` automatically generate a valid `SupplierQuote` with full provenance, enabling downstream selection in `SupplierIntelligence.tsx` without lookup errors.
  3. **Google Drive Persistence Service**: Elevate `googleDriveService.ts` from an isolated sub-component in `AnalyticsWorkspace` to a reusable snapshot export service.
  4. **Regression Guarantee**: Re-run contract (6/6) and adversarial (60/60) test suites to verify ₹0 calculation drift against `FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN`.

#### STEP 3 — Product & Opportunity Abstraction
- **Goal**: Remove SS304-specific assumptions from the application domain model.
- **Scope**:
  - Define canonical entity types: `Product`, `ProductVariant`, `Pack`, `Category`, `Opportunity`, `Channel`, `BuyerSegment`, `Supplier`.
  - Canonical initial records: `prod_ss304_din3017_canonical` and `opp_ss304_howrah_arb_001`.
  - Migrate existing SS304 assumptions into normalized product/scenario records.
  - Verify exact mathematical equivalence: Old Scenario Output == New Product/Scenario Output.

#### STEP 4 — Product Universe & Capability System
- **Goal**: Replace rigid 10 fixed stages with dynamic Product Capability Profiles.
- **Scope**:
  - Seed initial product records: SS304 Hose Clamp, SS316 Marine Clamp, High-Tensile Hex Bolt DIN 933, Brass Ball Valve.
  - Implement Product Capability Profile mapping (`SUPPLY`, `SPECIFICATION_QUALITY`, `COMPLIANCE`, `OFFER_DESIGN`, `D2C`, `B2B`, `ECONOMICS`, `SIMULATION`, `RELATIONSHIPS`, `STRATEGY`).
  - Contextual navigation rendering only applicable capabilities per product.
  - Product isolation testing: Mutating Product B does not touch Product A.

#### STEP 5 — Opportunity Discovery Layer
- **Goal**: Make Opportunity a first-class citizen upstream of product modeling.
- **Scope**:
  - Add top-level `OPPORTUNITY DISCOVERY` workspace.
  - Surface commercial signals: supplier/marketplace price spreads, fragmented sellers, low MOQ, high review velocity.
  - Implement explainable Opportunity Ranking with multi-dimensional scoring and `DATA INSUFFICIENT` guards.
  - Opportunity lifecycle: `DISCOVERED` ➔ `RESEARCHING` ➔ `SIMULATING` ➔ `VALIDATING` ➔ `PILOT` ➔ `ACTIVE` (or `REJECTED`, `PAUSED`, `WATCH`).

#### STEP 6 — Multi-Product Research, Market Surveillance & Product Thesis Engine (COMPLETED)
- **Goal**: Evolve POC-001 into a continuous, multi-product opportunity research platform with mandatory adversarial counter-analysis, market surveillance, and dynamic thesis revision.
- **Scope & Deliverables Delivered**:
  1. **Generic Product Universe**: Multi-product entity catalog (`SS304 Hose Clamp [THESIS_FORMED]`, `Brass Ball Valve [RESEARCHING]`, `Terracotta Diya [CANDIDATE]`, `LED Fairy Lights [ACTIVE_MONITORING]`, `DIN 933 Hex Bolt [EVIDENCE_ACCUMULATING]`).
  2. **Evidence Graph & Provenance**: Strict chain from `Source` ➔ `Observation` ➔ `Claim` ➔ `Hypothesis` ➔ `Adversarial Counter-Analysis` ➔ `Structured Product Thesis`.
  3. **Continuous Market Surveillance**: Append-only time-series observations tracking marketplace prices, supplier quotes, review complaints, and raw material indices.
  4. **Mandatory Adversarial Counter-Analysis**: Every bull hypothesis countered by independent bear-case analysis testing fatal flaws.
  5. **Dynamic Structured Product Thesis**: Structured thesis format with read-only outputs from `FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN`.
  6. **Section 20 Core Experiment**: Injected +28% Nickel price surge dynamically revised thesis from `PURSUE` ➔ `VALIDATE_FURTHER`, decreased confidence from 88% to 52%, and logged audit event.
  7. **Cross-Product Factor Analysis & Differential Economics**: Macro factor sensitivities with `DATA INSUFFICIENT` statistical guardrails and side-by-side differential margin decomposition.
  8. **Human Decision Gate**: Commercial decision buttons (`PURSUE`, `VALIDATE_FURTHER`, `REJECT`, `MONITOR`) with audit sign-off fields.
  9. **Verification Suite**: 9/9 automated tests passing with ₹0 calculation drift.

#### STEP 7 — Persistence, Reproducibility & Archival Durability
- **Goal**: Multi-tier persistence architecture.
- **Scope**:
  - Operational store: Firestore (`firebase-applet-config.json`).
  - Client resilience: Local cache / IndexedDB fallback.
  - Durable archive: Google Drive versioned snapshot bundles (`manifest.json`, `schema.json`, `products.json`, `observations.jsonl`, `scenarios.json`, `simulations.json`).
  - Simulation reproducibility: Historical simulations never change when live database updates.

#### STEP 8 — Research Agents
- **Goal**: Autonomous research agents feeding into the strict epistemic boundary.
- **Scope**:
  - Specialized agents: Discovery, Market Research, Supplier, Buyer/B2B, Competitive.
  - Underlying providers: Gemini 3.8 Flash (deep synthesis) + Groq (rapid extraction).
  - Strict boundary: `Raw Capture` ➔ `Normalized Observation` ➔ `Validation` ➔ `Approval` ➔ `Active Scenario`.
  - Zero agent writes directly to financial state.

#### STEP 9 — Strategy & Capital Allocation Control Tower
- **Goal**: Executive decision layer for research effort and capital allocation.
- **Scope**:
  - Synthesize opportunities, evidence quality, and market risks.
  - Actionable recommendation verbs: `RESEARCH`, `SOURCE`, `TEST`, `SCALE`, `MOVE_TO_B2B`, `BUILD_BASKET`, `PAUSE`, `REJECT`.
  - Deterministic constrained capital allocation solver for ₹50,000 / ₹1,00,000 / ₹5,00,000 budgets respecting MOQ, safety stock, and supplier concentration.

---

### 5. Frozen Financial Core Invariant
The epistemic boundary remains strictly invariant throughout all steps:

```
OBSERVATION
    ↓
INTELLIGENCE REGISTRY
    ↓
CANDIDATE PARAMETER
    ↓
USER / SYSTEM APPROVAL
    ↓
ACTIVE SCENARIO PARAMETER
    ↓
FROZEN FINANCIAL ENGINE (v1.0.0-FROZEN)
    ↓
DECISION
```
- No agent or LLM may calculate or mutate financial state.
- No raw observation may directly alter calculation parameters without approved promotion.
- ₹0 calculation drift maintained across all versions.
