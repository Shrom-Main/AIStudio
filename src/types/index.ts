/**
 * Industrial Consumables Distribution Engine — Types
 * POC-001: SS304 Worm-Drive Hose Clamps (DIN 3017)
 */

export type ProvenanceType =
  | 'ACTUAL_INTERNAL'
  | 'SUPPLIER_QUOTED'
  | 'DIRECT_OBSERVATION'
  | 'EXTERNALLY_SOURCED'
  | 'AGENT_OBSERVED'
  | 'ESTIMATE'
  | 'ASSUMPTION'
  | 'SCENARIO'
  | 'SYNTHETIC'
  | 'MODEL_GENERATED';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type ObservationSourceType =
  | 'MARKETPLACE'
  | 'MAP'
  | 'DIRECT'
  | 'SUPPLIER'
  | 'PUBLIC_LISTING'
  | 'DIRECTORY'
  | 'GOVERNMENT_GEM';

export type ObservationEntityType =
  | 'SUPPLIER'
  | 'SKU'
  | 'BUSINESS'
  | 'COMPETITOR'
  | 'CUSTOMER'
  | 'CLUSTER';

export interface IntelligenceObservation {
  id: string;
  source_type: ObservationSourceType;
  source_name: string;
  source_url?: string;
  source_record_id?: string;
  observed_at: string;
  collected_at: string;
  entity_type: ObservationEntityType;
  entity_name: string;
  category: string;
  subcategory: string;
  location: string;
  latitude?: number;
  longitude?: number;
  attribute: string;
  value: number | string | boolean;
  unit?: string;
  currency?: string;
  confidence: ConfidenceLevel;
  provenance: ProvenanceType;
  collection_method: 'MANUAL_ENTRY' | 'CSV_IMPORT' | 'API_CONNECTOR' | 'RESEARCH_AGENT' | 'WEB_GROUNDING';
  agent_id?: string;
  raw_reference?: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  notes?: string;
}

export interface ResearchTask {
  task_id: string;
  name: string;
  objective: string;
  target_entities: string[];
  source_targets: string[];
  geographic_scope: string;
  created_at: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'PAUSED' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  last_run?: string;
  next_run?: string;
  agent_config?: {
    frequency_hours: number;
    depth: 'SURFACE' | 'DEEP';
    schema_fields: string[];
  };
  output_schema: string;
}

export interface SKUProduct {
  id: string;
  sku_code: string;
  product_family: string;
  size_range: string;
  material_grade: string; // e.g. SS304 (DIN 1.4301 / W4)
  standard: string; // e.g. DIN 3017
  band_width_mm: number;
  band_thickness_mm: number;
  pack_size: number;
  unit_weight_g: number;
  package_weight_g: number;
  package_dimensions_cm: { length: number; width: number; height: number };
  active_supplier_id: string;
  status: 'TEST' | 'PROMISING' | 'SCALE' | 'OPTIMISE' | 'NEGOTIATE' | 'KILL';
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  city?: string;
  state?: string;
  coordinates?: { lat: number; lng: number };
  type: 'MANUFACTURER' | 'TRADER' | 'UNKNOWN';
  contact_person: string;
  phone: string;
  email: string;
  lead_time_days: number;
  payment_terms: string; // e.g. "30% Advance, 70% against BL / Dispatch"
  private_label_capability: boolean;
  custom_packaging: boolean;
  existing_marketplace_presence: boolean;
  material_claims: string;
  certifications: string[];
  mtc_availability: boolean;
  xrf_pmi_willingness: boolean;
  sample_status: 'SAMPLE_APPROVED' | 'SAMPLE_PENDING_QA' | 'REJECTED' | 'NOT_REQUESTED';
  defect_rate_pct: number;
  on_time_delivery_pct: number;
  price_stability_score: number; // 0-100
  notes: string;
  verified_status?: 'VERIFIED_AUDITED' | 'GST_ACTIVE' | 'PENDING_PHYSICAL_AUDIT';
  monthly_capacity_units?: number;
  gstin?: string;
}

export interface SupplierQuote {
  id: string;
  supplier_id: string;
  sku_id: string;
  quoted_price_inr: number;
  moq_units: number;
  quoted_date: string;
  valid_until: string;
  inbound_freight_per_unit: number;
  qa_cost_per_unit: number;
  packaging_cost_per_unit: number;
  wastage_allowance_pct: number;
  gst_rate_pct: number;
  provenance: ProvenanceType;
  confidence: ConfidenceLevel;
}

export interface QABatch {
  id: string;
  batch_id: string;
  supplier_id: string;
  sku_id: string;
  quantity: number;
  inspection_date: string;
  material_claim: string;
  xrf_result: {
    chromium_pct: number; // SS304 standard: 18.0 - 20.0%
    nickel_pct: number;   // SS304 standard: 8.0 - 10.5%
    molybdenum_pct: number;
    manganese_pct: number;
    carbon_pct: number;
  };
  pmi_pass: boolean;
  measured_band_thickness_mm: number;
  measured_band_width_mm: number;
  measured_clamp_range: string;
  screw_inspection: 'OK' | 'DEFECTIVE' | 'LOOSE_FIT';
  housing_inspection: 'OK' | 'CRACKED' | 'BURR_PRESENT';
  torque_test_nm: number; // Target >= 4.5 Nm for DIN 3017
  corrosion_test_result: 'PASS_72H_SALT_SPRAY' | 'SURFACE_RUST_DETECTED' | 'NOT_TESTED';
  sample_size: number;
  accepted_quantity: number;
  rejected_quantity: number;
  qa_status: 'PASS' | 'CONDITIONAL' | 'FAIL' | 'PENDING';
  failure_reason?: string;
  inspector: string;
}

export interface AmazonFeeAssumptions {
  scenario_name: 'Conservative' | 'Base' | 'Optimistic';
  referral_fee_pct: number; // e.g. 8.5%
  closing_fee_inr: number; // e.g. 25
  fba_pick_pack_inr: number; // e.g. 28
  weight_handling_fee_inr: number; // e.g. 35
  storage_per_unit_inr: number; // e.g. 6
  gst_on_marketplace_fees_pct: number; // 18%
  ppc_per_order_inr: number;
  return_rate_pct: number;
  refund_loss_rate_pct: number;
  damaged_inventory_allowance_pct: number;
  effective_date: string;
  source_notes: string;
}

export interface SKUCommercialCalculation {
  sku_id: string;
  pack_size: number;
  asp_inr: number;
  supplier_unit_price: number;
  inbound_freight_unit: number;
  qa_cost_unit: number;
  packaging_cost_unit: number;
  landed_cogs_per_unit: number;
  landed_cogs_per_order: number;
  amazon_total_fees_per_order: number;
  ppc_per_order: number;
  return_loss_per_order: number;
  total_cost_to_serve: number;
  net_contribution_per_order: number;
  net_contribution_per_unit: number;
  contribution_margin_pct: number;
  break_even_asp: number;
  max_allowable_ppc: number;
  max_supplier_unit_price: number;
  max_acceptable_return_rate_pct: number;
  monthly_contribution_5_orders_day: number;
  monthly_contribution_10_orders_day: number;
  monthly_contribution_20_orders_day: number;
  monthly_contribution_50_orders_day: number;
  cash_required_for_moq: number;
}

export interface B2BCustomer {
  id: string;
  company_name: string;
  contact_person: string;
  industry: 'HVAC' | 'PLUMBING' | 'AUTOMOTIVE' | 'MARINE' | 'IRRIGATION' | 'MAINTENANCE' | 'OEM' | 'DISTRIBUTOR';
  location: string;
  city?: string;
  state?: string;
  coordinates?: { lat: number; lng: number };
  first_touch_source: 'AMAZON_ORDER' | 'INDIAMART_ENQUIRY' | 'DIRECT_OUTREACH' | 'TRADE_REFERRAL';
  amazon_order_history_count: number;
  estimated_annual_consumption_units: number;
  direct_b2b_status: 'PROSPECT' | 'ENQUIRY_RECEIVED' | 'QUOTED' | 'ACTIVE_ACCOUNT' | 'DORMANT';
  average_order_value_inr: number;
  order_frequency_days: number;
  gross_contribution_margin_pct: number;
  opportunity_score: number; // 0-100
  flag_notes: string;
  next_follow_up: string;
  phone?: string;
  email?: string;
  gstin?: string;
  preferred_credit_days?: number;
  verified_status?: 'VERIFIED_BUYER' | 'CREDIT_APPROVED' | 'GST_CONFIRMED';
}

export type MapEntityRole = 'SELLER' | 'BUYER';

export interface GeoEntity {
  id: string;
  role: MapEntityRole;
  name: string;
  category: string;
  location: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  contactPerson: string;
  phone: string;
  email?: string;
  verificationStatus: string;
  score: number;
  metrics: {
    priceOrTargetInr?: number;
    volumeOrCapacity?: number;
    materialGrade?: string;
    leadOrCreditDays?: number;
    moq?: number;
    marginPct?: number;
  };
  notes?: string;
  originalEntity: Supplier | B2BCustomer;
}

export type BottleneckType =
  | 'CAPITAL'
  | 'SUPPLIER_MOQ'
  | 'INVENTORY'
  | 'DEMAND'
  | 'AMAZON'
  | 'PPC'
  | 'PACKAGING'
  | 'QA'
  | 'LOGISTICS'
  | 'B2B_COLLECTION'
  | 'SUPPLIER_CAPACITY';

export interface CapitalCycleResult {
  cycle_number: number;
  starting_cash: number;
  deployed_procurement: number;
  inbound_and_prep_cost: number;
  total_cash_outflow: number;
  units_procured: number;
  gross_sales: number;
  marketplace_fees_paid: number;
  ppc_spend: number;
  returns_deduction: number;
  net_cash_recovered: number;
  cycle_contribution: number;
  ending_cash: number;
  cash_reconciliation_delta: number;
  opening_inventory_units: number;
  purchased_units: number;
  sold_units: number;
  damaged_units: number;
  closing_inventory_units: number;
  closing_inventory_value: number;
  inventory_reconciliation_delta: number;
  cumulative_profit: number;
  cycle_duration_days: number;
  working_capital_required: number;
  floating_capital_peak: number;
  limiting_bottleneck?: BottleneckType;
  bottleneck_reason?: string;
}

export interface XIRRResult {
  xirr_pct: number | null;
  status: 'CONVERGED' | 'NEGATIVE' | 'UNDEFINED';
  notes: string;
}

export interface FinancialIdentitySummary {
  revenue: number;
  cogs: number;
  gross_profit: number;
  marketplace_fees_and_direct: number;
  contribution: number;
  operating_expenses: number | null; // null = DATA REQUIRED
  ebitda: number | null;             // null = DATA REQUIRED
  depreciation: number | null;       // null = DATA REQUIRED
  interest: number | null;           // null = DATA REQUIRED
  pbt: number | null;                // null = DATA REQUIRED
  tax: number | null;                // null = DATA REQUIRED
  pat: number | null;                // null = DATA REQUIRED
}

export interface CapitalLeakageItem {
  id: string;
  category: 'PPC_OVERSPEND' | 'EXCESS_RETURNS' | 'EXCESS_INVENTORY' | 'POOR_SUPPLIER_PRICING' | 'FREIGHT_INEFFICIENCY' | 'MOQ_OVERBUYING' | 'IDLE_CASH';
  title: string;
  monthly_leakage_inr: number;
  potential_recovered_capital_inr: number;
  benchmark_rule: string;
  recommended_remedy: string;
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
}

export interface ActionRequiredItem {
  id: string;
  category: 'QA' | 'ECONOMICS' | 'INVENTORY' | 'SUPPLIER' | 'MARKETPLACE' | 'B2B' | 'MANUFACTURING';
  issue: string;
  evidence: string;
  recommended_action: string;
  expected_impact: string;
  action_verb: 'BUY' | 'TEST' | 'SCALE' | 'NEGOTIATE' | 'HOLD' | 'KILL' | 'MOVE_TO_B2B' | 'MANUFACTURING_REVIEW';
  urgency: 'HIGH' | 'MEDIUM' | 'ROUTINE';
}

export interface MakeVsBuyModel {
  annual_demand_units: number;
  monthly_demand_units: number;
  supplier_landed_cost_unit: number;
  expected_manufacturing_cost_unit: number;
  tooling_capex_inr: number;
  equipment_press_capex_inr: number;
  monthly_labour_inr: number;
  monthly_electricity_inr: number;
  scrap_rate_pct: number;
  monthly_rent_maintenance_inr: number;
  cost_of_capital_pct: number;
  minimum_efficient_scale_units_year: number;
  annual_savings_inr: number;
  payback_period_months: number;
  roi_pct: number;
  break_even_volume_units: number;
  capacity_utilization_pct: number;
  demand_certainty_score: number; // 0-100
  recommendation: 'CONTINUE_SOURCING' | 'MANUFACTURING_JUSTIFIED';
  reasoning: string;
}

export * from './contract';
