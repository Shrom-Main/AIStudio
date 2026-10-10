import React, { useState } from 'react';
import { QABatch, Supplier } from '../types';
import { ShieldCheck, AlertOctagon, CheckCircle2, XCircle, AlertTriangle, Plus, FileText } from 'lucide-react';

interface QAVerificationProps {
  batches: QABatch[];
  suppliers: Supplier[];
  activeBatchId?: string;
  onAddBatch: (batch: QABatch) => void;
  onSetQaStatus?: (batchId: string, status: 'PASS' | 'QUARANTINE') => void;
  onNavigateNext?: () => void;
}

export const QAVerification: React.FC<QAVerificationProps> = ({
  batches,
  suppliers,
  activeBatchId,
  onAddBatch,
  onSetQaStatus,
  onNavigateNext
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<QABatch | null>(batches[0] || null);

  // New batch form state
  const [batchId, setBatchId] = useState<string>(`BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1000);
  const [crPct, setCrPct] = useState<number>(18.2);
  const [niPct, setNiPct] = useState<number>(8.1);
  const [moPct, setMoPct] = useState<number>(0.2);
  const [mnPct, setMnPct] = useState<number>(1.4);
  const [torqueNm, setTorqueNm] = useState<number>(4.8);
  const [inspector, setInspector] = useState<string>('P. Sengupta (NABL certified)');

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify standard DIN 3017 SS304 thresholds
    const isPmiPass = crPct >= 18.0 && crPct <= 20.0 && niPct >= 8.0 && niPct <= 10.5;
    const isTorquePass = torqueNm >= 4.5;
    const pass = isPmiPass && isTorquePass;

    const newBatch: QABatch = {
      id: `qa-${Date.now()}`,
      batch_id: batchId,
      supplier_id: supplierId,
      sku_id: 'sku-ss304-2032-20p',
      quantity,
      inspection_date: new Date().toISOString().split('T')[0],
      material_claim: 'SS304 W4 (DIN 1.4301)',
      xrf_result: {
        chromium_pct: crPct,
        nickel_pct: niPct,
        molybdenum_pct: moPct,
        manganese_pct: mnPct,
        carbon_pct: 0.05
      },
      pmi_pass: isPmiPass,
      measured_band_thickness_mm: 0.68,
      measured_band_width_mm: 12.0,
      measured_clamp_range: '20.0mm - 32.2mm',
      screw_inspection: 'OK',
      housing_inspection: 'OK',
      torque_test_nm: torqueNm,
      corrosion_test_result: pass ? 'PASS_72H_SALT_SPRAY' : 'SURFACE_RUST_DETECTED',
      sample_size: 50,
      accepted_quantity: pass ? quantity : 0,
      rejected_quantity: pass ? 0 : quantity,
      qa_status: pass ? 'PASS' : 'FAIL',
      failure_reason: pass ? undefined : 'Material or torque out of specification. Suspect low-nickel grade.',
      inspector
    };

    onAddBatch(newBatch);
    setSelectedBatch(newBatch);
    setShowAddModal(false);
  };

  const getStatusBadge = (status: QABatch['qa_status']) => {
    switch (status) {
      case 'PASS':
        return 'text-emerald-400 bg-emerald-950 border-emerald-800';
      case 'CONDITIONAL':
        return 'text-amber-400 bg-amber-950 border-amber-800';
      case 'FAIL':
        return 'text-rose-400 bg-rose-950 border-rose-800';
      case 'PENDING':
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                Layer 2 · Metallurgical QA
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">DIN 3017 Physical & XRF Verification</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Batch-Level Quality Assurance & Material Verification
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Never infer SS304 merely because the supplier claims "SS304". Handheld XRF / PMI testing and DIN 3017 torque tests protect against low-nickel counterfeit substitutions.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs font-mono transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Inspection Batch</span>
          </button>
        </div>

        {/* Metallurgical Reference Standard Alert */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[10px] uppercase">SS304 Chromium (Cr)</span>
            <span className="text-sm font-bold text-white tabular-nums">18.00% – 20.00%</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Corrosion resistance barrier</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[10px] uppercase">SS304 Nickel (Ni)</span>
            <span className="text-sm font-bold text-white tabular-nums">8.00% – 10.50%</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Austenitic structure</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[10px] uppercase">DIN 3017 Torque Limit</span>
            <span className="text-sm font-bold text-white tabular-nums">&ge; 4.50 Nm</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">Screw & housing shear limit</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded border-rose-500/30">
            <span className="text-rose-400 block text-[10px] uppercase font-bold">Counterfeit Danger (SS201)</span>
            <span className="text-xs text-rose-300">Cr &lt;16.5% &middot; Ni &lt;5.0%</span>
            <span className="text-slate-500 text-[10px] block mt-0.5">High manganese rust risk</span>
          </div>
        </div>
      </div>

      {/* Batches Table & Drill-down */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table List (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono mb-4 pb-2 border-b border-slate-800">
            Incoming Batch Inspection Ledger
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <th className="py-2.5 px-3">Batch ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Units</th>
                  <th className="py-2.5 px-3">Cr %</th>
                  <th className="py-2.5 px-3">Ni %</th>
                  <th className="py-2.5 px-3">Torque</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {batches.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBatch(b)}
                    className={`cursor-pointer transition-colors ${
                      selectedBatch?.id === b.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-white">{b.batch_id}</td>
                    <td className="py-3 px-3 text-slate-400">{b.inspection_date}</td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">{b.quantity}</td>
                    <td className="py-3 px-3 font-semibold tabular-nums">
                      <span className={b.xrf_result.chromium_pct >= 18.0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {b.xrf_result.chromium_pct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold tabular-nums">
                      <span className={b.xrf_result.nickel_pct >= 8.0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {b.xrf_result.nickel_pct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 tabular-nums">
                      <span className={b.torque_test_nm >= 4.5 ? 'text-slate-200' : 'text-rose-400 font-bold'}>
                        {b.torque_test_nm} Nm
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(b.qa_status)}`}>
                        {b.qa_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch Inspector Detail (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 text-xs font-mono space-y-4">
          {selectedBatch ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedBatch.batch_id}</h4>
                  <span className="text-slate-400 text-[11px]">{selectedBatch.material_claim}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getStatusBadge(selectedBatch.qa_status)}`}>
                  {selectedBatch.qa_status}
                </span>
              </div>

              {selectedBatch.failure_reason && (
                <div className="p-3 bg-rose-950/40 border border-rose-800 rounded text-rose-300 text-[11px] leading-relaxed">
                  <span className="font-bold block mb-0.5">Failure Reason:</span>
                  {selectedBatch.failure_reason}
                </div>
              )}

              <div className="space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">XRF Chemical Spectroscopy</span>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 border border-slate-800 rounded">
                  <div>Chromium: <span className="font-bold text-white">{selectedBatch.xrf_result.chromium_pct}%</span></div>
                  <div>Nickel: <span className="font-bold text-white">{selectedBatch.xrf_result.nickel_pct}%</span></div>
                  <div>Molybdenum: <span className="text-slate-300">{selectedBatch.xrf_result.molybdenum_pct}%</span></div>
                  <div>Manganese: <span className="text-slate-300">{selectedBatch.xrf_result.manganese_pct}%</span></div>
                  <div>Carbon: <span className="text-slate-300">{selectedBatch.xrf_result.carbon_pct}%</span></div>
                  <div>PMI Result: <span className={selectedBatch.pmi_pass ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{selectedBatch.pmi_pass ? 'PASS' : 'FAIL'}</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Mechanical & Dimensional</span>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 border border-slate-800 rounded">
                  <div>Band Thick: <span className="text-white">{selectedBatch.measured_band_thickness_mm} mm</span></div>
                  <div>Band Width: <span className="text-white">{selectedBatch.measured_band_width_mm} mm</span></div>
                  <div>Torque: <span className="text-white font-bold">{selectedBatch.torque_test_nm} Nm</span></div>
                  <div>Corrosion: <span className="text-slate-300 text-[10px]">{selectedBatch.corrosion_test_result}</span></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div>Inspector: <span className="text-slate-200">{selectedBatch.inspector}</span></div>
                <div>Accepted: <span className="text-emerald-400 font-bold">{selectedBatch.accepted_quantity} pcs</span> &middot; Rejected: <span className="text-rose-400 font-bold">{selectedBatch.rejected_quantity} pcs</span></div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Commercial Eligibility Gate:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSetQaStatus?.(selectedBatch.batch_id, 'PASS')}
                    className="flex-1 py-1.5 px-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded font-mono text-[10px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Approve (PASS)
                  </button>
                  <button
                    onClick={() => onSetQaStatus?.(selectedBatch.batch_id, 'QUARANTINE')}
                    className="flex-1 py-1.5 px-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 rounded font-mono text-[10px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3 h-3 text-rose-400" />
                    Quarantine (BLOCK)
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Select a batch from the table to view metallurgical details.</p>
          )}
        </div>
      </div>

      {/* Add Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase">Log Incoming QA / XRF Inspection</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Batch ID:</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Supplier:</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Quantity (pcs):</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Chromium % (18-20):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={crPct}
                    onChange={(e) => setCrPct(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nickel % (8-10.5):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={niPct}
                    onChange={(e) => setNiPct(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Torque Test (Nm &ge;4.5):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={torqueNm}
                    onChange={(e) => setTorqueNm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Inspector:</label>
                  <input
                    type="text"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400"
                >
                  Submit QA Verdict
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {onNavigateNext && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onNavigateNext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs rounded border border-slate-700 transition-colors"
          >
            <span>Proceed to Stage 5: SKU Economics</span>
            <span>➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
