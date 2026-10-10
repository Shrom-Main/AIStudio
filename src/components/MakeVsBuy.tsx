import React, { useState } from 'react';
import { calculateMakeVsBuy } from '../lib/calculators';
import { Factory, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, Cpu } from 'lucide-react';

interface MakeVsBuyProps {
  activeSupplierCost?: number;
  activeOrdersPerDay?: number;
  activePackSize?: number;
  onNavigateToStage?: (stage: string) => void;
}

export const MakeVsBuy: React.FC<MakeVsBuyProps> = ({
  activeSupplierCost = 15.00,
  activeOrdersPerDay = 10,
  activePackSize = 20,
  onNavigateToStage
}) => {
  const calculatedLanded = Number((activeSupplierCost * 1.086).toFixed(2));
  const calculatedDemand = activeOrdersPerDay * activePackSize * 365;

  const [annualDemand, setAnnualDemand] = useState<number>(calculatedDemand || 73000);
  const [supplierLandedCost, setSupplierLandedCost] = useState<number>(calculatedLanded || 16.30);
  const [toolingCapex, setToolingCapex] = useState<number>(350000);
  const [equipmentCapex, setEquipmentCapex] = useState<number>(850000);
  const [monthlyLabour, setMonthlyLabour] = useState<number>(38000);
  const [monthlyElectricity, setMonthlyElectricity] = useState<number>(14000);
  const [monthlyRent, setMonthlyRent] = useState<number>(22000);
  const [rawMaterialUnit, setRawMaterialUnit] = useState<number>(8.10);
  const [screwUnit, setScrewUnit] = useState<number>(2.80);
  const [minEfficientScale, setMinEfficientScale] = useState<number>(180000);

  React.useEffect(() => {
    if (activeSupplierCost) {
      setSupplierLandedCost(Number((activeSupplierCost * 1.086).toFixed(2)));
    }
  }, [activeSupplierCost]);

  React.useEffect(() => {
    if (activeOrdersPerDay && activePackSize) {
      setAnnualDemand(activeOrdersPerDay * activePackSize * 365);
    }
  }, [activeOrdersPerDay, activePackSize]);

  const model = calculateMakeVsBuy(
    annualDemand,
    supplierLandedCost,
    monthlyLabour,
    monthlyElectricity,
    monthlyRent,
    toolingCapex,
    equipmentCapex,
    rawMaterialUnit,
    screwUnit,
    3.5,
    minEfficientScale
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                Layer 4 · Manufacturing Feasibility
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">Section 16 Make-vs-Buy</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Manufacturing Trigger & Feasibility Decision Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prevents premature vertical integration. Only displays MANUFACTURING JUSTIFIED when annual demand and capex payback satisfy strict mathematical thresholds.
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded border font-mono font-bold text-xs uppercase flex items-center gap-2 ${
              model.recommendation === 'MANUFACTURING_JUSTIFIED'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                : 'bg-amber-950 text-amber-400 border-amber-700'
            }`}
          >
            {model.recommendation === 'MANUFACTURING_JUSTIFIED' ? <Factory className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {model.recommendation.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Reasoning Banner */}
        <div className="pt-4 pb-2">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs font-mono">
            <span className="text-amber-400 font-bold block mb-1">Commercial Economic Evaluation:</span>
            <p className="text-slate-300 font-sans leading-relaxed">{model.reasoning}</p>
          </div>
        </div>

        {/* Key Model Outputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block uppercase">Current Buy Cost</span>
            <span className="text-sm font-bold text-white tabular-nums">₹{model.supplier_landed_cost_unit.toFixed(2)}/pc</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block uppercase">Expected Make Cost</span>
            <span className="text-sm font-bold text-amber-400 tabular-nums">₹{model.expected_manufacturing_cost_unit.toFixed(2)}/pc</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block uppercase">Annual Net Savings</span>
            <span className={`text-sm font-bold tabular-nums ${model.annual_savings_inr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{model.annual_savings_inr.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block uppercase">Capex Payback</span>
            <span className="text-sm font-bold text-white tabular-nums">{model.payback_period_months} months</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block uppercase">Break-even Volume</span>
            <span className="text-sm font-bold text-white tabular-nums">{model.break_even_volume_units.toLocaleString()} pcs</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block uppercase">Min Efficient Scale</span>
            <span className="text-sm font-bold text-slate-300 tabular-nums">{model.minimum_efficient_scale_units_year.toLocaleString()} pcs</span>
          </div>
        </div>
      </div>

      {/* Model Parameter Adjusters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono mb-4 pb-2 border-b border-slate-800">
          Manufacturing Capex & Operating Cost Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
            <span className="text-amber-400 font-bold uppercase block text-[11px]">Demand & Sourcing Baseline</span>
            <div>
              <label className="text-slate-400 block mb-1">Annual Demand Volume (units/yr):</label>
              <input
                type="number"
                value={annualDemand}
                onChange={(e) => setAnnualDemand(parseInt(e.target.value) || 10000)}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Current Landed Buy Cost (₹/pc):</label>
              <input
                type="number"
                step="0.1"
                value={supplierLandedCost}
                onChange={(e) => setSupplierLandedCost(parseFloat(e.target.value) || 10)}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
            <span className="text-blue-400 font-bold uppercase block text-[11px]">Capital Expenditure (Capex)</span>
            <div>
              <label className="text-slate-400 block mb-1">Tooling & Progressive Dies (₹):</label>
              <input
                type="number"
                value={toolingCapex}
                onChange={(e) => setToolingCapex(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Stamping Press & Machinery (₹):</label>
              <input
                type="number"
                value={equipmentCapex}
                onChange={(e) => setEquipmentCapex(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
            <span className="text-cyan-400 font-bold uppercase block text-[11px]">Monthly Factory Fixed Overheads</span>
            <div>
              <label className="text-slate-400 block mb-1">Machinist Labour (₹/mo):</label>
              <input
                type="number"
                value={monthlyLabour}
                onChange={(e) => setMonthlyLabour(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Power & Industrial Shed Rent (₹/mo):</label>
              <input
                type="number"
                value={monthlyRent + monthlyElectricity}
                onChange={(e) => {
                  const total = parseInt(e.target.value) || 0;
                  setMonthlyRent(Math.round(total * 0.6));
                  setMonthlyElectricity(Math.round(total * 0.4));
                }}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs font-mono text-slate-400">
          Manufacturing Thesis: <strong className="text-amber-400">Distribute first, prove repeat cash flow, then vertically integrate.</strong>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToStage && (
            <>
              <button
                onClick={() => onNavigateToStage('ANALYTICS')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs rounded transition-colors"
              >
                <span>Stage 11: Floor Arbitrage &rarr;</span>
              </button>
              <button
                onClick={() => onNavigateToStage('CONTROL_TOWER')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs rounded transition-colors"
              >
                <span>Control Tower</span>
              </button>
              <button
                onClick={() => onNavigateToStage('CONTRACT')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded border border-slate-700 transition-colors"
              >
                <span>Engine Contract</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
