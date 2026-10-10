import React, { useState } from 'react';
import {
  ConfidenceLevel,
  IntelligenceObservation,
  ProvenanceType,
  ResearchTask
} from '../types';
import {
  Database,
  Search,
  Plus,
  Filter,
  Shield,
  Layers,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  Tag,
  AlertCircle
} from 'lucide-react';

interface IntelligenceRegistryProps {
  observations: IntelligenceObservation[];
  tasks: ResearchTask[];
  onAddObservation: (obs: IntelligenceObservation) => void;
  onAddTask: (task: ResearchTask) => void;
  confidenceFilter: ConfidenceLevel | 'ALL';
}

export const IntelligenceRegistry: React.FC<IntelligenceRegistryProps> = ({
  observations,
  tasks,
  onAddObservation,
  onAddTask,
  confidenceFilter
}) => {
  const [activeTab, setActiveTab] = useState<'OBSERVATIONS' | 'TASKS' | 'PROVENANCE_HIERARCHY'>('OBSERVATIONS');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New observation state
  const [newObs, setNewObs] = useState<Partial<IntelligenceObservation>>({
    source_type: 'MARKETPLACE',
    source_name: 'IndiaMART',
    entity_type: 'SUPPLIER',
    entity_name: '',
    category: 'Procurement',
    subcategory: 'Supplier Quotation',
    location: 'Howrah, WB',
    attribute: 'quoted_price',
    value: 14.50,
    unit: 'INR/piece',
    currency: 'INR',
    confidence: 'HIGH',
    provenance: 'SUPPLIER_QUOTED',
    collection_method: 'MANUAL_ENTRY',
    status: 'VERIFIED',
    notes: ''
  });

  const getProvenanceBadgeStyle = (provenance: ProvenanceType) => {
    switch (provenance) {
      case 'ACTUAL_INTERNAL':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800';
      case 'SUPPLIER_QUOTED':
        return 'text-blue-400 bg-blue-950/70 border-blue-800';
      case 'DIRECT_OBSERVATION':
        return 'text-cyan-400 bg-cyan-950/70 border-cyan-800';
      case 'AGENT_OBSERVED':
        return 'text-indigo-400 bg-indigo-950/70 border-indigo-800';
      case 'EXTERNALLY_SOURCED':
        return 'text-amber-400 bg-amber-950/70 border-amber-800';
      case 'ASSUMPTION':
        return 'text-orange-400 bg-orange-950/70 border-orange-800';
      case 'SCENARIO':
        return 'text-purple-400 bg-purple-950/70 border-purple-800';
      case 'SYNTHETIC':
        return 'text-slate-400 bg-slate-900 border-slate-700';
      default:
        return 'text-slate-300 bg-slate-900 border-slate-700';
    }
  };

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'HIGH':
        return 'text-emerald-400 font-bold';
      case 'MEDIUM':
        return 'text-amber-400';
      case 'LOW':
        return 'text-rose-400';
    }
  };

  // Filtered observations
  const filteredObservations = observations.filter((obs) => {
    if (confidenceFilter !== 'ALL' && obs.confidence !== confidenceFilter) return false;
    if (entityFilter !== 'ALL' && obs.entity_type !== entityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        obs.entity_name.toLowerCase().includes(q) ||
        obs.attribute.toLowerCase().includes(q) ||
        obs.source_name.toLowerCase().includes(q) ||
        obs.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObs.entity_name || !newObs.attribute) return;

    const fullObservation: IntelligenceObservation = {
      id: `obs-${Date.now()}`,
      source_type: newObs.source_type || 'MARKETPLACE',
      source_name: newObs.source_name || 'Manual Source',
      source_url: newObs.source_url,
      observed_at: new Date().toISOString(),
      collected_at: new Date().toISOString(),
      entity_type: newObs.entity_type || 'SUPPLIER',
      entity_name: newObs.entity_name,
      category: newObs.category || 'General',
      subcategory: newObs.subcategory || 'Market Rate',
      location: newObs.location || 'Howrah',
      attribute: newObs.attribute,
      value: newObs.value ?? 0,
      unit: newObs.unit || 'INR',
      currency: newObs.currency || 'INR',
      confidence: newObs.confidence || 'MEDIUM',
      provenance: newObs.provenance || 'EXTERNALLY_SOURCED',
      collection_method: 'MANUAL_ENTRY',
      status: 'VERIFIED',
      notes: newObs.notes || 'Manually entered into registry.'
    };

    onAddObservation(fullObservation);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                Layer 2 · Evidence & Registry
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">Step 1 Priority</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Intelligence Registry & Provenance Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Normalizes raw observations from Amazon, IndiaMART, GeM, and Howrah suppliers into structured evidence with strict confidence and provenance hierarchy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Observation</span>
            </button>
          </div>
        </div>

        {/* Workspace Sub-tabs */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab('OBSERVATIONS')}
            className={`px-3 py-1.5 text-xs font-mono rounded font-medium transition-colors ${
              activeTab === 'OBSERVATIONS'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Structured Observations ({observations.length})
          </button>
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`px-3 py-1.5 text-xs font-mono rounded font-medium transition-colors ${
              activeTab === 'TASKS'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Research Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('PROVENANCE_HIERARCHY')}
            className={`px-3 py-1.5 text-xs font-mono rounded font-medium transition-colors ${
              activeTab === 'PROVENANCE_HIERARCHY'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Provenance Hierarchy Rules
          </button>
        </div>

        {/* Research Boundary Contract Callout */}
        <div className="mt-3 bg-slate-950/80 border border-slate-800 p-3 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] whitespace-nowrap">
              RESEARCH BOUNDARY ENFORCED
            </span>
            <span className="text-slate-400 text-[11px]">
              Observations recorded here are immutable. Financial simulations consume them through explicit Layer 3 Epistemic Bindings.
            </span>
          </div>
          <span className="text-amber-400/90 text-[10px] shrink-0">Input Truth &ne; Calculation Correctness</span>
        </div>
      </div>

      {activeTab === 'OBSERVATIONS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
          {/* Table Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entity, attribute, location, or source..."
                className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-mono">Entity:</span>
              {['ALL', 'SUPPLIER', 'SKU', 'BUSINESS', 'COMPETITOR'].map((ent) => (
                <button
                  key={ent}
                  onClick={() => setEntityFilter(ent)}
                  className={`px-2 py-1 font-mono rounded ${
                    entityFilter === ent
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ent}
                </button>
              ))}
            </div>
          </div>

          {/* Observations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <th className="py-2.5 px-3">Obs ID</th>
                  <th className="py-2.5 px-3">Source & Name</th>
                  <th className="py-2.5 px-3">Entity Target</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Attribute & Observed Value</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Provenance Type</th>
                  <th className="py-2.5 px-3">Observed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredObservations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-500">{obs.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{obs.source_name}</div>
                      <div className="text-[10px] text-slate-500">{obs.source_type}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{obs.entity_name}</div>
                      <div className="text-[10px] text-slate-500">{obs.entity_type} · {obs.subcategory}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {obs.location}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-400">{obs.attribute}: </span>
                      <span className="text-amber-400 font-bold tabular-nums">
                        {typeof obs.value === 'number' && obs.currency === 'INR' ? `₹${obs.value}` : String(obs.value)}
                      </span>
                      {obs.unit && <span className="text-slate-500 text-[10px]"> {obs.unit}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={getConfidenceBadge(obs.confidence)}>{obs.confidence}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] border font-semibold ${getProvenanceBadgeStyle(
                          obs.provenance
                        )}`}
                      >
                        {obs.provenance}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] tabular-nums">
                      {new Date(obs.observed_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'TASKS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono">
                Research Task Registry (Section 6 & 7)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardized agent task specifications structured for eventual invocation by background browser agents.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{tasks.length} tasks registered</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task.task_id}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-md space-y-2.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-bold">{task.task_id}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {task.priority} PRIORITY
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        task.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-100">{task.name}</h4>
                <p className="text-slate-400 leading-relaxed font-sans">{task.objective}</p>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500">Scope:</span> {task.geographic_scope}
                  </div>
                  <div>
                    <span className="text-slate-500">Sources:</span> {task.source_targets.join(', ')}
                  </div>
                  <div>
                    <span className="text-slate-500">Last Execution:</span> {task.last_run || 'Never'} ·{' '}
                    <span className="text-slate-500">Next:</span> {task.next_run || 'Manual'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'PROVENANCE_HIERARCHY' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 text-xs space-y-4 font-mono">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Strict Provenance Hierarchy Rules (Section 5)
            </h3>
            <p className="text-slate-400 mt-1">
              "Never silently upgrade an observation. Financial truth comes from deterministic calculations, not inferred assumptions."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-emerald-400 font-bold">1. ACTUAL_INTERNAL</span>
              <p className="text-slate-400 font-sans">
                Internal bank transactions, paid invoices, cleared customs duty receipts, and physical warehouse count reports.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-blue-400 font-bold">2. SUPPLIER_QUOTED</span>
              <p className="text-slate-400 font-sans">
                Formal price quotations received on letterhead, WhatsApp, or email from an identified manufacturer/trader.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-cyan-400 font-bold">3. DIRECT_OBSERVATION</span>
              <p className="text-slate-400 font-sans">
                Physically visited Howrah / Burrabazar hardware storefronts, verified factory presence, or measured clamp dimensions.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-indigo-400 font-bold">4. AGENT_OBSERVED</span>
              <p className="text-slate-400 font-sans">
                Extracted directly by an automated connector or web tool from public marketplace endpoints (e.g. Amazon India buy box).
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-amber-400 font-bold">5. EXTERNALLY_SOURCED</span>
              <p className="text-slate-400 font-sans">
                Public directory listings (IndiaMART, GeM tenders, industry portals) subject to counter-party verification.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-orange-400 font-bold">6. ASSUMPTION & SCENARIO</span>
              <p className="text-slate-400 font-sans">
                User-entered hypotheses, modeled PPC cost curves, stress-test interest rates, or simulated supplier cost reductions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Observation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full p-6 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase">Add Structured Intelligence Observation</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateObservation} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Entity Name:</label>
                <input
                  type="text"
                  required
                  value={newObs.entity_name}
                  onChange={(e) => setNewObs({ ...newObs, entity_name: e.target.value })}
                  placeholder="e.g. Shyam Fasteners Howrah"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Entity Type:</label>
                  <select
                    value={newObs.entity_type}
                    onChange={(e) => setNewObs({ ...newObs, entity_type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded text-white"
                  >
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="SKU">SKU</option>
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="COMPETITOR">COMPETITOR</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Source Name:</label>
                  <input
                    type="text"
                    value={newObs.source_name}
                    onChange={(e) => setNewObs({ ...newObs, source_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Attribute:</label>
                  <input
                    type="text"
                    value={newObs.attribute}
                    onChange={(e) => setNewObs({ ...newObs, attribute: e.target.value })}
                    placeholder="e.g. quoted_price"
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Observed Value:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newObs.value as number}
                    onChange={(e) => setNewObs({ ...newObs, value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Confidence:</label>
                  <select
                    value={newObs.confidence}
                    onChange={(e) => setNewObs({ ...newObs, confidence: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded text-white"
                  >
                    <option value="HIGH">HIGH (Verified / Direct)</option>
                    <option value="MEDIUM">MEDIUM (Strong Evidence)</option>
                    <option value="LOW">LOW (Unverified / Indirect)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Provenance Type:</label>
                  <select
                    value={newObs.provenance}
                    onChange={(e) => setNewObs({ ...newObs, provenance: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded text-white"
                  >
                    <option value="SUPPLIER_QUOTED">SUPPLIER_QUOTED</option>
                    <option value="DIRECT_OBSERVATION">DIRECT_OBSERVATION</option>
                    <option value="AGENT_OBSERVED">AGENT_OBSERVED</option>
                    <option value="EXTERNALLY_SOURCED">EXTERNALLY_SOURCED</option>
                    <option value="ASSUMPTION">ASSUMPTION</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Location:</label>
                <input
                  type="text"
                  value={newObs.location}
                  onChange={(e) => setNewObs({ ...newObs, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-white"
                />
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
                  Save to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
