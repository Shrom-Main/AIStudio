/**
 * POC-001: Product Universe Cockpit
 * Step 4: Catalog of Products, Opportunities, & Capability Profiles
 */

import React, { useState } from 'react';
import {
  Globe,
  Layers,
  Target,
  Package,
  Building2,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sliders,
  Database
} from 'lucide-react';
import { productRegistry } from '../lib/productRegistry';
import { ProductCapabilityId } from '../types/capability';

interface ProductUniverseProps {
  selectedProductId: string;
  selectedOpportunityId: string;
  onSelectProduct: (productId: string) => void;
  onSelectOpportunity: (opportunityId: string) => void;
  onNavigateToCapability: (capabilityId: ProductCapabilityId) => void;
}

export const ProductUniverse: React.FC<ProductUniverseProps> = ({
  selectedProductId,
  selectedOpportunityId,
  onSelectProduct,
  onSelectOpportunity,
  onNavigateToCapability
}) => {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'CAPABILITY_PROFILES' | 'ENTITY_GRAPH'>('CATALOG');

  const allProducts = productRegistry.getAllProducts();
  const allOpportunities = productRegistry.getAllOpportunities();
  const context = productRegistry.resolveProductContext(selectedProductId, selectedOpportunityId);

  return (
    <div className="space-y-6">
      {/* Top Banner: Architecture Context & Boundary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white font-mono">Product Universe & Capability System</h2>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono font-semibold">
                POC-001 · STEP 4
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              The Product Universe represents the catalog of products that the operating system knows about and studies. 
              The selected product dynamically determines which analytical capabilities are applicable, decoupling analysis 
              from any fixed 10-stage pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500">Universe Scope:</span>
            <span className="text-amber-400 font-bold">{allProducts.length} Product</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-bold">{allOpportunities.length} Opportunity</span>
            <span className="text-slate-600">·</span>
            <span className="text-indigo-400 font-bold">14 Capabilities</span>
          </div>
        </div>

        {/* Epistemic & Scope Boundary Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-semibold">
              STEP 5 DEFERRED
            </span>
            <span>Opportunity Discovery engines, web research agents & multi-product scraping remain out of scope for Step 4.</span>
          </div>
          <div className="text-slate-500">
            Authoritative source: <code className="text-slate-300">productRegistry.ts</code>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
            activeTab === 'CATALOG'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          Product & Opportunity Catalog
        </button>
        <button
          onClick={() => setActiveTab('CAPABILITY_PROFILES')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
            activeTab === 'CAPABILITY_PROFILES'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          Capability Profile Inspector
        </button>
        <button
          onClick={() => setActiveTab('ENTITY_GRAPH')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
            activeTab === 'ENTITY_GRAPH'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          Relational Domain Graph
        </button>
      </div>

      {/* Tab 1: Product & Opportunity Catalog */}
      {activeTab === 'CATALOG' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Product Catalog Card */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Catalogued Products ({allProducts.length})
            </h3>

            {allProducts.map((p) => {
              const isSelected = p.product_id === selectedProductId;
              return (
                <div
                  key={p.product_id}
                  onClick={() => onSelectProduct(p.product_id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850 border-cyan-500/50 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {p.lifecycle_status}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2">{p.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{p.product_id}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Standard:</span>
                      <span className="text-slate-200">{p.standard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Material Grade:</span>
                      <span className="text-slate-200">{p.material_specification}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Unit of Measure:</span>
                      <span className="text-slate-200">{p.unit_of_measure}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500">Signal Origin:</span>
                    <span className="text-amber-400">Signal #001 (Canonical)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Product Detailed Domain Profile */}
          <div className="lg:col-span-2 space-y-4">
            {context ? (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{context.product.name}</h3>
                        <span className="text-xs font-mono text-slate-400">({context.category.name})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{context.product.notes}</p>
                    </div>
                    <button
                      onClick={() => onNavigateToCapability('OVERVIEW')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Commercial Opportunities Associated */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      Associated Commercial Opportunities ({context.opportunities.length})
                    </h4>

                    {context.opportunities.map((opp) => (
                      <div
                        key={opp.opportunity_id}
                        className="p-4 bg-slate-950 border border-slate-850 rounded-lg space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] border border-amber-800">
                                CHANNEL: {opp.channel}
                              </span>
                              <span className="text-xs font-mono text-slate-500">{opp.opportunity_id}</span>
                            </div>
                            <h5 className="text-sm font-semibold text-white mt-1.5">{opp.title}</h5>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {opp.lifecycle_status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          {opp.thesis}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="p-2 bg-slate-900/40 rounded border border-slate-800/80">
                            <span className="text-amber-400 font-bold block mb-0.5">Supply Thesis:</span>
                            <span className="text-slate-300">{opp.supply_thesis}</span>
                          </div>
                          <div className="p-2 bg-slate-900/40 rounded border border-slate-800/80">
                            <span className="text-cyan-400 font-bold block mb-0.5">Competitive Thesis:</span>
                            <span className="text-slate-300">{opp.competitive_thesis}</span>
                          </div>
                        </div>

                        {context.buyerSegment && (
                          <div className="p-2 bg-slate-900/40 rounded border border-slate-800/80 flex justify-between items-center text-[11px] font-mono text-slate-400">
                            <span>Target Buyer: <strong className="text-slate-200">{context.buyerSegment.name}</strong></span>
                            <span>Typical Volume: <strong className="text-slate-200">{context.buyerSegment.typical_order_volume_units} pcs / {context.buyerSegment.purchasing_frequency_days}d</strong></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pack Offers Configured */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      Pack Offers & Logistics Formats ({context.packOffers.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 font-mono text-xs">
                      {context.packOffers.map((p) => (
                        <div
                          key={p.pack_id}
                          className={`p-2.5 rounded-lg border text-center ${
                            p.pack_size === 20
                              ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-bold text-sm text-white">{p.pack_size} pcs</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{p.package_weight_g}g gross</div>
                          <div className="text-[9px] text-slate-500 mt-1 truncate">
                            {p.package_dimensions_cm.length}x{p.package_dimensions_cm.width}x{p.package_dimensions_cm.height} cm
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No product context resolved.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Capability Profile Inspector */}
      {activeTab === 'CAPABILITY_PROFILES' && context && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Product Capability Profile: {context.product.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Defines the analytical modules applicable to this product class. A chemical product might expose
                  Compliance instead of Metallurgy; an industrial fastener exposes QA & Metallurgy (DIN 3017).
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 font-mono text-xs border border-indigo-800">
                {context.applicableCapabilities.length} Applicable Modules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {context.applicableCapabilities.map((cap) => {
                const binding = context.capabilityProfile.module_bindings[cap.id];
                return (
                  <div
                    key={cap.id}
                    onClick={() => onNavigateToCapability(cap.id)}
                    className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-lg transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {cap.topLevel}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1.5 group-hover:text-indigo-300 transition-colors">
                          {cap.name}
                        </h4>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      {cap.description}
                    </p>

                    {binding && (
                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-indigo-400">
                        <span className="text-slate-500">Module Binding:</span>
                        <span>{binding}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Relational Domain Graph */}
      {activeTab === 'ENTITY_GRAPH' && context && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Canonical Domain Entity Relationships
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic resolution map showing how entities are linked through the authoritative data access layer.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <span>[Product]</span>
              <span className="text-white">{context.product.name} ({context.product.product_id})</span>
            </div>

            <div className="pl-6 border-l-2 border-cyan-500/30 space-y-4">
              <div>
                <span className="text-indigo-400 font-bold">[ProductVariant]</span>
                <span className="text-slate-300 ml-2">
                  {context.variants.map((v) => `${v.variant_name} (${v.variant_id})`).join(', ')}
                </span>
              </div>

              <div className="pl-6 border-l-2 border-indigo-500/30 space-y-4">
                <div>
                  <span className="text-purple-400 font-bold">[PackOffers]</span>
                  <span className="text-slate-300 ml-2">
                    {context.packOffers.map((p) => `${p.pack_size}p (${p.pack_id})`).join(', ')}
                  </span>
                </div>

                <div className="pl-6 border-l-2 border-purple-500/30 space-y-4">
                  <div>
                    <span className="text-amber-400 font-bold">[Opportunity]</span>
                    <span className="text-white ml-2">
                      {context.opportunities.map((o) => `${o.title} (${o.opportunity_id})`).join(', ')}
                    </span>
                  </div>

                  <div className="pl-6 border-l-2 border-amber-500/30 space-y-2">
                    <div>
                      <span className="text-emerald-400 font-bold">[BuyerSegment]</span>
                      <span className="text-slate-300 ml-2">
                        {context.buyerSegment ? `${context.buyerSegment.name} (${context.buyerSegment.segment_id})` : 'None linked'}
                      </span>
                    </div>

                    <div>
                      <span className="text-emerald-400 font-bold">[UseCase]</span>
                      <span className="text-slate-300 ml-2">
                        {context.useCase ? `${context.useCase.title} (${context.useCase.use_case_id})` : 'None linked'}
                      </span>
                    </div>

                    <div>
                      <span className="text-emerald-400 font-bold">[Deterministic Scenario]</span>
                      <span className="text-slate-300 ml-2">
                        Bound to Frozen Financial Engine (v1.0.0-FROZEN) · Δ ₹0.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
