import React from 'react';
import { SKUProduct } from '../types';
import { TrendingUp, ShoppingBag, Eye, MousePointer, Award, AlertCircle } from 'lucide-react';

interface AmazonExperimentProps {
  skus: SKUProduct[];
  activeOrdersPerDay?: number;
  activePpc?: number;
  onPromoteCalibratedDemand?: (ordersPerDay: number, ppcPerOrder: number, source: string) => void;
  onNavigateNext?: () => void;
}

export const AmazonExperiment: React.FC<AmazonExperimentProps> = ({
  skus,
  activeOrdersPerDay = 10,
  activePpc = 45,
  onPromoteCalibratedDemand,
  onNavigateNext
}) => {
  // Synthesized experiment funnel data
  const funnelStages = [
    { stage: 'Impressions', value: '184,200', drop: 'CTR: 2.14%' },
    { stage: 'Clicks / Visits', value: '3,942', drop: 'Session Conv: 14.8%' },
    { stage: 'Sessions', value: '3,410', drop: 'Cart-to-Order: 82%' },
    { stage: 'Amazon Orders', value: '584', drop: 'ACOS: 14.2% · TACOS: 4.8%' },
    { stage: 'Verified Reviews', value: '42', drop: 'Avg Rating: 4.6 ★' },
    { stage: 'Recurring B2B Inquiries', value: '18', drop: '3.1% Conversion' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                Layer 1 & 4 · Marketplace Experimentation
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">Section 10 & 11 Funnel</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Amazon Experiment Tracker & Decision Framework
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Amazon is a demand-testing and customer acquisition layer, not the terminal business. Tracks conversion velocity, PPC efficiency, and identifies bottlenecks.
            </p>
          </div>
        </div>

        {/* Funnel Visualizer */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          {funnelStages.map((stg, i) => (
            <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-500 uppercase block">{stg.stage}</span>
              <div className="text-lg font-bold text-white mt-1 tabular-nums">{stg.value}</div>
              <span className="text-[10px] text-amber-400 block mt-1">{stg.drop}</span>
            </div>
          ))}
        </div>

        {/* Candidate Calibrated Demand Promotion Panel */}
        <div className="mt-4 p-3 bg-amber-950/30 border border-amber-500/40 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                CALIBRATED ESTIMATE CANDIDATE
              </span>
              <span className="text-slate-400">Campaign DIN-3017-W4-PHASE1</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Observed conversion velocity: <strong className="text-white">13 orders/day</strong> · Average PPC cost: <strong className="text-white">₹41.20/order</strong> (ACOS: 14.2%).
              Promoting creates an approved scenario parameter without mutating frozen accounting.
            </p>
          </div>
          <button
            onClick={() => onPromoteCalibratedDemand?.(13, 41.20, 'Amazon Campaign DIN-3017-W4-PHASE1')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs whitespace-nowrap transition-colors"
          >
            Apply to Active Scenario
          </button>
        </div>
      </div>

      {/* SKU Performance Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono mb-4 pb-2 border-b border-slate-800">
          SKU Amazon Experiment Ledger & Decision Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Orders (30d)</th>
                <th className="py-2.5 px-3">Units Sold</th>
                <th className="py-2.5 px-3">ASP</th>
                <th className="py-2.5 px-3">Revenue</th>
                <th className="py-2.5 px-3">PPC Spend</th>
                <th className="py-2.5 px-3">ACOS</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3">Return Rate</th>
                <th className="py-2.5 px-3">Contribution</th>
                <th className="py-2.5 px-3">Decision Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {skus.map((sku) => {
                const is20 = sku.pack_size === 20;
                const orders = is20 ? 142 : 54;
                const units = orders * sku.pack_size;
                const asp = is20 ? 499 : 299;
                const revenue = orders * asp;
                const ppcSpend = orders * 42;
                const acos = ((ppcSpend / revenue) * 100).toFixed(1);
                const contrib = Math.round(revenue * 0.24);

                return (
                  <tr key={sku.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{sku.sku_code}</td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">{orders}</td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">{units} pcs</td>
                    <td className="py-3 px-3 text-white font-bold tabular-nums">₹{asp}</td>
                    <td className="py-3 px-3 text-slate-200 tabular-nums">₹{revenue.toLocaleString()}</td>
                    <td className="py-3 px-3 text-rose-400 tabular-nums">₹{ppcSpend.toLocaleString()}</td>
                    <td className="py-3 px-3 text-amber-400 tabular-nums">{acos}%</td>
                    <td className="py-3 px-3 text-slate-300">4.6 ★ (24)</td>
                    <td className="py-3 px-3 text-slate-300">2.4%</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold tabular-nums">₹{contrib.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          sku.status === 'SCALE'
                            ? 'text-emerald-400 bg-emerald-950 border-emerald-800'
                            : sku.status === 'TEST'
                            ? 'text-cyan-400 bg-cyan-950 border-cyan-800'
                            : sku.status === 'NEGOTIATE'
                            ? 'text-amber-400 bg-amber-950 border-amber-800'
                            : 'text-purple-400 bg-purple-950 border-purple-800'
                        }`}
                      >
                        {sku.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {onNavigateNext && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onNavigateNext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs rounded border border-slate-700 transition-colors"
          >
            <span>Proceed to Stage 8: B2B Accounts & CRM Funnel</span>
            <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
