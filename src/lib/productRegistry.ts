/**
 * POC-001: Product Registry & Universe Data Access Layer
 * Step 4: Authoritative Domain Source for Canonical Products, Opportunities, & Capabilities
 * 
 * Provides single-source-of-truth access for:
 * - Products, Variants, Pack Offers, Opportunities, Categories
 * - Suppliers, Buyer Segments, Use Cases
 * - Product Capability Profiles & Applicable Capabilities
 * - Relational Context Resolution
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
import { Supplier } from '../types';
import {
  ProductCapabilityId,
  ProductCapabilityProfile,
  CAPABILITY_TAXONOMY,
  CapabilityDescriptor
} from '../types/capability';

import {
  canonicalCategory,
  canonicalProduct,
  canonicalVariant,
  canonicalPackOffers,
  canonicalOpportunity,
  canonicalBuyerSegment,
  canonicalUseCase
} from '../data/canonicalCatalog';
import { seedSuppliers } from '../data/seedData';

/**
 * Capability profile for Signal #001: SS304 Worm-Drive Hose Clamp
 */
export const canonicalSS304CapabilityProfile: ProductCapabilityProfile = {
  product_id: canonicalProduct.product_id,
  applicable_capabilities: [
    'STRATEGY',
    'DISCOVERY',
    'OVERVIEW',
    'SUPPLY',
    'SPECIFICATION_QUALITY',
    'OFFER_DESIGN',
    'ECONOMICS',
    'CHANNELS_D2C',
    'CHANNELS_B2B',
    'SIMULATION',
    'SUPPLY_STRATEGY',
    'RESEARCH',
    'RELATIONSHIPS',
    'SYSTEM',
    'UNIVERSE'
  ],
  module_bindings: {
    DISCOVERY: 'industrial_fasteners_discovery_pipeline',
    SPECIFICATION_QUALITY: 'metallurgy_torque_din3017',
    OFFER_DESIGN: 'polybag_carton_tiering',
    CHANNELS_D2C: 'amazon_in_fba',
    CHANNELS_B2B: 'oem_pump_direct_contract',
    SUPPLY_STRATEGY: 'progressive_stamping_die'
  },
  custom_labels: {
    DISCOVERY: 'Opportunity Discovery',
    SPECIFICATION_QUALITY: 'Metallurgy & Torque QA (DIN 3017)',
    OFFER_DESIGN: 'Offer Packaging & Logistics',
    CHANNELS_D2C: 'Amazon D2C Marketplace',
    CHANNELS_B2B: 'B2B Wholesale Accounts',
    SUPPLY_STRATEGY: 'Make vs Buy Sourcing',
    STRATEGY: 'Executive Control Tower'
  }
};

export interface ResolvedProductContext {
  product: Product;
  category: Category;
  variants: ProductVariant[];
  packOffers: PackOffer[];
  opportunities: Opportunity[];
  activeOpportunity?: Opportunity;
  activeVariant?: ProductVariant;
  activePack?: PackOffer;
  buyerSegment?: BuyerSegment;
  useCase?: UseCase;
  capabilityProfile: ProductCapabilityProfile;
  applicableCapabilities: CapabilityDescriptor[];
}

export class ProductRegistry {
  private products = new Map<string, Product>();
  private variants = new Map<string, ProductVariant>();
  private packOffers = new Map<string, PackOffer>();
  private opportunities = new Map<string, Opportunity>();
  private categories = new Map<string, Category>();
  private suppliers = new Map<string, Supplier>();
  private buyerSegments = new Map<string, BuyerSegment>();
  private useCases = new Map<string, UseCase>();
  private capabilityProfiles = new Map<string, ProductCapabilityProfile>();

  constructor() {
    this.seedCanonicalData();
  }

  private seedCanonicalData(): void {
    // Seed canonical category
    this.registerCategory(canonicalCategory);

    // Seed canonical product
    this.registerProduct(canonicalProduct);

    // Seed canonical variant
    this.registerVariant(canonicalVariant);

    // Seed canonical pack offers
    for (const pack of canonicalPackOffers) {
      this.registerPackOffer(pack);
    }

    // Seed canonical buyer segment & use case
    this.registerBuyerSegment(canonicalBuyerSegment);
    this.registerUseCase(canonicalUseCase);

    // Seed canonical opportunity
    this.registerOpportunity(canonicalOpportunity);

    // Seed suppliers
    for (const sup of seedSuppliers) {
      this.registerSupplier(sup);
    }

    // Seed capability profile
    this.registerCapabilityProfile(canonicalSS304CapabilityProfile);
  }

  // --- Registration Methods ---
  public registerProduct(product: Product): void {
    this.products.set(product.product_id, product);
  }

  public registerVariant(variant: ProductVariant): void {
    this.variants.set(variant.variant_id, variant);
  }

  public registerPackOffer(offer: PackOffer): void {
    this.packOffers.set(offer.pack_id, offer);
  }

  public registerOpportunity(opportunity: Opportunity): void {
    this.opportunities.set(opportunity.opportunity_id, opportunity);
  }

  public registerCategory(category: Category): void {
    this.categories.set(category.category_id, category);
  }

  public registerSupplier(supplier: Supplier): void {
    this.suppliers.set(supplier.id, supplier);
  }

  public registerBuyerSegment(segment: BuyerSegment): void {
    this.buyerSegments.set(segment.segment_id, segment);
  }

  public registerUseCase(useCase: UseCase): void {
    this.useCases.set(useCase.use_case_id, useCase);
  }

  public registerCapabilityProfile(profile: ProductCapabilityProfile): void {
    this.capabilityProfiles.set(profile.product_id, profile);
  }

  // --- Retrieval Methods ---
  public getProduct(productId: string): Product | undefined {
    return this.products.get(productId);
  }

  public getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  public getVariant(variantId: string): ProductVariant | undefined {
    return this.variants.get(variantId);
  }

  public getVariantsByProduct(productId: string): ProductVariant[] {
    return Array.from(this.variants.values()).filter((v) => v.product_id === productId);
  }

  public getPackOffer(packId: string): PackOffer | undefined {
    return this.packOffers.get(packId);
  }

  public getPackOffersByProduct(productId: string): PackOffer[] {
    return Array.from(this.packOffers.values()).filter((p) => p.product_id === productId);
  }

  public getPackOffersByVariant(variantId: string): PackOffer[] {
    return Array.from(this.packOffers.values()).filter((p) => p.variant_id === variantId);
  }

  public getOpportunity(opportunityId: string): Opportunity | undefined {
    return this.opportunities.get(opportunityId);
  }

  public getOpportunitiesByProduct(productId: string): Opportunity[] {
    return Array.from(this.opportunities.values()).filter((o) => o.product_id === productId);
  }

  public getAllOpportunities(): Opportunity[] {
    return Array.from(this.opportunities.values());
  }

  public getCategory(categoryId: string): Category | undefined {
    return this.categories.get(categoryId);
  }

  public getAllCategories(): Category[] {
    return Array.from(this.categories.values());
  }

  public getSupplier(supplierId: string): Supplier | undefined {
    return this.suppliers.get(supplierId);
  }

  public getAllSuppliers(): Supplier[] {
    return Array.from(this.suppliers.values());
  }

  public getBuyerSegment(segmentId: string): BuyerSegment | undefined {
    return this.buyerSegments.get(segmentId);
  }

  public getAllBuyerSegments(): BuyerSegment[] {
    return Array.from(this.buyerSegments.values());
  }

  public getUseCase(useCaseId: string): UseCase | undefined {
    return this.useCases.get(useCaseId);
  }

  public getUseCasesBySegment(segmentId: string): UseCase[] {
    return Array.from(this.useCases.values()).filter((u) => u.segment_id === segmentId);
  }

  public getCapabilityProfile(productId: string): ProductCapabilityProfile | undefined {
    return this.capabilityProfiles.get(productId);
  }

  /**
   * Resolve applicable capabilities for a product according to its capability profile.
   * If no profile is found, returns a safe default set.
   */
  public getApplicableCapabilities(productId: string): CapabilityDescriptor[] {
    const profile = this.capabilityProfiles.get(productId);
    if (!profile) {
      // Default fallback
      return [
        CAPABILITY_TAXONOMY.STRATEGY,
        CAPABILITY_TAXONOMY.OVERVIEW,
        CAPABILITY_TAXONOMY.SUPPLY,
        CAPABILITY_TAXONOMY.ECONOMICS,
        CAPABILITY_TAXONOMY.SIMULATION,
        CAPABILITY_TAXONOMY.SYSTEM
      ];
    }

    return profile.applicable_capabilities
      .map((capId) => {
        const base = CAPABILITY_TAXONOMY[capId];
        if (!base) return null;
        const customName = profile.custom_labels?.[capId];
        return customName ? { ...base, name: customName } : base;
      })
      .filter((cap): cap is CapabilityDescriptor => cap !== null)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Resolves the entire relational hierarchy for a product and optional active opportunity.
   */
  public resolveProductContext(productId: string, opportunityId?: string): ResolvedProductContext | null {
    const product = this.getProduct(productId);
    if (!product) return null;

    const category = this.getCategory(product.category_id) || {
      category_id: product.category_id,
      name: 'Uncategorized',
      description: '',
      gst_rate_pct: 18
    };

    const variants = this.getVariantsByProduct(productId);
    const packOffers = this.getPackOffersByProduct(productId);
    const opportunities = this.getOpportunitiesByProduct(productId);

    const activeOpportunity = opportunityId
      ? this.getOpportunity(opportunityId)
      : opportunities[0];

    const activeVariant = (activeOpportunity?.variant_id
      ? this.getVariant(activeOpportunity.variant_id)
      : undefined) || variants[0];

    const activePack = (activeOpportunity?.pack_id
      ? this.getPackOffer(activeOpportunity.pack_id)
      : undefined) || packOffers.find((p) => p.pack_size === 20) || packOffers[0];

    const buyerSegment = activeOpportunity?.target_buyer_segment_id
      ? this.getBuyerSegment(activeOpportunity.target_buyer_segment_id)
      : undefined;

    const useCase = buyerSegment
      ? this.getUseCasesBySegment(buyerSegment.segment_id)[0]
      : undefined;

    const capabilityProfile = this.getCapabilityProfile(productId) || {
      product_id: productId,
      applicable_capabilities: ['STRATEGY', 'OVERVIEW', 'SUPPLY', 'ECONOMICS', 'SYSTEM'],
      module_bindings: {}
    };

    const applicableCapabilities = this.getApplicableCapabilities(productId);

    return {
      product,
      category,
      variants,
      packOffers,
      opportunities,
      activeOpportunity,
      activeVariant,
      activePack,
      buyerSegment,
      useCase,
      capabilityProfile,
      applicableCapabilities
    };
  }
}

/**
 * Singleton authoritative product registry instance
 */
export const productRegistry = new ProductRegistry();
