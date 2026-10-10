import React, { useState } from 'react';
import { AmazonFeeAssumptions } from '../types';
import { calculateSKUEconomics } from '../lib/calculators';
import {
  Calculator,
  Sliders,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface SKUEconomicsSandboxProps {
  feeAssumptions: AmazonFeeAssumptions;
  onUpdateFeeAssumptions: (updated: AmazonFeeAssumptions) => void;
  activeSupplierCost?: number;
  activePackSize?: number;
  activeAsp?: number;
  onUpdateActiveScenario?: (params: {
    supplierUnitPrice?: number;
    asp?: number;
  }) => void;
  onNavigateNext?: () => void;
}

export const SKUEconomicsSandbox: React.FC<SKUEconomicsSandboxProps> = ({
  feeAssumptions,
  onUpdateFeeAssumptions,
  activeSupplierCost: propSupplierCost = 15.00,
  activePackSize: propPackSize = 20,
  activeAsp: propAsp = 499,
  onUpdateActiveScenario,
  onNavigateNext
}) => {
  // Acceptance Test State Parameters
  const [supplierPriceA, setSupplierPriceA] = useState<number>(14.50);
  const [supplierPriceB, setSupplierPriceB] = useState<number>(15.25);
  const [selectedSupplierPreset, setSelectedSupplierPreset] = useState<'A' | 'B' | 'CUSTOM'>('CUSTOM');
  const [activeSupplierCost, setActiveSupplierCost] = useState<number>(propSupplierCost);

  const [packSize, setPackSize] = useState<number>(propPackSize);
  const [asp, setAsp] = useState<number>(propAsp);
  const [packageWeightG, setPackageWeightG] = useState<number>(485);
  const [packageLengthCm, setPackageLengthCm] = useState<number>(20);
  const [packageWidthCm, setPackageWidthCm] = useState<number>(14);
  const [packageHeightCm, setPackageHeightCm] = useState<number>(5);

  React.useEffect(() => {
    if (propSupplierCost !== undefined) setActiveSupplierCost(propSupplierCost);
  }, [propSupplierCost]);

  React.useEffect(() => {
    if (propPackSize !== undefined) setPackSize(propPackSize);
  }, [propPackSize]);

  React.useEffect(() => {
    if (propAsp !== undefined) setAsp(propAsp);
  }, [propAsp]);

  const [inboundFreightUnit, setInboundFreightUnit] = useState<number>(0.35);
  const [qaCostUnit, setQaCostUnit] = useState<number>(0.20);
  const [packagingCostUnit, setPackagingCostUnit] = useState<number>(0.35);
  const [moqUnits, setMoqUnits] = useState<number>(500);

  // Compute economics for active selection
  const econ = calculateSKUEconomics(
    'SANDBOX-SKU',
    packSize,
    asp,
    activeSupplierCost,
    packageWeightG,
    feeAssumptions,
    inboundFreightUnit,
    qaCostUnit,
    packagingCostUnit,
    moqUnits
  );

  // Compare Supplier A vs Supplier B directly
  const econA = calculateSKUEconomics(
    'SUP-A',
    packSize,
    asp,
    supplierPriceA,
    packageWeightG,
    feeAssumptions,
    inboundFreightUnit,
    qaCostUnit,
    packagingCostUnit,
    moqUnits
  );

  const econB = calculateSKUEconomics(
    'SUP-B',
    packSize,
    asp,
    supplierPriceB,
    packageWeightG,
    feeAssumptions,
    inboundFreightUnit,
    qaCostUnit,
    packagingCostUnit,
    moqUnits
  );

  const handleSelectPresetSupplier = (supplierKey: 'A' | 'B') => {
    setSelectedSupplierPreset(supplierKey);
    setActiveSupplierCost(supplierKey === 'A' ? supplierPriceA : supplierPriceB);
  };

  // Determine SKU Decision
  let skuDecision: 'SCALE' | 'TEST' | 'NEGOTIATE' | 'KILL' = 'TEST';
  let decisionRationale = '';
  if (econ.contribution_margin_pct >= 20 && feeAssumptions.return_rate_pct < 4.0) {
    skuDecision = 'SCALE';
    decisionRationale = 'High contribution margin and low return risk; ready for increased FBA capital allocation.';
  } else if (econ.contribution_margin_pct >= 12) {
    skuDecision = 'TEST';
    decisionRationale = 'Acceptable baseline contribution; validate conversion velocity before large PO commitments.';
  } else if (econ.contribution_margin_pct > 0) {
    skuDecision = 'NEGOTIATE';
    decisionRationale = `Unit economics compressed. Supplier price must be negotiated below ₹${econ.max_supplier_unit_price} to hit 15% margin floor.`;
  } else {
    skuDecision = 'KILL';
    decisionRationale = 'Structurally negative contribution after landed COGS and Amazon marketplace fees.';
  }

  // Sensitivity Matrix 1: Selling Price × Supplier Cost
  const aspRowValues = [399, 449, 499, 549, 599];
  const supplierCostColValues = [12.00, 13.50, 14.50, 15.25, 16.50];

  // Sensitivity Matrix 2: Selling Price × PPC
  const ppcRowValues = [25, 35, 45, 60, 75];

  return (
    <div className="space-y-6">
      {/* Sandbox Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                Layer 3 · Commercial Sandbox
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">Section 27 Acceptance Engine</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              SKU Economics & 60-Second Capital Allocation Sandbox
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter supplier quotes, ASP, package weights, and Amazon fee assumptions to immediately calculate True Landed COGS, Total Cost to Serve, and Break-even thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Quick Test Preset:</span>
            <button
              onClick={() => handleSelectPresetSupplier('A')}
              className={`px-3 py-1.5 rounded transition-all font-semibold ${
                selectedSupplierPreset === 'A'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Supplier A (₹{supplierPriceA.toFixed(2)})
            </button>
            <button
              onClick={() => handleSelectPresetSupplier('B')}
              className={`px-3 py-1.5 rounded transition-all font-semibold ${
                selectedSupplierPreset === 'B'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Supplier B (₹{supplierPriceB.toFixed(2)})
            </button>
          </div>
        </div>

        {/* Inputs Configuration Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs font-mono">
          {/* Supplier & Pack */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded space-y-2">
            <span className="text-amber-400 font-bold uppercase block text-[11px]">Product & Sourcing</span>
            <div>
              <label className="text-slate-400 block mb-0.5">Active Unit Cost (₹/pc):</label>
              <input
                type="number"
                step="0.05"
                value={activeSupplierCost}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setActiveSupplierCost(val);
                  setSelectedSupplierPreset('CUSTOM');
                }}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white font-bold text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-0.5">Pack Size:</label>
                <input
                  type="number"
                  value={packSize}
                  onChange={(e) => setPackSize(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-0.5">MOQ (pcs):</label>
                <input
                  type="number"
                  value={moqUnits}
                  onChange={(e) => setMoqUnits(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Dimensions */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded space-y-2">
            <span className="text-blue-400 font-bold uppercase block text-[11px]">Marketplace & Packaging</span>
            <div>
              <label className="text-slate-400 block mb-0.5">Amazon Selling Price (ASP ₹):</label>
              <input
                type="number"
                value={asp}
                onChange={(e) => setAsp(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white font-bold text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-0.5">Weight (g):</label>
                <input
                  type="number"
                  value={packageWeightG}
                  onChange={(e) => setPackageWeightG(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-0.5">Dims (L×W×H cm):</label>
                <span className="text-slate-300 block py-1">
                  {packageLengthCm}×{packageWidthCm}×{packageHeightCm}
                </span>
              </div>
            </div>
          </div>

          {/* Prep & Inbound Logistics */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded space-y-2">
            <span className="text-cyan-400 font-bold uppercase block text-[11px]">Inbound & Prep Costs</span>
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-slate-400 block text-[10px]">Freight/pc:</label>
                <input
                  type="number"
                  step="0.05"
                  value={inboundFreightUnit}
                  onChange={(e) => setInboundFreightUnit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 px-1.5 py-1 rounded text-white text-center"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px]">QA/pc:</label>
                <input
                  type="number"
                  step="0.05"
                  value={qaCostUnit}
                  onChange={(e) => setQaCostUnit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 px-1.5 py-1 rounded text-white text-center"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px]">Pack/pc:</label>
                <input
                  type="number"
                  step="0.05"
                  value={packagingCostUnit}
                  onChange={(e) => setPackagingCostUnit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 px-1.5 py-1 rounded text-white text-center"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              Total prep: ₹{(inboundFreightUnit + qaCostUnit + packagingCostUnit).toFixed(2)}/pc
            </p>
          </div>

          {/* Dynamic Amazon Fees */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded space-y-2">
            <span className="text-purple-400 font-bold uppercase block text-[11px]">Amazon Fee Overrides</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block text-[10px]">PPC / Order (₹):</label>
                <input
                  type="number"
                  value={feeAssumptions.ppc_per_order_inr}
                  onChange={(e) =>
                    onUpdateFeeAssumptions({
                      ...feeAssumptions,
                      ppc_per_order_inr: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px]">Return Rate (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={feeAssumptions.return_rate_pct}
                  onChange={(e) =>
                    onUpdateFeeAssumptions({
                      ...feeAssumptions,
                      return_rate_pct: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Referral: {feeAssumptions.referral_fee_pct}% · Weight Fee: ₹{feeAssumptions.weight_handling_fee_inr}
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Test Output Ledger (Requirement 27) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Output 1: Landed COGS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono">
          <span className="text-[10px] uppercase text-slate-400 block">Landed COGS</span>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            ₹{econ.landed_cogs_per_order}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              (₹{econ.landed_cogs_per_unit}/pc)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
            <div>Supplier Unit: ₹{econ.supplier_unit_price.toFixed(2)}</div>
            <div>Inbound + QA + Packaging: ₹{(inboundFreightUnit + qaCostUnit + packagingCostUnit).toFixed(2)}</div>
          </div>
        </div>

        {/* Output 2: Total Cost to Serve */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono">
          <span className="text-[10px] uppercase text-slate-400 block">Total Cost to Serve</span>
          <div className="text-2xl font-bold text-rose-400 mt-1 tabular-nums">
            ₹{econ.total_cost_to_serve}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
            <div>Amazon Fees: ₹{econ.amazon_total_fees_per_order}</div>
            <div>PPC: ₹{econ.ppc_per_order} · Returns: ₹{econ.return_loss_per_order}</div>
          </div>
        </div>

        {/* Output 3: Contribution per Order */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono">
          <span className="text-[10px] uppercase text-slate-400 block">Net Contribution</span>
          <div
            className={`text-2xl font-bold mt-1 tabular-nums ${
              econ.net_contribution_per_order >= 0 ? 'text-emerald-400' : 'text-rose-500'
            }`}
          >
            ₹{econ.net_contribution_per_order}
            <span className="text-xs font-normal text-slate-300 ml-1.5">
              ({econ.contribution_margin_pct}%)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
            <div>Per Unit Margin: ₹{econ.net_contribution_per_unit}/pc</div>
            <div>Break-even ASP: ₹{econ.break_even_asp}</div>
          </div>
        </div>

        {/* Output 4: Decision & Limits */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 font-mono">
          <span className="text-[10px] uppercase text-slate-400 block">Decision & Capital Limits</span>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                skuDecision === 'SCALE'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : skuDecision === 'TEST'
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                  : skuDecision === 'NEGOTIATE'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}
            >
              {skuDecision}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
            <div>Max Allowable PPC: ₹{econ.max_allowable_ppc}</div>
            <div>Max Supplier Price: ₹{econ.max_supplier_unit_price}/pc</div>
          </div>
        </div>
      </div>

      {/* Direct Supplier A vs Supplier B Comparison (Prompt Section 27) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="pb-3 mb-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono">
              Supplier A vs Supplier B Acceptance Comparison (Pack of {packSize} @ ₹{asp} ASP)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant sensitivity comparing Supplier A (₹{supplierPriceA.toFixed(2)}) against Supplier B (₹{supplierPriceB.toFixed(2)}).
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Cash for MOQ: ₹{econA.cash_required_for_moq.toLocaleString()} vs ₹{econB.cash_required_for_moq.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Supplier A Box */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-sm">Supplier A (Howrah Precision)</span>
              <span className="text-slate-300 font-bold">₹{supplierPriceA.toFixed(2)} / pc</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 pt-2 border-t border-slate-800">
              <div>Landed Order COGS: <span className="text-white font-bold">₹{econA.landed_cogs_per_order}</span></div>
              <div>Cost to Serve: <span className="text-slate-400">₹{econA.total_cost_to_serve}</span></div>
              <div>Contribution/Order: <span className="text-emerald-400 font-bold">₹{econA.net_contribution_per_order}</span></div>
              <div>Margin: <span className="text-emerald-400 font-bold">{econA.contribution_margin_pct}%</span></div>
              <div>Break-even ASP: <span className="text-slate-300">₹{econA.break_even_asp}</span></div>
              <div>Max PPC: <span className="text-slate-300">₹{econA.max_allowable_ppc}</span></div>
            </div>
          </div>

          {/* Supplier B Box */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 text-sm">Supplier B (Bengal Metalcraft)</span>
              <span className="text-slate-300 font-bold">₹{supplierPriceB.toFixed(2)} / pc</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 pt-2 border-t border-slate-800">
              <div>Landed Order COGS: <span className="text-white font-bold">₹{econB.landed_cogs_per_order}</span></div>
              <div>Cost to Serve: <span className="text-slate-400">₹{econB.total_cost_to_serve}</span></div>
              <div>Contribution/Order: <span className="text-emerald-400 font-bold">₹{econB.net_contribution_per_order}</span></div>
              <div>Margin: <span className="text-emerald-400 font-bold">{econB.contribution_margin_pct}%</span></div>
              <div>Break-even ASP: <span className="text-slate-300">₹{econB.break_even_asp}</span></div>
              <div>Max PPC: <span className="text-slate-300">₹{econB.max_allowable_ppc}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Contribution Ramps (5, 10, 20, 50 orders/day) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono mb-3">
          Monthly Contribution Ramp at Commercial Velocity Tiers (30 Days)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[10px] uppercase">5 Orders / Day</span>
            <div className="text-lg font-bold text-white mt-1 tabular-nums">
              ₹{econ.monthly_contribution_5_orders_day.toLocaleString()}
            </div>
            <span className="text-slate-500 text-[10px]">150 orders · 3,000 pcs</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[10px] uppercase">10 Orders / Day</span>
            <div className="text-lg font-bold text-white mt-1 tabular-nums">
              ₹{econ.monthly_contribution_10_orders_day.toLocaleString()}
            </div>
            <span className="text-slate-500 text-[10px]">300 orders · 6,000 pcs</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded border-amber-500/30">
            <span className="text-amber-400 block text-[10px] uppercase font-bold">20 Orders / Day (Scale Target)</span>
            <div className="text-lg font-bold text-amber-300 mt-1 tabular-nums">
              ₹{econ.monthly_contribution_20_orders_day.toLocaleString()}
            </div>
            <span className="text-slate-500 text-[10px]">600 orders · 12,000 pcs</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[10px] uppercase">50 Orders / Day (Category Leader)</span>
            <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
              ₹{econ.monthly_contribution_50_orders_day.toLocaleString()}
            </div>
            <span className="text-slate-500 text-[10px]">1,500 orders · 30,000 pcs</span>
          </div>
        </div>
      </div>

      {/* Two-Way Sensitivity Matrix: Selling Price × Supplier Cost */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="pb-3 mb-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono">
              Sensitivity Matrix: Selling Price (ASP) × Supplier Unit Cost
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Net contribution per order (₹) across market ASP and negotiated supplier pricing.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Values in INR</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className="py-2.5 px-3 text-left">ASP / Supplier ₹</th>
                {supplierCostColValues.map((sc) => (
                  <th key={sc} className="py-2.5 px-3">
                    ₹{sc.toFixed(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {aspRowValues.map((p) => (
                <tr key={p} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-left font-bold text-white">₹{p} ASP</td>
                  {supplierCostColValues.map((sc) => {
                    const testEcon = calculateSKUEconomics(
                      'SENS',
                      packSize,
                      p,
                      sc,
                      packageWeightG,
                      feeAssumptions,
                      inboundFreightUnit,
                      qaCostUnit,
                      packagingCostUnit
                    );
                    const contrib = testEcon.net_contribution_per_order;
                    const isPositive = contrib >= 0;

                    return (
                      <td
                        key={sc}
                        className={`py-2.5 px-3 font-semibold tabular-nums ${
                          contrib >= 80
                            ? 'text-emerald-400 bg-emerald-950/20'
                            : isPositive
                            ? 'text-slate-200'
                            : 'text-rose-500 bg-rose-950/20'
                        }`}
                      >
                        ₹{contrib}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => {
            onUpdateActiveScenario?.({
              supplierUnitPrice: activeSupplierCost,
              asp: asp
            });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs rounded transition-colors"
        >
          <span>Sync Values (₹{activeSupplierCost}/pc · ₹{asp} ASP) to Pipeline Scenario</span>
        </button>

        {onNavigateNext && (
          <button
            onClick={onNavigateNext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs rounded border border-slate-700 transition-colors"
          >
            <span>Proceed to Stage 6: Hero Pack Optimizer</span>
            <span>➔</span>
          </button>
        )}
      </div>
    </div>
  );
};
