/**
 * POC-001: Discovery Engine & Epistemic Boundary Control
 * Step 5: Opportunity Discovery, Signal Ingestion, Deduplication & Conflict Isolation
 * 
 * Strict Epistemic Law:
 * Web/Agent Observation -> Observation -> Evidence/Provenance -> Candidate -> Review/Approval -> Scenario Parameter -> Frozen Core
 * 
 * Under NO circumstances does an observation directly alter active scenario financial parameters.
 */

import {
  DiscoverySource,
  DiscoveryRun,
  DiscoverySignal,
  ObservationEnvelope,
  CandidateProduct,
  CandidateOpportunity,
  ObservationConflict,
  DeduplicationResult,
  DiscoveryTask,
  DiscoveryResult,
  DiscoveryAgent,
  UserDiscoveryFeedback
} from '../types/discovery';
import { productRegistry } from './productRegistry';

// Seed Public Discovery Sources
export const seedDiscoverySources: DiscoverySource[] = [
  {
    source_id: 'src_bis_standards_registry',
    source_type: 'PUBLIC_DOCUMENT',
    name: 'Bureau of Indian Standards (BIS) — IS 4762 / DIN 3017 Register',
    url: 'https://standardsbis.bsbedge.com',
    publisher: 'Government of India',
    description: 'National specifications and dimensional tolerance registry for industrial worm-drive hose clamps.',
    reliability_class: 'OFFICIAL_STANDARD',
    active: true
  },
  {
    source_id: 'src_howrah_msme_cluster',
    source_type: 'SUPPLIER_DIRECTORY',
    name: 'Howrah Baltikuri & Dasnagar Precision Stamping Cluster Directory',
    url: 'https://msme.gov.in/industrial-clusters/howrah',
    publisher: 'West Bengal Directorate of MSME',
    description: 'Empirical manufacturing unit registry for heavy stamping and stainless hardware.',
    reliability_class: 'AUDITED_DIRECTORY',
    active: true
  },
  {
    source_id: 'src_amazon_in_catalog',
    source_type: 'MARKETPLACE',
    name: 'Amazon India Industrial & Scientific Hardware Marketplace',
    url: 'https://www.amazon.in/b?node=976419031',
    publisher: 'Amazon Seller Services India',
    description: 'Public listing catalog for DIY and commercial mechanical consumables.',
    reliability_class: 'PUBLIC_MARKETPLACE',
    active: true
  },
  {
    source_id: 'src_indiamart_b2b',
    source_type: 'SUPPLIER_DIRECTORY',
    name: 'IndiaMART Verified SS304 Fastener & Clamp Manufacturers',
    url: 'https://dir.indiamart.com/kolkata/hose-clamps.html',
    publisher: 'IndiaMART InterMESH Ltd',
    description: 'Public directory of fastener stockists, stamping units, and industrial fabricators.',
    reliability_class: 'COMMERCIAL_DIRECTORY',
    active: true
  },
  {
    source_id: 'src_agent_web_crawler',
    source_type: 'AGENT_RESEARCH',
    name: 'Autonomous Industrial Research Agent (Gemini / Web Grounded)',
    publisher: 'POC-001 Discovery Subsystem',
    description: 'Read-only web extraction agent investigating public B2B prices and supply clusters.',
    reliability_class: 'MACHINE_EXTRACTED',
    active: true
  }
];

// Seed Historical Discovery Runs
export const seedDiscoveryRuns: DiscoveryRun[] = [
  {
    run_id: 'run_disc_howrah_20261001',
    agent_id: 'agent_cluster_inspector_01',
    provider: 'DETERMINISTIC_CLUSTER_ENGINE',
    started_at: '2026-10-01T09:00:00Z',
    completed_at: '2026-10-01T09:02:15Z',
    query: 'SS304 DIN 3017 worm drive hose clamp manufacturers Baltikuri Howrah',
    objective: 'Discover Howrah precision stamping suppliers producing DIN 3017 W4 grade worm-drive clamps.',
    source_ids: ['src_howrah_msme_cluster', 'src_bis_standards_registry'],
    status: 'COMPLETED',
    observation_count: 4,
    candidate_count: 1
  },
  {
    run_id: 'run_disc_amazon_scraping_20261003',
    agent_id: 'agent_marketplace_scraper_02',
    provider: 'GEMINI_SEARCH_GROUNDED',
    started_at: '2026-10-03T14:10:00Z',
    completed_at: '2026-10-03T14:11:42Z',
    query: 'SS304 hose clamp pack of 20 prices and seller reviews Amazon India',
    objective: 'Audit public marketplace prices, seller concentration, and review defect modes for DIN 3017 clamps.',
    source_ids: ['src_amazon_in_catalog'],
    status: 'COMPLETED',
    observation_count: 5,
    candidate_count: 1
  }
];

// Seed Discovery Signals
export const seedDiscoverySignals: DiscoverySignal[] = [
  {
    signal_id: 'sig_disc_001_ss304_din3017_cluster',
    run_id: 'run_disc_howrah_20261001',
    signal_type: 'SUPPLY_CLUSTER',
    title: 'Howrah Baltikuri High-Speed Progressive Stamping Cluster',
    description: 'Identified 12 verified stamping units in Baltikuri Industrial Estate with active tooling for DIN 3017 9mm/12mm band widths.',
    observed_at: '2026-10-01T09:01:20Z',
    source_id: 'src_howrah_msme_cluster',
    source_url: 'https://msme.gov.in/industrial-clusters/howrah',
    provenance: 'EXTERNAL_PUBLISHED',
    evidence_quality: 94,
    status: 'ACCEPTED',
    linked_product_id: 'prod_ss304_din3017_canonical',
    linked_opportunity_id: 'opp_ss304_howrah_arb_001'
  },
  {
    signal_id: 'sig_disc_002_supplier_quote_observation',
    run_id: 'run_disc_howrah_20261001',
    signal_type: 'PRICE',
    title: 'Observed Baltikuri Finished Clamp Sourcing Quotation (₹13.20/pc)',
    description: 'Bengal Precision Stamping quoted ₹13.20/pc for 16–25mm SS304 DIN 3017 clamps against 50,000 unit batch commitments.',
    observed_at: '2026-10-01T09:02:00Z',
    source_id: 'src_howrah_msme_cluster',
    source_url: 'https://msme.gov.in/industrial-clusters/howrah/bengal-precision',
    provenance: 'SUPPLIER_QUOTED',
    evidence_quality: 91,
    status: 'ACCEPTED',
    linked_product_id: 'prod_ss304_din3017_canonical',
    linked_opportunity_id: 'opp_ss304_howrah_arb_001'
  },
  {
    signal_id: 'sig_disc_003_marketplace_asp_spread',
    run_id: 'run_disc_amazon_scraping_20261003',
    signal_type: 'MARKET',
    title: 'Marketplace ASP Spread: ₹499–₹649 for 20-Pack SS304 Clamps',
    description: 'Amazon.in top 4 listings sell 20-packs at average ASP ₹539 (₹26.95/pc), creating a ₹13.75/pc gross spread over Howrah sourcing.',
    observed_at: '2026-10-03T14:11:00Z',
    source_id: 'src_amazon_in_catalog',
    source_url: 'https://www.amazon.in/b?node=976419031',
    provenance: 'EXTERNAL_PUBLISHED',
    evidence_quality: 89,
    status: 'ACCEPTED',
    linked_product_id: 'prod_ss304_din3017_canonical',
    linked_opportunity_id: 'opp_ss304_howrah_arb_001'
  },
  {
    signal_id: 'sig_disc_004_candidate_brass_ball_valve',
    run_id: 'run_disc_amazon_scraping_20261003',
    signal_type: 'PRODUCT',
    title: 'Candidate Signal: Forged Brass Full-Bore Ball Valve 1/2" (IS 9890)',
    description: 'Observed recurring MRO consumption and high marketplace price spread on standard 1/2 inch brass shut-off valves.',
    observed_at: '2026-10-03T14:11:30Z',
    source_id: 'src_indiamart_b2b',
    source_url: 'https://dir.indiamart.com/kolkata/brass-valves.html',
    provenance: 'AGENT_OBSERVED',
    evidence_quality: 76,
    status: 'REVIEW'
  }
];

// Seed Observation Envelopes
export const seedObservationEnvelopes: ObservationEnvelope[] = [
  {
    observation_id: 'obs_001_supplier_unit_price_bengal',
    run_id: 'run_disc_howrah_20261001',
    subject_type: 'PRICE',
    subject_candidate_id: 'sup-howrah-precision',
    source: 'Howrah Baltikuri & Dasnagar Cluster Directory',
    source_url: 'https://msme.gov.in/industrial-clusters/howrah',
    observed_at: '2026-10-01T09:02:00Z',
    raw_value: '₹13.20 per piece ex-factory',
    normalized_value: 13.20,
    unit: 'INR/unit',
    category: 'PROCUREMENT_PRICE',
    provenance: 'SUPPLIER_QUOTED',
    extraction_method: 'MANUAL',
    verification_status: 'VERIFIED',
    notes: 'Observed price only. Epistemic isolation enforced: not promoted to active scenario without review.'
  },
  {
    observation_id: 'obs_002_supplier_unit_price_chakan',
    run_id: 'run_disc_howrah_20261001',
    subject_type: 'PRICE',
    subject_candidate_id: 'sup-pune-automotive',
    source: 'Chakan Automotive Fasteners Catalog',
    source_url: 'https://chakanfasteners.com/catalog/hose-clamps',
    observed_at: '2026-10-01T09:03:00Z',
    raw_value: '₹13.80 per unit FOB Pune',
    normalized_value: 13.80,
    unit: 'INR/unit',
    category: 'PROCUREMENT_PRICE',
    provenance: 'EXTERNAL_PUBLISHED',
    extraction_method: 'RULE',
    verification_status: 'PARTIALLY_VERIFIED',
    notes: 'Quotation published online; MOQ 10,000 units.'
  },
  {
    observation_id: 'obs_003_marketplace_asp_20pack',
    run_id: 'run_disc_amazon_scraping_20261003',
    subject_type: 'PRICE',
    subject_candidate_id: 'asin-b09-ss304-20p',
    source: 'Amazon India Marketplace Product Page',
    source_url: 'https://www.amazon.in/dp/B09V7XYZ12',
    observed_at: '2026-10-03T14:11:00Z',
    raw_value: '₹499.00 inclusive of taxes',
    normalized_value: 499.00,
    unit: 'INR/pack',
    category: 'MARKETPLACE_ASP',
    provenance: 'EXTERNAL_PUBLISHED',
    extraction_method: 'API',
    verification_status: 'VERIFIED',
    notes: 'Pack of 20 SS304 Worm Drive Hose Clamps (16–25mm).'
  },
  {
    observation_id: 'obs_004_brass_valve_candidate_price',
    run_id: 'run_disc_amazon_scraping_20261003',
    subject_type: 'PRICE',
    subject_candidate_id: 'cand_prod_brass_ball_valve_001',
    source: 'IndiaMART Verified Sourcing Page',
    source_url: 'https://dir.indiamart.com/kolkata/brass-valves.html',
    observed_at: '2026-10-03T14:11:30Z',
    raw_value: '₹115.00/pc MOQ 200',
    normalized_value: 115.00,
    unit: 'INR/unit',
    category: 'PROCUREMENT_PRICE',
    provenance: 'AGENT_OBSERVED',
    extraction_method: 'LLM',
    verification_status: 'UNVERIFIED',
    notes: 'Candidate product observation only. Awaiting physical verification.'
  }
];

// Seed Candidate Products (Not permanent products, kept in candidate queue)
export const seedCandidateProducts: CandidateProduct[] = [
  {
    candidate_product_id: 'cand_prod_brass_ball_valve_001',
    proposed_name: 'Forged Brass Full-Bore Ball Valve 1/2" (IS 9890)',
    category_hint: 'Fluid Handling & Industrial Valves',
    description: 'Forged brass quarter-turn shutoff ball valve with chrome-plated ball and PTFE seats.',
    observed_material: 'Forged Brass CW617N / IS 319 Grade 1',
    observed_standard: 'IS 9890 / BS 5154',
    signal_ids: ['sig_disc_004_candidate_brass_ball_valve'],
    evidence_ids: ['obs_004_brass_valve_candidate_price'],
    status: 'RESEARCHING',
    created_at: '2026-10-03T14:15:00Z',
    updated_at: '2026-10-03T14:15:00Z'
  }
];

// Seed Candidate Opportunities
export const seedCandidateOpportunities: CandidateOpportunity[] = [
  {
    candidate_opportunity_id: 'cand_opp_brass_valve_jalandhar_kolkata_001',
    candidate_product_id: 'cand_prod_brass_ball_valve_001',
    proposed_title: 'Jalandhar Forged Brass Valve → Eastern Region MRO Direct Supply',
    thesis: 'Procure high-volume forged valves from Jalandhar cluster at ₹115 and distribute to Eastern OEM fabricators at ₹185.',
    channel: 'B2B',
    buyer_segment: 'Chemical & Industrial Pump Fabricators',
    use_case: 'Fluid shut-off on slurry and water delivery lines',
    supply_thesis: 'Jalandhar valve forging cluster delivers 38% lower unit cost than local Kolkata traders.',
    competitive_thesis: 'Local distributors stock unbranded Chinese pot-metal valves with high leak rates.',
    signal_ids: ['sig_disc_004_candidate_brass_ball_valve'],
    evidence_ids: ['obs_004_brass_valve_candidate_price'],
    status: 'DISCOVERED',
    created_at: '2026-10-03T14:20:00Z',
    updated_at: '2026-10-03T14:20:00Z'
  }
];

// Seed Observation Conflicts
export const seedObservationConflicts: ObservationConflict[] = [
  {
    conflict_id: 'conf_price_howrah_vs_delhi_trader',
    subject: 'SS304 DIN 3017 16-25mm Hose Clamp',
    field: 'supplier_unit_price',
    observations: [
      {
        observation_id: 'obs_conf_01',
        source: 'Howrah Baltikuri Direct Stamping Press',
        observed_at: '2026-10-01T09:02:00Z',
        value: 13.20,
        unit: 'INR/unit'
      },
      {
        observation_id: 'obs_conf_02',
        source: 'Delhi Chawri Bazar Commercial Hardware Stockist',
        observed_at: '2026-10-02T11:45:00Z',
        value: 17.50,
        unit: 'INR/unit'
      }
    ],
    status: 'UNRESOLVED',
    resolution_notes: 'Delhi trader quote reflects 32% middleman markup over Howrah direct stamping press. Retain both observations; do not blend or overwrite.',
    created_at: '2026-10-02T12:00:00Z'
  }
];

/**
 * Deterministic Deduplication Engine
 */
export function evaluateDeduplication(
  title: string,
  material?: string,
  standard?: string,
  partNumber?: string
): DeduplicationResult {
  const normTitle = title.toLowerCase().trim();
  const normMaterial = (material || '').toLowerCase().trim();
  const normStandard = (standard || '').toLowerCase().trim();

  // Check against canonical product
  const canonical = productRegistry.getProduct('prod_ss304_din3017_canonical');
  if (canonical) {
    const isSS304 = normTitle.includes('ss304') || normTitle.includes('304') || normMaterial.includes('ss304') || normMaterial.includes('w4');
    const isHoseClamp = normTitle.includes('hose clamp') || normTitle.includes('worm drive') || normTitle.includes('worm-drive') || normTitle.includes('clamp');
    const isDIN3017 = normTitle.includes('din 3017') || normStandard.includes('din 3017') || normStandard.includes('is 4762');

    if (isSS304 && isHoseClamp && isDIN3017) {
      return {
        verdict: 'DUPLICATE',
        matchedEntityId: canonical.product_id,
        matchedEntityType: 'PRODUCT',
        confidenceScore: 0.98,
        reasons: [
          'Matches canonical SS304 Worm-Drive Hose Clamp on DIN 3017 standard',
          'Identical W4 material metallurgy specification',
          'Associated with established Signal #001'
        ]
      };
    }

    if (isSS304 && isHoseClamp) {
      return {
        verdict: 'POSSIBLE_DUPLICATE',
        matchedEntityId: canonical.product_id,
        matchedEntityType: 'PRODUCT',
        confidenceScore: 0.75,
        reasons: [
          'Matches material (SS304) and generic category (Hose Clamp)',
          'Requires standard verification (DIN 3017 vs SAE J1508)'
        ]
      };
    }
  }

  // Check part number if provided
  if (partNumber && partNumber.toUpperCase().includes('DIN3017')) {
    return {
      verdict: 'POSSIBLE_DUPLICATE',
      matchedEntityId: 'prod_ss304_din3017_canonical',
      matchedEntityType: 'PRODUCT',
      confidenceScore: 0.85,
      reasons: ['Part number explicitly references DIN 3017 standard series']
    };
  }

  if (normTitle.length < 5) {
    return {
      verdict: 'REVIEW',
      confidenceScore: 0.2,
      reasons: ['Title or description insufficient to evaluate deduplication']
    };
  }

  return {
    verdict: 'NEW',
    confidenceScore: 0.95,
    reasons: ['No matching canonical entity found in Product Registry']
  };
}

/**
 * Validates agent output before allowing ingestion
 */
export function validateAgentOutput(payload: {
  title?: string;
  description?: string;
  source?: string;
  source_url?: string;
  observed_price?: number;
  run_id?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
    errors.push('Missing or empty title');
  }

  if (!payload.run_id || typeof payload.run_id !== 'string') {
    errors.push('Missing run_id linkage');
  }

  if (payload.observed_price !== undefined) {
    if (typeof payload.observed_price !== 'number' || isNaN(payload.observed_price) || !isFinite(payload.observed_price)) {
      errors.push('Observed price must be a valid finite number');
    } else if (payload.observed_price < 0) {
      errors.push('Observed price cannot be negative');
    }
  }

  if (!payload.source || payload.source.trim().length === 0) {
    errors.push('Source identification is required for empirical provenance');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Provider-Neutral Deterministic Cluster Discovery Agent
 */
export class DeterministicClusterAgent implements DiscoveryAgent {
  agent_id = 'agent_deterministic_cluster_01';
  provider = 'DETERMINISTIC_CLUSTER_ENGINE';

  async discover(task: DiscoveryTask): Promise<DiscoveryResult> {
    const runId = `run_disc_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const geo = (task.scope?.geography || 'Kolkata / Howrah').toLowerCase();

    const signals: DiscoverySignal[] = [];
    const observations: ObservationEnvelope[] = [];
    const candidateProducts: CandidateProduct[] = [];
    const candidateOpportunities: CandidateOpportunity[] = [];
    const conflicts: ObservationConflict[] = [];

    // Signal A: Howrah local stamping discovery
    const sig1Id = `sig_${Date.now()}_01`;
    signals.push({
      signal_id: sig1Id,
      run_id: runId,
      signal_type: 'SUPPLY_CLUSTER',
      title: 'Howrah Baltikuri DIN 3017 Hose Clamp Cluster',
      description: `Discovered 8 audited precision stamping units in Baltikuri Industrial Estate (${geo}) with verified W4 progressive tooling.`,
      observed_at: timestamp,
      source_id: 'src_howrah_msme_cluster',
      source_url: 'https://msme.gov.in/industrial-clusters/howrah',
      provenance: 'EXTERNAL_PUBLISHED',
      evidence_quality: 92,
      status: 'ACCEPTED',
      linked_product_id: 'prod_ss304_din3017_canonical',
      linked_opportunity_id: 'opp_ss304_howrah_arb_001'
    });

    // Signal B: Unpriced supplier signal (Strict Rule: NO synthetic quote)
    const sig2Id = `sig_${Date.now()}_02`;
    signals.push({
      signal_id: sig2Id,
      run_id: runId,
      signal_type: 'SUPPLIER',
      title: 'Dasnagar Heavy Engineering & Pressing Works',
      description: 'Manufactures custom bands and stamping housings. Quotation pending RFQ response (Price: DATA INSUFFICIENT).',
      observed_at: timestamp,
      source_id: 'src_howrah_msme_cluster',
      provenance: 'EXTERNAL_PUBLISHED',
      evidence_quality: 85,
      status: 'NEW',
      linked_product_id: 'prod_ss304_din3017_canonical'
    });

    // Observation 1: Price observation (isolated from financial state)
    observations.push({
      observation_id: `obs_${Date.now()}_price_howrah`,
      run_id: runId,
      subject_type: 'PRICE',
      subject_candidate_id: 'sup-howrah-precision',
      source: 'Baltikuri Stamping Press Spot Audit',
      source_url: 'https://msme.gov.in/industrial-clusters/howrah',
      observed_at: timestamp,
      raw_value: '₹13.40 / unit (ex-works Howrah)',
      normalized_value: 13.40,
      unit: 'INR/unit',
      category: 'SUPPLIER_PRICE',
      provenance: 'SUPPLIER_QUOTED',
      extraction_method: 'MANUAL',
      verification_status: 'PARTIALLY_VERIFIED',
      notes: 'Spot inquiry price. Epistemic boundary preserved: does NOT alter scenario parameter.'
    });

    // Candidate Product: Novel candidate if objective requests novel consumables
    if (task.objective.toLowerCase().includes('valve') || task.scope?.category?.toLowerCase().includes('valve')) {
      const candProdId = `cand_prod_${Date.now()}_valve`;
      const candOppId = `cand_opp_${Date.now()}_valve_arb`;

      candidateProducts.push({
        candidate_product_id: candProdId,
        proposed_name: 'Industrial SS316 3-Piece Ball Valve 1" (API 607 Fire Safe)',
        category_hint: 'Process Valves & Severe Service Fittings',
        description: 'Investment cast 3-piece full port ball valve for industrial solvent transfer lines.',
        observed_material: 'SS316 CF8M',
        observed_standard: 'API 607 / ASME B16.34',
        signal_ids: [sig1Id],
        evidence_ids: [`obs_${Date.now()}_price_howrah`],
        status: 'DISCOVERED',
        created_at: timestamp,
        updated_at: timestamp
      });

      candidateOpportunities.push({
        candidate_opportunity_id: candOppId,
        candidate_product_id: candProdId,
        proposed_title: 'Eastern Chemical Corridor Direct Valve Supply Arbitrage',
        thesis: 'Distribute certified API 607 SS316 ball valves directly to Haldia petrochemical plants.',
        channel: 'B2B',
        buyer_segment: 'Petrochemical & Fertilizer MRO',
        use_case: 'Corrosive chemical transfer isolation',
        supply_thesis: 'Sourcing directly from Rajkot investment casting foundries bypasses regional markups.',
        competitive_thesis: 'Incumbent stockists fail to provide batch material test certificates (MTC 3.1).',
        signal_ids: [sig1Id],
        evidence_ids: [],
        status: 'DISCOVERED',
        created_at: timestamp,
        updated_at: timestamp
      });
    }

    return {
      run_id: runId,
      signals,
      observations,
      candidateProducts,
      candidateOpportunities,
      conflicts
    };
  }
}

/**
 * Main Discovery Engine State & Service Layer
 */
export class DiscoveryEngine {
  private sources: DiscoverySource[] = [...seedDiscoverySources];
  private runs: DiscoveryRun[] = [...seedDiscoveryRuns];
  private signals: DiscoverySignal[] = [...seedDiscoverySignals];
  private observations: ObservationEnvelope[] = [...seedObservationEnvelopes];
  private candidateProducts: CandidateProduct[] = [...seedCandidateProducts];
  private candidateOpportunities: CandidateOpportunity[] = [...seedCandidateOpportunities];
  private conflicts: ObservationConflict[] = [...seedObservationConflicts];
  private agents: Map<string, DiscoveryAgent> = new Map();

  constructor() {
    this.registerAgent(new DeterministicClusterAgent());
    this.loadOperationalPersistence();
  }

  private loadOperationalPersistence(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const savedSignals = localStorage.getItem('app_discovery_signals');
      if (savedSignals) {
        const parsed = JSON.parse(savedSignals);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.signals = parsed;
        }
      }
      const savedRuns = localStorage.getItem('app_discovery_runs');
      if (savedRuns) {
        const parsed = JSON.parse(savedRuns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.runs = parsed;
        }
      }
      const savedCandidates = localStorage.getItem('app_discovery_candidate_products');
      if (savedCandidates) {
        const parsed = JSON.parse(savedCandidates);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.candidateProducts = parsed;
        }
      }
    } catch {}
  }

  private saveOperationalPersistence(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem('app_discovery_signals', JSON.stringify(this.signals));
      localStorage.setItem('app_discovery_runs', JSON.stringify(this.runs));
      localStorage.setItem('app_discovery_candidate_products', JSON.stringify(this.candidateProducts));
    } catch {}
  }

  public registerAgent(agent: DiscoveryAgent): void {
    this.agents.set(agent.agent_id, agent);
  }

  public getSources(): DiscoverySource[] {
    return [...this.sources];
  }

  public getRuns(): DiscoveryRun[] {
    return [...this.runs];
  }

  public getSignals(): DiscoverySignal[] {
    return [...this.signals];
  }

  public getObservations(): ObservationEnvelope[] {
    return [...this.observations];
  }

  public getCandidateProducts(): CandidateProduct[] {
    return [...this.candidateProducts];
  }

  public getCandidateOpportunities(): CandidateOpportunity[] {
    return [...this.candidateOpportunities];
  }

  public getConflicts(): ObservationConflict[] {
    return [...this.conflicts];
  }

  /**
   * Execute an auditable Discovery Task
   */
  public async executeTask(task: DiscoveryTask, agentId?: string): Promise<DiscoveryRun> {
    const startedAt = new Date().toISOString();
    const runId = `run_${Date.now()}`;
    const agent = agentId ? this.agents.get(agentId) : this.agents.get('agent_deterministic_cluster_01') || new DeterministicClusterAgent();

    const newRun: DiscoveryRun = {
      run_id: runId,
      agent_id: agent?.agent_id,
      provider: agent?.provider || 'UNKNOWN',
      started_at: startedAt,
      query: task.objective,
      objective: task.objective,
      source_ids: this.sources.map((s) => s.source_id),
      status: 'RUNNING',
      observation_count: 0,
      candidate_count: 0
    };

    this.runs = [newRun, ...this.runs];

    try {
      if (!agent) {
        throw new Error('No registered discovery agent found');
      }

      const result = await agent.discover(task);

      // Ingest signals & observations with deduplication check
      for (const sig of result.signals) {
        // Evaluate deduplication against existing products
        const dedup = evaluateDeduplication(sig.title);
        if (dedup.verdict === 'DUPLICATE' && dedup.matchedEntityId) {
          sig.linked_product_id = dedup.matchedEntityId;
        }
        this.signals = [sig, ...this.signals];
      }

      for (const obs of result.observations) {
        this.observations = [obs, ...this.observations];
      }

      for (const candProd of result.candidateProducts) {
        this.candidateProducts = [candProd, ...this.candidateProducts];
      }

      for (const candOpp of result.candidateOpportunities) {
        this.candidateOpportunities = [candOpp, ...this.candidateOpportunities];
      }

      for (const conf of result.conflicts) {
        this.conflicts = [conf, ...this.conflicts];
      }

      newRun.status = 'COMPLETED';
      newRun.completed_at = new Date().toISOString();
      newRun.observation_count = result.observations.length;
      newRun.candidate_count = result.candidateProducts.length + result.candidateOpportunities.length;
    } catch (err: any) {
      newRun.status = 'FAILED';
      newRun.completed_at = new Date().toISOString();
      newRun.errors = [err.message || 'Unknown discovery agent failure'];
    }

    this.saveOperationalPersistence();
    return newRun;
  }

  /**
   * Record User Feedback on Signal
   */
  public recordSignalFeedback(signalId: string, feedback: UserDiscoveryFeedback): void {
    this.signals = this.signals.map((sig) => {
      if (sig.signal_id === signalId) {
        return {
          ...sig,
          user_feedback: feedback,
          status: feedback === 'NOT_RELEVANT' ? 'REJECTED' :
                  feedback === 'DUPLICATE' ? 'DUPLICATE' :
                  feedback === 'RELEVANT' ? 'ACCEPTED' : sig.status
        };
      }
      return sig;
    });
    this.saveOperationalPersistence();
  }

  /**
   * Update Candidate Product Status
   */
  public updateCandidateProductStatus(candidateId: string, status: CandidateProduct['status']): void {
    this.candidateProducts = this.candidateProducts.map((c) => {
      if (c.candidate_product_id === candidateId) {
        return {
          ...c,
          status,
          updated_at: new Date().toISOString()
        };
      }
      return c;
    });
    this.saveOperationalPersistence();
  }

  /**
   * Update Candidate Opportunity Status
   */
  public updateCandidateOpportunityStatus(candidateId: string, status: CandidateOpportunity['status']): void {
    this.candidateOpportunities = this.candidateOpportunities.map((c) => {
      if (c.candidate_opportunity_id === candidateId) {
        return {
          ...c,
          status,
          updated_at: new Date().toISOString()
        };
      }
      return c;
    });
    this.saveOperationalPersistence();
  }

  /**
   * Reset Discovery State to Default
   */
  public resetToDefaults(): void {
    this.sources = [...seedDiscoverySources];
    this.runs = [...seedDiscoveryRuns];
    this.signals = [...seedDiscoverySignals];
    this.observations = [...seedObservationEnvelopes];
    this.candidateProducts = [...seedCandidateProducts];
    this.candidateOpportunities = [...seedCandidateOpportunities];
    this.conflicts = [...seedObservationConflicts];
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('app_discovery_signals');
      localStorage.removeItem('app_discovery_runs');
      localStorage.removeItem('app_discovery_candidate_products');
    }
  }
}

export const discoveryEngine = new DiscoveryEngine();
