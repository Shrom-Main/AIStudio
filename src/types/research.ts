/**
 * POC-001: Product Signal Intelligence OS
 * Step 6: Category-Agnostic Multi-Product Research, Market Surveillance & Product Thesis Engine
 * 
 * Strict Epistemic Boundaries:
 * 1. Category is metadata, not architecture. The system covers D2C, B2B, Festive, Industrial, Home, Electrical, etc.
 * 2. Signal Discovery is the real primitive (Price anomaly, Demand spike, Review cluster, Cluster arbitrage, etc.).
 * 3. Commercial Archetypes unify diverse products sharing the same economic DNA.
 * 4. Thesis Support Score / Evidence Strength replaces pseudo-probabilistic "confidence".
 * 5. Historical Thesis Versions are strictly immutable (v1 -> v2 created as new record, v1 never mutated).
 * 6. Observed signals (LME Nickel = $20,800/t) are separated from derived scenario assumptions (+₹3.20/unit).
 * 7. Frozen Financial Core (v1.0.0-FROZEN) is strictly read-only.
 */

import { ParameterEpistemicClass } from './models';

// ============================================================================
// 1. Broad Channels & Commercial Archetypes
// ============================================================================

export type CommercialChannel =
  | 'D2C'
  | 'B2B'
  | 'MARKETPLACE'
  | 'RETAIL'
  | 'DISTRIBUTOR'
  | 'EVENTS_WEDDING'
  | 'INSTITUTIONAL'
  | 'EXPORT'
  | 'SECONDARY_SURPLUS'
  | 'HYBRID';

export type CommercialArchetype =
  | 'SEASONAL_D2C_VISUAL'          // High seasonality, low manufacturing complexity, visual merchandising, high D2C markup (Diyas, Candles, Lights)
  | 'CLUSTER_MRO_STANDARDIZED'     // Local manufacturing cluster, poor digital distribution, standardized SKU, fragmented B2B/D2C demand (SS Clamps, Valves, Fasteners)
  | 'TECHNICAL_COMPLIANCE'         // High compliance (BIS, CE), warranty/return sensitivity, import substitution (Circuit breakers, Safety switches)
  | 'COMMODITY_PACKAGING_ARBITRAGE'// Bulk inward break-bulk packaging, transport efficiency, price-sensitive wholesale
  | 'DISCOVERY_UNCLASSIFIED';

// ============================================================================
// 2. Cleanly Segregated Lifecycle Concepts (No Single Overloaded Enum)
// ============================================================================

/** Lifecycle of the Research Investigation Case */
export type ResearchCaseStatus =
  | 'IN_QUEUE'
  | 'ACTIVE_INVESTIGATION'
  | 'ADVERSARIAL_REVIEW'
  | 'COMPLETED'
  | 'SUSPENDED';

/** Lifecycle status of a specific Thesis Version */
export type ThesisVersionStatus =
  | 'DRAFT'
  | 'ACTIVE_SUPPORTED'
  | 'UNDER_REVISION'
  | 'REJECTED'
  | 'ARCHIVED';

/** Executive commercial decision recommendation */
export type ThesisDecision =
  | 'PURSUE'
  | 'VALIDATE_FURTHER'
  | 'REJECT'
  | 'MONITOR';

export type EvidencePolarity = 'SUPPORTING' | 'COUNTER' | 'NEUTRAL';

export type SurveillanceFrequency =
  | 'ONCE'
  | 'DAILY'
  | 'WEEKLY'
  | 'EVENT_TRIGGERED'
  | 'MANUAL';

export type SurveillanceTriggerType =
  | 'PRICE_SPIKE_OR_DROP'
  | 'COMPETITOR_COUNT_CHANGE'
  | 'REVIEW_SENTIMENT_SHIFT'
  | 'NEW_SUPPLIER_DETECTED'
  | 'RAW_MATERIAL_SHIFT'
  | 'MARKETPLACE_FEE_CHANGE'
  | 'DEMAND_SIGNAL_SHIFT'
  | 'THESIS_SUPPORT_DROP'
  | 'CONTRADICTORY_EVIDENCE';

export type ResearchAgentDomain =
  | 'DEMAND'
  | 'COMPETITION'
  | 'PRICING'
  | 'SOURCING'
  | 'RAW_MATERIALS'
  | 'MARKETPLACE_ECONOMICS'
  | 'REVIEWS_CUSTOMER_PAIN'
  | 'LOGISTICS'
  | 'REGULATORY_COMPLIANCE'
  | 'ADVERSARIAL_BEAR';

// ============================================================================
// 3. Evidence Graph Primitives (Traceability Chain)
// ============================================================================

export interface ResearchClaim {
  claim_id: string;
  product_id: string;
  statement: string;
  domain: ResearchAgentDomain;
  polarity: EvidencePolarity;
  observation_ids: string[];
  /** Decision-support metric: 0-100 evidence strength, NOT statistical probability */
  evidence_strength_score: number;
  verified: boolean;
  notes?: string;
  created_at: string;
}

export interface ResearchHypothesis {
  hypothesis_id: string;
  product_id: string;
  title: string;
  thesis_statement: string;
  commercial_rationale: string;
  supporting_claim_ids: string[];
  counter_claim_ids: string[];
  status: 'FORMED' | 'TESTING' | 'SUPPORTED' | 'DISPROVEN' | 'INSUFFICIENT_DATA';
  created_at: string;
  updated_at: string;
}

export interface AdversarialAnalysis {
  analysis_id: string;
  product_id: string;
  hypothesis_id: string;
  bull_case: {
    summary: string;
    key_drivers: string[];
    evidence_ids: string[];
    thesis_support_score: number; // 0-100
  };
  bear_case: {
    summary: string;
    key_vulnerabilities: string[];
    counter_evidence_ids: string[];
    critical_risks: string[];
    threat_severity_score: number; // 0-100
  };
  reconciled_delta: string;
  verdict: 'BULL_DOMINANT' | 'BALANCED_UNCERTAIN' | 'BEAR_DOMINANT' | 'DATA_INSUFFICIENT';
  created_at: string;
}

// ============================================================================
// 4. Continuous Market Surveillance & Append-Only Time Series
// ============================================================================

export type EvidenceType =
  | 'MARKETPLACE_PRICE'
  | 'COMPETITOR_COUNT'
  | 'REVIEW_RATING'
  | 'REVIEW_VOLUME'
  | 'SUPPLIER_QUOTE'
  | 'RAW_MATERIAL_INDEX'
  | 'FREIGHT_INDEX'
  | 'FEE_SCHEDULE'
  | 'REGULATORY_NOTICE'
  | 'SEARCH_VOLUME_INDEX'
  | 'DATA_UNAVAILABLE';

export interface SurveillanceObservation {
  observation_id: string;
  product_id: string;
  source_id: string;
  source_name: string;
  source_url?: string;
  evidence_type: EvidenceType;
  observed_at: string;
  retrieval_timestamp: string;
  metric_name: string;
  metric_value: number | string | null;
  metric_unit?: string;
  provenance: 'API' | 'PUBLIC_DOCUMENT' | 'AUDITED_DIRECTORY' | 'SCRAPED_PERMITTED' | 'USER_MANUAL';
  epistemic_status: 'FACT' | 'ESTIMATE' | 'UNVERIFIED' | 'STALE' | 'DATA_UNAVAILABLE';
  notes?: string;
}

export interface SurveillanceTriggerEvent {
  event_id: string;
  product_id: string;
  trigger_type: SurveillanceTriggerType;
  description: string;
  triggered_at: string;
  previous_value?: string | number;
  new_value?: string | number;
  action_taken: string;
  automated_run_id?: string;
}

// ============================================================================
// 5. Immutable Structured Product Thesis & Version History
// ============================================================================

export interface ThesisFactorLinkage {
  factor_name: string;
  /** Explicitly distinguishes raw external observation from derived scenario assumption */
  kind: 'OBSERVED_SIGNAL' | 'SCENARIO_DERIVED_HYPOTHESIS';
  observed_evidence_id?: string;
  observed_value?: string | number;
  assumed_impact_description: string;
  calculation_formula?: string; // e.g. "Scenario assumption: +₹3.20/u per +28% LME shift"
}

export interface StructuredProductThesis {
  thesis_id: string;
  product_id: string;
  product_name: string;
  category: string;
  primary_archetype: CommercialArchetype;
  applicable_channels: CommercialChannel[];
  
  /** Strictly immutable version tracking */
  version: number;
  previous_version_id?: string;
  version_status: ThesisVersionStatus;
  
  decision: ThesisDecision;
  /** Explicitly named decision support metric (0-100), NOT statistical probability */
  thesis_support_score: number;
  evidence_strength_grade: 'STRONG_EVIDENCE' | 'MODERATE_EVIDENCE' | 'SPECULATIVE' | 'INSUFFICIENT_DATA';
  
  opportunity_statement: string;
  why_now: {
    narrative: string;
    evidence_ids: string[];
  };
  customer_problem: {
    narrative: string;
    evidence_ids: string[];
  };
  market_structure: {
    narrative: string;
    evidence_ids: string[];
  };
  supply_advantage: {
    narrative: string;
    evidence_ids: string[];
  };
  observed_competition: {
    competitor_count: number;
    narrative: string;
    evidence_ids: string[];
  };
  pricing_envelope: {
    observed_asp_min: number;
    observed_asp_max: number;
    recommended_target_asp: number;
    evidence_ids: string[];
  };
  
  /** Transparent linkage between observed signals and derived scenario assumptions */
  factor_linkages: ThesisFactorLinkage[];

  /** Read-only outputs computed by the frozen financial core */
  financial_economics: {
    supplier_unit_price: number;
    landed_cogs_per_unit: number;
    pack_size: number;
    marketplace_fees_per_order: number;
    net_contribution_per_order: number;
    net_margin_pct: number;
    capital_runway_days: number;
    calculation_authority: 'FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN';
  };

  operational_complexity: {
    grade: 'LOW' | 'MEDIUM' | 'HIGH';
    notes: string;
    packaging_fragility: boolean;
    compliance_qa_required: boolean;
  };
  
  bull_case: {
    summary: string;
    evidence_ids: string[];
  };
  bear_case: {
    summary: string;
    counter_evidence_ids: string[];
    fatal_flaws_tested: string[];
  };
  
  unresolved_questions: string[];
  required_validation_experiments: string[];
  
  contradictory_evidence_events: {
    event_id: string;
    timestamp: string;
    finding: string;
    impact_on_thesis: string;
  }[];
  
  human_signoff?: {
    approved_by: string;
    approved_at: string;
    notes: string;
  };
  
  /** Indicates provisional/illustrative seed thesis awaiting field verification */
  is_provisional?: boolean;
  provisional_notice?: string;
  
  /** Linked governed evaluations produced by the model registry */
  governed_evaluations?: GovernedResearchEvaluation[];
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 6. Cross-Product Relationships & Rigorous Statistical Guardrails
// ============================================================================

export type MacroFactorTag =
  | 'STAINLESS_STEEL'
  | 'BRASS_COPPER'
  | 'CLAY_CERAMICS'
  | 'SOY_WAX_FRAGRANCE'
  | 'COPPER_ELECTRONICS'
  | 'ROAD_FREIGHT'
  | 'AMAZON_HARDWARE_FEES'
  | 'AMAZON_HOME_FEE'
  | 'FESTIVAL_SEASONALITY'
  | 'FRAGILITY_RETURNS'
  | 'BIS_SAFETY_COMPLIANCE'
  | 'IMPORT_TARIFFS';

export interface ProductFactorExposure {
  product_id: string;
  product_name: string;
  archetype: CommercialArchetype;
  factor: MacroFactorTag;
  sensitivity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  
  /** Rigorous statistical guardrails */
  evidence_count: number;
  sample_size: number;
  date_range_days: number;
  missing_points_count: number;
  methodology: string;
  outliers_detected: boolean;
  data_sufficient: boolean;
  /** Explicit statistical invariant */
  correlation_does_not_equal_causation: true;
  caveats: string[];
}

export interface DifferentialEconomicComparison {
  baseline_product_id: string;
  target_product_id: string;
  baseline_name: string;
  target_name: string;
  baseline_archetype: CommercialArchetype;
  target_archetype: CommercialArchetype;
  variances: {
    unit_purchase_cost_delta: number;
    packaging_cost_delta: number;
    freight_delta: number;
    marketplace_fee_delta: number;
    target_asp_delta: number;
    gross_margin_pct_delta: number;
    capital_velocity_delta_orders_per_month: number;
  };
  drivers: string[];
  data_sufficient: boolean;
  statistical_notes: string;
  
  /** Model-driven evaluation metadata */
  evaluation_status?: 'EVALUATED_VIA_MODEL_REGISTRY' | 'NOT_EVALUABLE' | 'DATA_INSUFFICIENT';
  governed_evaluations?: GovernedResearchEvaluation[];
  missing_requirements?: string[];
}

// ============================================================================
// 7. Governed Research Evaluation Contract (Model Registry Integration)
// ============================================================================

export interface GovernedModelInputBinding {
  symbol: string;
  name: string;
  value: any;
  unit: string;
  epistemic_class: ParameterEpistemicClass;
  source_reference?: string;
  is_assumption: boolean;
  is_missing: boolean;
}

export interface GovernedResearchEvaluation {
  evaluation_id: string;
  case_or_opportunity_id: string;
  target_entity_id: string;
  model_id: string;
  model_version: string;
  model_name: string;
  status: 'SUCCESS' | 'DATA_INSUFFICIENT' | 'NOT_EVALUABLE' | 'FAILED';
  input_bindings: GovernedModelInputBinding[];
  explicit_assumptions: string[];
  missing_inputs: string[];
  outputs: Record<string, any>;
  warnings: string[];
  execution_notes: string;
  evaluated_at: string;
  reproducibility_reference: string;
}

// ============================================================================
// 8. Auditable Contradiction Evaluation Rules & Commercial Profiles
// ============================================================================

export interface ContradictionEvaluationRule {
  rule_id: string;
  rule_name: string;
  trigger_type: SurveillanceTriggerType;
  applicability: {
    target_entity_ids?: string[];
    archetypes?: CommercialArchetype[];
    categories?: string[];
    factors?: MacroFactorTag[];
  };
  required_evidence: {
    evidence_type: EvidenceType;
    metric_name: string;
    threshold_condition: string;
    evaluator: (metricValue: number | string) => boolean;
  };
  resulting_action: {
    recommended_decision: ThesisDecision;
    score_penalty: number;
    score_adjustment_rationale: string;
    requires_human_review: boolean;
    unresolved_conflict_description: string;
  };
}

export interface ProductCommercialEconomicProfile {
  product_id: string;
  name: string;
  category: string;
  archetype: CommercialArchetype;
  channels: CommercialChannel[];
  pack_size: number;
  asp: number;
  unit_purchase_cost: number;
  packaging_cost_per_order: number;
  inbound_freight_per_order: number;
  channel_fees_per_order: number;
  monthly_velocity_orders: number;
  sample_size_n: number;
  data_sufficient: boolean;
  transit_breakage_rate_pct?: number;
  distributor_margin_pct?: number;
  retailer_margin_pct?: number;
  super_stockist_margin_pct?: number;
  drivers: string[];
  statistical_notes: string;
  provenance_sources: Record<string, string>;
  assumptions: string[];
}

