/**
 * POC-001: Capability System & Capability Profile Architecture
 * Step 4: Product-Agnostic Capability Taxonomy & Contextual Resolution
 * 
 * Target Architecture:
 * Product 
 *   └── Product Capability Profile
 *         └── Applicable Capabilities
 *               └── Research / Supply / Specification / Offer / Channels / Economics / Simulation / Strategy / System
 */

/**
 * Top-Level Stable Capability Taxonomy (Section 3)
 */
export type TopLevelCapability =
  | 'DISCOVER'       // Opportunity/product signal discovery (Step 5 deferred)
  | 'UNIVERSE'       // Product, variant, pack, opportunity, supplier, buyer registry
  | 'RESEARCH'       // Evidence gathering, observations, tasks, provenance
  | 'ECONOMICS'      // Deterministic commercial/economic analysis (frozen core)
  | 'COMPARE'        // Benchmarking & comparison (Step 6 deferred)
  | 'RELATIONSHIPS'  // Factor linkages & shared market drivers (Step 6 deferred)
  | 'PORTFOLIO'      // Basket & capital-allocation analysis (Step 7 deferred)
  | 'STRATEGY'       // Opportunity-level strategic decision support
  | 'SYSTEM';        // Contracts, schemas, snapshots, governance

/**
 * Product-Context Applicable Capability Identifiers (Section 4 & 5)
 * Generic concepts that allow product-specific module bindings underneath.
 */
export type ProductCapabilityId =
  | 'DISCOVERY'              // Signal ingestion, candidate queue & research queue (Step 5)
  | 'OVERVIEW'               // Product summary & thesis
  | 'SUPPLY'                 // Supplier intelligence & geo distribution (Old: Supplier Intelligence)
  | 'SPECIFICATION_QUALITY'  // Product specs & QA (Old: QA & Metallurgy; generic for metal, electrical, chemical)
  | 'OFFER_DESIGN'           // Packaging & offer engineering (Old: Hero Pack Optimizer)
  | 'CHANNELS_D2C'           // Direct-to-consumer marketplace (Old: Amazon Experiment)
  | 'CHANNELS_B2B'           // Industrial wholesale & direct accounts (Old: B2B Funnel)
  | 'ECONOMICS'              // Unit economics & landed COGS (Old: SKU Economics)
  | 'SIMULATION'             // Capital runway & cash-flow cycles (Old: Finance Board)
  | 'SUPPLY_STRATEGY'        // In-house tooling vs. buy trade-off (Old: Make vs Buy)
  | 'RELATIONSHIPS'          // Market & factor relationships
  | 'STRATEGY'               // Strategic decision cockpits (Old: Executive Control Tower)
  | 'RESEARCH'               // Evidence observations & registry (Old: Intelligence Registry)
  | 'SYSTEM'                 // Frozen contract audit, snapshots & archives (Old: Contract Inspector)
  | 'UNIVERSE';              // Product universe & capability inspector

export interface CapabilityDescriptor {
  id: ProductCapabilityId;
  topLevel: TopLevelCapability;
  name: string;
  genericConcept: string;
  description: string;
  order: number;
}

/**
 * Product Capability Profile (Section 4)
 * Dictates which capabilities are active and applicable for a given product.
 */
export interface ProductCapabilityProfile {
  product_id: string;
  applicable_capabilities: ProductCapabilityId[];
  /** Sub-module specialization bindings (e.g. 'metallurgy_torque_din3017') */
  module_bindings: Partial<Record<ProductCapabilityId, string>>;
  /** Product-specific display labels (e.g. 'Metallurgy & Torque QA' under SPECIFICATION_QUALITY) */
  custom_labels?: Partial<Record<ProductCapabilityId, string>>;
}

/**
 * Canonical taxonomy registry with standard descriptors
 */
export const CAPABILITY_TAXONOMY: Record<ProductCapabilityId, CapabilityDescriptor> = {
  DISCOVERY: {
    id: 'DISCOVERY',
    topLevel: 'DISCOVER',
    name: 'Opportunity Discovery',
    genericConcept: 'Signal Ingestion & Candidate Pipeline',
    description: 'Controlled signal intake, observation normalization, candidate queue, and epistemic isolation.',
    order: 0
  },
  STRATEGY: {
    id: 'STRATEGY',
    topLevel: 'STRATEGY',
    name: 'Strategy & Control Tower',
    genericConcept: 'Commercial Decision & Capital Allocation',
    description: 'Executive cockpit, bottleneck triage, and real-time capital allocation posture.',
    order: 1
  },
  OVERVIEW: {
    id: 'OVERVIEW',
    topLevel: 'UNIVERSE',
    name: 'Product Overview',
    genericConcept: 'Opportunity Signal Profile',
    description: 'Canonical identity, thesis, material specification, and baseline opportunity parameters.',
    order: 2
  },
  SUPPLY: {
    id: 'SUPPLY',
    topLevel: 'RESEARCH',
    name: 'Supply & Sourcing',
    genericConcept: 'Supplier Intelligence & Sourcing Map',
    description: 'Direct manufacturer quotation analysis, industrial cluster mapping, and supplier capacity verification.',
    order: 3
  },
  SPECIFICATION_QUALITY: {
    id: 'SPECIFICATION_QUALITY',
    topLevel: 'RESEARCH',
    name: 'Specification & Quality',
    genericConcept: 'Physical Standards & Quality Verification',
    description: 'Technical standards compliance, batch sampling QA, and defect risk gating.',
    order: 4
  },
  OFFER_DESIGN: {
    id: 'OFFER_DESIGN',
    topLevel: 'ECONOMICS',
    name: 'Offer Design',
    genericConcept: 'Offer Packaging & Logistics Tiering',
    description: 'Pack size optimization, dimensional weight engineering, and FBA tier minimization.',
    order: 5
  },
  ECONOMICS: {
    id: 'ECONOMICS',
    topLevel: 'ECONOMICS',
    name: 'Unit Economics',
    genericConcept: 'Deterministic Commercial Economics',
    description: 'Unit landed cost, cost-to-serve breakdown, marketplace fee sensitivity, and net margin calculation.',
    order: 6
  },
  CHANNELS_D2C: {
    id: 'CHANNELS_D2C',
    topLevel: 'ECONOMICS',
    name: 'Channels: D2C Marketplace',
    genericConcept: 'Digital Consumer & B2C Channel Execution',
    description: 'Amazon ASIN sales velocity, advertising PPC budget elasticity, and return rate stress test.',
    order: 7
  },
  CHANNELS_B2B: {
    id: 'CHANNELS_B2B',
    topLevel: 'ECONOMICS',
    name: 'Channels: B2B Wholesale',
    genericConcept: 'Direct Industrial Wholesale & Repeat Contract Accounts',
    description: 'OEM customer pipeline, contract pricing, annual volume demand, and wholesale credit terms.',
    order: 8
  },
  SIMULATION: {
    id: 'SIMULATION',
    topLevel: 'ECONOMICS',
    name: 'Simulation & Runway',
    genericConcept: 'Dynamic Working Capital Simulation',
    description: 'Multi-cycle cash flow simulation, working capital reserves, floating capital lag, and XIRR rate.',
    order: 9
  },
  SUPPLY_STRATEGY: {
    id: 'SUPPLY_STRATEGY',
    topLevel: 'STRATEGY',
    name: 'Supply Strategy',
    genericConcept: 'Make vs Buy Sourcing Analysis',
    description: 'Tooling CAPEX, progressive stamping unit economics, and in-house manufacturing cross-over volume.',
    order: 10
  },
  RESEARCH: {
    id: 'RESEARCH',
    topLevel: 'RESEARCH',
    name: 'Evidence & Research Registry',
    genericConcept: 'Empirical Evidence & Epistemic Tracking',
    description: 'Observation log, provenance lineage, confidence weighting, and research backlog management.',
    order: 11
  },
  RELATIONSHIPS: {
    id: 'RELATIONSHIPS',
    topLevel: 'RELATIONSHIPS',
    name: 'Relationships & Linkages',
    genericConcept: 'Cross-Product & Factor Linkages',
    description: 'Material cost dependencies, shared supply clusters, and customer cross-purchasing affinity.',
    order: 12
  },
  SYSTEM: {
    id: 'SYSTEM',
    topLevel: 'SYSTEM',
    name: 'System Governance',
    genericConcept: 'Frozen Engine Contracts & Audits',
    description: 'Mathematical verification suite, adversarial stress test, snapshot vault, and Google Drive archival.',
    order: 13
  },
  UNIVERSE: {
    id: 'UNIVERSE',
    topLevel: 'UNIVERSE',
    name: 'Product Universe',
    genericConcept: 'Accumulated Product & Opportunity Catalog',
    description: 'Complete inventory of catalogued products, variants, opportunities, and their capability profiles.',
    order: 14
  }
};
