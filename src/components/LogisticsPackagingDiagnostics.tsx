import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Layers,
  Truck,
  Box,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Star,
  DollarSign,
  Compass,
  FileText,
  Maximize2,
  Building2,
  Factory
} from 'lucide-react';
import { Supplier, B2BCustomer } from '../types';
import { Packaging3DPlayer } from './Packaging3DPlayer';
import { FormulaRegistryAndTrends } from './FormulaRegistryAndTrends';

interface LogisticsPackagingDiagnosticsProps {
  activePackSize?: number;
  activeAsp?: number;
  activeSupplierPrice?: number;
  selectedSupplierId?: string;
  selectedBuyerId?: string;
  suppliers?: Supplier[];
  b2bCustomers?: B2BCustomer[];
  onNavigateToStage?: (stage: string) => void;
  onSyncToPipeline?: (data: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    packSize: number;
    grossWeightGrams: number;
    packagingCostPerUnit: number;
  }) => void;
}

export const LogisticsPackagingDiagnostics: React.FC<LogisticsPackagingDiagnosticsProps> = ({
  activePackSize = 20,
  activeAsp = 499,
  activeSupplierPrice = 13.50,
  selectedSupplierId,
  selectedBuyerId,
  suppliers = [],
  b2bCustomers = [],
  onNavigateToStage,
  onSyncToPipeline
}) => {
  // Resolve active supplier and active buyer from pipeline
  const activeSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0] || null;
  }, [suppliers, selectedSupplierId]);

  const activeBuyer = useMemo(() => {
    return b2bCustomers.find((b) => b.id === selectedBuyerId) || b2bCustomers[0] || null;
  }, [b2bCustomers, selectedBuyerId]);

  // 1. Packaging Dimensional State
  const [packSize, setPackSize] = useState<number>(activePackSize);
  const [unitWeightGrams, setUnitWeightGrams] = useState<number>(24.25);
  const [boxLengthCm, setBoxLengthCm] = useState<number>(14);
  const [boxWidthCm, setBoxWidthCm] = useState<number>(11);
  const [boxHeightCm, setBoxHeightCm] = useState<number>(6.5);
  const [boxTareWeightGrams, setBoxTareWeightGrams] = useState<number>(45);

  // Sync with prop if it changes
  useEffect(() => {
    setPackSize(activePackSize);
  }, [activePackSize]);

  // 2. Multi-Channel Review Mining State
  const [reviewMiningActive, setReviewMiningActive] = useState<boolean>(false);
  const [reviewIntelligence, setReviewIntelligence] = useState<any>(null);

  // 3. Logistics Corridor Analysis State
  const [corridorLoading, setCorridorLoading] = useState<boolean>(false);
  const [corridorData, setCorridorData] = useState<any>(null);

  // 4. Packaging Diagnostics AI Call
  const [aiDiagnosticsLoading, setAiDiagnosticsLoading] = useState<boolean>(false);
  const [aiDiagnostics, setAiDiagnostics] = useState<any>(null);

  // Fetch initial AI diagnostics and review mining
  useEffect(() => {
    runPackagingDiagnostics();
    fetchReviewIntelligence();
    fetchCorridors();
  }, []);

  const runPackagingDiagnostics = async () => {
    setAiDiagnosticsLoading(true);
    try {
      const res = await fetch('/api/ai/packaging-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packSize,
          unitWeightGrams,
          boxLengthCm,
          boxWidthCm,
          boxHeightCm,
          masterCartonUnits: 400
        })
      });
      const data = await res.json();
      if (data.success && data.diagnostics) {
        setAiDiagnostics(data.diagnostics);
      }
    } catch (e) {
      console.error('Failed to load packaging diagnostics', e);
    } finally {
      setAiDiagnosticsLoading(false);
    }
  };

  const fetchReviewIntelligence = async () => {
    setReviewMiningActive(true);
    try {
      const res = await fetch('/api/ai/multichannel-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCategory: 'DIN 3017 SS304 Worm Drive Hose Clamps',
          channels: ['Amazon India', 'Moglix', 'IndustryBuying', 'D2C Brand Stores']
        })
      });
      const data = await res.json();
      if (data.success && data.reviewIntelligence) {
        setReviewIntelligence(data.reviewIntelligence);
      }
    } catch (e) {
      console.error('Failed to load review intelligence', e);
    } finally {
      setReviewMiningActive(false);
    }
  };

  const fetchCorridors = async () => {
    setCorridorLoading(true);
    try {
      const originCity = activeSupplier?.city
        ? `${activeSupplier.city} (${activeSupplier.name})`
        : 'Howrah Industrial Cluster, West Bengal';
      const destList = [
        activeBuyer?.city ? `${activeBuyer.city} (${activeBuyer.company_name})` : 'Pune (Auto Tier-1)',
        'Jamshedpur (Heavy Eng)',
        'Rajkot (Pumps/Tooling)',
        'Coimbatore (Submersibles)'
      ];
      const res = await fetch('/api/ai/logistics-corridors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originCity,
          destinations: destList,
          monthlyShipmentWeightKg: Math.round(((packSize * unitWeightGrams + boxTareWeightGrams) * 4000) / 1000)
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCorridorData(data.data);
      }
    } catch (e) {
      console.error('Failed to load corridor data', e);
    } finally {
      setCorridorLoading(false);
    }
  };

  // Pure Deterministic Volumetric Calculations
  const calculations = useMemo(() => {
    const rawClampsWeightKg = (packSize * unitWeightGrams) / 1000;
    const grossPhysicalWeightKg = rawClampsWeightKg + boxTareWeightGrams / 1000;
    const grossPhysicalWeightG = Math.round(grossPhysicalWeightKg * 1000);

    const boxVolumeCm3 = boxLengthCm * boxWidthCm * boxHeightCm;
    const volumetricWeightAirKg = boxVolumeCm3 / 5000;
    const volumetricWeightRoadKg = boxVolumeCm3 / 4000;

    const billableWeightAirKg = Math.max(grossPhysicalWeightKg, volumetricWeightAirKg);
    const billableWeightRoadKg = Math.max(grossPhysicalWeightKg, volumetricWeightRoadKg);

    // Clamp displacement volume estimate (SS304 density 7.93 g/cm3)
    const steelVolumeCm3 = (packSize * unitWeightGrams) / 7.93;
    const deadSpacePct = Math.max(0, Math.min(95, Math.round(((boxVolumeCm3 - steelVolumeCm3) / boxVolumeCm3) * 100)));

    // Amazon FBA 500g boundary check
    const isAboveFba500g = grossPhysicalWeightG > 500;
    const fbaExcessPenaltyInr = isAboveFba500g ? 24.00 : 0.00;

    // Pallet stacking (Euro Pallet: 120cm x 80cm x 150cm usable height)
    const boxesPerLayer = Math.floor(120 / boxLengthCm) * Math.floor(80 / boxWidthCm);
    const layers = Math.floor(150 / boxHeightCm);
    const totalBoxesPerEuroPallet = boxesPerLayer * layers;
    const totalClampsPerEuroPallet = totalBoxesPerEuroPallet * packSize;

    return {
      grossPhysicalWeightKg: Math.round(grossPhysicalWeightKg * 1000) / 1000,
      grossPhysicalWeightG,
      boxVolumeCm3,
      volumetricWeightAirKg: Math.round(volumetricWeightAirKg * 1000) / 1000,
      volumetricWeightRoadKg: Math.round(volumetricWeightRoadKg * 1000) / 1000,
      billableWeightAirKg: Math.round(billableWeightAirKg * 1000) / 1000,
      billableWeightRoadKg: Math.round(billableWeightRoadKg * 1000) / 1000,
      isAirPenalized: volumetricWeightAirKg > grossPhysicalWeightKg,
      deadSpacePct,
      isAboveFba500g,
      fbaExcessPenaltyInr,
      totalBoxesPerEuroPallet,
      totalClampsPerEuroPallet
    };
  }, [packSize, unitWeightGrams, boxLengthCm, boxWidthCm, boxHeightCm, boxTareWeightGrams]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Packaging &amp; Route Logistics Engine
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">
                Volumetric Weight Diagnostic · Multi-Channel Reviews · Corridor Optimization
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Volumetric Freight &amp; Multi-Channel Diagnostics</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                Physical vs Volumetric Moat
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Eliminate dead-air freight penalties, prevent Amazon FBA 500g surcharge crossings, study corridor transit routes, and mine real customer reviews across D2C and marketplace channels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                runPackagingDiagnostics();
                fetchReviewIntelligence();
                fetchCorridors();
              }}
              disabled={aiDiagnosticsLoading || reviewMiningActive || corridorLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiDiagnosticsLoading ? 'animate-spin' : ''}`} />
              <span>Recalculate Diagnostics</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Physical Gross Weight</span>
            <div className="text-lg font-bold text-white mt-0.5">{calculations.grossPhysicalWeightG} g</div>
            <span className="text-[10px] text-slate-500">
              {calculations.isAboveFba500g ? (
                <span className="text-rose-400">Above 500g (+₹24 FBA Fee)</span>
              ) : (
                <span className="text-emerald-400">Below 500g (Tier 1 Base Fee)</span>
              )}
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Volumetric Air Weight</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">
              {(calculations.volumetricWeightAirKg * 1000).toFixed(0)} g
            </div>
            <span className="text-[10px] text-slate-500">
              {calculations.isAirPenalized ? (
                <span className="text-rose-400">Volumetric Penalty Active</span>
              ) : (
                <span className="text-emerald-400">Dense Physical Billing</span>
              )}
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Packaging Dead Space</span>
            <div className="text-lg font-bold text-blue-400 mt-0.5">{calculations.deadSpacePct}%</div>
            <span className="text-[10px] text-slate-500">Wasted Volume in Box</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Euro-Pallet Capacity</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {calculations.totalClampsPerEuroPallet.toLocaleString()} pcs
            </div>
            <span className="text-[10px] text-slate-500">{calculations.totalBoxesPerEuroPallet} retail boxes/pallet</span>
          </div>
        </div>
      </div>

      {/* 2. 3D Interactive Model Player & Extruder Simulator */}
      <Packaging3DPlayer
        initialLengthCm={boxLengthCm}
        initialWidthCm={boxWidthCm}
        initialHeightCm={boxHeightCm}
        initialPackSize={packSize}
        initialUnitWeightGrams={unitWeightGrams}
        onSyncToPipeline={(data) => {
          setBoxLengthCm(data.lengthCm);
          setBoxWidthCm(data.widthCm);
          setBoxHeightCm(data.heightCm);
          setPackSize(data.packSize);
          onSyncToPipeline?.(data);
        }}
      />

      {/* 3. Visual Library: Standard vs. Optimized Industrial Packaging Configurations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl font-sans space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-white text-base tracking-tight">
                Visual Library: Standard vs. Engineered Packaging Configurations
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative engineering specifications, void air ratios, and unboxing protection profiles.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            3 Configurations Documented
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Standard Loose Polybag */}
          <div className="bg-slate-950 border border-rose-500/30 rounded-lg p-4 space-y-3 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold text-sm">Config A: Standard Loose Bag</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-300 border border-rose-800">
                  Dead Air Penalty
                </span>
              </div>

              {/* Technical Blueprint SVG Diagram */}
              <div className="h-32 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
                <svg viewBox="0 0 200 120" className="w-full h-full text-slate-500">
                  {/* Outer oversized box */}
                  <rect x="25" y="15" width="150" height="90" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="3,3" />
                  {/* Loose clamps scattered randomly */}
                  <circle cx="55" cy="85" r="14" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <circle cx="95" cy="88" r="14" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <circle cx="135" cy="82" r="14" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <circle cx="80" cy="65" r="14" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  {/* Red void zone */}
                  <rect x="26" y="16" width="148" height="42" fill="rgba(239, 68, 68, 0.15)" stroke="none" />
                  <text x="100" y="38" fill="#f87171" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    78% WASTED DEAD AIR
                  </text>
                </svg>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Carton Dimension:</span>
                  <span className="font-bold">16 x 13 x 9 cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volumetric Divisor:</span>
                  <span className="text-rose-400 font-bold">374 g (Air Weight)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Packaging Unit Cost:</span>
                  <span className="text-white font-bold">₹3.50 / pack</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              High transit friction; clamps scratch each other and risk puncturing retail bags during courier handling.
            </div>
          </div>

          {/* Card 2: Engineered Nested Blister Tray */}
          <div className="bg-slate-950 border border-emerald-500/50 rounded-lg p-4 space-y-3 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-sm">Config B: Nested Blister Tray</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Recommended D2C
                </span>
              </div>

              {/* Technical Blueprint SVG Diagram */}
              <div className="h-32 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                  {/* Tight compact outer box */}
                  <rect x="35" y="25" width="130" height="70" fill="none" stroke="#10b981" strokeWidth="2" />
                  {/* Interlocking tightly nested clamps */}
                  <circle cx="58" cy="60" r="16" fill="rgba(16, 185, 129, 0.1)" stroke="#34d399" strokeWidth="2.5" />
                  <circle cx="86" cy="60" r="16" fill="rgba(16, 185, 129, 0.1)" stroke="#34d399" strokeWidth="2.5" />
                  <circle cx="114" cy="60" r="16" fill="rgba(16, 185, 129, 0.1)" stroke="#34d399" strokeWidth="2.5" />
                  <circle cx="142" cy="60" r="16" fill="rgba(16, 185, 129, 0.1)" stroke="#34d399" strokeWidth="2.5" />
                  <text x="100" y="112" fill="#34d399" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    ZERO VOID &middot; DIN 3017 NESTED
                  </text>
                </svg>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Carton Dimension:</span>
                  <span className="font-bold">14 x 11 x 6.5 cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volumetric Divisor:</span>
                  <span className="text-emerald-400 font-bold">200 g (Under Gross)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Packaging Unit Cost:</span>
                  <span className="text-white font-bold">₹5.20 / pack</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400/90">
              Thermoformed cavity holds clamps motionless; prevents screw stripped threads and satisfies Amazon FBA Tier 1.
            </div>
          </div>

          {/* Card 3: Master Industrial Bulk Palletized Crate */}
          <div className="bg-slate-950 border border-blue-500/40 rounded-lg p-4 space-y-3 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-bold text-sm">Config C: Palletized Bulk Crate</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-950 text-blue-300 border border-blue-800">
                  Industrial B2B
                </span>
              </div>

              {/* Technical Blueprint SVG Diagram */}
              <div className="h-32 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                  {/* Heavy Master Crate */}
                  <rect x="25" y="20" width="150" height="75" fill="rgba(59, 130, 246, 0.08)" stroke="#3b82f6" strokeWidth="2" />
                  {/* Strapping Bands */}
                  <line x1="60" y1="20" x2="60" y2="95" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="2,2" />
                  <line x1="140" y1="20" x2="140" y2="95" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="2,2" />
                  {/* Pallet Footing */}
                  <rect x="20" y="95" width="160" height="12" fill="#475569" stroke="#334155" />
                  <rect x="35" y="107" width="20" height="8" fill="#1e293b" />
                  <rect x="90" y="107" width="20" height="8" fill="#1e293b" />
                  <rect x="145" y="107" width="20" height="8" fill="#1e293b" />
                </svg>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Carton Dimension:</span>
                  <span className="font-bold">38 x 28 x 22 cm (400u)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Freight Cost/Clamp:</span>
                  <span className="text-blue-400 font-bold">₹0.40 / unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Packaging Unit Cost:</span>
                  <span className="text-white font-bold">₹1.20 / unit</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-blue-400/90">
              7-Ply heavy corrugated box with desiccants and edge protectors; maximized pallet cube utilization on Euro-pallets.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Dimensional Controls & Scheme Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Sliders */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Box className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Packaging Geometry Controls</h3>
          </div>

          {/* Pack Size */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Pack Size:</span>
              <span className="font-bold text-white">{packSize} pcs</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={10}
              value={packSize}
              onChange={(e) => setPackSize(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          {/* Box Length */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Box Length (L):</span>
              <span className="font-bold text-white">{boxLengthCm} cm</span>
            </div>
            <input
              type="range"
              min={8}
              max={25}
              step={0.5}
              value={boxLengthCm}
              onChange={(e) => setBoxLengthCm(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          {/* Box Width */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Box Width (W):</span>
              <span className="font-bold text-white">{boxWidthCm} cm</span>
            </div>
            <input
              type="range"
              min={6}
              max={20}
              step={0.5}
              value={boxWidthCm}
              onChange={(e) => setBoxWidthCm(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          {/* Box Height */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Box Height (H):</span>
              <span className="font-bold text-white">{boxHeightCm} cm</span>
            </div>
            <input
              type="range"
              min={4}
              max={15}
              step={0.5}
              value={boxHeightCm}
              onChange={(e) => setBoxHeightCm(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          {/* Packaging Weight Optimization Advice */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 leading-relaxed">
            {calculations.isAboveFba500g ? (
              <div className="text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-rose-400" />
                <strong>Weight Alert:</strong> Total gross weight is {calculations.grossPhysicalWeightG}g. Trimming packaging box tare by {calculations.grossPhysicalWeightG - 495}g saves ₹24.00 per unit on Amazon FBA weight fees!
              </div>
            ) : (
              <div className="text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                <strong>Optimized Tier:</strong> At {calculations.grossPhysicalWeightG}g, this pack fits comfortably within the &lt;500g base fulfillment tier.
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: 3 Packaging Schemes Compared */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm">Packaging Scheme Efficiency Comparison</h3>
            </div>
            <span className="text-[10px] text-slate-400">Engineering Density Analysis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Scheme 1 */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">1. Loose Polybag</span>
                <span className="text-[9px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">Baseline</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Pkg Cost/Unit:</span>
                  <span className="text-white font-bold">₹3.50</span>
                </div>
                <div className="flex justify-between">
                  <span>Dead Space:</span>
                  <span className="text-rose-400 font-bold">78%</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Damage:</span>
                  <span className="text-amber-400">Moderate</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                Clamps rattle inside loose polybag; high risk of surface scratching and punctured shipping mailers.
              </p>
            </div>

            {/* Scheme 2 */}
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-300">2. Nested Blister Tray</span>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 py-0.5 rounded">
                  Recommended D2C
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Pkg Cost/Unit:</span>
                  <span className="text-white font-bold">₹5.20</span>
                </div>
                <div className="flex justify-between">
                  <span>Dead Space:</span>
                  <span className="text-emerald-400 font-bold">24%</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Damage:</span>
                  <span className="text-emerald-400">Near Zero</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                Precision thermoformed cavities lock clamps in place; prevents screw deformation and enhances unboxing.
              </p>
            </div>

            {/* Scheme 3 */}
            <div className="p-3.5 bg-blue-950/30 border border-blue-500/40 rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-300">3. B2B Heavy Master Crate</span>
                <span className="text-[9px] bg-blue-950 text-blue-400 border border-blue-800 px-1 py-0.5 rounded">
                  Industrial B2B
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Pkg Cost/Unit:</span>
                  <span className="text-white font-bold">₹1.20</span>
                </div>
                <div className="flex justify-between">
                  <span>Dead Space:</span>
                  <span className="text-blue-400 font-bold">12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Consolidation:</span>
                  <span className="text-emerald-400">Maximum</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                500 pcs packed in heavy 7-ply corrugated carton with desiccants; freight cost drops to ₹0.40/clamp.
              </p>
            </div>
          </div>

          {/* Side-by-side B2B Wholesale vs D2C Fulfillment Comparison */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded">
            <div className="font-bold text-white text-xs mb-2 flex items-center justify-between">
              <span>B2B Wholesale vs Amazon D2C Unit Economics</span>
              <span className="text-[10px] text-emerald-400">Direct Profit Spread</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">D2C Fulfillment Cost:</span>
                <span className="text-rose-400 font-bold">₹112 / pack (₹5.60/pc)</span>
              </div>
              <div>
                <span className="text-slate-500 block">B2B LTL Freight:</span>
                <span className="text-emerald-400 font-bold">₹18 / pack (₹0.90/pc)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Freight Arbitrage:</span>
                <span className="text-blue-400 font-bold">+₹4.70/clamp saved in B2B</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cash Conversion:</span>
                <span className="text-amber-400 font-bold">7 days (D2C) vs 30 days (B2B)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Multi-Channel Customer Review Mining & Quality Moat Intelligence */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="font-bold text-white text-sm">Multi-Channel Review Forensic Analysis</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesizing customer reviews across Amazon India, Moglix, Industrybuying, and D2C brand channels to discover failure modes and anchor price expectations.
            </p>
          </div>

          {reviewIntelligence && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">
                Market Average: <strong className="text-amber-400">★ {reviewIntelligence.aggregateRating} / 5.0</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 text-[11px]">
                Sampled: <strong className="text-white">{reviewIntelligence.totalReviewsSampled} verified buyers</strong>
              </span>
            </div>
          )}
        </div>

        {reviewIntelligence ? (
          <div className="space-y-4">
            {/* Top 4 Failure Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reviewIntelligence.topFailureModes?.map((fail: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{fail.issue}</span>
                    </span>
                    <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">
                      {fail.frequencyPct}% of Complaints
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    "{fail.customerQuote}"
                  </div>
                  <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-800">
                    <strong className="text-emerald-400">Our Engineered Remedy: </strong>
                    {fail.remedy}
                  </div>
                </div>
              ))}
            </div>

            {/* Quality Moat Action Formula */}
            {reviewIntelligence.qualityMoatFormula && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/50 rounded flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-emerald-400 font-bold block mb-1">
                    Quality Arbitrage Moat Formula:
                  </span>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    {reviewIntelligence.qualityMoatFormula.competitiveEdgeSummary}
                  </p>
                </div>
                <div className="whitespace-nowrap px-4 py-2 bg-emerald-950 border border-emerald-700 rounded text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Price Premium Justified</span>
                  <span className="text-lg font-bold text-emerald-400">
                    +{reviewIntelligence.qualityMoatFormula.justifiedPricePremiumPct}% ASP
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-slate-950 border border-slate-800 rounded text-center text-slate-400 text-xs">
            Loading multi-channel review forensics...
          </div>
        )}
      </div>

      {/* 4. National Logistics Corridors & Transport Optimization */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm">National Highway Freight Corridors &amp; LSPs</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Howrah manufacturing origin to buyer destination corridors, carrier benchmarking, and 36-month industrial growth rates.
            </p>
          </div>

          {corridorData && (
            <span className="text-slate-400 text-[11px]">
              Origin: <strong className="text-white">{corridorData.origin}</strong>
            </span>
          )}
        </div>

        {corridorData ? (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3">Destination Cluster</th>
                    <th className="py-2 px-3">Highway Corridor</th>
                    <th className="py-2 px-3">Distance / Transit</th>
                    <th className="py-2 px-3">Recommended LSP</th>
                    <th className="py-2 px-3">Freight / Clamp</th>
                    <th className="py-2 px-3">Road Quality</th>
                    <th className="py-2 px-3 text-right">3-Yr Demand Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {corridorData.corridorAnalysis?.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{c.destination}</td>
                      <td className="py-2.5 px-3 text-blue-300">{c.primaryCorridor}</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {c.distanceKm} km · {c.transitDays} days
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">{c.recommendedLsp}</td>
                      <td className="py-2.5 px-3 font-bold text-white">₹{c.freightCostPerClamp.toFixed(2)} / pc</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {c.roadQualityScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        +{c.threeYearGrowthForecastPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {corridorData.hubOptimizationSummary && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 text-[11px] leading-relaxed">
                <span className="text-blue-400 font-bold">Consolidated Dispatch Strategy: </span>
                {corridorData.hubOptimizationSummary}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-slate-950 border border-slate-800 rounded text-center text-slate-400 text-xs">
            Loading logistics corridor optimizations...
          </div>
        )}
      </div>

      {/* 5. Mathematical Formula Registry & Supply Chain Trend Detector */}
      <FormulaRegistryAndTrends />
    </div>
  );
};
