/**
 * POC-001: Product & Opportunity Domain Model
 * 
 * Formal entity relationship:
 * Product
 *   └── ProductVariant
 *         └── Pack / Offer
 *               └── Opportunity
 *                     └── Scenario / PipelineActiveScenario
 * 
 * Suppliers remain independent commercial entities that can quote or supply
 * one or more products/variants across various channels.
 */

export type Channel = 'D2C' | 'B2B' | 'HYBRID';

export type ProductLifecycleStatus =
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'CANDIDATE'
  | 'SIMULATING'
  | 'VALIDATING'
  | 'PILOT'
  | 'ACTIVE'
  | 'REJECTED'
  | 'PAUSED'
  | 'WATCH';

export type OpportunityLifecycleStatus =
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'CANDIDATE'
  | 'SIMULATING'
  | 'VALIDATING'
  | 'PILOT'
  | 'ACTIVE'
  | 'REJECTED'
  | 'PAUSED'
  | 'WATCH';

export interface Category {
  category_id: string;
  name: string;
  description: string;
  hsn_code?: string;
  gst_rate_pct: number;
}

export interface Product {
  product_id: string;
  name: string;
  category_id: string;
  material_specification?: string;
  standard?: string;
  unit_of_measure: string;
  created_at: string;
  updated_at: string;
  lifecycle_status: ProductLifecycleStatus;
  notes?: string;
}

export interface ProductVariant {
  variant_id: string;
  product_id: string;
  variant_name: string;
  size_specification: string;
  unit_weight_g: number;
  technical_specifications?: Record<string, string | number | boolean>;
  band_width_mm?: number;
  band_thickness_mm?: number;
  material_grade?: string;
}

export interface PackOffer {
  pack_id: string;
  variant_id: string;
  product_id: string;
  pack_size: number;
  package_weight_g: number;
  package_dimensions_cm: {
    length: number;
    width: number;
    height: number;
  };
  packaging_type: string;
  legacy_sku_code?: string;
}

export interface BuyerSegment {
  segment_id: string;
  name: string;
  industry: string;
  purchasing_frequency_days: number;
  typical_order_volume_units: number;
  price_sensitivity: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

export interface UseCase {
  use_case_id: string;
  segment_id: string;
  title: string;
  description: string;
}

export interface Opportunity {
  opportunity_id: string;
  product_id?: string;
  variant_id?: string;
  pack_id?: string;
  title: string;
  thesis: string;
  channel: Channel;
  target_buyer_segment_id?: string;
  supply_thesis: string;
  competitive_thesis: string;
  evidence_summary: string;
  lifecycle_status: OpportunityLifecycleStatus;
  created_at: string;
  updated_at: string;
}
