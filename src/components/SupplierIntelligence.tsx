import React, { useState, useMemo } from 'react';
import { Supplier, SupplierQuote } from '../types';
import { compareSuppliers, SupplierComparisonResult } from '../lib/calculators';
import { ShieldCheck, AlertTriangle, Truck, Award, CheckCircle, Scale, Building2, Sparkles } from 'lucide-react';

interface SupplierIntelligenceProps {
  suppliers: Supplier[];
  quotes: SupplierQuote[];
  activeQuoteId?: string;
  activeSupplierId?: string;
  onSelectActiveQuote?: (
    quoteId: string,
    supplierId: string,
    unitPrice: number,
    supplierName: string
  ) => void;
  onNavigateNext?: () => void;
}

export const SupplierIntelligence: React.FC<SupplierIntelligenceProps> = ({
  suppliers,
  quotes,
  activeQuoteId,
  activeSupplierId,
  onSelectActiveQuote,
  onNavigateNext
}) => {
  const [targetAsp, setTargetAsp] = useState<number>(499);
  const [packSize, setPackSize] = useState<number>(20);

  // Match quotes to suppliers ONLY when verified quote records exist with positive prices.
  // Never fabricate a synthetic price for unquoted suppliers.
  const { pairedQuotes, unquotedSuppliers } = useMemo(() => {
    const paired: { supplier: Supplier; quote: SupplierQuote }[] = [];
    const quotedSupplierIds = new Set<string>();

    quotes.forEach((q) => {
      const s = suppliers.find((sup) => sup.id === q.supplier_id);
      if (s && typeof q.quoted_price_inr === 'number' && q.quoted_price_inr > 0) {
        paired.push({ supplier: s, quote: q });
        quotedSupplierIds.add(s.id);
      }
    });

    const unquoted = suppliers.filter((s) => !quotedSupplierIds.has(s.id));
    return { pairedQuotes: paired, unquotedSuppliers: unquoted };
  }, [suppliers, quotes]);

  const comparisonResults = compareSuppliers(pairedQuotes, targetAsp, packSize);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                Layer 1 & 2 · Buy-Side Intelligence
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">Supplier Sourcing & Verification</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Supplier Intelligence & Head-to-Head Landed Cost Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates true landed cost after freight, QA inspection, defect wastage, and MOQ working capital lock-up.
            </p>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded text-xs font-mono max-w-md">
            <span className="text-amber-400 font-bold block mb-1">Commercial Rule of Thumb:</span>
            <p className="text-slate-300">
              «Cheapest supplier ≠ best supplier.» A ₹2 lower unit quote that carries 4.8% defect rate or demands ₹2.5L MOQ destroys capital efficiency.
            </p>
          </div>
        </div>

        {/* Head-to-Head Comparison Table */}
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className="py-2.5 px-3">Supplier Name & Location</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Quoted Unit ₹</th>
                <th className="py-2.5 px-3">Freight & QA</th>
                <th className="py-2.5 px-3">Defect Cost</th>
                <th className="py-2.5 px-3">Landed Unit ₹</th>
                <th className="py-2.5 px-3">Landed {packSize}-Pack</th>
                <th className="py-2.5 px-3">Contribution @ ₹{targetAsp}</th>
                <th className="py-2.5 px-3">MOQ Cash Required</th>
                <th className="py-2.5 px-3">Supplier Score</th>
                <th className="py-2.5 px-3">Partner Verdict</th>
                <th className="py-2.5 px-3">Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonResults.map((item, idx) => {
                const isSelected =
                  (item.quote_id && activeQuoteId === item.quote_id) ||
                  (item.supplier_id && activeSupplierId === item.supplier_id);
                return (
                  <tr key={idx} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-amber-500/10' : ''}`}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.supplier_name}</span>
                        {(item.supplier_id?.includes('groq') || item.supplier_id?.includes('scraped') || item.supplier_id?.includes('INGESTED') || item.supplier_id?.includes('SCRAPED')) && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            Ingested
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.location}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-300">{item.type}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-400 tabular-nums">
                      ₹{item.quoted_price.toFixed(2)}
                      {item.is_cheapest_quote && (
                        <span className="ml-1 text-[9px] px-1 py-0.2 bg-blue-900 text-blue-300 rounded font-normal">
                          LOWEST
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">
                      +₹{(item.freight_per_unit + item.qa_cost_per_unit + item.packaging_per_unit).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-rose-400 tabular-nums">
                      +₹{item.defect_wastage_cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-white tabular-nums">
                      ₹{item.landed_cost_unit.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-200 tabular-nums">
                      ₹{item.landed_cost_20pack}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400 tabular-nums">
                      ₹{item.contribution_at_499} ({item.contribution_margin_pct}%)
                    </td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">
                      ₹{item.cash_required_for_moq.toLocaleString()} ({item.moq} pcs)
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-300 tabular-nums">
                      {item.supplier_score}/100
                    </td>
                    <td className="py-3 px-3">
                      {item.is_best_landed_partner ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          RECOMMENDED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                          SECONDARY
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold text-[10px]">
                          ACTIVE SCENARIO
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (item.quote_id && item.supplier_id) {
                              onSelectActiveQuote?.(
                                item.quote_id,
                                item.supplier_id,
                                item.quoted_price,
                                item.supplier_name
                              );
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 font-mono text-[10px] transition-colors"
                        >
                          Use as Active
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

      {/* Observed Entities Pending Commercial Quotation (REVIEW / DATA INSUFFICIENT) */}
      {unquotedSuppliers.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Observed Suppliers Awaiting Commercial Quotation
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                REVIEW / DATA INSUFFICIENT ({unquotedSuppliers.length})
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Prices not fabricated · Active promotion blocked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="py-2 px-3">Supplier Entity</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Observation Status</th>
                  <th className="py-2 px-3">Capacity / Month</th>
                  <th className="py-2 px-3">Commercial Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {unquotedSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{s.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{s.id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{s.type}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.location}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        DATA INSUFFICIENT (NO OBSERVED PRICE)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums">
                      {s.monthly_capacity_units ? `${s.monthly_capacity_units.toLocaleString()} pcs` : 'Unspecified'}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        disabled
                        title="Cannot promote to active scenario: No verified commercial quote observed."
                        className="px-2.5 py-1 rounded bg-slate-900 text-slate-600 border border-slate-800 font-mono text-[10px] cursor-not-allowed"
                      >
                        Quote Required
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplier Profile Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm">{s.name}</h4>
                <span className="text-slate-400 text-[11px]">{s.location}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                {s.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>Contact: <span className="text-white">{s.contact_person}</span></div>
              <div>Phone: <span className="text-slate-400">{s.phone}</span></div>
              <div>Lead Time: <span className="text-white font-bold">{s.lead_time_days} days</span></div>
              <div>Payment Terms: <span className="text-slate-300">{s.payment_terms}</span></div>
              <div>PMI/XRF Willing: <span className={s.xrf_pmi_willingness ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{s.xrf_pmi_willingness ? 'YES' : 'NO'}</span></div>
              <div>MTC Available: <span className={s.mtc_availability ? 'text-emerald-400' : 'text-slate-500'}>{s.mtc_availability ? 'YES' : 'NO'}</span></div>
              <div>Defect Rate: <span className="text-rose-400 font-bold">{s.defect_rate_pct}%</span></div>
              <div>On-Time Rate: <span className="text-emerald-400">{s.on_time_delivery_pct}%</span></div>
            </div>

            <p className="text-slate-400 font-sans pt-2 border-t border-slate-800 leading-relaxed text-[11px]">
              <span className="text-slate-500 font-mono uppercase">Notes: </span>
              {s.notes}
            </p>
          </div>
        ))}
      </div>

      {onNavigateNext && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onNavigateNext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs rounded border border-slate-700 transition-colors"
          >
            <span>Proceed to Stage 4: QA & Metallurgy</span>
            <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
