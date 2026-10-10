/**
 * POC-001 Financial Engine Contract & Research Boundary
 * Strict separation of:
 * 1. Externally Observed Information (Raw Observations)
 * 2. Intelligence Registry (Normalized Store)
 * 3. Parameter / Assumption Formulation (Epistemic Bindings)
 * 4. Deterministic Financial Engine (Frozen Core - Pure Math)
 * 5. Commercial Decision Engine (Threshold Rules)
 */

import {
  AmazonFeeAssumptions,
  BottleneckType,
  CapitalCycleResult,
  CapitalLeakageItem,
  ConfidenceLevel,
  MakeVsBuyModel,
  ProvenanceType,
  SKUCommercialCalculation,
  XIRRResult
} from './index';

/**
 * Epistemic classification of input data
 */
export type EpistemicStatus =
  | 'GROUND_TRUTH_INTERNAL'    // Verified internal financial/warehouse records
  | 'SUPPLIER_QUOTATION'       // Formal quotation from verified supplier
  | 'FIELD_OBSERVATION'        // Direct physical or manual observation
  | 'DIRECT_OBSERVATION'       // Direct observation (alias per validation spec)
  | 'EXTERNAL_PUBLISHED'       // Public market listing, official fee card
  | 'ESTIMATE_CALIBRATED'      // Engineering or freight estimate
  | 'EXPLICIT_ASSUMPTION'      // Working assumption (e.g. return loss rate)
  | 'SCENARIO_PARAMETER'       // What-if scenario parameter (Conservative/Optimistic)
  | 'SYNTHETIC_BENCHMARK';     // Model-generated benchmark

/**
 * A bound parameter with full provenance and lineage
 */
export interface BoundParameter<T = number | string | boolean> {
  key: string;
  label: string;
  value: T;
  unit?: string;
  epistemic_status: EpistemicStatus;
  provenance: ProvenanceType;
  confidence: ConfidenceLevel;
  source_observation_id?: string;
  source_description?: string;
  is_assumption: boolean;
  notes?: string;
}

/**
 * Provenance Lineage Summary of an calculation
 */
export interface ProvenanceLineage {
  total_inputs: number;
  actuals_count: number;
  quoted_count: number;
  assumptions_count: number;
  estimates_count: number;
  scenario_count: number;
  evidence_quality_score: number; // 0 to 100 based on proportion of verified actuals/quotes vs assumptions
  epistemic_truth_score?: number; // Deprecated alias for evidence_quality_score
  lineage_breakdown: {
    label: string;
    value: string | number;
    epistemic_status: EpistemicStatus;
    provenance: ProvenanceType;
    is_assumption: boolean;
  }[];
}

/**
 * Adversarial Red-Team Test Evaluation Types
 */
export interface AdversarialTestResult {
  id: string;
  category: string;
  name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'DATA_REQUIRED';
  details?: string;
}

export interface AdversarialReport {
  timestamp: string;
  engine_version: string;
  executive_verdict: 'PASS — FROZEN CORE VALIDATED' | 'PASS WITH WARNINGS' | 'FAIL — DEFECTS REMAIN';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  warning_tests: number;
  results: AdversarialTestResult[];
}

/**
 * Frozen Financial Engine Contract Envelope
 * Guaranteed deterministic output with mathematical verification and lineage
 */
export interface ContractExecutionResult<T> {
  contract_version: string;
  execution_timestamp: string; // ISO string representing execution time
  is_deterministic: boolean;
  data: T;
  lineage: ProvenanceLineage;
  mathematical_verifications: {
    cash_reconciliation_exact: boolean;
    inventory_reconciliation_exact: boolean;
    accounting_identity_holds: boolean;
    max_reconciliation_drift: number;
  };
  contract_warning?: string;
}

/**
 * Contract Parameters for SKU Economics
 */
export interface SKUEconomicsContractInputs {
  sku_id: BoundParameter<string>;
  pack_size: BoundParameter<number>;
  target_asp: BoundParameter<number>;
  supplier_unit_price: BoundParameter<number>;
  package_weight_g: BoundParameter<number>;
  inbound_freight_unit: BoundParameter<number>;
  qa_cost_unit: BoundParameter<number>;
  packaging_cost_unit: BoundParameter<number>;
  labelling_warehousing_unit: BoundParameter<number>;
  wastage_pct: BoundParameter<number>;
  fee_assumptions: AmazonFeeAssumptions;
  fee_assumptions_provenance: ProvenanceType;
}

/**
 * Contract Parameters for Capital Runway Simulation
 */
export interface CapitalSimulationContractInputs {
  initial_capital: BoundParameter<number>;
  pack_size: BoundParameter<number>;
  target_asp: BoundParameter<number>;
  supplier_unit_price: BoundParameter<number>;
  orders_per_day: BoundParameter<number>;
  fee_assumptions: AmazonFeeAssumptions;
  max_cycles: BoundParameter<number>;
  supplier_moq: BoundParameter<number>;
  inbound_freight_unit: BoundParameter<number>;
  qa_cost_unit: BoundParameter<number>;
  packaging_cost_unit: BoundParameter<number>;
  labelling_warehousing_unit: BoundParameter<number>;
  wastage_pct: BoundParameter<number>;
}

/**
 * Formal Contract Verification Report
 */
export interface EngineAuditReport {
  timestamp: string;
  engine_version: string;
  audit_status: 'PASSED' | 'FAILED' | 'WARNING';
  tests_executed: number;
  tests_passed: number;
  test_results: {
    test_id: string;
    name: string;
    description: string;
    passed: boolean;
    details: string;
    drift: number;
  }[];
}

/**
 * Self-Contained Simulation Snapshot
 * Fully encapsulates all material inputs, cost assumptions, fee schedules,
 * provenance metadata, and versioning required for exact bitwise re-execution.
 */
export interface SelfContainedSnapshot {
  snapshot_id: string;
  engine_version: string;
  frozen_date: string;
  contract_version: string;
  timestamp: string;
  is_self_contained: true;
  inputs: {
    capital_inr: number;
    pack_size: number;
    asp_inr: number;
    supplier_price_unit_inr: number;
    orders_per_day: number;
    moq_units: number;
    package_weight_g: number;
  };
  cost_assumptions: {
    inbound_freight_unit_inr: number;
    qa_cost_unit_inr: number;
    packaging_cost_unit_inr: number;
    labelling_warehousing_unit_inr: number;
    scrap_wastage_pct: number;
  };
  fee_assumptions: AmazonFeeAssumptions;
  provenance_lineage: ProvenanceLineage;
  decision_rules: {
    kill_threshold_net_contribution: number;
    optimise_margin_pct_threshold: number;
    scale_margin_pct_threshold: number;
    scale_min_contribution_inr: number;
    b2b_min_pack_size: number;
  };
  outputs: {
    landed_cogs_per_order: number;
    amazon_total_fees_per_order: number;
    ppc_per_order: number;
    return_loss_per_order: number;
    net_contribution_per_order: number;
    contribution_margin_pct: number;
    gross_profit_per_order: number;
    bottleneck: BottleneckType;
    bottleneck_diagnosis: string;
    decision: string;
    rationale: string;
    cash_reconciliation_delta: number;
    inventory_reconciliation_delta: number;
    gross_profit_delta: number;
  };
}

