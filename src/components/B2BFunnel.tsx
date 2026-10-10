import React from 'react';
import { B2BCustomer } from '../types';
import { Building2, TrendingUp, Users, ArrowRight, CheckCircle2, Phone } from 'lucide-react';

interface B2BFunnelProps {
  customers: B2BCustomer[];
  activeSupplierCost?: number;
  activePackSize?: number;
  activeAsp?: number;
  activeBuyerId?: string;
  onSelectBuyer?: (buyerId: string) => void;
  onNavigateNext?: () => void;
}

export const B2BFunnel: React.FC<B2BFunnelProps> = ({
  customers,
  activeSupplierCost = 15.00,
  activePackSize = 20,
  activeAsp = 499,
  activeBuyerId,
  onSelectBuyer,
  onNavigateNext
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                Layer 4 · Commercial Transformation
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">Section 12 & 13 B2B Engine</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              B2B Customer Funnel & Recurring Account Scoring
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Amazon is a customer acquisition layer. When a customer orders 5×20-packs in 45 days, the system identifies them as a potential recurring commercial account and estimates annualized consumption.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">B2B Conversion Rate</span>
              <span className="text-emerald-400 font-bold text-sm">31.2%</span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-500 text-[10px] block uppercase">Direct Margin Expansion</span>
              <span className="text-amber-400 font-bold text-sm">+18.5%</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Channel Economics Comparison */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 border border-rose-900/40 rounded space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">D2C Marketplace Channel (Amazon)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800 font-bold">MARGIN NEGATIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
              <div>Selling Price: <strong className="text-white">₹{activeAsp}</strong></div>
              <div>Landed COGS ({activePackSize}p): <span className="text-slate-400">₹{(activeSupplierCost * activePackSize * 1.086).toFixed(0)}</span></div>
              <div>Marketplace Fees: <span className="text-rose-400 font-semibold">-₹160.97</span></div>
              <div>PPC & Returns: <span className="text-rose-400">-₹50.24</span></div>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-between font-bold">
              <span>Net Contribution:</span>
              <span className="text-rose-400">-₹38.21 (-7.7%)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-emerald-800/40 rounded space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Wholesale B2B Parallel Channel</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">CASH POSITIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
              <div>Wholesale Bulk: <strong className="text-white">₹420</strong></div>
              <div>Landed COGS ({activePackSize}p): <span className="text-slate-400">₹{(activeSupplierCost * activePackSize * 1.086).toFixed(0)}</span></div>
              <div>Marketplace Fees: <span className="text-emerald-400 font-semibold">₹0.00 (Zero)</span></div>
              <div>Freight & Terms: <span className="text-amber-400">-₹20.00</span></div>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-between font-bold">
              <span>Net Contribution:</span>
              <span className="text-emerald-400">+₹74.00 (+17.6%)</span>
            </div>
          </div>
        </div>

        {/* Customer Accounts Table */}
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className="py-2.5 px-3">Company & Contact</th>
                <th className="py-2.5 px-3">Industry</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Acquisition Source</th>
                <th className="py-2.5 px-3">Est. Annual Consumption</th>
                <th className="py-2.5 px-3">Avg Order Value</th>
                <th className="py-2.5 px-3">Gross Margin</th>
                <th className="py-2.5 px-3">B2B Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customers.map((c) => {
                const isActive = activeBuyerId === c.id;
                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isActive
                        ? 'bg-emerald-950/30 border-l-2 border-emerald-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        )}
                        <span className="font-bold text-white">{c.company_name}</span>
                        {(c.id.includes('groq') || c.id.includes('scraped') || c.id.includes('INGESTED') || c.id.includes('SCRAPED')) && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Ingested
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{c.contact_person}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{c.industry}</td>
                    <td className="py-3 px-3 text-slate-400">{c.location}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {c.first_touch_source}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white tabular-nums">
                      {c.estimated_annual_consumption_units.toLocaleString()} pcs/yr
                    </td>
                    <td className="py-3 px-3 text-slate-200 tabular-nums">₹{c.average_order_value_inr.toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold tabular-nums">{c.gross_contribution_margin_pct}%</td>
                    <td className="py-3 px-3 font-bold text-amber-400 tabular-nums">{c.opportunity_score}/100</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.direct_b2b_status === 'ACTIVE_ACCOUNT'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : c.direct_b2b_status === 'QUOTED'
                            ? 'bg-blue-950 text-blue-400 border-blue-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}
                      >
                        {c.direct_b2b_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVE FOCUS
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectBuyer?.(c.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 font-mono text-[10px] transition-colors cursor-pointer"
                        >
                          Select as Active
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

      {/* Account Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-sm">{c.company_name}</span>
              <span className="text-amber-400 font-bold">{c.opportunity_score}/100 Priority</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed text-[11px]">{c.flag_notes}</p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Next Follow-up: <span className="text-white font-bold">{c.next_follow_up}</span></span>
              <span>Reorder Frequency: <span className="text-white">{c.order_frequency_days} days</span></span>
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
            <span>Proceed to Stage 9: Finance Board & Runway</span>
            <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
