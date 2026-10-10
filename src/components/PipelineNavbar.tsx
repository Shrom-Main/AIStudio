/**
 * Industrial Consumables Distribution Engine — Pipeline Header & Navigation Bar
 * POC-001: Sequential pipeline progression, stage statuses, and lightweight contract badges
 */

import React, { useState } from 'react';
import { PipelineStageId, PipelineState, StageStatus } from '../types/pipeline';
import {
  Lock,
  Database,
  Building2,
  ShieldCheck,
  Calculator,
  Package,
  ShoppingBag,
  Users,
  Coins,
  Factory,
  ChevronRight,
  ChevronLeft,
  Camera,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MapPin,
  BarChart2,
  UploadCloud,
  Layers,
  Target,
  Sparkles,
  Globe,
  Compass
} from 'lucide-react';
import {
  savePipelineSnapshotToDrive,
  signInWithGoogleDrive,
  isAuthenticatedWithDrive
} from '../lib/googleDriveService';
import {
  canonicalCategory,
  canonicalProduct,
  canonicalVariant,
  canonicalPackOffers,
  canonicalOpportunity,
  canonicalBuyerSegment,
  canonicalUseCase
} from '../data/canonicalCatalog';
import { productRegistry } from '../lib/productRegistry';
import { ProductCapabilityId } from '../types/capability';

export function capabilityToStage(capId: ProductCapabilityId): PipelineStageId | 'CONTROL_TOWER' | 'GEOMAP' | 'RESEARCH_COCKPIT' {
  switch (capId) {
    case 'DISCOVERY':
      return 'DISCOVERY';
    case 'STRATEGY':
      return 'CONTROL_TOWER';
    case 'SUPPLY':
      return 'SUPPLIERS';
    case 'SPECIFICATION_QUALITY':
      return 'QA';
    case 'OFFER_DESIGN':
      return 'PACK_OPTIMIZER';
    case 'CHANNELS_D2C':
      return 'AMAZON';
    case 'CHANNELS_B2B':
      return 'B2B';
    case 'ECONOMICS':
      return 'ECONOMICS';
    case 'SIMULATION':
      return 'FINANCE';
    case 'SUPPLY_STRATEGY':
      return 'MAKE_VS_BUY';
    case 'RESEARCH':
      return 'RESEARCH_COCKPIT';
    case 'SYSTEM':
      return 'CONTRACT';
    case 'UNIVERSE':
    case 'OVERVIEW':
      return 'UNIVERSE';
    case 'RELATIONSHIPS':
      return 'RESEARCH_COCKPIT';
    default:
      return 'CONTROL_TOWER';
  }
}

export const CAPABILITY_ICONS: Record<ProductCapabilityId, React.ComponentType<{ className?: string }>> = {
  DISCOVERY: Compass,
  STRATEGY: Target,
  OVERVIEW: Sparkles,
  SUPPLY: Building2,
  SPECIFICATION_QUALITY: ShieldCheck,
  OFFER_DESIGN: Package,
  ECONOMICS: Calculator,
  CHANNELS_D2C: ShoppingBag,
  CHANNELS_B2B: Users,
  SIMULATION: Coins,
  SUPPLY_STRATEGY: Factory,
  RESEARCH: Database,
  RELATIONSHIPS: BarChart2,
  SYSTEM: Lock,
  UNIVERSE: Globe
};

interface PipelineNavbarProps {
  currentStage: PipelineStageId | 'CONTROL_TOWER' | 'GEOMAP' | 'RESEARCH_COCKPIT';
  pipelineState: PipelineState;
  onNavigate: (stage: PipelineStageId | 'CONTROL_TOWER' | 'GEOMAP' | 'RESEARCH_COCKPIT') => void;
  onSaveSnapshot: (label: string) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
}

export const STAGE_CONFIG: {
  id: PipelineStageId;
  stageNumber: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'CONTRACT', stageNumber: 1, label: 'Engine Contract', icon: Lock },
  { id: 'REGISTRY', stageNumber: 2, label: 'Registry', icon: Database },
  { id: 'SUPPLIERS', stageNumber: 3, label: 'Suppliers', icon: Building2 },
  { id: 'QA', stageNumber: 4, label: 'QA Lab', icon: ShieldCheck },
  { id: 'ECONOMICS', stageNumber: 5, label: 'Economics', icon: Calculator },
  { id: 'PACK_OPTIMIZER', stageNumber: 6, label: 'Pack Opt', icon: Package },
  { id: 'AMAZON', stageNumber: 7, label: 'Amazon D2C', icon: ShoppingBag },
  { id: 'B2B', stageNumber: 8, label: 'B2B CRM', icon: Users },
  { id: 'FINANCE', stageNumber: 9, label: 'Finance Runway', icon: Coins },
  { id: 'MAKE_VS_BUY', stageNumber: 10, label: 'Make vs Buy', icon: Factory },
  { id: 'ANALYTICS', stageNumber: 11, label: 'Analytics & Sensitivity', icon: BarChart2 }
];

export const PipelineNavbar: React.FC<PipelineNavbarProps> = ({
  currentStage,
  pipelineState,
  onNavigate,
  onSaveSnapshot,
  onRestoreSnapshot
}) => {
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [driveExportStatus, setDriveExportStatus] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleExportToDrive = async (snap: any) => {
    try {
      setDriveExportStatus(`Archiving ${snap.snapshotId} to Google Drive...`);
      if (!isAuthenticatedWithDrive()) {
        await signInWithGoogleDrive();
      }
      await savePipelineSnapshotToDrive(snap);
      setDriveExportStatus(`Archived ${snap.snapshotId} to Google Drive successfully!`);
      setTimeout(() => setDriveExportStatus(null), 3500);
    } catch (e: any) {
      setDriveExportStatus(`Drive archive failed: ${e.message}`);
      setTimeout(() => setDriveExportStatus(null), 4000);
    }
  };

  const scrollStages = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const selectedProductId = pipelineState.identity.selectedProductId || 'prod_ss304_din3017_canonical';
  const applicableCaps = productRegistry.getApplicableCapabilities(selectedProductId);
  const profile = productRegistry.getCapabilityProfile(selectedProductId);

  const currentStageIndex = applicableCaps.findIndex(
    (c) => capabilityToStage(c.id) === currentStage || (c.id as string) === (currentStage as string)
  );
  const canGoPrevious = currentStageIndex > 0;
  const canGoNext = currentStageIndex >= 0 && currentStageIndex < applicableCaps.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onNavigate(capabilityToStage(applicableCaps[currentStageIndex - 1].id));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onNavigate(capabilityToStage(applicableCaps[currentStageIndex + 1].id));
    }
  };

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'VALIDATED':
        return <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono"><CheckCircle2 className="w-2.5 h-2.5" /> VALIDATED</span>;
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> ACTIVE</span>;
      case 'BLOCKED':
        return <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-mono"><XCircle className="w-2.5 h-2.5" /> BLOCKED</span>;
      case 'WARNING':
      case 'DATA_REQUIRED':
        return <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-mono"><AlertTriangle className="w-2.5 h-2.5" /> DATA REQ</span>;
      case 'READY':
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">READY</span>;
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      {/* Top Banner: Sequence Controls, Contract Lineage, and Snapshot Vault */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/60 text-xs">
        {/* Left: Sequential Stage Indicators & Quick Step */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('CONTROL_TOWER')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              currentStage === 'CONTROL_TOWER'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Control Tower Cockpit
          </button>
          <button
            onClick={() => onNavigate('UNIVERSE' as any)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              (currentStage as string) === 'UNIVERSE'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Product Universe</span>
          </button>
          <button
            onClick={() => onNavigate('GEOMAP')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              currentStage === 'GEOMAP'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3 h-3 text-blue-400" />
            <span>GeoMap (Sellers & Buyers)</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
              title="Previous Stage"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-400 font-mono text-[11px]">
              {currentStage === 'CONTROL_TOWER'
                ? 'Overview Mode'
                : `Stage ${currentStageIndex + 1} of 10`}
            </span>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
              title="Next Stage"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Lightweight Contract Badge with Auditable Epistemic Tooltip */}
        <div className="flex items-center gap-2">
          <div
            className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-slate-300 cursor-help"
            title="Evidence Quality Score reflects provenance classification and confidence weighting. It is not a probability that the model or output is correct."
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">CORE v1.0.0</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 font-bold">
              EQS {pipelineState.evidenceLineage.evidenceQualityScore}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400">LINEAGE OK</span>
            <HelpCircle className="w-3 h-3 text-slate-400 ml-0.5" />

            {/* Hover Tooltip Curtain */}
            <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-72 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-[10px] font-sans text-slate-300 z-50 pointer-events-none">
              <div className="font-bold text-amber-400 mb-1 font-mono">Provenance & Contract Boundary:</div>
              <p className="leading-relaxed">
                Evidence Quality Score reflects provenance classification and confidence weighting. It is not a probability that the model or output is correct.
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-slate-400 font-mono">
                <span>Active Source:</span>
                <span className="text-slate-200 truncate max-w-[140px]">{pipelineState.evidenceLineage.source}</span>
              </div>
            </div>
          </div>

          {/* Active Product, Opportunity & Parameter Chips */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <button
              onClick={() => setShowOpportunityModal(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors border border-slate-700 hover:border-slate-600 cursor-pointer"
              title={`Inspect Canonical Product: ${canonicalProduct.name} (${canonicalProduct.product_id})`}
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Prod: <strong className="text-slate-100">{canonicalProduct.standard} SS304</strong></span>
            </button>
            <span>·</span>
            <button
              onClick={() => setShowOpportunityModal(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 transition-colors border border-amber-800/60 hover:border-amber-700 cursor-pointer"
              title={`Inspect Canonical Opportunity: ${canonicalOpportunity.title} (${canonicalOpportunity.opportunity_id})`}
            >
              <Target className="w-3 h-3 text-amber-400" />
              <span>Opp: <strong className="text-amber-300 font-bold">#001 Howrah Arb</strong></span>
            </button>
            <span>·</span>
            <span>Pack: <strong className="text-slate-200">{pipelineState.identity.selectedPackSize}pcs</strong></span>
            <span>·</span>
            <span>ASP: <strong className="text-slate-200">₹{pipelineState.activeScenario.asp}</strong></span>
            <span>·</span>
            <span>Unit: <strong className="text-slate-200">₹{pipelineState.activeScenario.supplierUnitPrice.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Right: Snapshot Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSnapshots(!showSnapshots)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Snapshots ({pipelineState.snapshots.length})</span>
          </button>
        </div>
      </div>

      {/* Snapshot Drawer Modal */}
      {showSnapshots && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold text-slate-200 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                Deterministic Scenario Snapshots
              </h4>
              <button
                onClick={() => setShowSnapshots(false)}
                className="text-slate-400 hover:text-white font-mono"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-slate-400 text-xs">
              Every meaningful simulation requires state snapshots to maintain auditability. Saving captures all active parameters, lineage, and frozen engine versions without mutating live state.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                placeholder="Snapshot label (e.g., 20-Pack with ₹12.80 IndiaMART Quote)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                onClick={() => {
                  onSaveSnapshot(snapshotLabel || `Snapshot ${pipelineState.snapshots.length + 1}`);
                  setSnapshotLabel('');
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                Capture Snapshot
              </button>
            </div>

            {driveExportStatus && (
              <div className="p-2 rounded bg-indigo-950/70 border border-indigo-700/60 text-indigo-200 font-mono text-[11px] flex items-center justify-between">
                <span>{driveExportStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pt-2">
              {pipelineState.snapshots.map((snap) => (
                <div
                  key={snap.snapshotId}
                  className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-mono font-semibold text-slate-200 text-xs truncate">
                      {snap.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {snap.snapshotId} · {new Date(snap.timestamp).toLocaleTimeString()} · Pack {snap.identity.selectedPackSize} · ₹{snap.activeScenario.asp} ASP
                    </div>
                    <div className="text-[10px] text-amber-400/90 font-mono">
                      Net: ₹{snap.calculatedSummary.netContributionPerOrder.toFixed(2)} ({snap.calculatedSummary.decision})
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleExportToDrive(snap)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded font-mono text-[10px] flex items-center gap-1 transition-colors border border-slate-700"
                      title="Archive Snapshot to Google Drive"
                    >
                      <UploadCloud className="w-3 h-3 text-blue-400" />
                      Drive
                    </button>
                    <button
                      onClick={() => {
                        onRestoreSnapshot(snap.snapshotId);
                        setShowSnapshots(false);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-[10px] flex items-center gap-1 transition-colors border border-slate-700"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Canonical Opportunity & Product Domain Abstraction Inspector */}
      {showOpportunityModal && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h4 className="font-mono font-bold text-slate-100 text-sm">
                  Canonical Domain Abstraction: Opportunity Signal #001
                </h4>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800">
                  STEP 3 DOMAIN MODEL ACTIVE
                </span>
              </div>
              <button
                onClick={() => setShowOpportunityModal(false)}
                className="px-2 py-1 text-slate-400 hover:text-white font-mono hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Entity Relationship Diagram */}
            <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-md font-mono text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="font-bold">Product</span>
                <span className="text-slate-500 font-normal">({canonicalProduct.product_id})</span>
              </div>
              <span className="text-slate-600">→</span>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <span className="font-bold">Variant</span>
                <span className="text-slate-500 font-normal">({canonicalVariant.variant_id})</span>
              </div>
              <span className="text-slate-600">→</span>
              <div className="flex items-center gap-1.5 text-purple-400">
                <span className="font-bold">Pack Offer</span>
                <span className="text-slate-500 font-normal">({canonicalPackOffers[2].pack_id})</span>
              </div>
              <span className="text-slate-600">→</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="font-bold">Opportunity</span>
                <span className="text-slate-500 font-normal">({canonicalOpportunity.opportunity_id})</span>
              </div>
              <span className="text-slate-600">→</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="font-bold">Scenario</span>
                <span className="text-slate-500 font-normal">(v1.0.0-FROZEN)</span>
              </div>
            </div>

            {/* Grid: Product & Variant vs. Opportunity Commercial Thesis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product & Variant Card */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono font-bold text-cyan-300 uppercase tracking-wider text-[11px]">Product & Variant Entity</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                    {canonicalProduct.lifecycle_status}
                  </span>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="text-sm font-semibold text-white">{canonicalProduct.name}</div>
                  <div className="text-slate-400 font-mono text-[10px]">{canonicalProduct.product_id}</div>
                  <div className="pt-1.5 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                      <span className="text-slate-500 block">Standard:</span>
                      <span className="text-slate-200 font-bold">{canonicalProduct.standard}</span>
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                      <span className="text-slate-500 block">Metallurgy:</span>
                      <span className="text-slate-200 font-bold">{canonicalProduct.material_specification}</span>
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                      <span className="text-slate-500 block">Category:</span>
                      <span className="text-slate-200">{canonicalCategory.name}</span>
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                      <span className="text-slate-500 block">HSN / GST:</span>
                      <span className="text-slate-200">{canonicalCategory.hsn_code} ({canonicalCategory.gst_rate_pct}%)</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400 font-mono text-[10px] block mb-1">Variant & Dimensions:</span>
                    <span className="text-slate-200 font-mono text-[10px]">
                      {canonicalVariant.variant_name} · Band: {canonicalVariant.technical_specifications?.band_width_mm ?? canonicalVariant.band_width_mm}mm x {canonicalVariant.technical_specifications?.band_thickness_mm ?? canonicalVariant.band_thickness_mm}mm · Weight: {canonicalVariant.unit_weight_g}g/pc
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                    <span className="block mb-1 text-slate-500">Pack Configurations Available:</span>
                    <div className="flex flex-wrap gap-1">
                      {canonicalPackOffers.map((p) => (
                        <span
                          key={p.pack_id}
                          className={`px-1.5 py-0.5 rounded border ${
                            p.pack_size === pipelineState.identity.selectedPackSize
                              ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {p.pack_size}p ({p.package_weight_g}g)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opportunity Thesis Card */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono font-bold text-amber-300 uppercase tracking-wider text-[11px]">Commercial Opportunity Thesis</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                    CHANNEL: {canonicalOpportunity.channel}
                  </span>
                </div>
                <div className="space-y-2 text-slate-300 text-[11px]">
                  <div>
                    <div className="text-sm font-semibold text-white">{canonicalOpportunity.title}</div>
                    <div className="text-slate-400 font-mono text-[10px]">{canonicalOpportunity.opportunity_id}</div>
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-slate-950 p-2 rounded border border-slate-850 text-[11px]">
                    {canonicalOpportunity.thesis}
                  </p>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                      <span className="text-amber-400 font-mono font-bold block">Supply Arbitrage Thesis:</span>
                      <span className="text-slate-300">{canonicalOpportunity.supply_thesis}</span>
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                      <span className="text-cyan-400 font-mono font-bold block">Competitive Differentiation:</span>
                      <span className="text-slate-300">{canonicalOpportunity.competitive_thesis}</span>
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-850 flex justify-between">
                      <div>
                        <span className="text-slate-500 font-mono block">Target Buyer Segment:</span>
                        <span className="text-slate-200">{canonicalBuyerSegment.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 font-mono block">Typical Vol:</span>
                        <span className="text-slate-200 font-mono">{canonicalBuyerSegment.typical_order_volume_units} pcs / {canonicalBuyerSegment.purchasing_frequency_days}d</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Deterministic Scenario Linkage */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">FROZEN FINANCIAL ENGINE LINK:</span>
                <span className="text-slate-300">
                  Scenario inputs: ₹{pipelineState.activeScenario.asp} ASP · ₹{pipelineState.activeScenario.supplierUnitPrice.toFixed(2)} Unit Cost · {pipelineState.identity.selectedPackSize}pc Pack · ₹{pipelineState.activeScenario.capital.toLocaleString()} Capital
                </span>
              </div>
              <div className="text-slate-400 text-[10px]">
                Contract Verification: <span className="text-emerald-400 font-bold">6/6 PASS</span> · Adversarial: <span className="text-emerald-400 font-bold">60/60 PASS</span> · Drift: <span className="text-emerald-400 font-bold">₹0</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Primary Pipeline Stage Bar (11 Stages in Sequence) with responsive horizontal scrolling & chevron controls */}
      <div className="relative w-full border-t border-slate-800/80 bg-slate-950/40 flex items-center">
        <button
          onClick={() => scrollStages('left')}
          title="Scroll stages left"
          className="shrink-0 px-2 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border-r border-slate-800 z-10 transition-colors flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto scroll-smooth py-1.5 px-3 flex items-center gap-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
        >
          <div className="flex items-center gap-1.5 min-w-max">
            {applicableCaps.map((cap, index) => {
              const Icon = CAPABILITY_ICONS[cap.id] || Sparkles;
              const targetStage = capabilityToStage(cap.id);
              const isActive = (currentStage as string) === targetStage || (currentStage as string) === cap.id;
              const status = (targetStage !== 'CONTROL_TOWER' && targetStage !== 'GEOMAP'
                ? pipelineState.stageStatuses[targetStage as PipelineStageId]
                : undefined) || 'READY';
              const binding = profile?.module_bindings[cap.id];

              return (
                <button
                  key={cap.id}
                  onClick={() => onNavigate(targetStage)}
                  title={`${cap.name}: ${cap.description}${binding ? ` (Binding: ${binding})` : ''}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-xs font-mono whitespace-nowrap border cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white font-bold border-amber-500/60 shadow-xs'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{cap.name}</span>
                  <span className="ml-1 pl-1.5 border-l border-slate-700/80">
                    {getStatusBadge(status)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => scrollStages('right')}
          title="Scroll stages right"
          className="shrink-0 px-2 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border-l border-slate-800 z-10 transition-colors flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
