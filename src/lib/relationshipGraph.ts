/**
 * POC-001: Product Signal Intelligence & Capital Allocation OS
 * Architectural Governance Amendment: Extensible Entity & Relationship Graph
 * 
 * Strict Domain Invariants:
 * 1. Typed relationships, not unrestricted Record<string, unknown>.
 * 2. Inferred relationships require review; never auto-promoted to established facts.
 * 3. Evidence-backed with explicit provenance, timestamps, methodology and caveats.
 * 4. Broad commercial scope: Physical MRO, Festive D2C, Scented candles, Electrical,
 *    Secondary/surplus, B2B wholesale, Import substitution, etc.
 */

import {
  EntityDomainType,
  RelationshipType,
  RelationshipReviewStatus,
  TypedEntityRelationship,
  EntitySummary,
  ArchetypePatternDefinition
} from '../types/entityRelations';

export class RelationshipGraph {
  private entities = new Map<string, EntitySummary>();
  private relationships = new Map<string, TypedEntityRelationship>();
  private archetypes = new Map<string, ArchetypePatternDefinition>();

  constructor() {
    this.seedGraph();
  }

  // ============================================================================
  // Entity Registration & Lookup
  // ============================================================================

  public registerEntity(entity: EntitySummary): void {
    this.entities.set(entity.entity_id, entity);
  }

  public getEntity(entityId: string): EntitySummary | undefined {
    return this.entities.get(entityId);
  }

  public getAllEntities(): EntitySummary[] {
    return Array.from(this.entities.values());
  }

  public getEntitiesByType(type: EntityDomainType): EntitySummary[] {
    return this.getAllEntities().filter((e) => e.entity_type === type);
  }

  // ============================================================================
  // Relationship Registration & Queries
  // ============================================================================

  public addRelationship(rel: TypedEntityRelationship): void {
    this.relationships.set(rel.relationship_id, rel);
  }

  public getRelationship(relId: string): TypedEntityRelationship | undefined {
    return this.relationships.get(relId);
  }

  public getAllRelationships(): TypedEntityRelationship[] {
    return Array.from(this.relationships.values());
  }

  public getRelationshipsForEntity(entityId: string): TypedEntityRelationship[] {
    return this.getAllRelationships().filter(
      (r) => r.source_entity_id === entityId || r.target_entity_id === entityId
    );
  }

  public getRelationshipsByType(type: RelationshipType): TypedEntityRelationship[] {
    return this.getAllRelationships().filter((r) => r.relationship_type === type);
  }

  public reviewRelationship(
    relationshipId: string,
    newStatus: RelationshipReviewStatus,
    reviewerNotes?: string
  ): TypedEntityRelationship | undefined {
    const rel = this.relationships.get(relationshipId);
    if (!rel) return undefined;
    rel.status = newStatus;
    if (reviewerNotes) {
      rel.caveats.push(`Review (${new Date().toISOString()}): ${reviewerNotes}`);
    }
    return rel;
  }

  // ============================================================================
  // Archetypes
  // ============================================================================

  public registerArchetype(arch: ArchetypePatternDefinition): void {
    this.archetypes.set(arch.archetype_id, arch);
  }

  public getAllArchetypes(): ArchetypePatternDefinition[] {
    return Array.from(this.archetypes.values());
  }

  public getArchetype(archetypeId: string): ArchetypePatternDefinition | undefined {
    return this.archetypes.get(archetypeId);
  }

  public getArchetypeMembers(archetypeId: string): EntitySummary[] {
    const arch = this.archetypes.get(archetypeId);
    if (!arch) return [];
    return arch.member_product_ids
      .map((id) => this.entities.get(id))
      .filter((e): e is EntitySummary => Boolean(e));
  }

  // ============================================================================
  // Seeding Commercial Universe Entities & Typed Relationships
  // ============================================================================

  private seedGraph(): void {
    // 1. Entities
    const seedEntityList: EntitySummary[] = [
      // Products
      {
        entity_id: 'prod_ss304_din3017_canonical',
        entity_type: 'PRODUCT',
        label: 'SS304 Worm-Drive Hose Clamp (DIN 3017)',
        category: 'Industrial Hardware & Consumables',
        archetype: 'CLUSTER_MRO_STANDARDIZED',
        epistemic_status: 'FACT',
        metadata: { standard: 'DIN 3017', material: 'SS304 W4', cluster: 'Howrah Baltikuri' }
      },
      {
        entity_id: 'prod_diya_terracotta_12p',
        entity_type: 'PRODUCT',
        label: 'Handcrafted Terracotta Clay Diya (12-Pack)',
        category: 'Home & Seasonal Handicrafts',
        archetype: 'SEASONAL_D2C_VISUAL',
        epistemic_status: 'FACT',
        metadata: { seasonal_peak: 'Diwali Q3-Q4', fragility: 'HIGH', material: 'Baked Clay' }
      },
      {
        entity_id: 'prod_candle_soy_fragrance',
        entity_type: 'PRODUCT',
        label: 'Hand-Poured Soy Wax Aromatherapy Candle',
        category: 'Wellness & Home Fragrance',
        archetype: 'SEASONAL_D2C_VISUAL',
        epistemic_status: 'FACT',
        metadata: { seasonal_peak: 'Festive & Winter', markup: 'HIGH', repeat_velocity: 'MEDIUM' }
      },
      {
        entity_id: 'cand_prod_brass_ball_valve_001',
        entity_type: 'PRODUCT',
        label: 'Forged Brass Ball Valve (1/2" Full Bore PN20)',
        category: 'Plumbing & Fluid Control',
        archetype: 'CLUSTER_MRO_STANDARDIZED',
        epistemic_status: 'ESTIMATE',
        metadata: { cluster: 'Jalandhar', spec: 'PN20 Full Bore', channel: 'B2B Wholesale' }
      },
      {
        entity_id: 'prod_mcb_circuit_breaker',
        entity_type: 'PRODUCT',
        label: 'Single Pole 16A C-Curve MCB (IS 60898)',
        category: 'Electrical Switchgear & Safety',
        archetype: 'TECHNICAL_COMPLIANCE',
        epistemic_status: 'FACT',
        metadata: { compliance: 'BIS IS/60898', return_sensitivity: 'HIGH', testing_lab: 'CPRI' }
      },
      {
        entity_id: 'prod_led_decorative_lights',
        entity_type: 'PRODUCT',
        label: 'Warm White Copper Wire LED Fairy Lights (10m USB)',
        category: 'Seasonal Home Decor',
        archetype: 'SEASONAL_D2C_VISUAL',
        epistemic_status: 'FACT',
        metadata: { origin: 'Import / Domestic assembly', return_rate: 'HIGH_12pct' }
      },
      {
        entity_id: 'prod_din933_hex_bolt',
        entity_type: 'PRODUCT',
        label: 'High-Tensile Grade 8.8 Hex Bolt (DIN 933 M10x50)',
        category: 'Industrial Hardware & Consumables',
        archetype: 'CLUSTER_MRO_STANDARDIZED',
        epistemic_status: 'FACT',
        metadata: { standard: 'DIN 933', cluster: 'Howrah / Ludhiana', channel: 'B2B Bulk' }
      },

      // Market Factors
      {
        entity_id: 'factor_lme_nickel',
        entity_type: 'MARKET_FACTOR',
        label: 'LME Global Nickel Cash Index',
        epistemic_status: 'FACT',
        metadata: { volatility: 'HIGH', benchmark: '$16,250 - $20,800/t' }
      },
      {
        entity_id: 'factor_copper_brass_mcx',
        entity_type: 'MARKET_FACTOR',
        label: 'MCX Copper / Brass Ingot Index',
        epistemic_status: 'FACT',
        metadata: { volatility: 'MEDIUM', benchmark: '₹720 - ₹840/kg' }
      },
      {
        entity_id: 'factor_fragility_pottery',
        entity_type: 'MARKET_FACTOR',
        label: 'Courier Transit Pottery Fragility & Breakage Factor',
        epistemic_status: 'FACT',
        metadata: { average_breakage: '8.5%' }
      },

      // Seasons / Events
      {
        entity_id: 'season_diwali_festive',
        entity_type: 'EVENT_SEASON',
        label: 'Diwali & Dussehra Q3/Q4 Festive Shopping Spike',
        epistemic_status: 'FACT',
        metadata: { window_weeks: 6, annual_multiplier: '4.8x' }
      },
      {
        entity_id: 'season_monsoon_marine',
        entity_type: 'EVENT_SEASON',
        label: 'Monsoon Coastal & Agricultural Pump Demand Surge',
        epistemic_status: 'FACT',
        metadata: { window_weeks: 10, corrosion_risk: 'CRITICAL' }
      },

      // Channels
      {
        entity_id: 'channel_amazon_fba',
        entity_type: 'COMMERCIAL_CHANNEL',
        label: 'Amazon India FBA Marketplace',
        epistemic_status: 'FACT',
        metadata: { fee_model: 'Commission + Weight Handling + Closing Fee' }
      },
      {
        entity_id: 'channel_b2b_distributor_network',
        entity_type: 'COMMERCIAL_CHANNEL',
        label: 'Regional B2B Hardware & Plumbing Distributor Network',
        epistemic_status: 'FACT',
        metadata: { payment_terms: '30 to 60 days credit', moq_units: 500 }
      },
      {
        entity_id: 'channel_d2c_brand_store',
        entity_type: 'COMMERCIAL_CHANNEL',
        label: 'Direct-to-Consumer Brand Store (Shopify / Quick Commerce)',
        epistemic_status: 'FACT',
        metadata: { cac_dependency: 'HIGH', margin: '60%+' }
      }
    ];

    for (const ent of seedEntityList) {
      this.registerEntity(ent);
    }

    // 2. Commercial Archetypes
    this.registerArchetype({
      archetype_id: 'SEASONAL_D2C_VISUAL',
      name: 'Seasonal Festive Visual D2C Merchandising',
      description: 'High seasonality, rapid 6-week demand window, visual social-commerce merchandising, high retail gross markups (50-70%), but severe unsold inventory and transit breakage risks.',
      shared_economic_dna: 'High gross margins; steep time-decay post-event; fragility/shrinkage vulnerability; quick working capital turns.',
      key_drivers: ['Festival gifting calendar', 'Visual photo/video listings', 'Fast surface shipping courier fulfillment'],
      vulnerabilities: ['Post-event inventory cliff', 'Transit breakage (>8%)', 'Ad CAC bid surges in peak October week'],
      member_product_ids: [
        'prod_diya_terracotta_12p',
        'prod_candle_soy_fragrance',
        'prod_led_decorative_lights'
      ],
      applicable_models: [
        'MOD-SEASONAL-SELLTHROUGH-v1.0.0',
        'MOD-D2C-LTV-CAC-PAYBACK-v1.0.0',
        'EQ-BREAKAGE-SPOILAGE-COST-v1.0.0',
        'RULE-INVENTORY-CLEARANCE-ALERT-v1.0.0'
      ]
    });

    this.registerArchetype({
      archetype_id: 'CLUSTER_MRO_STANDARDIZED',
      name: 'Industrial Cluster Standardized Consumables & MRO',
      description: 'Manufactured in concentrated regional MSME clusters (Howrah, Jalandhar, Ludhiana), standardized DIN/IS technical specifications, low unit costs, unbranded competition, and steady year-round recurring B2B/workshop demand.',
      shared_economic_dna: 'Predictable year-round demand; local sourcing cost arbitrage; raw material commodity sensitivity; bundled hero packaging moats.',
      key_drivers: ['Local cluster manufacturing proximity', 'Standardized DIN/ISO compliance', 'Bundled hero pack unit economics'],
      vulnerabilities: ['Commodity price surges (Nickel, Brass)', 'SS201 alloy substitution cheating', 'B2B 60-day credit term drag'],
      member_product_ids: [
        'prod_ss304_din3017_canonical',
        'cand_prod_brass_ball_valve_001',
        'prod_din933_hex_bolt'
      ],
      applicable_models: [
        'EQ-MAKE-BUY-CROSSOVER-v1.0.0',
        'EQ-B2B-CREDIT-DRAG-v1.0.0',
        'EQ-FBA-WEIGHT-CLIFF-v1.0.0',
        'MOD-DISTRIBUTOR-TIERED-MARGIN-v1.0.0',
        'STAT-CROSS-FACTOR-SENSITIVITY-v1.0.0'
      ]
    });

    this.registerArchetype({
      archetype_id: 'TECHNICAL_COMPLIANCE',
      name: 'Regulated Technical & Electrical Compliance',
      description: 'Rigorous regulatory standards (BIS, CPRI, CE), mandatory testing certification, low customer price sensitivity if trust is established, but high return/warranty penalty if units fail.',
      shared_economic_dna: 'High certification barriers to entry; protected price premiums; warranty return sensitivities.',
      key_drivers: ['Verified test certification', 'Electrical contractor trust', 'Safety branding'],
      vulnerabilities: ['High laboratory testing compliance costs', 'Catastrophic liability on electrical short circuits'],
      member_product_ids: ['prod_mcb_circuit_breaker'],
      applicable_models: [
        'EQ-CONTRIBUTION-MARGIN-v1.0.0',
        'RULE-CHANNEL-FEASIBILITY-GATE-v1.0.0'
      ]
    });

    // 3. Typed Relationships
    const seedRelationships: TypedEntityRelationship[] = [
      // Archetype classification relationships
      {
        relationship_id: 'rel_arch_diya',
        relationship_type: 'ARCHETYPE_CLASSIFIES_PRODUCT',
        direction: 'DIRECTED',
        source_entity_id: 'SEASONAL_D2C_VISUAL',
        source_entity_type: 'COMMERCIAL_ARCHETYPE',
        target_entity_id: 'prod_diya_terracotta_12p',
        target_entity_type: 'PRODUCT',
        status: 'REVIEWED_CONFIRMED',
        strength_score: 95,
        evidence_ids: ['obs_festive_diwali_surge'],
        methodology: 'Archetype classification taxonomy',
        observed_at: '2026-10-06T10:00:00Z',
        effective_at: '2026-10-06T10:00:00Z',
        caveats: ['Demands tight 45-day seasonal campaign timeline.'],
        uncertainty_description: 'Low uncertainty; proven seasonal visual archetype.',
        version: 1
      },
      {
        relationship_id: 'rel_arch_ss304',
        relationship_type: 'ARCHETYPE_CLASSIFIES_PRODUCT',
        direction: 'DIRECTED',
        source_entity_id: 'CLUSTER_MRO_STANDARDIZED',
        source_entity_type: 'COMMERCIAL_ARCHETYPE',
        target_entity_id: 'prod_ss304_din3017_canonical',
        target_entity_type: 'PRODUCT',
        status: 'REVIEWED_CONFIRMED',
        strength_score: 98,
        evidence_ids: ['surv_obs_ss304_sup_quote'],
        methodology: 'Industrial manufacturing cluster audit',
        observed_at: '2026-10-06T10:00:00Z',
        effective_at: '2026-10-06T10:00:00Z',
        caveats: ['Requires DIN 3017 stamping precision verification.'],
        uncertainty_description: 'Deterministic; Howrah cluster audited.',
        version: 1
      },
      {
        relationship_id: 'rel_arch_brass_valve',
        relationship_type: 'ARCHETYPE_CLASSIFIES_PRODUCT',
        direction: 'DIRECTED',
        source_entity_id: 'CLUSTER_MRO_STANDARDIZED',
        source_entity_type: 'COMMERCIAL_ARCHETYPE',
        target_entity_id: 'cand_prod_brass_ball_valve_001',
        target_entity_type: 'PRODUCT',
        status: 'REVIEWED_CONFIRMED',
        strength_score: 92,
        evidence_ids: ['obs_brass_jalandhar_quote'],
        methodology: 'Regional plumbing cluster analysis',
        observed_at: '2026-10-06T10:00:00Z',
        effective_at: '2026-10-06T10:00:00Z',
        caveats: ['Subject to MCX brass scrap fluctuations.'],
        uncertainty_description: 'High correlation with Jalandhar cluster quotes.',
        version: 1
      },

      // Product <-> Complements (Shared Baskets)
      {
        relationship_id: 'rel_comp_diya_candle',
        relationship_type: 'PRODUCT_COMPLEMENTS',
        direction: 'BIDIRECTIONAL',
        source_entity_id: 'prod_diya_terracotta_12p',
        source_entity_type: 'PRODUCT',
        target_entity_id: 'prod_candle_soy_fragrance',
        target_entity_type: 'PRODUCT',
        status: 'INFERRED_UNVERIFIED',
        strength_score: 82,
        evidence_ids: ['obs_festive_hamper_market'],
        methodology: 'Market basket association and festive gifting co-purchase analysis',
        observed_at: '2026-10-07T12:00:00Z',
        effective_at: '2026-10-07T12:00:00Z',
        caveats: ['Gifting hamper bundle hypothesis requires physical pilot packaging test.'],
        uncertainty_description: 'Heuristic co-occurrence in Diwali luxury gift hampers.',
        version: 1
      },

      // Factor Exposures
      {
        relationship_id: 'rel_factor_ss304_nickel',
        relationship_type: 'PRODUCT_EXPOSED_TO_FACTOR',
        direction: 'DIRECTED',
        source_entity_id: 'prod_ss304_din3017_canonical',
        source_entity_type: 'PRODUCT',
        target_entity_id: 'factor_lme_nickel',
        target_entity_type: 'MARKET_FACTOR',
        status: 'REVIEWED_CONFIRMED',
        strength_score: 88,
        evidence_ids: ['surv_obs_ss304_nickel_index'],
        methodology: 'Metallurgical cost breakdown (Cr 18%, Ni 8% component)',
        observed_at: '2026-10-06T10:00:00Z',
        effective_at: '2026-10-06T10:00:00Z',
        caveats: ['Coil strip pass-through lagged by 30-45 days.'],
        uncertainty_description: 'Verified metallurgical formula linkage.',
        version: 1
      },
      {
        relationship_id: 'rel_factor_diya_fragility',
        relationship_type: 'PRODUCT_EXPOSED_TO_FACTOR',
        direction: 'DIRECTED',
        source_entity_id: 'prod_diya_terracotta_12p',
        source_entity_type: 'PRODUCT',
        target_entity_id: 'factor_fragility_pottery',
        target_entity_type: 'MARKET_FACTOR',
        status: 'REVIEWED_CONFIRMED',
        strength_score: 94,
        evidence_ids: ['obs_diya_transit_damage'],
        methodology: 'Historical e-commerce handicraft return analysis',
        observed_at: '2026-10-06T10:00:00Z',
        effective_at: '2026-10-06T10:00:00Z',
        caveats: ['Damage rate drops to <2% if nested thermoformed trays are utilized.'],
        uncertainty_description: 'Empirically audited against postal returns.',
        version: 1
      },

      // Season Drivers
      {
        relationship_id: 'rel_season_diya_diwali',
        relationship_type: 'EVENT_SEASON_DRIVES_PRODUCT',
        direction: 'DIRECTED',
        source_entity_id: 'season_diwali_festive',
        source_entity_type: 'EVENT_SEASON',
        target_entity_id: 'prod_diya_terracotta_12p',
        target_entity_type: 'PRODUCT',
        status: 'REVIEWED_CONFIRMED',
        strength_score: 99,
        evidence_ids: ['obs_diwali_search_volume_google_trends'],
        methodology: 'Google Trends & Amazon monthly search volume index',
        observed_at: '2026-10-06T10:00:00Z',
        effective_at: '2026-10-06T10:00:00Z',
        caveats: ['Demands 100% stock readiness by Ashvin Krishna Trayodashi (Dhanteras).'],
        uncertainty_description: 'Deterministic cultural calendar driver.',
        version: 1
      },
      {
        relationship_id: 'rel_season_clamp_monsoon',
        relationship_type: 'EVENT_SEASON_DRIVES_PRODUCT',
        direction: 'DIRECTED',
        source_entity_id: 'season_monsoon_marine',
        source_entity_type: 'EVENT_SEASON',
        target_entity_id: 'prod_ss304_din3017_canonical',
        target_entity_type: 'PRODUCT',
        status: 'REVIEWED_CONFIRMED',
        strength_score: 76,
        evidence_ids: ['obs_monsoon_pump_installations'],
        methodology: 'Agricultural irrigation seasonal maintenance survey',
        observed_at: '2026-10-06T10:00:00Z',
        effective_at: '2026-10-06T10:00:00Z',
        caveats: ['Submersible agricultural pump replacement peaks in June-August.'],
        uncertainty_description: 'Monsoon rainfall timing variation (+/- 2 weeks).',
        version: 1
      }
    ];

    for (const r of seedRelationships) {
      this.addRelationship(r);
    }
  }
}

export const relationshipGraph = new RelationshipGraph();
