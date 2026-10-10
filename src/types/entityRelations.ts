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

export type EntityDomainType =
  | 'PRODUCT'
  | 'PRODUCT_VARIANT'
  | 'OPPORTUNITY'
  | 'SUPPLIER'
  | 'SUPPLIER_QUOTE'
  | 'SELLER_COMPETITOR'
  | 'BUYER_SEGMENT'
  | 'MARKET_CATEGORY'
  | 'COMMERCIAL_CHANNEL'
  | 'USE_CASE'
  | 'EVENT_SEASON'
  | 'MARKET_FACTOR'
  | 'OBSERVATION_DOCUMENT'
  | 'RESEARCH_CLAIM'
  | 'RESEARCH_HYPOTHESIS'
  | 'PRODUCT_THESIS'
  | 'ANALYTICAL_MODEL'
  | 'COMMERCIAL_ARCHETYPE'
  | 'DECISION_ALLOCATION';

export type RelationshipType =
  | 'PRODUCT_COMPLEMENTS'          // E.g., Diya + Cotton Wick, Clamp + Rubber Hose
  | 'PRODUCT_SUBSTITUTES'          // E.g., SS304 Clamp vs. SS201 Clamp, Brass Valve vs. PVC Valve
  | 'PRODUCT_SUPPLIED_BY'          // Product -> Supplier
  | 'PRODUCT_EXPOSED_TO_FACTOR'    // Product -> Market Factor (LME Nickel, Soy Wax, Clay, Monsoon)
  | 'PRODUCT_TARGETS_BUYER'        // Product -> Buyer Segment
  | 'OPPORTUNITY_USES_CHANNEL'     // Opportunity -> Channel (D2C, B2B, Retail, Events)
  | 'OPPORTUNITY_CORRELATED_WITH'  // Shared economic driver between opportunities
  | 'EVENT_SEASON_DRIVES_PRODUCT'  // Season/Event -> Product (Diwali -> Diya, Monsoon -> Clamps)
  | 'ARCHETYPE_CLASSIFIES_PRODUCT' // Commercial Archetype -> Product
  | 'EVIDENCE_SUPPORTS_CLAIM'      // Observation -> Claim
  | 'CLAIM_SUPPORTS_HYPOTHESIS'    // Claim -> Hypothesis
  | 'HYPOTHESIS_FORMS_THESIS'      // Hypothesis -> Thesis
  | 'MODEL_APPLIES_TO_ENTITY'      // Model -> Product / Opportunity
  | 'MODEL_DEPENDS_ON_MODEL';      // Model -> Predecessor Equation

export type RelationshipReviewStatus =
  | 'OBSERVED_DIRECT'       // Directly observed and documented in primary evidence
  | 'INFERRED_UNVERIFIED'   // Algorithmic or heuristic inference awaiting human review
  | 'REVIEWED_CONFIRMED'    // Reviewed and signed-off by human research officer
  | 'REJECTED';             // Adversarially challenged and disproven

export interface TypedEntityRelationship {
  relationship_id: string;
  relationship_type: RelationshipType;
  direction: 'DIRECTED' | 'BIDIRECTIONAL';
  
  source_entity_id: string;
  source_entity_type: EntityDomainType;
  
  target_entity_id: string;
  target_entity_type: EntityDomainType;
  
  status: RelationshipReviewStatus;
  
  /** Decision support strength score (0-100), NOT statistical probability */
  strength_score: number;
  
  evidence_ids: string[];
  methodology: string;
  observed_at: string;
  effective_at: string;
  
  caveats: string[];
  uncertainty_description: string;
  version: number;
  
  // Typed metadata attributes specific to the relationship
  relationship_attributes?: Record<string, string | number | boolean>;
}

export interface EntitySummary {
  entity_id: string;
  entity_type: EntityDomainType;
  label: string;
  category?: string;
  archetype?: string;
  epistemic_status: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ArchetypePatternDefinition {
  archetype_id: string;
  name: string;
  description: string;
  shared_economic_dna: string;
  key_drivers: string[];
  vulnerabilities: string[];
  member_product_ids: string[];
  applicable_models: string[];
}
