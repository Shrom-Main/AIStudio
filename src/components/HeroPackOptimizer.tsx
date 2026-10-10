import React, { useState } from 'react';
import { AmazonFeeAssumptions } from '../types';
import { evaluateHeroPacks, HeroPackComparison } from '../lib/calculators';
import { Layers, TrendingUp, CheckCircle, AlertTriangle, Package, ShieldAlert } from 'lucide-react';

interface HeroPackOptimizerProps {
  feeAssumptions: AmazonFeeAssumptions;
  activePackSize?: number;
  activeSupplierCost?: number;
  onSelectHeroPack?: (packSize: number, targetAsp: number) => void;
  onNavigateNext?: () => void;
}

export const HeroPackOptimizer: React.FC<HeroPackOptimizerProps> = ({
  feeAssumptions,
  activePackSize = 20,
  activeSupplierCost = 15.00,
  onSelectHeroPack,
  onNavigateNext
}) => {
  const [supplierPrice, setSupplierPrice] = useState<number>(activeSupplierCost);
  const [baseUnitWeight, setBaseUnitWeight] = useState<number>(18); // grams per clamp

  React.useEffect(() => {
    if (activeSupplierCost !== undefined) setSupplierPrice(activeSupplierCost);
  }, [activeSupplierCost]);

  const comparisons = evaluateHeroPacks(supplierPrice, baseUnitWeight, feeAssumptions);

  const getDecisionBadge = (rec: HeroPackComparison['recommendation']) => {
    switch (rec) {
      case 'SCALE':
        return 'text-emerald-400 bg-emerald-950 border-emerald-800';
      case 'TEST':
        return 'text-cyan-400 bg-cyan-950 border-cyan-800';
      case 'HOLD':
        return 'text-amber-400 bg-amber-950 border-amber-800';
      case 'KILL':
        return 'text-rose-400 bg-rose-950 border-rose-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                Layer 3 · Portfolio Architecture
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">Hero SKU Optimizer</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Pack Size Economic Comparison (5 to 100 Packs)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Do not assume the 20-pack is optimal. Evaluates shipping burden, working capital requirement, marketplace fees, and velocity score.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
              <span className="text-slate-400">Supplier Price:</span>
              <input
                type="number"
                step="0.1"
                value={supplierPrice}
                onChange={(e) => setSupplierPrice(parseFloat(e.target.value) || 12)}
                className="w-16 bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-white text-center"
              />
              <span className="text-slate-500">₹/pc</span>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className="py-2.5 px-3">Pack Bundle</th>
                <th className="py-2.5 px-3">Target ASP</th>
                <th className="py-2.5 px-3">Landed COGS</th>
                <th className="py-2.5 px-3">Amazon Fees</th>
                <th className="py-2.5 px-3">Contribution</th>
                <th className="py-2.5 px-3">Margin %</th>
                <th className="py-2.5 px-3">PPC Allowance</th>
                <th className="py-2.5 px-3">Expected Velocity</th>
                <th className="py-2.5 px-3">Monthly Profit</th>
                <th className="py-2.5 px-3">Inventory Capital</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Decision</th>
                <th className="py-2.5 px-3">Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisons.map((c) => {
                const isSelected = activePackSize === c.pack_size;
                return (
                  <tr key={c.pack_size} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-amber-500/10' : ''}`}>
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-500" />
                      {c.pack_size}-Pack
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-bold tabular-nums">₹{c.suggested_asp}</td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">₹{c.order_cogs}</td>
                    <td className="py-3 px-3 text-rose-400 tabular-nums">₹{c.amazon_fees}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold tabular-nums">
                      ₹{c.net_contribution}
                    </td>
                    <td className="py-3 px-3 text-emerald-300 tabular-nums">{c.contribution_margin_pct}%</td>
                    <td className="py-3 px-3 text-slate-400 tabular-nums">₹{c.ppc_allowance}</td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">{c.expected_orders_day} ord/d</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold tabular-nums">
                      ₹{c.expected_monthly_contribution.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">
                      ₹{c.inventory_capital_1mo.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-400 tabular-nums">{c.economic_score}/100</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDecisionBadge(c.recommendation)}`}>
                        {c.recommendation}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold text-[10px]">
                          ACTIVE HERO PACK
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectHeroPack?.(c.pack_size, c.suggested_asp)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 font-mono text-[10px] transition-colors"
                        >
                          Select Pack
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisons
          .filter((c) => c.recommendation === 'SCALE' || c.recommendation === 'TEST' || c.pack_size === 5)
          .slice(0, 3)
          .map((card) => (
            <div key={card.pack_size} className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{card.pack_size}-Pack Strategic Review</span>
                <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getDecisionBadge(card.recommendation)}`}>
                  {card.recommendation}
                </span>
              </div>
              <p className="text-slate-400 font-sans">{card.rationale}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Break-even ASP: <span className="text-slate-200 font-bold">₹{card.break_even_asp}</span></div>
                <div>Monthly Working Capital: <span className="text-slate-200 font-bold">₹{card.inventory_capital_1mo.toLocaleString()}</span></div>
                <div>Net Contribution Margin: <span className="text-emerald-400 font-bold">{card.contribution_margin_pct}%</span></div>
              </div>
            </div>
          ))}
      </div>

      {onNavigateNext && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onNavigateNext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs rounded border border-slate-700 transition-colors"
          >
            <span>Proceed to Stage 7: Amazon Experiment Funnel</span>
            <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
