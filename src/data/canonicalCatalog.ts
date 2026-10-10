/**
 * POC-001: Canonical Domain Catalog & Baseline Records
 * 
 * Baseline Canonical Product: SS304 Worm-Drive Hose Clamp (DIN 3017)
 * Product ID: prod_ss304_din3017_canonical
 * 
 * Baseline Canonical Opportunity: Howrah Local-Supply Arbitrage Opportunity
 * Opportunity ID: opp_ss304_howrah_arb_001
 */

import {
  Category,
  Product,
  ProductVariant,
  PackOffer,
  BuyerSegment,
  UseCase,
  Opportunity
} from '../types/domain';

export const canonicalCategory: Category = {
  category_id: 'cat_industrial_fasteners',
  name: 'Industrial Fasteners & Hardware',
  description: 'Mechanical fastening, clamping, and fluid-line retention hardware for industrial MRO and assembly.',
  hsn_code: '73269099',
  gst_rate_pct: 18
};

export const canonicalProduct: Product = {
  product_id: 'prod_ss304_din3017_canonical',
  name: 'SS304 Worm-Drive Hose Clamp',
  category_id: canonicalCategory.category_id,
  material_specification: 'SS304 (DIN 1.4301 / W4)',
  standard: 'DIN 3017',
  unit_of_measure: 'pcs',
  created_at: '2026-03-20T00:00:00Z',
  updated_at: '2026-10-07T00:00:00Z',
  lifecycle_status: 'SIMULATING',
  notes: 'Canonical baseline product representing Opportunity Signal #001.'
};

export const canonicalVariant: ProductVariant = {
  variant_id: 'var_ss304_16_25mm',
  product_id: canonicalProduct.product_id,
  variant_name: '16-25mm Clamping Range (W4, 9mm Band)',
  size_specification: '16-25mm',
  unit_weight_g: 16.5,
  technical_specifications: {
    band_width_mm: 9.0,
    band_thickness_mm: 0.60,
    material_grade: 'SS304 (Cr 18-20%, Ni 8-10.5%)'
  },
  band_width_mm: 9.0,
  band_thickness_mm: 0.60,
  material_grade: 'SS304 (Cr 18-20%, Ni 8-10.5%)'
};

export const canonicalPackOffers: PackOffer[] = [
  {
    pack_id: 'pack_ss304_16_25mm_5p',
    variant_id: canonicalVariant.variant_id,
    product_id: canonicalProduct.product_id,
    pack_size: 5,
    package_weight_g: 110,
    package_dimensions_cm: { length: 12, width: 8, height: 4 },
    packaging_type: 'Polybag with Barcode',
    legacy_sku_code: 'sku-ss304-1625-5p'
  },
  {
    pack_id: 'pack_ss304_16_25mm_10p',
    variant_id: canonicalVariant.variant_id,
    product_id: canonicalProduct.product_id,
    pack_size: 10,
    package_weight_g: 195,
    package_dimensions_cm: { length: 14, width: 10, height: 4 },
    packaging_type: 'Kraft Box with Zip Polybag',
    legacy_sku_code: 'sku-ss304-1625-10p'
  },
  {
    pack_id: 'pack_ss304_16_25mm_20p',
    variant_id: canonicalVariant.variant_id,
    product_id: canonicalProduct.product_id,
    pack_size: 20,
    package_weight_g: 375,
    package_dimensions_cm: { length: 18, width: 12, height: 5 },
    packaging_type: 'Heavy Corrugated Carton with Zip Polybag',
    legacy_sku_code: 'sku-ss304-1625-20p'
  },
  {
    pack_id: 'pack_ss304_16_25mm_50p',
    variant_id: canonicalVariant.variant_id,
    product_id: canonicalProduct.product_id,
    pack_size: 50,
    package_weight_g: 1250,
    package_dimensions_cm: { length: 20, width: 15, height: 9 },
    packaging_type: 'Master Pack Carton with Sub-Bundles',
    legacy_sku_code: 'sku-ss304-1625-50p'
  },
  {
    pack_id: 'pack_ss304_16_25mm_100p',
    variant_id: canonicalVariant.variant_id,
    product_id: canonicalProduct.product_id,
    pack_size: 100,
    package_weight_g: 2480,
    package_dimensions_cm: { length: 26, width: 18, height: 12 },
    packaging_type: 'Industrial Bulk Master Carton',
    legacy_sku_code: 'sku-ss304-1625-100p'
  }
];

export const canonicalPack: PackOffer = canonicalPackOffers[2]; // Default 20-pack Hero SKU

export const canonicalBuyerSegment: BuyerSegment = {
  segment_id: 'seg_oem_irrigation_pumps',
  name: 'Submersible Pump & Fluid OEM Assembly',
  industry: 'Industrial Pumps & Fluid Handling',
  purchasing_frequency_days: 30,
  typical_order_volume_units: 2000,
  price_sensitivity: 'HIGH',
  notes: 'Requires verified non-magnetic 304 metallurgy (Ni >= 8%) to resist groundwater corrosion.'
};

export const canonicalUseCase: UseCase = {
  use_case_id: 'uc_irrigation_discharge_coupling',
  segment_id: canonicalBuyerSegment.segment_id,
  title: 'Agricultural Submersible Discharge Pipe Clamping',
  description: 'Securing HDPE/PVC delivery hoses to pump discharge flanges under continuous 4-6 bar hydraulic pressure.'
};

export const canonicalOpportunity: Opportunity = {
  opportunity_id: 'opp_ss304_howrah_arb_001',
  product_id: canonicalProduct.product_id,
  variant_id: canonicalVariant.variant_id,
  pack_id: canonicalPack.pack_id,
  title: 'Kolkata / Howrah Local-Supply Arbitrage Opportunity',
  thesis: 'Local Howrah precision stamping units quoted ~₹12.50-₹15.00/unit vs. marketplace ASP of ₹499 (20-pack). Certified DIN 3017 W4 material grade provides a trust wedge against unverified, fragmented sellers while establishing repeat volume for B2B wholesale migration.',
  channel: 'D2C',
  target_buyer_segment_id: canonicalBuyerSegment.segment_id,
  supply_thesis: 'Direct procurement from audited Howrah industrial cluster bypassing multi-tier distributors.',
  competitive_thesis: 'Verified DIN 3017 torque rating (>= 4.5 Nm) and XRF spectro certified Ni >= 8% metallurgy beats generic imported unbranded clamps on Amazon.',
  evidence_summary: '4 verified quotes collected across Dasnagar, Baltikuri, and Liluah; 14 historical observations in registry; baseline canonical test pass.',
  lifecycle_status: 'SIMULATING',
  created_at: '2026-03-20T00:00:00Z',
  updated_at: '2026-10-07T00:00:00Z'
};
