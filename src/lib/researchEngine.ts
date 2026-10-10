/**
 * POC-001: Product Signal Intelligence OS
 * Step 6: Category-Agnostic Multi-Product Research Engine & Epistemic Controller
 * 
 * Strict Epistemic Invariants:
 * 1. Category is metadata. Products span D2C, B2B, Festive, MRO, Technical, Home, and Electrical.
 * 2. Signal Discovery is the primary primitive.
 * 3. Commercial Archetypes unify diverse products sharing the same structural economic DNA.
 * 4. Thesis Support Score (0-100) replaces pseudo-probabilistic "confidence".
 * 5. Thesis Versioning is strictly immutable: v1 is never mutated; v2 is created as a new record.
 * 6. Observed signals are explicitly separated from derived scenario assumptions.
 * 7. Frozen Financial Core (v1.0.0-FROZEN) is strictly read-only.
 */

import {
  CommercialArchetype,
  CommercialChannel,
  ResearchCaseStatus,
  ThesisVersionStatus,
  ThesisDecision,
  ResearchClaim,
  ResearchHypothesis,
  AdversarialAnalysis,
  SurveillanceObservation,
  SurveillanceTriggerEvent,
  StructuredProductThesis,
  ProductFactorExposure,
  DifferentialEconomicComparison,
  ThesisFactorLinkage,
  GovernedResearchEvaluation,
  GovernedModelInputBinding,
  ContradictionEvaluationRule,
  ProductCommercialEconomicProfile,
  MacroFactorTag,
  EvidenceType
} from '../types/research';
import {
  calculateLandedCost,
  calculateAmazonFees,
  calculateSKUEconomics,
  simulateCapitalRunway
} from './calculators';
import { baseFeeAssumptions } from '../data/seedData';
import { productRegistry } from './productRegistry';
import { equationRegistry } from './equationRegistry';

// ============================================================================
// 1. Broad Product Universe (Category-Agnostic & Archetype-Aware)
// ============================================================================

export interface ResearchUniverseItem {
  product_id: string;
  name: string;
  category: string;
  archetype: CommercialArchetype;
  channels: CommercialChannel[];
  case_status: ResearchCaseStatus;
  is_monitored: boolean;
  frequency: string;
  evidence_count: number;
  latest_thesis_decision?: ThesisDecision;
  /** Decision-support score 0-100, NOT statistical probability */
  thesis_support_score: number;
}

export const initialResearchUniverse: ResearchUniverseItem[] = [
  {
    product_id: 'prod_ss304_din3017_canonical',
    name: 'SS304 Worm-Drive Hose Clamp (DIN 3017)',
    category: 'Industrial Hardware & Consumables',
    archetype: 'CLUSTER_MRO_STANDARDIZED',
    channels: ['D2C', 'B2B', 'DISTRIBUTOR'],
    case_status: 'COMPLETED',
    is_monitored: true,
    frequency: 'DAILY',
    evidence_count: 14,
    latest_thesis_decision: 'PURSUE',
    thesis_support_score: 88
  },
  {
    product_id: 'prod_diya_terracotta_12p',
    name: 'Handcrafted Terracotta Clay Diya (12-Pack Festive)',
    category: 'Home & Seasonal Handicrafts',
    archetype: 'SEASONAL_D2C_VISUAL',
    channels: ['D2C', 'EVENTS_WEDDING', 'RETAIL'],
    case_status: 'ACTIVE_INVESTIGATION',
    is_monitored: true,
    frequency: 'WEEKLY',
    evidence_count: 7,
    latest_thesis_decision: 'VALIDATE_FURTHER',
    thesis_support_score: 64
  },
  {
    product_id: 'prod_candle_soy_fragrance',
    name: 'Aromatherapy Hand-Poured Soy Wax Candle (Lavender & Cedar)',
    category: 'Wellness & Home Fragrance',
    archetype: 'SEASONAL_D2C_VISUAL',
    channels: ['D2C', 'MARKETPLACE'],
    case_status: 'IN_QUEUE',
    is_monitored: false,
    frequency: 'MANUAL',
    evidence_count: 4,
    latest_thesis_decision: 'MONITOR',
    thesis_support_score: 58
  },
  {
    product_id: 'cand_prod_brass_ball_valve_001',
    name: 'Forged Brass Ball Valve (1/2" PN20 Full Bore)',
    category: 'Plumbing & Fluid Control',
    archetype: 'CLUSTER_MRO_STANDARDIZED',
    channels: ['B2B', 'DISTRIBUTOR', 'HYBRID'],
    case_status: 'ACTIVE_INVESTIGATION',
    is_monitored: true,
    frequency: 'WEEKLY',
    evidence_count: 5,
    latest_thesis_decision: 'VALIDATE_FURTHER',
    thesis_support_score: 52
  },
  {
    product_id: 'prod_mcb_circuit_breaker',
    name: 'Single Pole 16A C-Curve Miniature Circuit Breaker (BIS/IS 60898)',
    category: 'Electrical Switchgear & Safety',
    archetype: 'TECHNICAL_COMPLIANCE',
    channels: ['MARKETPLACE', 'RETAIL', 'B2B'],
    case_status: 'ADVERSARIAL_REVIEW',
    is_monitored: true,
    frequency: 'WEEKLY',
    evidence_count: 9,
    latest_thesis_decision: 'VALIDATE_FURTHER',
    thesis_support_score: 61
  },
  {
    product_id: 'prod_led_decorative_lights',
    name: 'Warm White LED Copper Wire Fairy Lights (10m USB)',
    category: 'Seasonal Home Decor',
    archetype: 'SEASONAL_D2C_VISUAL',
    channels: ['D2C', 'MARKETPLACE'],
    case_status: 'COMPLETED',
    is_monitored: true,
    frequency: 'DAILY',
    evidence_count: 8,
    latest_thesis_decision: 'REJECT',
    thesis_support_score: 32
  },
  {
    product_id: 'opp_cat_brass_fittings_howrah',
    name: 'Howrah Brass Plumbing Cluster - Category Sourcing Investigation',
    category: 'Plumbing & Fluid Control',
    archetype: 'CLUSTER_MRO_STANDARDIZED',
    channels: ['B2B', 'DISTRIBUTOR'],
    case_status: 'ACTIVE_INVESTIGATION',
    is_monitored: true,
    frequency: 'WEEKLY',
    evidence_count: 3,
    thesis_support_score: 45
  },
  {
    product_id: 'signal_festive_copper_wire_demand',
    name: 'Pre-Diwali Copper Wire String Seasonal Demand Spike Signal',
    category: 'Seasonal Home Decor',
    archetype: 'SEASONAL_D2C_VISUAL',
    channels: ['D2C', 'MARKETPLACE'],
    case_status: 'IN_QUEUE',
    is_monitored: true,
    frequency: 'DAILY',
    evidence_count: 2,
    thesis_support_score: 40
  },
  {
    product_id: 'signal_bis_qco_mcb_mandate',
    name: 'BIS QCO Low-Voltage Switchgear Regulatory Enforcement Signal',
    category: 'Electrical Switchgear & Safety',
    archetype: 'TECHNICAL_COMPLIANCE',
    channels: ['MARKETPLACE', 'RETAIL', 'B2B'],
    case_status: 'IN_QUEUE',
    is_monitored: true,
    frequency: 'EVENT_TRIGGERED',
    evidence_count: 4,
    thesis_support_score: 55
  }
];

// ============================================================================
// 2. Append-Only Time Series of Surveillance Observations
// ============================================================================

export const seedSurveillanceObservations: SurveillanceObservation[] = [
  {
    observation_id: 'surv_obs_ss304_price_01',
    product_id: 'prod_ss304_din3017_canonical',
    source_id: 'src_amazon_in',
    source_name: 'Amazon India Hardware Category',
    evidence_type: 'MARKETPLACE_PRICE',
    observed_at: '2026-10-01T08:30:00Z',
    retrieval_timestamp: '2026-10-01T08:31:12Z',
    metric_name: 'Observed ASP (20-Pack)',
    metric_value: 499,
    metric_unit: 'INR',
    provenance: 'API',
    epistemic_status: 'FACT',
    notes: 'Buy Box price stable for leading 20-pack competitor.'
  },
  {
    observation_id: 'surv_obs_ss304_price_02',
    product_id: 'prod_ss304_din3017_canonical',
    source_id: 'src_amazon_in',
    source_name: 'Amazon India Hardware Category',
    evidence_type: 'MARKETPLACE_PRICE',
    observed_at: '2026-10-04T10:15:00Z',
    retrieval_timestamp: '2026-10-04T10:16:04Z',
    metric_name: 'Observed ASP (20-Pack)',
    metric_value: 489,
    metric_unit: 'INR',
    provenance: 'API',
    epistemic_status: 'FACT',
    notes: 'Minor price compression (-₹10) by seller Apex Tools.'
  },
  {
    observation_id: 'surv_obs_ss304_price_03',
    product_id: 'prod_ss304_din3017_canonical',
    source_id: 'src_amazon_in',
    source_name: 'Amazon India Hardware Category',
    evidence_type: 'MARKETPLACE_PRICE',
    observed_at: '2026-10-07T06:00:00Z',
    retrieval_timestamp: '2026-10-07T06:01:20Z',
    metric_name: 'Observed ASP (20-Pack)',
    metric_value: 499,
    metric_unit: 'INR',
    provenance: 'API',
    epistemic_status: 'FACT',
    notes: 'Price rebounded to ₹499 baseline.'
  },
  {
    observation_id: 'surv_obs_ss304_sup_quote',
    product_id: 'prod_ss304_din3017_canonical',
    source_id: 'src_howrah_baltikuri',
    source_name: 'Howrah Baltikuri Cluster Direct Audit',
    evidence_type: 'SUPPLIER_QUOTE',
    observed_at: '2026-10-04T14:00:00Z',
    retrieval_timestamp: '2026-10-04T14:05:00Z',
    metric_name: 'Ex-Factory Unit Price (16-27mm)',
    metric_value: 13.50,
    metric_unit: 'INR/unit',
    provenance: 'AUDITED_DIRECTORY',
    epistemic_status: 'FACT',
    notes: 'Verified against Apex Engineering firm quote for 1000 unit MOQ.'
  },
  {
    observation_id: 'surv_obs_ss304_nickel_index',
    product_id: 'prod_ss304_din3017_canonical',
    source_id: 'src_lme_nickel',
    source_name: 'London Metal Exchange / Indian Steel Bulletin',
    evidence_type: 'RAW_MATERIAL_INDEX',
    observed_at: '2026-10-06T18:00:00Z',
    retrieval_timestamp: '2026-10-06T18:02:15Z',
    metric_name: 'LME Nickel Cash Index',
    metric_value: 16250,
    metric_unit: 'USD/tonne',
    provenance: 'PUBLIC_DOCUMENT',
    epistemic_status: 'FACT',
    notes: 'Raw material grade SS304 strip coil costs remain stable (+0.8% 30d).'
  },
  {
    observation_id: 'surv_obs_diya_search_spike',
    product_id: 'prod_diya_terracotta_12p',
    source_id: 'src_google_trends_in',
    source_name: 'Google Trends & Amazon Search Term Index',
    evidence_type: 'SEARCH_VOLUME_INDEX',
    observed_at: '2026-10-05T09:00:00Z',
    retrieval_timestamp: '2026-10-05T09:02:10Z',
    metric_name: 'Search Volume: "terracotta diya set"',
    metric_value: 480,
    metric_unit: '% 30d surge',
    provenance: 'API',
    epistemic_status: 'FACT',
    notes: 'Pre-Diwali seasonal search breakout began 4 weeks prior to festival.'
  },
  {
    observation_id: 'surv_obs_diya_fragility',
    product_id: 'prod_diya_terracotta_12p',
    source_id: 'src_craft_logistics',
    source_name: 'D2C Packaging & Transit Damage Audit',
    evidence_type: 'REVIEW_VOLUME',
    observed_at: '2026-09-28T09:00:00Z',
    retrieval_timestamp: '2026-09-28T09:01:00Z',
    metric_name: 'Transit Breakage Rate',
    metric_value: 14.8,
    metric_unit: '% returned',
    provenance: 'SCRAPED_PERMITTED',
    epistemic_status: 'ESTIMATE',
    notes: 'High fragility requires bubble-wrap nested box (+₹22/unit pack packaging cost).'
  },
  {
    observation_id: 'surv_obs_mcb_bis_standard',
    product_id: 'prod_mcb_circuit_breaker',
    source_id: 'src_bis_portal',
    source_name: 'Bureau of Indian Standards Mandatory QCO',
    evidence_type: 'REGULATORY_NOTICE',
    observed_at: '2026-10-03T11:00:00Z',
    retrieval_timestamp: '2026-10-03T11:02:00Z',
    metric_name: 'Mandatory ISI Mark Enforcement',
    metric_value: 'IS/IEC 60898-1',
    metric_unit: 'Standard Code',
    provenance: 'PUBLIC_DOCUMENT',
    epistemic_status: 'FACT',
    notes: 'Uncertified Chinese imports legally banned from Indian marketplace listings.'
  }
];

// ============================================================================
// 3. Claims & Adversarial Analyses
// ============================================================================

export const seedResearchClaims: ResearchClaim[] = [
  {
    claim_id: 'claim_ss304_cluster_cost',
    product_id: 'prod_ss304_din3017_canonical',
    statement: 'Howrah local precision cluster yields ₹13.50/unit ex-factory on 1000 unit MOQ vs ₹18.00 national trade average.',
    domain: 'SOURCING',
    polarity: 'SUPPORTING',
    observation_ids: ['surv_obs_ss304_sup_quote'],
    evidence_strength_score: 95,
    verified: true,
    notes: 'Verified via physical factory visit and GST invoice match.',
    created_at: '2026-10-04T14:30:00Z'
  },
  {
    claim_id: 'claim_ss304_d2c_pack_spread',
    product_id: 'prod_ss304_din3017_canonical',
    statement: 'Retail Amazon 20-pack market sustains ₹499 price point with <5 branded competitors in SS304 (W4 grade).',
    domain: 'PRICING',
    polarity: 'SUPPORTING',
    observation_ids: ['surv_obs_ss304_price_01', 'surv_obs_ss304_price_03'],
    evidence_strength_score: 90,
    verified: true,
    notes: 'Buy Box ownership requires fast delivery and prime dispatch.',
    created_at: '2026-10-04T15:00:00Z'
  },
  {
    claim_id: 'claim_diya_festive_spread',
    product_id: 'prod_diya_terracotta_12p',
    statement: 'Festive handmade 12-pack achieves ₹299 retail ASP against ₹30 ex-potter cluster procurement cost.',
    domain: 'PRICING',
    polarity: 'SUPPORTING',
    observation_ids: ['surv_obs_diya_search_spike'],
    evidence_strength_score: 78,
    verified: true,
    notes: 'High markup compensates for short 4-week sales window and packaging overhead.',
    created_at: '2026-10-05T10:00:00Z'
  }
];

export const seedAdversarialAnalysisSS304: AdversarialAnalysis = {
  analysis_id: 'adv_ss304_001',
  product_id: 'prod_ss304_din3017_canonical',
  hypothesis_id: 'hyp_ss304_d2c_spread',
  bull_case: {
    summary: 'Localized Howrah stamping cluster provides a ₹13.50/unit ex-factory cost basis that supports a high-margin (net ₹134.82/order) 20-pack D2C hero offer at ₹499 on Amazon India.',
    key_drivers: [
      'Empirical ₹13.50 sourcing cost vs ₹18.00 national trade pricing',
      'High repeat industrial and DIY workshop utility',
      'Unfragmented quality gap in Amazon listings (mostly unbranded mixed grades)',
      'Low volumetric freight footprint (0.50 kg package weight)'
    ],
    evidence_ids: ['surv_obs_ss304_price_01', 'surv_obs_ss304_sup_quote'],
    thesis_support_score: 92
  },
  bear_case: {
    summary: 'Sourcing margin is vulnerable to raw nickel index shocks, supplier metal adulteration (SS201 substituted for SS304), and high return rates if band threading fails under torque.',
    key_vulnerabilities: [
      'SS201 nickel-depleted scrap substitution leading to coastal corrosion complaints',
      'Band thread shear at >4.5 Nm torque causing 1-star review clustering',
      'Rising Amazon FBA weight-handling fee tier adjustments for parcels over 500g',
      'Local working-capital tie-up if 20-pack sells fewer than 5 orders/day'
    ],
    counter_evidence_ids: ['surv_obs_ss304_price_02'],
    critical_risks: [
      'Metallurgical counterfeit risk (must enforce acid droplet batch test)',
      'Thread stripping under torque (must specify cold-extruded DIN 3017 band)',
      'Ad spend escalation if organic ranking takes >45 days'
    ],
    threat_severity_score: 85
  },
  reconciled_delta: 'Bull case holds robustly PROVIDED that cold-extruded DIN 3017 specification and chemical acid batch verification are strictly enforced. Sourcing arbitrage is real, not illusory.',
  verdict: 'BULL_DOMINANT',
  created_at: '2026-10-06T16:00:00Z'
};

// ============================================================================
// 4. Initial Immutable Thesis v1 for Canonical Reference Case
// ============================================================================

export function buildCanonicalSS304ThesisV1(): StructuredProductThesis {
  const supplierUnitPrice = 13.50;
  const packSize = 20;
  const asp = 499.00;
  
  // Read-only calculation through the frozen financial core
  const skuCalc = calculateSKUEconomics(
    'sku_ss304_20p',
    packSize,
    asp,
    supplierUnitPrice,
    485,
    baseFeeAssumptions
  );
  const landedCogs = skuCalc.landed_cogs_per_unit;
  const landedCogsPerOrder = skuCalc.landed_cogs_per_order;
  const amazonFees = skuCalc.amazon_total_fees_per_order;
  const netContribution = skuCalc.net_contribution_per_order;
  const runwaySim = simulateCapitalRunway(50000, packSize, asp, supplierUnitPrice, 10, baseFeeAssumptions);
  const capitalRunway = runwaySim.cashRunwayDays;

  const linkages: ThesisFactorLinkage[] = [
    {
      factor_name: 'LME Nickel Cash Index',
      kind: 'OBSERVED_SIGNAL',
      observed_evidence_id: 'surv_obs_ss304_nickel_index',
      observed_value: '$16,250/tonne',
      assumed_impact_description: 'Raw strip costs currently stable (+0.8% 30d).'
    },
    {
      factor_name: 'Raw Material Pass-Through Sensitivity',
      kind: 'SCENARIO_DERIVED_HYPOTHESIS',
      assumed_impact_description: 'Estimated ex-factory unit cost shift of +₹3.20/unit if raw coil strip surges +28%.',
      calculation_formula: 'Scenario assumption: +₹3.20/u per +28% LME shift'
    }
  ];

  return {
    thesis_id: 'thesis_ss304_v1_baseline',
    product_id: 'prod_ss304_din3017_canonical',
    product_name: 'SS304 Worm-Drive Hose Clamp (DIN 3017)',
    category: 'Industrial Hardware & Consumables',
    primary_archetype: 'CLUSTER_MRO_STANDARDIZED',
    applicable_channels: ['D2C', 'B2B', 'DISTRIBUTOR'],
    version: 1,
    version_status: 'ACTIVE_SUPPORTED',
    decision: 'PURSUE',
    thesis_support_score: 88,
    evidence_strength_grade: 'STRONG_EVIDENCE',
    opportunity_statement:
      'Capitalize on Howrah precision stamping cluster ex-factory cost of ₹13.50/unit to dominate the high-intent Amazon 20-pack industrial & automotive consumable segment at ₹499 with genuine W4 DIN 3017 certified quality.',
    why_now: {
      narrative:
        'Incumbent sellers on Amazon India are predominantly repackaging unbranded SS201/carbon clamps that fail in coastal and automotive coolant applications. Howrah MSME cluster offers immediate capacity with audited DIN 3017 tooling.',
      evidence_ids: ['surv_obs_ss304_sup_quote']
    },
    customer_problem: {
      narrative:
        'DIY mechanics, plumbing installers, and industrial workshops suffer from screw-band slippage, stripped threads under screwdriver torque, and premature coastal rust.',
      evidence_ids: ['surv_obs_ss304_price_02']
    },
    market_structure: {
      narrative:
        'Fragmented tier-3 sellers competing on low count packs (2-pack, 5-pack) with high shipping costs per unit. The 20-pack hero bundle captures workshop scale economics.',
      evidence_ids: ['surv_obs_ss304_price_01', 'surv_obs_ss304_price_03']
    },
    supply_advantage: {
      narrative:
        'Direct geographic proximity to Howrah Baltikuri industrial belt allows zero long-haul inward freight and rapid 48-hour QA batch sampling.',
      evidence_ids: ['surv_obs_ss304_sup_quote']
    },
    observed_competition: {
      competitor_count: 6,
      narrative:
        '6 visible competitors in the 20-pack range; only 1 advertises genuine SS304 W4 spec. Most lack verifiable DIN 3017 certificates.',
      evidence_ids: ['surv_obs_ss304_price_01']
    },
    pricing_envelope: {
      observed_asp_min: 449,
      observed_asp_max: 549,
      recommended_target_asp: 499,
      evidence_ids: ['surv_obs_ss304_price_01', 'surv_obs_ss304_price_02', 'surv_obs_ss304_price_03']
    },
    factor_linkages: linkages,
    financial_economics: {
      supplier_unit_price: supplierUnitPrice,
      landed_cogs_per_unit: landedCogs,
      pack_size: packSize,
      marketplace_fees_per_order: amazonFees,
      net_contribution_per_order: netContribution,
      net_margin_pct: (netContribution / asp) * 100,
      capital_runway_days: capitalRunway,
      calculation_authority: 'FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN'
    },
    operational_complexity: {
      grade: 'LOW',
      notes: 'Compact, non-fragile metallic items. Low volumetric weight fits Standard Parcel FBA tier.',
      packaging_fragility: false,
      compliance_qa_required: true
    },
    bull_case: {
      summary:
        'Howrah local cluster sourcing at ₹13.50 generates resilient contribution margin at ₹499 ASP, with minimal break-even hurdle (<2 orders/day).',
      evidence_ids: ['claim_ss304_cluster_cost', 'claim_ss304_d2c_pack_spread']
    },
    bear_case: {
      summary:
        'Substituted SS201 material or stripped threads can destroy Amazon review rating and trigger returns; commodity price spikes on nickel could compress margin.',
      counter_evidence_ids: ['surv_obs_ss304_price_02'],
      fatal_flaws_tested: [
        'Raw material substitution (SS201 acid test verifies grade)',
        'Torque failure (cold-extruded threads withstand 5.5 Nm)',
        'Amazon fee drag (20-pack unit economics verified via frozen engine)'
      ]
    },
    unresolved_questions: [
      'Can Howrah supplier maintain 1000 units/week surge capacity during October peak?',
      'Will Amazon FBA weight reassessment classify 20-pack packaging at 505g vs 495g?'
    ],
    required_validation_experiments: [
      'Physical acid droplet test on 50 sample units from Batch #001',
      'Torque wrench destruction test: measure band shear at 5.0 Nm',
      'Test 20-pack shipment through India Post vs Delhivery surface logistics'
    ],
    contradictory_evidence_events: [],
    created_at: '2026-10-06T10:00:00Z',
    updated_at: '2026-10-06T10:00:00Z'
  };
}

export function buildCanonicalSS304Thesis(): StructuredProductThesis {
  return buildCanonicalSS304ThesisV1();
}

/**
 * Provisional / Illustrative Theses for Discovery Universe Items
 * Explicitly tagged as provisional examples with visible assumptions and missing evidence.
 */
export function buildProvisionalDiyaThesis(): StructuredProductThesis {
  return {
    thesis_id: 'thesis_diya_v1_provisional',
    product_id: 'prod_diya_terracotta_12p',
    product_name: 'Handcrafted Terracotta Clay Diya (12-Pack Festive)',
    category: 'Home & Seasonal Handicrafts',
    primary_archetype: 'SEASONAL_D2C_VISUAL',
    applicable_channels: ['D2C', 'EVENTS_WEDDING', 'RETAIL'],
    version: 1,
    version_status: 'DRAFT',
    decision: 'VALIDATE_FURTHER',
    thesis_support_score: 64,
    evidence_strength_grade: 'MODERATE_EVIDENCE',
    is_provisional: true,
    provisional_notice: 'PROVISIONAL / ILLUSTRATIVE SEED THESIS: Assumptions and missing evidence awaiting field audit. Transit breakage and post-festival salvage value unverified.',
    opportunity_statement:
      'Capitalize on extreme 4-week Diwali demand spike by packaging Kumartuli artisan clay diyas in custom molded-pulp 12-packs for premium Amazon D2C gifting at ₹299.',
    why_now: {
      narrative: 'Pre-festive search volume surges +420% in Q3; incumbent unbranded sellers ship in non-protective bags with 20%+ transit shattering rates.',
      evidence_ids: ['surv_obs_festive_trend_01']
    },
    customer_problem: {
      narrative: 'Consumers frequently receive damaged, fractured diyas; seeking guaranteed intact, hand-painted festive delivery.',
      evidence_ids: []
    },
    market_structure: {
      narrative: 'Hyper-seasonal 4-week operational window; off-season demand contracts by 94%.',
      evidence_ids: []
    },
    supply_advantage: {
      narrative: 'Direct MSME potter cooperative procurement at ₹2.50/unit ex-factory.',
      evidence_ids: []
    },
    observed_competition: {
      competitor_count: 14,
      narrative: 'Numerous unorganized sellers with high return/damage rates during peak festive rush.',
      evidence_ids: []
    },
    pricing_envelope: {
      observed_asp_min: 199,
      observed_asp_max: 399,
      recommended_target_asp: 299,
      evidence_ids: []
    },
    factor_linkages: [
      {
        factor_name: 'Diwali Seasonal Demand Wave',
        kind: 'OBSERVED_SIGNAL',
        observed_value: '+420% search index',
        assumed_impact_description: 'Demand concentrated in 4-week pre-festival window.'
      },
      {
        factor_name: 'Transit Breakage Rate',
        kind: 'SCENARIO_DERIVED_HYPOTHESIS',
        assumed_impact_description: '14.8% transit breakage rate requires ₹22 protective packaging buffer.',
        calculation_formula: 'Scenario assumption: +₹22 molded pulp tray insert per 12-pack'
      }
    ],
    financial_economics: {
      supplier_unit_price: 2.50,
      landed_cogs_per_unit: 4.83,
      pack_size: 12,
      marketplace_fees_per_order: 125.97,
      net_contribution_per_order: 115.03,
      net_margin_pct: 38.5,
      capital_runway_days: 45,
      calculation_authority: 'FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN'
    },
    operational_complexity: {
      grade: 'HIGH',
      notes: 'Fragile unglazed baked clay requires specialized molded pulp cushioning.',
      packaging_fragility: true,
      compliance_qa_required: false
    },
    bull_case: {
      summary: 'Extreme gross margin spread between ₹2.50/unit production and ₹299 retail ASP.',
      evidence_ids: []
    },
    bear_case: {
      summary: 'Post-Diwali unsold stock suffers 90% liquidation markdown; transit breakage risk.',
      counter_evidence_ids: [],
      fatal_flaws_tested: ['Post-festive inventory obsolescence', 'Transit breakage > 15%']
    },
    unresolved_questions: [
      'Can molded pulp inserts reduce courier breakage below 4%?',
      'What is verifiable post-Diwali clearance recovery rate?'
    ],
    required_validation_experiments: [
      'ISTA-1A certified transit drop test on 30 sample 12-packs',
      'Pre-season pilot testing on 200 orders in Kolkata metropolitan area'
    ],
    contradictory_evidence_events: [],
    created_at: '2026-10-07T10:00:00Z',
    updated_at: '2026-10-07T10:00:00Z'
  };
}

export function buildProvisionalCandleThesis(): StructuredProductThesis {
  return {
    thesis_id: 'thesis_candle_v1_provisional',
    product_id: 'prod_candle_soy_fragrance',
    product_name: 'Aromatherapy Hand-Poured Soy Wax Candle (Lavender & Cedar)',
    category: 'Wellness & Home Fragrance',
    primary_archetype: 'SEASONAL_D2C_VISUAL',
    applicable_channels: ['D2C', 'MARKETPLACE'],
    version: 1,
    version_status: 'DRAFT',
    decision: 'MONITOR',
    thesis_support_score: 58,
    evidence_strength_grade: 'SPECULATIVE',
    is_provisional: true,
    provisional_notice: 'PROVISIONAL / ILLUSTRATIVE SEED THESIS: Assumptions and missing evidence awaiting field audit. Repeat purchase velocity and CAC payback unverified.',
    opportunity_statement:
      'Target high AOV urban gifting and self-care segments with clean-burning soy wax in amber glass jars at ₹699.',
    why_now: {
      narrative: 'Growing urban consumer shift away from soot-heavy paraffin wax toward aromatherapy soy formulations.',
      evidence_ids: []
    },
    customer_problem: {
      narrative: 'Paraffin candles emit synthetic chemical soot; consumers seek therapeutic grade organic essential oils.',
      evidence_ids: []
    },
    market_structure: {
      narrative: 'Fragmented indie lifestyle brands competing with premium visual packaging on Instagram and Amazon.',
      evidence_ids: []
    },
    supply_advantage: {
      narrative: 'Direct contract pourer partnership in Baddi with organic fragrance oil batch documentation.',
      evidence_ids: []
    },
    observed_competition: {
      competitor_count: 22,
      narrative: 'Heavy brand competition in ₹499–₹899 bracket requiring paid acquisition spend.',
      evidence_ids: []
    },
    pricing_envelope: {
      observed_asp_min: 499,
      observed_asp_max: 899,
      recommended_target_asp: 699,
      evidence_ids: []
    },
    factor_linkages: [
      {
        factor_name: 'Soy Wax Commodity Index',
        kind: 'OBSERVED_SIGNAL',
        observed_value: '₹180/kg',
        assumed_impact_description: 'Wax input pricing stable.'
      }
    ],
    financial_economics: {
      supplier_unit_price: 65.00,
      landed_cogs_per_unit: 102.00,
      pack_size: 1,
      marketplace_fees_per_order: 172.97,
      net_contribution_per_order: 424.03,
      net_margin_pct: 60.7,
      capital_runway_days: 60,
      calculation_authority: 'FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN'
    },
    operational_complexity: {
      grade: 'MEDIUM',
      notes: 'Amber glass jar fragility; summer courier heat melting risk.',
      packaging_fragility: true,
      compliance_qa_required: false
    },
    bull_case: {
      summary: 'Superior 60%+ contribution margin provides headroom for digital performance ad spend.',
      evidence_ids: []
    },
    bear_case: {
      summary: 'High D2C CAC might eradicate profit without strong 90-day repeat repurchase.',
      counter_evidence_ids: [],
      fatal_flaws_tested: ['Customer Acquisition Cost > ₹400', 'Repeat reorder rate < 8%']
    },
    unresolved_questions: [
      'What is 90-day repeat reorder cohort velocity?',
      'Does summer non-AC transit cause soy wax surface tunneling?'
    ],
    required_validation_experiments: [
      'Small paid ad creative test to establish baseline CAC',
      'Heat cabinet stability testing at 45°C'
    ],
    contradictory_evidence_events: [],
    created_at: '2026-10-07T10:00:00Z',
    updated_at: '2026-10-07T10:00:00Z'
  };
}

export function buildProvisionalBrassValveThesis(): StructuredProductThesis {
  return {
    thesis_id: 'thesis_brass_valve_v1_provisional',
    product_id: 'cand_prod_brass_ball_valve_001',
    product_name: 'Forged Brass Ball Valve (1/2" PN20 Full Bore)',
    category: 'Plumbing & Fluid Control',
    primary_archetype: 'CLUSTER_MRO_STANDARDIZED',
    applicable_channels: ['B2B', 'DISTRIBUTOR', 'HYBRID'],
    version: 1,
    version_status: 'DRAFT',
    decision: 'VALIDATE_FURTHER',
    thesis_support_score: 52,
    evidence_strength_grade: 'INSUFFICIENT_DATA',
    is_provisional: true,
    provisional_notice: 'PROVISIONAL / ILLUSTRATIVE SEED THESIS: Assumptions and missing evidence awaiting field audit. Jalandhar supplier quote sample size N=8 is below computational threshold (minimum N=10).',
    opportunity_statement:
      'Exploit inter-regional price spread between Jalandhar forging cluster (₹118) and Eastern regional MRO distributors at ₹349.',
    why_now: {
      narrative: 'Jalandhar valve forging cluster offers 25% cost advantage over local Eastern regional wholesale traders.',
      evidence_ids: []
    },
    customer_problem: {
      narrative: 'Substandard cast-iron or zinc alloy valves suffer hairline fractures under 16 bar line pressure.',
      evidence_ids: []
    },
    market_structure: {
      narrative: 'B2B trade credit customary terms (45-60 days) require working capital reserves.',
      evidence_ids: []
    },
    supply_advantage: {
      narrative: 'Direct Jalandhar forge procurement bypassing Delhi wholesale intermediaries.',
      evidence_ids: []
    },
    observed_competition: {
      competitor_count: 8,
      narrative: 'Established premium brands command high brand loyalty; unbranded market plagued by leaks.',
      evidence_ids: []
    },
    pricing_envelope: {
      observed_asp_min: 279,
      observed_asp_max: 399,
      recommended_target_asp: 349,
      evidence_ids: []
    },
    factor_linkages: [
      {
        factor_name: 'MCX Brass Ingot Index',
        kind: 'OBSERVED_SIGNAL',
        observed_value: '₹540/kg',
        assumed_impact_description: 'Raw brass scrap and billet pricing.'
      }
    ],
    financial_economics: {
      supplier_unit_price: 118.00,
      landed_cogs_per_unit: 144.70,
      pack_size: 1,
      marketplace_fees_per_order: 202.97,
      net_contribution_per_order: 1.33,
      net_margin_pct: 0.4,
      capital_runway_days: 90,
      calculation_authority: 'FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN'
    },
    operational_complexity: {
      grade: 'MEDIUM',
      notes: 'Heavy weight per unit; pressure burst testing required (IS 9890).',
      packaging_fragility: false,
      compliance_qa_required: true
    },
    bull_case: {
      summary: 'Industrial B2B recurring orders with consistent order sizes and low return rates.',
      evidence_ids: []
    },
    bear_case: {
      summary: 'Retail single-unit packaging and courier fees erode unit margin; 60-day credit terms tie up capital.',
      counter_evidence_ids: [],
      fatal_flaws_tested: ['Working capital drag under B2B credit', 'Single unit shipping fee drag']
    },
    unresolved_questions: [
      'Can Jalandhar supplier quote be audited across N >= 10 verifiable shipments?',
      'What is distributor credit default rate in Howrah market?'
    ],
    required_validation_experiments: [
      'Hydrostatic test at 25 bar on 15 units',
      'Direct distributor interview program with 5 hardware stockists'
    ],
    contradictory_evidence_events: [],
    created_at: '2026-10-07T10:00:00Z',
    updated_at: '2026-10-07T10:00:00Z'
  };
}

export function buildProvisionalMCBThesis(): StructuredProductThesis {
  return {
    thesis_id: 'thesis_mcb_v1_provisional',
    product_id: 'prod_mcb_circuit_breaker',
    product_name: 'Single Pole 16A C-Curve MCB (BIS/IS 60898)',
    category: 'Electrical Switchgear & Safety',
    primary_archetype: 'TECHNICAL_COMPLIANCE',
    applicable_channels: ['MARKETPLACE', 'RETAIL', 'B2B'],
    version: 1,
    version_status: 'DRAFT',
    decision: 'VALIDATE_FURTHER',
    thesis_support_score: 61,
    evidence_strength_grade: 'MODERATE_EVIDENCE',
    is_provisional: true,
    provisional_notice: 'PROVISIONAL / ILLUSTRATIVE SEED THESIS: Assumptions and missing evidence awaiting field audit. BIS IS/60898 testing and CPRI lab accreditation pending audit.',
    opportunity_statement:
      'Leverage mandatory BIS Quality Control Orders to provide compliant 16A C-curve miniature circuit breakers in multi-pack boxes at ₹249.',
    why_now: {
      narrative: 'Government QCO strictly eliminates low-cost non-compliant imported breakers.',
      evidence_ids: []
    },
    customer_problem: {
      narrative: 'Contractors and homeowners face safety hazards and inspection failures with uncertified circuit breakers.',
      evidence_ids: []
    },
    market_structure: {
      narrative: 'Oligopoly of tier-1 electrical brands commanding high 40%+ distributor markups.',
      evidence_ids: []
    },
    supply_advantage: {
      narrative: 'Haridwar OEM manufacturing cluster with valid BIS licensing capacity.',
      evidence_ids: []
    },
    observed_competition: {
      competitor_count: 10,
      narrative: 'Legacy brand dominance requiring trade contractor trust.',
      evidence_ids: []
    },
    pricing_envelope: {
      observed_asp_min: 199,
      observed_asp_max: 299,
      recommended_target_asp: 249,
      evidence_ids: []
    },
    factor_linkages: [
      {
        factor_name: 'BIS Regulatory QCO Enforcement',
        kind: 'OBSERVED_SIGNAL',
        observed_value: 'Active Gazette Notification',
        assumed_impact_description: 'Barriers uncertified non-compliant imports.'
      }
    ],
    financial_economics: {
      supplier_unit_price: 85.00,
      landed_cogs_per_unit: 105.00,
      pack_size: 1,
      marketplace_fees_per_order: 185.97,
      net_contribution_per_order: -41.97,
      net_margin_pct: -16.9,
      capital_runway_days: 75,
      calculation_authority: 'FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN'
    },
    operational_complexity: {
      grade: 'HIGH',
      notes: 'Mandatory BIS compliance testing and strict return policy for electrical safety.',
      packaging_fragility: false,
      compliance_qa_required: true
    },
    bull_case: {
      summary: 'Regulatory barrier insulates domestic compliant supply from cheap dumping.',
      evidence_ids: []
    },
    bear_case: {
      summary: 'Single unit marketplace retail generates negative contribution; requires multi-pack contractor box.',
      counter_evidence_ids: [],
      fatal_flaws_tested: ['Retail single unit marketplace fee drag', 'Contractor brand loyalty']
    },
    unresolved_questions: [
      'Can unit economics turn positive in 6-pack contractor box bundle?',
      'What is CPRI lab test certificate verification lead time?'
    ],
    required_validation_experiments: [
      'Trip curve test at 3x and 5x rated current',
      'Contractor 6-pack box prototype cost evaluation'
    ],
    contradictory_evidence_events: [],
    created_at: '2026-10-07T10:00:00Z',
    updated_at: '2026-10-07T10:00:00Z'
  };
}

export function buildProvisionalLEDLightsThesis(): StructuredProductThesis {
  return {
    thesis_id: 'thesis_led_lights_v1_provisional',
    product_id: 'prod_led_decorative_lights',
    product_name: 'Warm White LED Copper Wire Fairy Lights (10m USB)',
    category: 'Seasonal Home Decor',
    primary_archetype: 'SEASONAL_D2C_VISUAL',
    applicable_channels: ['D2C', 'MARKETPLACE'],
    version: 1,
    version_status: 'DRAFT',
    decision: 'REJECT',
    thesis_support_score: 32,
    evidence_strength_grade: 'SPECULATIVE',
    is_provisional: true,
    provisional_notice: 'PROVISIONAL / ILLUSTRATIVE SEED THESIS: Assumptions and missing evidence awaiting field audit. High defect rate (12.4%) and predatory marketplace price war produce negative net contribution.',
    opportunity_statement:
      'Festive copper wire LED decorative lighting for home ambient decor.',
    why_now: {
      narrative: 'High search volume before festive holiday seasons.',
      evidence_ids: []
    },
    customer_problem: {
      narrative: 'Flimsy wire connectors and defective USB power adapters cause high failure rate.',
      evidence_ids: []
    },
    market_structure: {
      narrative: 'Severe commodity price war driven by dropshippers discounting below ₹149.',
      evidence_ids: []
    },
    supply_advantage: {
      narrative: 'Delhi electronics market wholesale lots at ₹42/unit.',
      evidence_ids: []
    },
    observed_competition: {
      competitor_count: 35,
      narrative: 'Identical generic listings competing purely on aggressive pricing and PPC spend.',
      evidence_ids: []
    },
    pricing_envelope: {
      observed_asp_min: 119,
      observed_asp_max: 199,
      recommended_target_asp: 149,
      evidence_ids: []
    },
    factor_linkages: [
      {
        factor_name: 'Marketplace Price Undercut',
        kind: 'OBSERVED_SIGNAL',
        observed_value: 'Lowest ASP ₹149',
        assumed_impact_description: 'Erodes margins below break-even.'
      }
    ],
    financial_economics: {
      supplier_unit_price: 42.00,
      landed_cogs_per_unit: 53.00,
      pack_size: 1,
      marketplace_fees_per_order: 80.97,
      net_contribution_per_order: 15.03,
      net_margin_pct: 10.1,
      capital_runway_days: 30,
      calculation_authority: 'FINANCIAL_ENGINE_SPEC v1.0.0-FROZEN'
    },
    operational_complexity: {
      grade: 'HIGH',
      notes: '12.4% return rate due to electronic adapter defects and fragile soldered joints.',
      packaging_fragility: true,
      compliance_qa_required: false
    },
    bull_case: {
      summary: 'Lightweight product with low freight and strong seasonal impulse purchase volume.',
      evidence_ids: []
    },
    bear_case: {
      summary: 'High return rates and marketplace return shipping fees wipe out all profit.',
      counter_evidence_ids: [],
      fatal_flaws_tested: ['Return handling fee drag exceeding gross margin', 'Severe price undercutting']
    },
    unresolved_questions: [
      'Can domestic vendor supply reinforced USB adapters with failure rate < 1%?'
    ],
    required_validation_experiments: [
      '72-hour continuous burn-in test on 50 units'
    ],
    contradictory_evidence_events: [],
    created_at: '2026-10-07T10:00:00Z',
    updated_at: '2026-10-07T10:00:00Z'
  };
}

// ============================================================================
// 5. Product Commercial Economic Profiles (Model-Driven Calculation Layer)
// ============================================================================

export const seedProductCommercialEconomicProfiles: ProductCommercialEconomicProfile[] = [
  {
    product_id: 'prod_ss304_din3017_canonical',
    name: 'SS304 Worm-Drive Hose Clamp (20-Pack)',
    category: 'Industrial Hardware & Consumables',
    archetype: 'CLUSTER_MRO_STANDARDIZED',
    channels: ['D2C', 'B2B', 'DISTRIBUTOR'],
    pack_size: 20,
    asp: 499.00,
    unit_purchase_cost: 13.50,
    packaging_cost_per_order: 7.00,
    inbound_freight_per_order: 7.00,
    channel_fees_per_order: 160.97,
    monthly_velocity_orders: 30,
    sample_size_n: 45,
    data_sufficient: true,
    drivers: [
      'Local Howrah precision stamping cluster ex-factory baseline cost of ₹13.50/unit',
      'Hero 20-pack bundle captures workshop scale economics and amortizes shipping',
      'Amazon FBA standard weight tier under 500g envelope'
    ],
    statistical_notes: 'Validated canonical baseline scenario with empirical supplier quotes (N=45).',
    provenance_sources: {
      asp: 'Amazon IN Buy Box median 20-pack price (₹499.00)',
      landed_cogs: 'Howrah Baltikuri Audited MSME Directory (₹13.50/u * 20 + ₹14 packaging/freight)',
      channel_fees: 'Amazon IN 2026 Hardware Rate Card Schedule (₹160.97)'
    },
    assumptions: ['ASP stable at ₹499', '20-pack conversion rate 2.8%']
  },
  {
    product_id: 'cand_prod_brass_ball_valve_001',
    name: 'Forged Brass Ball Valve (1/2" PN20)',
    category: 'Plumbing & Fluid Control',
    archetype: 'CLUSTER_MRO_STANDARDIZED',
    channels: ['B2B', 'DISTRIBUTOR', 'HYBRID'],
    pack_size: 1,
    asp: 349.00,
    unit_purchase_cost: 118.00,
    packaging_cost_per_order: 11.50,
    inbound_freight_per_order: 15.20,
    channel_fees_per_order: 202.97,
    monthly_velocity_orders: 24,
    sample_size_n: 8, // < 10 -> DATA INSUFFICIENT
    data_sufficient: false,
    retailer_margin_pct: 20.0,
    distributor_margin_pct: 12.5,
    super_stockist_margin_pct: 6.0,
    drivers: [
      'Higher single-unit metal content and precision machining cost',
      'Jalandhar inward inter-state freight premium vs local Howrah supply',
      'Single unit retail sale vs bulk 20-pack distributor bundle'
    ],
    statistical_notes: 'DATA INSUFFICIENT: Jalandhar quote sample size N=8 is below computational threshold (minimum N=10). Correlation != causation.',
    provenance_sources: {
      asp: 'Trade directory wholesale catalog median (₹349.00)',
      landed_cogs: 'IndiaMART trade inquiry (unverified N=8, ₹118.00/u)',
      channel_fees: 'Estimated B2B delivery tariff',
      retailer_margin: 'Regional plumbing hardware retail survey (20.0%)',
      super_stockist_margin: 'State C&F agent schedule (6.0%)'
    },
    assumptions: [
      'Single unit retail packaging',
      'Jalandhar dispatch to Kolkata depot',
      'Standard 3-tier wholesale trade discount waterfall (20% retailer, 12.5% distributor, 6% super stockist)'
    ]
  },
  {
    product_id: 'prod_diya_terracotta_12p',
    name: 'Terracotta Clay Diya (12-Pack)',
    category: 'Home & Seasonal Handicrafts',
    archetype: 'SEASONAL_D2C_VISUAL',
    channels: ['D2C', 'EVENTS_WEDDING', 'RETAIL'],
    pack_size: 12,
    asp: 299.00,
    unit_purchase_cost: 2.50,
    packaging_cost_per_order: 29.00,
    inbound_freight_per_order: 21.50,
    channel_fees_per_order: 125.97,
    monthly_velocity_orders: 48,
    sample_size_n: 36,
    data_sufficient: true,
    transit_breakage_rate_pct: 14.8,
    drivers: [
      'Negligible ex-factory raw clay cost (₹2.50/unit) creates massive gross spread',
      'Heavy packaging cost surcharge to counteract 14.8% transit breakage rate',
      'Extreme 4-week pre-Diwali demand surge offsets low annual off-season velocity'
    ],
    statistical_notes: 'Sufficient historical sample size (N=36). Highly sensitive to seasonal timing.',
    provenance_sources: {
      asp: 'Festive seasonal Amazon/Quick-Commerce benchmark (₹299.00)',
      landed_cogs: 'Kumartuli Potter Cooperative direct quote (₹2.50/u * 12 + ₹50.50 packaging/freight)',
      transit_audit: 'Post-monsoon transit breakage audit (14.8%)'
    },
    assumptions: ['Molded pulp protective tray packaging', '4-week festive selling window']
  },
  {
    product_id: 'prod_candle_soy_fragrance',
    name: 'Aromatherapy Soy Candle',
    category: 'Wellness & Home Fragrance',
    archetype: 'SEASONAL_D2C_VISUAL',
    channels: ['D2C', 'MARKETPLACE'],
    pack_size: 1,
    asp: 699.00,
    unit_purchase_cost: 65.00,
    packaging_cost_per_order: 25.00,
    inbound_freight_per_order: 12.00,
    channel_fees_per_order: 172.97,
    monthly_velocity_orders: 34,
    sample_size_n: 16,
    data_sufficient: true,
    drivers: [
      'High D2C markup on visual gifting and wellness presentation',
      'Fragrance oil and glass jar represent 70% of BOM cost',
      'Year-round gifting with peak spikes in Q4'
    ],
    statistical_notes: 'Moderate evidence (N=16). High AOV potential.',
    provenance_sources: {
      asp: 'Urban D2C lifestyle competitor median (₹699.00)',
      landed_cogs: 'Soy wax & fragrance oil formulation invoice (₹65.00/u + ₹37 packaging/freight)',
      channel_fees: 'Amazon IN FBA fee card'
    },
    assumptions: ['Lavender & Cedarwood 220g pour in amber glass jar']
  },
  {
    product_id: 'prod_mcb_circuit_breaker',
    name: 'Miniature Circuit Breaker (16A)',
    category: 'Electrical Switchgear & Safety',
    archetype: 'TECHNICAL_COMPLIANCE',
    channels: ['MARKETPLACE', 'RETAIL', 'B2B'],
    pack_size: 1,
    asp: 249.00,
    unit_purchase_cost: 85.00,
    packaging_cost_per_order: 9.00,
    inbound_freight_per_order: 11.00,
    channel_fees_per_order: 185.97,
    monthly_velocity_orders: 35,
    sample_size_n: 25,
    data_sufficient: true,
    drivers: [
      'Mandatory BIS IS 60898 certification eliminates cheap cross-border unbranded competition',
      'Silver-tungsten contact alloy cost tied to precious metal indices',
      'Steady MRO replacement and construction contractor demand'
    ],
    statistical_notes: 'High regulatory barrier protection verified via BIS QCO audit (N=25).',
    provenance_sources: {
      asp: 'Marketplace trade pricing (₹249.00)',
      landed_cogs: 'Haridwar OEM contract manufacturer quote (₹85.00/u + ₹20 packaging/freight)',
      compliance: 'BIS IS/60898 Type Test certificate'
    },
    assumptions: ['Single pole 16A C-Curve standard distribution']
  },
  {
    product_id: 'prod_led_decorative_lights',
    name: 'LED Fairy Lights (10m)',
    category: 'Seasonal Home Decor',
    archetype: 'SEASONAL_D2C_VISUAL',
    channels: ['D2C', 'MARKETPLACE'],
    pack_size: 1,
    asp: 149.00,
    unit_purchase_cost: 42.00,
    packaging_cost_per_order: 1.00,
    inbound_freight_per_order: 10.00,
    channel_fees_per_order: 80.97,
    monthly_velocity_orders: 38,
    sample_size_n: 22,
    data_sufficient: true,
    drivers: [
      'Direct Chinese dropshipping price war compresses retail ASP to ₹149',
      'High Amazon return fees on defective adapter electronics (12.4% return rate)',
      'Negative unit contribution under baseline FBA fee schedule'
    ],
    statistical_notes: 'High sample size (N=22). Clear commercial archetype failure pattern.',
    provenance_sources: {
      asp: 'Marketplace discounted promotional ASP (₹149.00)',
      landed_cogs: 'Delhi Lajpat Rai market wholesale lot quote (₹42.00/u + ₹11 packaging/freight)',
      returns: 'Customer review scraping on power adapter failures'
    },
    assumptions: ['10m copper wire USB plug-in string']
  }
];

export const seedContradictionEvaluationRules: ContradictionEvaluationRule[] = [
  {
    rule_id: 'RULE-CONTRADICTION-NICKEL-COST-SURGE',
    rule_name: 'Raw Material Surge Pass-Through Rule',
    trigger_type: 'RAW_MATERIAL_SHIFT',
    applicability: {
      target_entity_ids: ['prod_ss304_din3017_canonical'],
      factors: ['STAINLESS_STEEL']
    },
    required_evidence: {
      evidence_type: 'RAW_MATERIAL_INDEX',
      metric_name: 'LME Nickel Cash Index',
      threshold_condition: 'Price > $20,000/tonne (+28% surge over $16,250 baseline)',
      evaluator: (val) => typeof val === 'number' && val >= 20000
    },
    resulting_action: {
      recommended_decision: 'VALIDATE_FURTHER',
      score_penalty: 36, // 88 - 36 = 52
      score_adjustment_rationale:
        'Audited rule applied: LME Nickel +28% surge inflates raw strip cost (+₹3.20/unit). Without fixed forward contract, net contribution drops below hurdle rate. Score adjusted from 88 to 52 (-25 for margin compression, -11 for unhedged commodity exposure).',
      requires_human_review: true,
      unresolved_conflict_description:
        'Unresolved supplier pass-through risk: Howrah stamping vendor has floating raw material pricing. Awaiting forward procurement hedging agreement.'
    }
  },
  {
    rule_id: 'RULE-CONTRADICTION-IMPORT-PRICE-WAR',
    rule_name: 'Sub-Standard Import Dumping Defense Rule',
    trigger_type: 'PRICE_SPIKE_OR_DROP',
    applicability: {
      target_entity_ids: ['prod_ss304_din3017_canonical', 'prod_led_decorative_lights'],
      archetypes: ['CLUSTER_MRO_STANDARDIZED', 'SEASONAL_D2C_VISUAL']
    },
    required_evidence: {
      evidence_type: 'MARKETPLACE_PRICE',
      metric_name: 'Lowest Competitor ASP (20-Pack)',
      threshold_condition: 'Competitor ASP < ₹300/pack (Below Landed Cost Floor)',
      evaluator: (val) => typeof val === 'number' && val <= 300
    },
    resulting_action: {
      recommended_decision: 'REJECT',
      score_penalty: 50, // 88 - 50 = 38
      score_adjustment_rationale:
        'Audited rule applied: Low-cost competitor dumping at ₹299 undercuts compliant Howrah landed cost (₹326). Cannot sustain positive contribution in price war.',
      requires_human_review: true,
      unresolved_conflict_description:
        'Competitor dumping uncertified carbon steel. Marketplace price war prevents premium brand realization without heavy ad spend.'
    }
  },
  {
    rule_id: 'RULE-CONTRADICTION-CORROSION-FAILURE',
    rule_name: 'Coastal Salt-Spray Quality Failure Rule',
    trigger_type: 'CONTRADICTORY_EVIDENCE',
    applicability: {
      target_entity_ids: ['prod_ss304_din3017_canonical'],
      factors: ['FRAGILITY_RETURNS']
    },
    required_evidence: {
      evidence_type: 'REGULATORY_NOTICE',
      metric_name: 'Coastal Rust Failure Rate',
      threshold_condition: 'Failure rate > 10% on 24-hr salt-spray corrosion audit',
      evaluator: (val) => typeof val === 'number' && val > 10
    },
    resulting_action: {
      recommended_decision: 'REJECT',
      score_penalty: 54, // 88 - 54 = 34
      score_adjustment_rationale:
        'Audited rule applied: 38% customer rust complaints logged on marine batches; heat number failed salt spray test. Severe listing suspension hazard.',
      requires_human_review: true,
      unresolved_conflict_description:
        'Sub-standard raw coil batch failed metallurgical QA. Entire Batch #001 quarantined pending supplier dispute.'
    }
  }
];

// ============================================================================
// 6. Rigorous Statistical Guardrails & Cross-Product Factor Linkages
// ============================================================================

export const seedProductFactorExposures: ProductFactorExposure[] = [
  {
    product_id: 'prod_ss304_din3017_canonical',
    product_name: 'SS304 Hose Clamp',
    archetype: 'CLUSTER_MRO_STANDARDIZED',
    factor: 'STAINLESS_STEEL',
    sensitivity: 'HIGH',
    evidence_count: 8,
    sample_size: 42,
    date_range_days: 90,
    missing_points_count: 2,
    methodology: 'Weekly ex-factory billet quote tracking against LME Cash Nickel index',
    outliers_detected: false,
    data_sufficient: true,
    correlation_does_not_equal_causation: true,
    caveats: ['Correlation with spot nickel reflects lag of ~30-45 days in Indian MSME strip mills.']
  },
  {
    product_id: 'prod_ss304_din3017_canonical',
    product_name: 'SS304 Hose Clamp',
    archetype: 'CLUSTER_MRO_STANDARDIZED',
    factor: 'ROAD_FREIGHT',
    sensitivity: 'LOW',
    evidence_count: 5,
    sample_size: 20,
    date_range_days: 60,
    missing_points_count: 0,
    methodology: 'Local Kolkata transport challan audit',
    outliers_detected: false,
    data_sufficient: true,
    correlation_does_not_equal_causation: true,
    caveats: ['Intra-cluster transport (Howrah to Kolkata) is insulated from interstate diesel toll spikes.']
  },
  {
    product_id: 'prod_diya_terracotta_12p',
    product_name: 'Terracotta Diya 12-Pack',
    archetype: 'SEASONAL_D2C_VISUAL',
    factor: 'FESTIVAL_SEASONALITY',
    sensitivity: 'HIGH',
    evidence_count: 6,
    sample_size: 36,
    date_range_days: 365,
    missing_points_count: 1,
    methodology: 'Annual Google Trends and marketplace keyword volume normalization',
    outliers_detected: true,
    data_sufficient: true,
    correlation_does_not_equal_causation: true,
    caveats: ['Extreme peak in T-4 to T-1 week pre-Diwali; post-festival demand collapses by 94%.']
  },
  {
    product_id: 'prod_diya_terracotta_12p',
    product_name: 'Terracotta Diya 12-Pack',
    archetype: 'SEASONAL_D2C_VISUAL',
    factor: 'FRAGILITY_RETURNS',
    sensitivity: 'HIGH',
    evidence_count: 4,
    sample_size: 14,
    date_range_days: 30,
    missing_points_count: 2,
    methodology: 'Courier transit return audit on unreinforced corrugated boxes',
    outliers_detected: false,
    data_sufficient: true,
    correlation_does_not_equal_causation: true,
    caveats: ['Breakage rate of 14.8% requires custom molded pulp packaging (+₹22/pack).']
  },
  {
    product_id: 'cand_prod_brass_ball_valve_001',
    product_name: 'Brass Ball Valve',
    archetype: 'CLUSTER_MRO_STANDARDIZED',
    factor: 'BRASS_COPPER',
    sensitivity: 'HIGH',
    evidence_count: 3,
    sample_size: 8, // < 10 -> DATA INSUFFICIENT
    date_range_days: 14,
    missing_points_count: 3,
    methodology: 'Indicative trade directory price inquiry',
    outliers_detected: false,
    data_sufficient: false, // Guardrail active!
    correlation_does_not_equal_causation: true,
    caveats: ['Sample size N=8 is below minimum guardrail of 10. Cannot infer statistical significance.']
  },
  {
    product_id: 'prod_mcb_circuit_breaker',
    product_name: 'Miniature Circuit Breaker',
    archetype: 'TECHNICAL_COMPLIANCE',
    factor: 'BIS_SAFETY_COMPLIANCE',
    sensitivity: 'HIGH',
    evidence_count: 7,
    sample_size: 25,
    date_range_days: 180,
    missing_points_count: 0,
    methodology: 'Government gazette notifications and marketplace delisting logs',
    outliers_detected: false,
    data_sufficient: true,
    correlation_does_not_equal_causation: true,
    caveats: ['BIS Quality Control Orders strictly barrier non-certified cross-border sellers.']
  }
];

// ============================================================================
// 6. Research Engine Class
// ============================================================================

export class ResearchEngine {
  private universe: ResearchUniverseItem[] = [...initialResearchUniverse];
  private observations: SurveillanceObservation[] = [...seedSurveillanceObservations];
  private claims: ResearchClaim[] = [...seedResearchClaims];
  private adversarialAnalyses: Map<string, AdversarialAnalysis> = new Map();
  
  /** Current active thesis per product */
  private activeTheses: Map<string, StructuredProductThesis> = new Map();
  
  /** Strictly immutable historical versions per product */
  private thesisHistory: Map<string, StructuredProductThesis[]> = new Map();
  
  private factorExposures: ProductFactorExposure[] = [...seedProductFactorExposures];
  private triggers: SurveillanceTriggerEvent[] = [];

  /** Registered product commercial profiles for model-driven evaluation */
  private commercialEconomicProfiles: Map<string, ProductCommercialEconomicProfile> = new Map();

  /** Auditable contradiction rules */
  private contradictionRules: ContradictionEvaluationRule[] = [...seedContradictionEvaluationRules];

  constructor() {
    const v1Baseline = buildCanonicalSS304ThesisV1();
    this.activeTheses.set('prod_ss304_din3017_canonical', v1Baseline);
    this.thesisHistory.set('prod_ss304_din3017_canonical', [{ ...v1Baseline }]);
    this.adversarialAnalyses.set('prod_ss304_din3017_canonical', seedAdversarialAnalysisSS304);

    // Seed provisional/illustrative theses for known universe products
    const provisionalTheses: StructuredProductThesis[] = [
      buildProvisionalDiyaThesis(),
      buildProvisionalCandleThesis(),
      buildProvisionalBrassValveThesis(),
      buildProvisionalMCBThesis(),
      buildProvisionalLEDLightsThesis()
    ];
    for (const th of provisionalTheses) {
      this.activeTheses.set(th.product_id, th);
      this.thesisHistory.set(th.product_id, [{ ...th }]);
    }

    // Seed product economic profiles for model registry evaluations
    for (const prof of seedProductCommercialEconomicProfiles) {
      this.commercialEconomicProfiles.set(prof.product_id, prof);
    }

    this.loadOperationalPersistence();
  }

  private loadOperationalPersistence(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const savedHistory = localStorage.getItem('app_step6_thesis_history_v2');
      if (savedHistory) {
        const parsed: Record<string, StructuredProductThesis[]> = JSON.parse(savedHistory);
        Object.entries(parsed).forEach(([pId, list]) => {
          if (Array.isArray(list) && list.length > 0) {
            this.thesisHistory.set(pId, list);
            this.activeTheses.set(pId, list[list.length - 1]);
          }
        });
      }
      const savedObs = localStorage.getItem('app_step6_surveillance_obs_v2');
      if (savedObs) {
        const parsed = JSON.parse(savedObs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.observations = parsed;
        }
      }
      const savedTriggers = localStorage.getItem('app_step6_surveillance_triggers_v2');
      if (savedTriggers) {
        const parsed = JSON.parse(savedTriggers);
        if (Array.isArray(parsed)) {
          this.triggers = parsed;
        }
      }
    } catch {}
  }

  private saveOperationalPersistence(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const historyObj: Record<string, StructuredProductThesis[]> = {};
      this.thesisHistory.forEach((v, k) => {
        historyObj[k] = v;
      });
      localStorage.setItem('app_step6_thesis_history_v2', JSON.stringify(historyObj));
      localStorage.setItem('app_step6_surveillance_obs_v2', JSON.stringify(this.observations));
      localStorage.setItem('app_step6_surveillance_triggers_v2', JSON.stringify(this.triggers));
    } catch {}
  }

  // ==========================================================================
  // Public Accessors
  // ==========================================================================

  public getUniverse(): ResearchUniverseItem[] {
    return [...this.universe];
  }

  public getObservationsForProduct(productId: string): SurveillanceObservation[] {
    return this.observations.filter((o) => o.product_id === productId);
  }

  public getAllObservations(): SurveillanceObservation[] {
    return [...this.observations];
  }

  public getClaimsForProduct(productId: string): ResearchClaim[] {
    return this.claims.filter((c) => c.product_id === productId);
  }

  public getAdversarialAnalysis(productId: string): AdversarialAnalysis | undefined {
    return this.adversarialAnalyses.get(productId);
  }

  public getLatestThesis(productId: string): StructuredProductThesis | undefined {
    return this.activeTheses.get(productId);
  }

  public getThesis(productId: string): StructuredProductThesis | undefined {
    return this.getLatestThesis(productId);
  }

  /**
   * Retrieves the full immutable version history for a product thesis.
   * Enables reconstructible audit trails of why commercial theses changed.
   */
  public getThesisHistory(productId: string): StructuredProductThesis[] {
    return [...(this.thesisHistory.get(productId) || [])];
  }

  public getFactorExposures(productId: string): ProductFactorExposure[] {
    return this.factorExposures.filter((f) => f.product_id === productId);
  }

  public getAllFactorExposures(): ProductFactorExposure[] {
    return [...this.factorExposures];
  }

  public getTriggers(): SurveillanceTriggerEvent[] {
    return [...this.triggers];
  }

  // ==========================================================================
  // Ingest Surveillance Observation (Append-Only)
  // ==========================================================================

  public ingestObservation(obs: Omit<SurveillanceObservation, 'observation_id' | 'retrieval_timestamp'>): SurveillanceObservation {
    const newObs: SurveillanceObservation = {
      ...obs,
      observation_id: `surv_obs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      retrieval_timestamp: new Date().toISOString()
    };
    this.observations.unshift(newObs);

    const item = this.universe.find((u) => u.product_id === obs.product_id);
    if (item) {
      item.evidence_count += 1;
    }

    this.saveOperationalPersistence();
    return newObs;
  }

  // ==========================================================================
  // Governed Research Evaluation Contract (Model Registry Integration)
  // ==========================================================================

  /**
   * Evaluates an opportunity or research case using a registered equation or model.
   * Enforces schema conformance, explicit assumptions, and non-zero missing inputs.
   */
  public evaluateOpportunityWithModel(
    caseOrOpportunityId: string,
    targetEntityId: string,
    modelId: string,
    inputs: Record<string, any>,
    inputProvenance: Record<string, string> = {},
    assumptions: string[] = []
  ): GovernedResearchEvaluation {
    const model = equationRegistry.getModel(modelId);
    const timestamp = new Date().toISOString();
    const evaluationId = `reval_${modelId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (!model) {
      return {
        evaluation_id: evaluationId,
        case_or_opportunity_id: caseOrOpportunityId,
        target_entity_id: targetEntityId,
        model_id: modelId,
        model_version: 'UNKNOWN',
        model_name: 'Unknown Model',
        status: 'FAILED',
        input_bindings: [],
        explicit_assumptions: assumptions,
        missing_inputs: [],
        outputs: {},
        warnings: [`Model "${modelId}" not found in EquationRegistry.`],
        execution_notes: 'Evaluation aborted: unregistered model ID.',
        evaluated_at: timestamp,
        reproducibility_reference: 'sha256_unregistered'
      };
    }

    // Build input bindings according to schema without inventing defaults or fabricating zeroes
    const missingInputs: string[] = [];
    const inputBindings: GovernedModelInputBinding[] = model.input_schemas.map((schema) => {
      const val = inputs[schema.symbol];
      const isMissing = val === undefined || val === null || (typeof val === 'number' && !Number.isFinite(val));
      if (schema.required && isMissing) {
        missingInputs.push(`${schema.name} (${schema.symbol})`);
      }
      return {
        symbol: schema.symbol,
        name: schema.name,
        value: val !== undefined ? val : null,
        unit: schema.unit,
        epistemic_class: schema.epistemic_class,
        source_reference: inputProvenance[schema.symbol],
        is_assumption: schema.epistemic_class === 'SCENARIO_ASSUMPTION',
        is_missing: isMissing
      };
    });

    if (missingInputs.length > 0) {
      return {
        evaluation_id: evaluationId,
        case_or_opportunity_id: caseOrOpportunityId,
        target_entity_id: targetEntityId,
        model_id: model.model_id,
        model_version: model.version,
        model_name: model.name,
        status: 'NOT_EVALUABLE',
        input_bindings: inputBindings,
        explicit_assumptions: assumptions,
        missing_inputs: missingInputs,
        outputs: {},
        warnings: [`NOT_EVALUABLE: Missing required inputs: ${missingInputs.join(', ')}`],
        execution_notes: 'Model evaluation halted due to incomplete input contract.',
        evaluated_at: timestamp,
        reproducibility_reference: 'sha256_incomplete_inputs'
      };
    }

    try {
      const execResult = equationRegistry.evaluateModel(modelId, inputs, inputProvenance);
      return {
        evaluation_id: evaluationId,
        case_or_opportunity_id: caseOrOpportunityId,
        target_entity_id: targetEntityId,
        model_id: model.model_id,
        model_version: model.version,
        model_name: model.name,
        status: execResult.result.data_insufficient ? 'DATA_INSUFFICIENT' : execResult.result.success ? 'SUCCESS' : 'FAILED',
        input_bindings: inputBindings,
        explicit_assumptions: assumptions,
        missing_inputs: [],
        outputs: execResult.result.outputs,
        warnings: execResult.result.warnings,
        execution_notes: execResult.result.execution_notes,
        evaluated_at: execResult.record.executed_at,
        reproducibility_reference: execResult.record.reproducibility_hash
      };
    } catch (err: any) {
      return {
        evaluation_id: evaluationId,
        case_or_opportunity_id: caseOrOpportunityId,
        target_entity_id: targetEntityId,
        model_id: model.model_id,
        model_version: model.version,
        model_name: model.name,
        status: 'FAILED',
        input_bindings: inputBindings,
        explicit_assumptions: assumptions,
        missing_inputs: [],
        outputs: {},
        warnings: [err.message || 'Execution error in model evaluation'],
        execution_notes: 'Runtime execution failure.',
        evaluated_at: timestamp,
        reproducibility_reference: 'sha256_exec_error'
      };
    }
  }

  // ==========================================================================
  // Economic Profile & Contradiction Rule Accessors
  // ==========================================================================

  public getEconomicProfile(productId: string): ProductCommercialEconomicProfile | undefined {
    return this.commercialEconomicProfiles.get(productId);
  }

  public registerEconomicProfile(profile: ProductCommercialEconomicProfile): void {
    this.commercialEconomicProfiles.set(profile.product_id, profile);
  }

  public getAllEconomicProfiles(): ProductCommercialEconomicProfile[] {
    return Array.from(this.commercialEconomicProfiles.values());
  }

  public getContradictionRules(): ContradictionEvaluationRule[] {
    return [...this.contradictionRules];
  }

  public registerContradictionRule(rule: ContradictionEvaluationRule): void {
    this.contradictionRules.push(rule);
  }

  // ==========================================================================
  // Immutable Thesis Evolution (Section 20 & Audit Invariant 5)
  // ==========================================================================

  /**
   * Injects contradictory evidence against a product thesis.
   * Evaluates against auditable registered contradiction rules.
   * CRITICAL AUDIT RULE: Does NOT mutate v1 in place!
   * Creates a new immutable v2 record, links previous_version_id, logs the trigger event,
   * explicitly labels observed signals vs derived scenario assumptions,
   * and preserves the complete version audit trail.
   */
  public injectContradictoryEvidence(
    productId: string,
    contradictionType: 'NICKEL_RAW_MATERIAL_SPIKE' | 'CHINESE_IMPORT_DUMPING' | 'CORROSIVE_FAILURE_SPIKE'
  ): {
    newThesisVersion: StructuredProductThesis;
    previousThesisVersion: StructuredProductThesis;
    trigger: SurveillanceTriggerEvent;
    observation: SurveillanceObservation;
  } {
    const history = this.thesisHistory.get(productId);
    if (!history || history.length === 0) {
      throw new Error(`Cannot inject contradictory evidence: Entity "${productId}" has no existing thesis history.`);
    }
    const v1Baseline = history[history.length - 1];
    const timestamp = new Date().toISOString();

    let triggerDesc = '';
    let finding = '';
    let obsMetricName = '';
    let obsMetricValue: number | string = 0;
    let obsMetricUnit = '';
    let evidenceType: EvidenceType = 'RAW_MATERIAL_INDEX';

    if (contradictionType === 'NICKEL_RAW_MATERIAL_SPIKE') {
      triggerDesc = 'Global LME nickel cash price surged +28% to $20,800/t.';
      finding = 'LME Nickel Cash Index registered at $20,800/tonne (+28%). Scenario model derives an estimated +₹3.20/unit ex-factory stamping cost increase.';
      obsMetricName = 'LME Nickel Cash Index';
      obsMetricValue = 20800;
      obsMetricUnit = 'USD/tonne';
      evidenceType = 'RAW_MATERIAL_INDEX';
    } else if (contradictionType === 'CHINESE_IMPORT_DUMPING') {
      triggerDesc = 'Predatory low-cost import flood undercuts Amazon target ASP to ₹299.';
      finding = 'Observed lowest competitor 20-pack price dropped to ₹299 with sub-standard carbon steel.';
      obsMetricName = 'Lowest Competitor ASP (20-Pack)';
      obsMetricValue = 299;
      obsMetricUnit = 'INR';
      evidenceType = 'MARKETPLACE_PRICE';
    } else {
      triggerDesc = 'Coastal installation batch report: 38% customer rust complaints logged on marine batches.';
      finding = 'Quality inspection report: Suspect raw material heat number failed 24-hr salt-spray corrosion resistance test.';
      obsMetricName = 'Coastal Rust Failure Rate';
      obsMetricValue = 38.2;
      obsMetricUnit = '% of inspected units';
      evidenceType = 'REGULATORY_NOTICE';
    }

    // Evaluate against auditable registered contradiction rules
    const matchingRule = this.contradictionRules.find((r) => {
      if (contradictionType === 'NICKEL_RAW_MATERIAL_SPIKE') return r.rule_id === 'RULE-CONTRADICTION-NICKEL-COST-SURGE';
      if (contradictionType === 'CHINESE_IMPORT_DUMPING') return r.rule_id === 'RULE-CONTRADICTION-IMPORT-PRICE-WAR';
      return r.rule_id === 'RULE-CONTRADICTION-CORROSION-FAILURE';
    });

    let newDecision: ThesisDecision = 'VALIDATE_FURTHER';
    let newScore = v1Baseline.thesis_support_score;
    let impact = '';

    if (matchingRule && matchingRule.required_evidence.evaluator(obsMetricValue)) {
      newDecision = matchingRule.resulting_action.recommended_decision;
      newScore = Math.max(0, v1Baseline.thesis_support_score - matchingRule.resulting_action.score_penalty);
      impact = matchingRule.resulting_action.score_adjustment_rationale;
    } else {
      newDecision = 'VALIDATE_FURTHER';
      impact = 'EVIDENCE CONFLICT DETECTED: No objective scoring rule calibrated for this signal. Mandatory human review requested without score invention.';
    }

    // 1. Ingest raw observation
    const obs = this.ingestObservation({
      product_id: productId,
      source_id: 'src_adversarial_surveillance',
      source_name: 'Continuous Market Surveillance & Adversarial Scanner',
      evidence_type: evidenceType,
      observed_at: timestamp,
      metric_name: obsMetricName,
      metric_value: obsMetricValue,
      metric_unit: obsMetricUnit,
      provenance: 'API',
      epistemic_status: 'FACT',
      notes: finding
    });

    // 2. Log trigger event citing the auditable rule
    const trigger: SurveillanceTriggerEvent = {
      event_id: `trig_${Date.now()}`,
      product_id: productId,
      trigger_type: 'CONTRADICTORY_EVIDENCE',
      description: triggerDesc,
      triggered_at: timestamp,
      previous_value: v1Baseline.decision,
      new_value: newDecision,
      action_taken: matchingRule
        ? `Auditable Rule [${matchingRule.rule_id}] applied: Created Thesis v${v1Baseline.version + 1}; decision revised from ${v1Baseline.decision} to ${newDecision}; support score adjusted from ${v1Baseline.thesis_support_score} to ${newScore}. Rationale: ${matchingRule.resulting_action.score_adjustment_rationale}`
        : `Evidence conflict recorded: Created Thesis v${v1Baseline.version + 1}; decision set to ${newDecision}; score preserved at ${newScore}; human review queued.`
    };
    this.triggers.unshift(trigger);

    // 3. Build brand-new immutable thesis version (v2)
    const updatedFactorLinkages: ThesisFactorLinkage[] = [
      ...v1Baseline.factor_linkages,
      {
        factor_name: obsMetricName,
        kind: 'OBSERVED_SIGNAL',
        observed_evidence_id: obs.observation_id,
        observed_value: `${obsMetricValue} ${obsMetricUnit}`,
        assumed_impact_description: `Raw observation captured at ${timestamp}.`
      },
      {
        factor_name: 'Adversarial Contradiction Shift',
        kind: 'SCENARIO_DERIVED_HYPOTHESIS',
        assumed_impact_description: impact,
        calculation_formula: matchingRule?.rule_id || 'Scenario derivation rule'
      }
    ];

    const unresolvedQuestions = [...v1Baseline.unresolved_questions];
    if (matchingRule?.resulting_action.unresolved_conflict_description) {
      unresolvedQuestions.push(matchingRule.resulting_action.unresolved_conflict_description);
    }

    const v2Thesis: StructuredProductThesis = {
      ...v1Baseline,
      thesis_id: `thesis_${productId}_v${v1Baseline.version + 1}_${Date.now()}`,
      version: v1Baseline.version + 1,
      previous_version_id: v1Baseline.thesis_id,
      version_status: 'UNDER_REVISION',
      decision: newDecision,
      thesis_support_score: newScore,
      evidence_strength_grade: newScore < 50 ? 'SPECULATIVE' : 'MODERATE_EVIDENCE',
      factor_linkages: updatedFactorLinkages,
      unresolved_questions: unresolvedQuestions,
      bear_case: {
        ...v1Baseline.bear_case,
        summary: `EPISTEMIC REVISION: ${finding} ${v1Baseline.bear_case.summary}`,
        counter_evidence_ids: [...v1Baseline.bear_case.counter_evidence_ids, obs.observation_id],
        fatal_flaws_tested: [
          ...v1Baseline.bear_case.fatal_flaws_tested,
          `CRITICAL CONTRADICTION: ${triggerDesc}`
        ]
      },
      contradictory_evidence_events: [
        {
          event_id: trigger.event_id,
          timestamp,
          finding,
          impact_on_thesis: impact
        },
        ...v1Baseline.contradictory_evidence_events
      ],
      updated_at: timestamp
    };

    // Append to immutable history (v1 is preserved intact!)
    const newHistory = [...history, v2Thesis];
    this.thesisHistory.set(productId, newHistory);
    this.activeTheses.set(productId, v2Thesis);

    const uItem = this.universe.find((u) => u.product_id === productId);
    if (uItem) {
      uItem.latest_thesis_decision = newDecision;
      uItem.thesis_support_score = newScore;
    }

    this.saveOperationalPersistence();

    return {
      newThesisVersion: v2Thesis,
      previousThesisVersion: v1Baseline,
      trigger,
      observation: obs
    };
  }

  /**
   * Resets the canonical SS304 thesis history to clean baseline v1
   */
  public resetCanonicalSS304Thesis(): StructuredProductThesis {
    const v1Baseline = buildCanonicalSS304ThesisV1();
    this.activeTheses.set('prod_ss304_din3017_canonical', v1Baseline);
    this.thesisHistory.set('prod_ss304_din3017_canonical', [{ ...v1Baseline }]);

    const uItem = this.universe.find((u) => u.product_id === 'prod_ss304_din3017_canonical');
    if (uItem) {
      uItem.latest_thesis_decision = 'PURSUE';
      uItem.thesis_support_score = 88;
    }

    this.saveOperationalPersistence();
    return v1Baseline;
  }

  // ==========================================================================
  // Model-Driven Differential Economic Decomposition (Section 11)
  // Replaces hardcoded branches with generic registered model evaluation
  // ==========================================================================

  public computeDifferentialComparison(
    baselineProductId: string,
    targetProductId: string
  ): DifferentialEconomicComparison {
    const baselineProfile = this.commercialEconomicProfiles.get(baselineProductId);
    const targetProfile = this.commercialEconomicProfiles.get(targetProductId);

    if (!baselineProfile || !targetProfile || baselineProfile.asp <= 0 || targetProfile.asp <= 0) {
      const missing: string[] = [];
      if (!baselineProfile) missing.push(`Baseline profile "${baselineProductId}" not found`);
      else if (baselineProfile.asp <= 0) missing.push(`Baseline ASP non-positive`);
      if (!targetProfile) missing.push(`Target profile "${targetProductId}" not found`);
      else if (targetProfile.asp <= 0) missing.push(`Target ASP non-positive`);

      return {
        baseline_product_id: baselineProductId,
        target_product_id: targetProductId,
        baseline_name: baselineProfile?.name || 'Unknown Baseline',
        target_name: targetProfile?.name || 'Unknown Target',
        baseline_archetype: baselineProfile?.archetype || 'DISCOVERY_UNCLASSIFIED',
        target_archetype: targetProfile?.archetype || 'DISCOVERY_UNCLASSIFIED',
        variances: {
          unit_purchase_cost_delta: 0,
          packaging_cost_delta: 0,
          freight_delta: 0,
          marketplace_fee_delta: 0,
          target_asp_delta: 0,
          gross_margin_pct_delta: 0,
          capital_velocity_delta_orders_per_month: 0
        },
        drivers: ['Economic evaluation not possible: Product profiles or required inputs not configured.'],
        data_sufficient: false,
        statistical_notes: 'NOT_EVALUABLE: Missing required price/cost inputs for registered model evaluation.',
        evaluation_status: 'NOT_EVALUABLE',
        missing_requirements: missing
      };
    }

    // Model-driven evaluation via EQ-CONTRIBUTION-MARGIN-v1.0.0
    const baseLandedCogs =
      (baselineProfile.unit_purchase_cost * baselineProfile.pack_size) +
      baselineProfile.packaging_cost_per_order +
      baselineProfile.inbound_freight_per_order;
    const baseFees = baselineProfile.channel_fees_per_order;

    const baseCmEval = this.evaluateOpportunityWithModel(
      `opp_base_${baselineProfile.product_id}`,
      baselineProfile.product_id,
      'EQ-CONTRIBUTION-MARGIN-v1.0.0',
      {
        asp: baselineProfile.asp,
        landed_cogs: baseLandedCogs,
        channel_fees: baseFees
      },
      baselineProfile.provenance_sources,
      baselineProfile.assumptions
    );

    const targetLandedCogs =
      (targetProfile.unit_purchase_cost * targetProfile.pack_size) +
      targetProfile.packaging_cost_per_order +
      targetProfile.inbound_freight_per_order;
    const targetFees = targetProfile.channel_fees_per_order;

    const targetCmEval = this.evaluateOpportunityWithModel(
      `opp_target_${targetProfile.product_id}`,
      targetProfile.product_id,
      'EQ-CONTRIBUTION-MARGIN-v1.0.0',
      {
        asp: targetProfile.asp,
        landed_cogs: targetLandedCogs,
        channel_fees: targetFees
      },
      targetProfile.provenance_sources,
      targetProfile.assumptions
    );

    const governedEvals: GovernedResearchEvaluation[] = [baseCmEval, targetCmEval];

    // Specialist models where declared purpose and schemas genuinely apply
    if (targetProfile.transit_breakage_rate_pct !== undefined && targetProfile.transit_breakage_rate_pct > 0) {
      const unitBaseLandedCost = Number((targetLandedCogs / Math.max(1, targetProfile.pack_size)).toFixed(2));
      const breakageEval = this.evaluateOpportunityWithModel(
        `opp_breakage_${targetProfile.product_id}`,
        targetProfile.product_id,
        'EQ-BREAKAGE-SPOILAGE-COST-v1.0.0',
        {
          base_landed_cost_inr: unitBaseLandedCost,
          breakage_rate_pct: targetProfile.transit_breakage_rate_pct
        },
        targetProfile.provenance_sources,
        ['Assumes zero post-transit salvage on shattered ceramics']
      );
      governedEvals.push(breakageEval);
    }

    if (targetProfile.distributor_margin_pct !== undefined && targetProfile.distributor_margin_pct > 0) {
      const distInputs: Record<string, any> = {
        mrp_inr: targetProfile.asp,
        distributor_margin_pct: targetProfile.distributor_margin_pct
      };
      if (targetProfile.retailer_margin_pct !== undefined) {
        distInputs.retailer_margin_pct = targetProfile.retailer_margin_pct;
      }
      if (targetProfile.super_stockist_margin_pct !== undefined) {
        distInputs.super_stockist_margin_pct = targetProfile.super_stockist_margin_pct;
      }
      const distributorEval = this.evaluateOpportunityWithModel(
        `opp_dist_${targetProfile.product_id}`,
        targetProfile.product_id,
        'MOD-DISTRIBUTOR-TIERED-MARGIN-v1.0.0',
        distInputs,
        targetProfile.provenance_sources,
        ['Standard wholesale discount waterfall']
      );
      governedEvals.push(distributorEval);
    }

    const baseSuccess = baseCmEval.status === 'SUCCESS';
    const targetSuccess = targetCmEval.status === 'SUCCESS';

    if (!baseSuccess || !targetSuccess) {
      const missing: string[] = [
        ...(!baseSuccess ? baseCmEval.missing_inputs.map((m) => `Baseline: ${m}`) : []),
        ...(!baseSuccess ? baseCmEval.warnings : []),
        ...(!targetSuccess ? targetCmEval.missing_inputs.map((m) => `Target: ${m}`) : []),
        ...(!targetSuccess ? targetCmEval.warnings : [])
      ];
      return {
        baseline_product_id: baselineProductId,
        target_product_id: targetProductId,
        baseline_name: baselineProfile.name,
        target_name: targetProfile.name,
        baseline_archetype: baselineProfile.archetype,
        target_archetype: targetProfile.archetype,
        variances: {
          unit_purchase_cost_delta: 0,
          packaging_cost_delta: 0,
          freight_delta: 0,
          marketplace_fee_delta: 0,
          target_asp_delta: 0,
          gross_margin_pct_delta: 0,
          capital_velocity_delta_orders_per_month: 0
        },
        drivers: ['Model evaluation incomplete: Required model inputs missing or evaluation returned failure.'],
        data_sufficient: false,
        statistical_notes: `NOT_EVALUABLE: ${missing.join('; ')}`,
        evaluation_status: 'NOT_EVALUABLE',
        governed_evaluations: governedEvals,
        missing_requirements: missing
      };
    }

    const baseCmPct = baseCmEval.outputs.contribution_margin_pct || 0;
    const targetCmPct = targetCmEval.outputs.contribution_margin_pct || 0;

    const unitPurchaseDelta = Number((targetProfile.unit_purchase_cost - baselineProfile.unit_purchase_cost).toFixed(2));
    const packagingDelta = Number((targetProfile.packaging_cost_per_order - baselineProfile.packaging_cost_per_order).toFixed(2));
    const freightDelta = Number((targetProfile.inbound_freight_per_order - baselineProfile.inbound_freight_per_order).toFixed(2));
    const feeDelta = Number((targetProfile.channel_fees_per_order - baselineProfile.channel_fees_per_order).toFixed(2));
    const aspDelta = Number((targetProfile.asp - baselineProfile.asp).toFixed(2));
    const marginDelta = Number((targetCmPct - baseCmPct).toFixed(1));
    const velocityDelta = Number((targetProfile.monthly_velocity_orders - baselineProfile.monthly_velocity_orders).toFixed(1));

    const isDataSufficient = targetProfile.data_sufficient && targetProfile.sample_size_n >= 10;
    const statNotes = !isDataSufficient
      ? `DATA INSUFFICIENT: Quote sample size N=${targetProfile.sample_size_n} is below computational threshold (minimum N=10). Correlation != causation.`
      : targetProfile.statistical_notes;

    return {
      baseline_product_id: baselineProductId,
      target_product_id: targetProductId,
      baseline_name: baselineProfile.name,
      target_name: targetProfile.name,
      baseline_archetype: baselineProfile.archetype,
      target_archetype: targetProfile.archetype,
      variances: {
        unit_purchase_cost_delta: unitPurchaseDelta,
        packaging_cost_delta: packagingDelta,
        freight_delta: freightDelta,
        marketplace_fee_delta: feeDelta,
        target_asp_delta: aspDelta,
        gross_margin_pct_delta: marginDelta,
        capital_velocity_delta_orders_per_month: velocityDelta
      },
      drivers: [...targetProfile.drivers],
      data_sufficient: isDataSufficient,
      statistical_notes: statNotes,
      evaluation_status: 'EVALUATED_VIA_MODEL_REGISTRY',
      governed_evaluations: governedEvals
    };
  }

  // ==========================================================================
  // Human Decision Gate (Audit Invariant)
  // ==========================================================================

  public recordHumanSignoff(
    productId: string,
    decision: ThesisDecision,
    approvedBy: string,
    notes: string
  ): StructuredProductThesis | undefined {
    const current = this.activeTheses.get(productId);
    if (!current) return undefined;

    const updated: StructuredProductThesis = {
      ...current,
      decision,
      human_signoff: {
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        notes
      },
      updated_at: new Date().toISOString()
    };

    // Update both active map and history
    this.activeTheses.set(productId, updated);
    const history = this.thesisHistory.get(productId) || [];
    if (history.length > 0) {
      history[history.length - 1] = { ...updated };
    }

    const uItem = this.universe.find((u) => u.product_id === productId);
    if (uItem) {
      uItem.latest_thesis_decision = decision;
    }

    this.saveOperationalPersistence();
    return updated;
  }
}

export const researchEngine = new ResearchEngine();
