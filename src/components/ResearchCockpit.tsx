/**
 * POC-001: Step 6 Multi-Product Research Cockpit & Product Thesis Engine
 * 
 * Features:
 * 1. Product Universe with Research Lifecycle States
 * 2. Structured Evidence-Linked Product Thesis
 * 3. Section 20 Core Experiment: Live Contradictory Evidence Injection & Dynamic Revision
 * 4. Evidence Graph & Provenance Traceability
 * 5. Mandatory Adversarial Counter-Analysis (Bull vs. Bear Matrix)
 * 6. Continuous Market Surveillance Time-Series Feed
 * 7. Cross-Product Factor Exposure Matrix with DATA INSUFFICIENT Guardrails
 * 8. Differential Economic Decomposition (Reconciled via Frozen Financial Core)
 * 9. Human Sign-Off Decision Gating
 * 10. Automated Verification Suite Inspector
 */

import React, { useState } from 'react';
import {
  researchEngine,
  ResearchUniverseItem
} from '../lib/researchEngine';
import {
  StructuredProductThesis,
  SurveillanceObservation,
  ResearchClaim,
  AdversarialAnalysis,
  ProductFactorExposure,
  DifferentialEconomicComparison,
  ThesisDecision
} from '../types/research';
import { runResearchVerificationSuite, ResearchVerificationReport } from '../lib/researchVerification';
import { relationshipGraph } from '../lib/relationshipGraph';
import { FormulaRegistryAndTrends } from './FormulaRegistryAndTrends';
import { runGovernanceVerificationSuite, GovernanceVerificationReport } from '../lib/governanceVerification';
import {
  Compass,
  ShieldAlert,
  Flame,
  Scale,
  Activity,
  GitBranch,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Sliders,
  TrendingDown,
  TrendingUp,
  FileText,
  UserCheck,
  Share2,
  Calculator,
  BookOpen
} from 'lucide-react';

interface ResearchCockpitProps {
  onNavigateToCapability?: (capId: string) => void;
}

export const ResearchCockpit: React.FC<ResearchCockpitProps> = ({
  onNavigateToCapability
}) => {
  const [universe, setUniverse] = useState<ResearchUniverseItem[]>(() => researchEngine.getUniverse());
  const [selectedProductId, setSelectedProductId] = useState<string>('prod_ss304_din3017_canonical');
  const [activeTab, setActiveTab] = useState<
    | 'THESIS'
    | 'EXPERIMENT'
    | 'EVIDENCE_GRAPH'
    | 'ADVERSARIAL'
    | 'SURVEILLANCE'
    | 'FACTORS_DIFFERENTIAL'
    | 'ARCHETYPES_GRAPH'
    | 'EQUATION_MODELS'
    | 'VERIFICATION'
  >('THESIS');

  // Thesis & Evidence state
  const [thesis, setThesis] = useState<StructuredProductThesis | undefined>(
    () => researchEngine.getThesis(selectedProductId)
  );
  const [observations, setObservations] = useState<SurveillanceObservation[]>(
    () => researchEngine.getObservationsForProduct(selectedProductId)
  );
  const [claims, setClaims] = useState<ResearchClaim[]>(
    () => researchEngine.getClaimsForProduct(selectedProductId)
  );
  const [adversarial, setAdversarial] = useState<AdversarialAnalysis | undefined>(
    () => researchEngine.getAdversarialAnalysis(selectedProductId)
  );
  const [factorExposures, setFactorExposures] = useState<ProductFactorExposure[]>(
    () => researchEngine.getFactorExposures(selectedProductId)
  );

  // Cross-product differential target
  const [differentialTargetId, setDifferentialTargetId] = useState<string>('cand_prod_brass_ball_valve_001');
  const [differential, setDifferential] = useState<DifferentialEconomicComparison>(
    () => researchEngine.computeDifferentialComparison(selectedProductId, differentialTargetId)
  );

  // Verification report states
  const [verificationReport, setVerificationReport] = useState<ResearchVerificationReport | null>(null);
  const [governanceReport, setGovernanceReport] = useState<GovernanceVerificationReport | null>(null);

  // Human signoff modal state
  const [signoffNotes, setSignoffNotes] = useState<string>('');
  const [signoffDecision, setSignoffDecision] = useState<ThesisDecision>('PURSUE');
  const [showSignoffSuccess, setShowSignoffSuccess] = useState<boolean>(false);

  // Handle product selection
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const th = researchEngine.getThesis(productId);
    setThesis(th);
    setObservations(researchEngine.getObservationsForProduct(productId));
    setClaims(researchEngine.getClaimsForProduct(productId));
    setAdversarial(researchEngine.getAdversarialAnalysis(productId));
    setFactorExposures(researchEngine.getFactorExposures(productId));
    setDifferential(researchEngine.computeDifferentialComparison(productId, differentialTargetId));
  };

  // Section 20 Core Experiment Handler
  const handleInjectContradiction = (
    type: 'NICKEL_RAW_MATERIAL_SPIKE' | 'CHINESE_IMPORT_DUMPING' | 'CORROSIVE_FAILURE_SPIKE'
  ) => {
    const { newThesisVersion: revised } = researchEngine.injectContradictoryEvidence(selectedProductId, type);
    setThesis({ ...revised });
    setObservations(researchEngine.getObservationsForProduct(selectedProductId));
    setUniverse(researchEngine.getUniverse());
  };

  const handleResetExperiment = () => {
    const restored = researchEngine.resetCanonicalSS304Thesis();
    setThesis({ ...restored });
    setObservations(researchEngine.getObservationsForProduct(selectedProductId));
    setUniverse(researchEngine.getUniverse());
  };

  // Handle human sign-off
  const handleRecordSignoff = () => {
    const updated = researchEngine.recordHumanSignoff(
      selectedProductId,
      signoffDecision,
      'Ayan Mandal (Chief Research Officer)',
      signoffNotes || 'Validated against Howrah cluster physical factory audit.'
    );
    if (updated) {
      setThesis({ ...updated });
      setUniverse(researchEngine.getUniverse());
      setShowSignoffSuccess(true);
      setTimeout(() => setShowSignoffSuccess(false), 4000);
    }
  };

  // Run Verification Suite (Both Research & Governance Suites)
  const handleRunVerification = () => {
    const report = runResearchVerificationSuite();
    setVerificationReport(report);
    const gov = runGovernanceVerificationSuite();
    setGovernanceReport(gov);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner: Research OS Cockpit Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono tracking-wider uppercase mb-1">
              <span>POC-001 / Step 6</span>
              <span aria-hidden="true">·</span>
              <span>Epistemic Research & Thesis Engine</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Frozen Financial Core v1.0.0 Validated</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-500" />
              Multi-Product Research Cockpit & Surveillance Engine
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Continuous hypothesis testing, mandatory adversarial counter-analysis, time-series market surveillance, and dynamic evidence-linked product theses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunVerification}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Run 9-Point Verification Suite
            </button>
            {onNavigateToCapability && (
              <button
                onClick={() => onNavigateToCapability('ECONOMICS')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                Inspect Frozen Financial Core
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Verification Report Alert (if run) */}
        {verificationReport && (
          <div className="mt-4 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Verification Suite Result: {verificationReport.passed_tests}/{verificationReport.total_tests} Tests Passed ({verificationReport.executive_verdict})
              </span>
            </div>
            <button
              onClick={() => setActiveTab('VERIFICATION')}
              className="text-emerald-400 hover:text-emerald-300 underline font-medium"
            >
              View Detailed Test Audit Logs →
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Sidebar (Product Universe) + Right Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Universe Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Product Universe ({universe.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Strict Epistemic Isolation</span>
            </div>

            <div className="space-y-2">
              {universe.map((item) => {
                const isSelected = item.product_id === selectedProductId;
                return (
                  <button
                    key={item.product_id}
                    onClick={() => handleSelectProduct(item.product_id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs text-white line-clamp-1">
                        {item.name}
                      </div>
                      <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
                        {item.case_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{item.evidence_count} evidence</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-500">Decision:</span>
                        <span
                          className={`font-semibold ${
                            item.latest_thesis_decision === 'PURSUE'
                              ? 'text-emerald-400'
                              : item.latest_thesis_decision === 'REJECT'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {item.latest_thesis_decision || 'PENDING'}
                        </span>
                      </div>
                      <div className="font-mono text-slate-400">
                        Support: {item.thesis_support_score}/100
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Epistemic Invariant Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Epistemic Boundary Law
            </div>
            <p className="text-slate-400 leading-relaxed">
              Candidate items (e.g., Brass Ball Valve, Terracotta Diya) remain quarantined in the research state. They cannot alter active financial scenario parameters without explicit Human Sign-off.
            </p>
          </div>
        </div>

        {/* Right Column: Research Workspace Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Workspace Tabs (Segmented Controls) */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex flex-wrap gap-1 text-xs">
            <button
              onClick={() => setActiveTab('THESIS')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'THESIS'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Product Thesis
            </button>
            <button
              onClick={() => setActiveTab('EXPERIMENT')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'EXPERIMENT'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Section 20 Experiment
            </button>
            <button
              onClick={() => setActiveTab('EVIDENCE_GRAPH')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'EVIDENCE_GRAPH'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Evidence Graph
            </button>
            <button
              onClick={() => setActiveTab('ADVERSARIAL')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ADVERSARIAL'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Adversarial Matrix
            </button>
            <button
              onClick={() => setActiveTab('SURVEILLANCE')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'SURVEILLANCE'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Surveillance Feed
            </button>
            <button
              onClick={() => setActiveTab('FACTORS_DIFFERENTIAL')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'FACTORS_DIFFERENTIAL'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Cross-Product & Economics
            </button>
            <button
              onClick={() => setActiveTab('ARCHETYPES_GRAPH')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ARCHETYPES_GRAPH'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Archetypes &amp; Entity Graph
            </button>
            <button
              onClick={() => setActiveTab('EQUATION_MODELS')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'EQUATION_MODELS'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Model Registry
            </button>
            <button
              onClick={() => setActiveTab('VERIFICATION')}
              className={`px-3 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'VERIFICATION'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Test Audit
            </button>
          </div>

          {/* TAB 1: STRUCTURED PRODUCT THESIS */}
          {activeTab === 'THESIS' && (
            !thesis ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-base font-semibold text-white">No Thesis Established for this Entity</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This commercial opportunity or market signal is currently in pre-formulation observation.
                    No validated thesis has been established. Evidence is accumulating.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  <span>Entity ID: {selectedProductId}</span>
                  <span>·</span>
                  <span>Status: PENDING_PRIMARY_RESEARCH</span>
                </div>
              </div>
            ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-sm">
              {/* Thesis Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <span>Thesis ID: {thesis.thesis_id}</span>
                    <span aria-hidden="true">·</span>
                    <span>Version v{thesis.version}</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {new Date(thesis.updated_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{thesis.product_name}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 font-mono">Formal Decision</div>
                    <div
                      className={`text-sm font-bold font-mono ${
                        thesis.decision === 'PURSUE'
                          ? 'text-emerald-400'
                          : thesis.decision === 'REJECT'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {thesis.decision}
                    </div>
                  </div>
                  <div className="text-right pl-3 border-l border-slate-800">
                    <div className="text-[11px] text-slate-400 font-mono">Thesis Support Score</div>
                    <div className="text-sm font-bold font-mono text-white">
                      {thesis.thesis_support_score}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* Provisional / Illustrative Seed Thesis Warning */}
              {thesis.is_provisional && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>PROVISIONAL / ILLUSTRATIVE SEED THESIS</span>
                  </div>
                  <p className="text-amber-200/80 leading-relaxed text-[11px]">
                    {thesis.provisional_notice ||
                      'This thesis is an illustrative example with explicit assumptions and missing evidence awaiting verified field audit. Do not treat as validated commercial guidance.'}
                  </p>
                </div>
              )}

              {/* Thesis Version History & Diff Awareness */}
              {(() => {
                const history = researchEngine.getThesisHistory(selectedProductId);
                return (
                  <div className="space-y-3">
                    {history.length > 1 && (
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-semibold">Available Thesis Versions:</span>
                          <div className="flex items-center gap-1.5">
                            {history.map((ver) => (
                              <button
                                key={ver.thesis_id}
                                onClick={() => setThesis(ver)}
                                className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                                  thesis.version === ver.version
                                    ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold'
                                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                              >
                                <span>v{ver.version}</span>
                                <span className="text-[10px] opacity-75">· {ver.decision} ({ver.thesis_support_score}/100)</span>
                                {ver.version_status === 'ACTIVE_SUPPORTED' && (
                                  <span className="px-1 py-0.2 bg-emerald-950 text-emerald-300 rounded text-[9px] border border-emerald-800">ACTIVE</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {history.length} Immutable Versions Tracked
                        </div>
                      </div>
                    )}

                    {(() => {
                      const prevThesis = thesis.previous_version_id
                        ? history.find((h) => h.thesis_id === thesis.previous_version_id)
                        : undefined;

                      return thesis.previous_version_id ? (
                        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs space-y-1">
                          <div className="font-semibold text-amber-400 font-mono flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span>
                              Version Evolution: Viewing v{thesis.version}{' '}
                              {prevThesis ? `(Revised from v${prevThesis.version})` : '(Revised from Prior Version)'}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                            This thesis was dynamically re-evaluated following contradictory market evidence. Decision shifted to{' '}
                            <strong className="text-amber-300 font-mono">{thesis.decision}</strong>
                            {prevThesis && typeof prevThesis.thesis_support_score === 'number' ? (
                              <>
                                {' '}with Support Score revised from{' '}
                                <strong className="text-slate-200 font-mono">{prevThesis.thesis_support_score}</strong> to{' '}
                              </>
                            ) : (
                              ' with Support Score updated to '
                            )}
                            <strong className="text-white font-mono">{thesis.thesis_support_score}/100</strong>.{' '}
                            {prevThesis ? `v${prevThesis.version}` : 'Prior version'} remains immutably preserved in the audit log.
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                );
              })()}

              {/* Opportunity Statement */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase font-mono">
                  1. Opportunity Statement
                </div>
                <p className="text-sm text-slate-200 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 leading-relaxed font-sans">
                  {thesis.opportunity_statement}
                </p>
              </div>

              {/* Core Qualitative Findings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Why Now
                  </div>
                  <p className="text-slate-300 leading-relaxed">{thesis.why_now.narrative}</p>
                </div>
                <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Customer Problem
                  </div>
                  <p className="text-slate-300 leading-relaxed">{thesis.customer_problem.narrative}</p>
                </div>
                <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Supply Advantage
                  </div>
                  <p className="text-slate-300 leading-relaxed">{thesis.supply_advantage.narrative}</p>
                </div>
                <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800/80 space-y-1.5">
                  <div className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Market Competition
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {thesis.observed_competition.narrative} ({thesis.observed_competition.competitor_count} tracked competitors)
                  </p>
                </div>
              </div>

              {/* Read-Only Financial Economics computed via Frozen Financial Engine */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-xs font-semibold text-emerald-400 font-mono uppercase tracking-wider">
                    Unit Economics & Capital Requirement (Frozen Core)
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Authority: {thesis.financial_economics.calculation_authority}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500 font-mono">Supplier Unit Price</div>
                    <div className="font-semibold text-white text-sm mt-0.5">
                      ₹{thesis.financial_economics.supplier_unit_price.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-mono">Landed COGS (20-Pack)</div>
                    <div className="font-semibold text-white text-sm mt-0.5">
                      ₹{(thesis.financial_economics.landed_cogs_per_unit * thesis.financial_economics.pack_size).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-mono">Marketplace Fees</div>
                    <div className="font-semibold text-white text-sm mt-0.5">
                      ₹{thesis.financial_economics.marketplace_fees_per_order.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-mono">Net Margin</div>
                    <div
                      className={`font-semibold text-sm mt-0.5 ${
                        thesis.financial_economics.net_contribution_per_order >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      ₹{thesis.financial_economics.net_contribution_per_order.toFixed(2)} ({thesis.financial_economics.net_margin_pct.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Bull vs Bear Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg space-y-2">
                  <div className="font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Bull Case
                  </div>
                  <p className="text-slate-300 leading-relaxed">{thesis.bull_case.summary}</p>
                </div>
                <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-lg space-y-2">
                  <div className="font-semibold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Bear Case & Vulnerabilities
                  </div>
                  <p className="text-slate-300 leading-relaxed">{thesis.bear_case.summary}</p>
                </div>
              </div>

              {/* Contradictory Evidence Audit Trail (if any) */}
              {thesis.contradictory_evidence_events.length > 0 && (
                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-lg space-y-2.5 text-xs">
                  <div className="font-semibold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Contradictory Evidence Events Logged ({thesis.contradictory_evidence_events.length})
                  </div>
                  {thesis.contradictory_evidence_events.map((evt) => (
                    <div key={evt.event_id} className="p-2.5 bg-slate-900 rounded border border-amber-500/20 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                        <span>Event: {evt.finding}</span>
                        <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-amber-200">{evt.impact_on_thesis}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Human Decision Sign-Off Section */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    Human Review & Commercial Decision Gate
                  </h4>
                  {thesis.human_signoff && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Signed off by {thesis.human_signoff.approved_by} on{' '}
                      {new Date(thesis.human_signoff.approved_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 space-y-1 w-full">
                    <label className="text-[11px] text-slate-400">Review Notes / Validation Grounds</label>
                    <input
                      type="text"
                      value={signoffNotes}
                      onChange={(e) => setSignoffNotes(e.target.value)}
                      placeholder="e.g. Validated against Howrah cluster physical visit and QA spectrometer test."
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={signoffDecision}
                      onChange={(e) => setSignoffDecision(e.target.value as ThesisDecision)}
                      className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="PURSUE">PURSUE</option>
                      <option value="VALIDATE_FURTHER">VALIDATE FURTHER</option>
                      <option value="REJECT">REJECT</option>
                      <option value="MONITOR">MONITOR</option>
                    </select>

                    <button
                      onClick={handleRecordSignoff}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded text-xs transition-colors"
                    >
                      Record Human Gate
                    </button>
                  </div>
                </div>

                {showSignoffSuccess && (
                  <div className="text-xs text-emerald-400 font-mono mt-1">
                    ✓ Human decision recorded successfully. Financial models remain isolated until procurement execution.
                  </div>
                )}
              </div>
            </div>
          ) )}

          {/* TAB 2: SECTION 20 REQUIRED EXPERIMENT COCKPIT */}
          {activeTab === 'EXPERIMENT' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-sm">
              <div className="border-b border-slate-800 pb-3">
                <div className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-1">
                  Section 20 Requirement
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  SS304 Continuous Research Loop & Contradiction Experiment
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  The system must dynamically adapt its thesis when negative or contradictory evidence is observed, rather than stubbornly defending its initial conclusion. Test this live by injecting stress scenarios below:
                </p>
              </div>

              {/* Stress Ingestion Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <button
                  onClick={() => handleInjectContradiction('NICKEL_RAW_MATERIAL_SPIKE')}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-xl text-left space-y-2 transition-all hover:bg-slate-800/40"
                >
                  <div className="font-semibold text-xs text-amber-400 flex items-center justify-between">
                    <span>1. Nickel Price Surge (+28%)</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Raw strip cost escalates from ₹210 to ₹268/kg (+₹3.20/unit ex-factory). Squeezes contribution margin.
                  </p>
                  <div className="text-[10px] text-amber-300 font-mono">
                    Expected: Decision $\rightarrow$ VALIDATE FURTHER
                  </div>
                </button>

                <button
                  onClick={() => handleInjectContradiction('CHINESE_IMPORT_DUMPING')}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-rose-500/60 rounded-xl text-left space-y-2 transition-all hover:bg-slate-800/40"
                >
                  <div className="font-semibold text-xs text-rose-400 flex items-center justify-between">
                    <span>2. Chinese Import Dumping</span>
                    <TrendingDown className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Unbranded 20-pack listings flood Amazon at ₹299. Destroys the ₹499 price umbrella.
                  </p>
                  <div className="text-[10px] text-rose-300 font-mono">
                    Expected: Decision $\rightarrow$ REJECT
                  </div>
                </button>

                <button
                  onClick={() => handleInjectContradiction('CORROSIVE_FAILURE_SPIKE')}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-red-500/60 rounded-xl text-left space-y-2 transition-all hover:bg-slate-800/40"
                >
                  <div className="font-semibold text-xs text-red-400 flex items-center justify-between">
                    <span>3. Monsoon Rust Failures (38%)</span>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    38% customer rust complaints logged on monsoon marine batches (SS201 alloy adulteration).
                  </p>
                  <div className="text-[10px] text-red-300 font-mono">
                    Expected: Decision $\rightarrow$ REJECT
                  </div>
                </button>
              </div>

              {/* Live Status Comparison Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="font-semibold text-xs text-slate-300 uppercase tracking-wider font-mono">
                    Current Live Thesis Status Under Test
                  </div>
                  <button
                    onClick={handleResetExperiment}
                    className="px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Baseline Thesis
                  </button>
                </div>

                {thesis ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <div className="text-slate-500 font-mono">Decision Verdict</div>
                        <div
                          className={`text-base font-bold font-mono mt-1 ${
                            thesis.decision === 'PURSUE'
                              ? 'text-emerald-400'
                              : thesis.decision === 'REJECT'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {thesis.decision}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-mono">Thesis Version</div>
                        <div className="text-base font-bold font-mono text-white mt-1">
                          v{thesis.version}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-mono">Thesis Support Score</div>
                        <div className="text-base font-bold font-mono text-white mt-1">
                          {thesis.thesis_support_score}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-mono">Contradiction Events</div>
                        <div className="text-base font-bold font-mono text-amber-400 mt-1">
                          {thesis.contradictory_evidence_events.length}
                        </div>
                      </div>
                    </div>

                    {/* Latest Audit Impact Narrative */}
                    {thesis.contradictory_evidence_events.length > 0 && (
                      <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg text-xs space-y-1">
                        <div className="font-semibold text-amber-400 font-mono">
                          Dynamic Re-Evaluation Proof:
                        </div>
                        <div className="text-slate-300">
                          {thesis.contradictory_evidence_events[0].impact_on_thesis}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-slate-400 text-xs font-mono py-3">
                    No active thesis formed for this product. Select an active research case to test contradiction adaptation.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE GRAPH & TRACEABILITY */}
          {activeTab === 'EVIDENCE_GRAPH' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-sm">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-amber-500" />
                    Evidence Graph & Claim Traceability
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Traceability Chain: Source $\rightarrow$ Observation $\rightarrow$ Claim $\rightarrow$ Hypothesis $\rightarrow$ Thesis
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{claims.length} claims registered</span>
              </div>

              <div className="space-y-3">
                {claims.map((claim) => (
                  <div
                    key={claim.claim_id}
                    className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-500">{claim.claim_id}</span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="font-mono text-[11px] text-amber-400 uppercase">{claim.domain}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            claim.polarity === 'SUPPORTING'
                              ? 'text-emerald-400'
                              : claim.polarity === 'COUNTER'
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {claim.polarity}
                        </span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="font-mono text-slate-400">
                          Strength: {claim.evidence_strength_score}/100
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-200 font-medium leading-relaxed">{claim.statement}</p>

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span>Linked Observations: {claim.observation_ids.join(', ')}</span>
                      <span>Verified: {claim.verified ? 'YES' : 'PENDING'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ADVERSARIAL MATRIX */}
          {activeTab === 'ADVERSARIAL' && adversarial && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-sm">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-500" />
                    Mandatory Adversarial Counter-Analysis
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Every commercial thesis is actively challenged by independent bear-case analysis to prevent confirmation bias.
                  </p>
                </div>
                <div className="text-xs font-mono font-bold text-amber-400">
                  Verdict: {adversarial.verdict}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Bull Case */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-3">
                  <div className="font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center justify-between">
                    <span>Bull Case Thesis</span>
                    <span className="text-slate-400">Support: {adversarial.bull_case.thesis_support_score}/100</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{adversarial.bull_case.summary}</p>
                  <div className="space-y-1.5 pt-2 border-t border-emerald-500/20">
                    <div className="font-semibold text-emerald-300">Key Drivers:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {adversarial.bull_case.key_drivers.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bear Case */}
                <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-3">
                  <div className="font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center justify-between">
                    <span>Bear Case & Vulnerabilities</span>
                    <span className="text-slate-400">Threat Severity: {adversarial.bear_case.threat_severity_score}/100</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{adversarial.bear_case.summary}</p>
                  <div className="space-y-1.5 pt-2 border-t border-rose-500/20">
                    <div className="font-semibold text-rose-300">Fatal Flaws Tested:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {adversarial.bear_case.critical_risks.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Reconciled Delta */}
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-300 font-mono">Reconciled Analytical Delta:</div>
                <p className="text-slate-400 leading-relaxed">{adversarial.reconciled_delta}</p>
              </div>
            </div>
          )}

          {/* TAB 5: SURVEILLANCE FEED */}
          {activeTab === 'SURVEILLANCE' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-sm">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500" />
                    Continuous Market Surveillance Time Series
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Time-indexed observations across marketplace prices, supplier quotes, reviews, and raw material indices.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{observations.length} snapshots logged</span>
              </div>

              <div className="space-y-2.5">
                {observations.map((obs) => (
                  <div
                    key={obs.observation_id}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{obs.metric_name}</span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="text-slate-400 font-mono">{obs.source_name}</span>
                      </div>
                      <div className="font-mono text-emerald-400 font-semibold">
                        {obs.metric_value !== null ? `${obs.metric_value} ${obs.metric_unit || ''}` : 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                      <span>Observed: {new Date(obs.observed_at).toLocaleString()}</span>
                      <span>Epistemic Grade: {obs.epistemic_status}</span>
                    </div>

                    {obs.notes && <p className="text-slate-400 text-[11px]">{obs.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CROSS-PRODUCT FACTORS & DIFFERENTIAL ECONOMICS */}
          {activeTab === 'FACTORS_DIFFERENTIAL' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-sm">
              {/* Macro Factor Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Macro Factor Exposures ({factorExposures.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">Statistical Guardrails Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {factorExposures.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-white">{factor.factor}</span>
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            factor.sensitivity === 'HIGH'
                              ? 'text-rose-400'
                              : factor.sensitivity === 'MEDIUM'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {factor.sensitivity}
                        </span>
                      </div>

                      <p className="text-slate-400 text-[11px]">{factor.caveats?.[0] || factor.methodology}</p>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80 font-mono">
                        <span className="text-slate-500">N={factor.sample_size} samples</span>
                        {!factor.data_sufficient ? (
                          <span className="text-amber-400 font-semibold">DATA INSUFFICIENT</span>
                        ) : (
                          <span className="text-emerald-400">DATA SUFFICIENT</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Differential Economic Decomposition */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Differential Economic Decomposition (Reconciled via Frozen Engine)
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Compare vs:</span>
                    <select
                      value={differentialTargetId}
                      onChange={(e) => {
                        setDifferentialTargetId(e.target.value);
                        setDifferential(
                          researchEngine.computeDifferentialComparison(selectedProductId, e.target.value)
                        );
                      }}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                    >
                      <option value="cand_prod_brass_ball_valve_001">Forged Brass Ball Valve (1/2")</option>
                      <option value="prod_diya_terracotta_12p">Terracotta Clay Diya (12p)</option>
                      <option value="prod_candle_soy_fragrance">Aromatherapy Soy Candle</option>
                      <option value="prod_mcb_circuit_breaker">Miniature Circuit Breaker (16A)</option>
                      <option value="prod_led_decorative_lights">LED Fairy Lights (10m)</option>
                    </select>
                  </div>
                </div>

                {differential.evaluation_status === 'NOT_EVALUABLE' ? (
                  <div className="p-4 bg-rose-950/30 rounded-xl border border-rose-800/60 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>NOT EVALUABLE — INSUFFICIENT PARAMETERS</span>
                    </div>
                    <p className="text-rose-200/80 leading-relaxed text-[11px]">
                      {differential.statistical_notes}
                    </p>
                    {differential.missing_requirements && differential.missing_requirements.length > 0 && (
                      <ul className="list-disc list-inside space-y-0.5 text-rose-300 text-[11px] font-mono">
                        {differential.missing_requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="font-semibold text-white">
                        {differential.baseline_name} vs. {differential.target_name}
                      </div>
                      {!differential.data_sufficient && (
                        <span className="text-amber-400 font-mono text-[11px]">
                          DATA INSUFFICIENT — INDICATIVE VARIANCE ONLY
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <div className="text-slate-500 font-mono">Purchase Cost $\Delta$</div>
                        <div className="font-semibold text-white mt-0.5">
                          {differential.variances.unit_purchase_cost_delta >= 0 ? '+' : ''}
                          ₹{differential.variances.unit_purchase_cost_delta.toFixed(2)}/u
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-mono">Packaging Cost $\Delta$</div>
                        <div className="font-semibold text-white mt-0.5">
                          {differential.variances.packaging_cost_delta >= 0 ? '+' : ''}
                          ₹{differential.variances.packaging_cost_delta.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-mono">Freight $\Delta$</div>
                        <div className="font-semibold text-white mt-0.5">
                          {differential.variances.freight_delta >= 0 ? '+' : ''}
                          ₹{differential.variances.freight_delta.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-mono">Margin $\Delta$</div>
                        <div
                          className={`font-semibold mt-0.5 ${
                            differential.variances.gross_margin_pct_delta >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {differential.variances.gross_margin_pct_delta >= 0 ? '+' : ''}
                          {differential.variances.gross_margin_pct_delta.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <div className="font-semibold text-slate-300">Variance Drivers:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                        {differential.drivers.map((drv, idx) => (
                          <li key={idx}>{drv}</li>
                        ))}
                      </ul>
                    </div>

                    {differential.governed_evaluations && differential.governed_evaluations.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Governed Model Registry Evaluations:</span>
                          <span className="text-emerald-400">{differential.governed_evaluations.length} Executed</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {differential.governed_evaluations.map((ge, idx) => (
                            <div key={idx} className="p-2 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono space-y-0.5">
                              <div className="text-slate-300 font-semibold">{ge.model_id} (v{ge.model_version})</div>
                              <div className="text-slate-400 text-[10px]">Status: <span className={ge.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'}>{ge.status}</span> · Hash: {ge.reproducibility_reference}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: COMMERCIAL ARCHETYPES & ENTITY RELATIONSHIP GRAPH */}
          {activeTab === 'ARCHETYPES_GRAPH' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-sm font-sans">
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-amber-500" />
                    Commercial Archetypes &amp; Typed Entity Graph
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Universal commercial abstractions unifying diverse products sharing identical economic DNA, supply structures, or seasonal patterns.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  {relationshipGraph.getAllArchetypes().length} Archetypes · {relationshipGraph.getAllRelationships().length} Typed Relations
                </span>
              </div>

              {/* Archetypes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relationshipGraph.getAllArchetypes().map((arch) => {
                  const members = relationshipGraph.getArchetypeMembers(arch.archetype_id);
                  const isCurrentProductMember = arch.member_product_ids.includes(selectedProductId);
                  return (
                    <div
                      key={arch.archetype_id}
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        isCurrentProductMember
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-400 font-mono">
                          {arch.name}
                        </span>
                        {isCurrentProductMember && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 text-[9px] font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {arch.description}
                      </p>
                      
                      <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400 font-bold uppercase font-mono block">Shared Economic DNA:</span>
                        <p className="text-slate-300 font-sans italic">{arch.shared_economic_dna}</p>
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <span className="text-slate-400 font-bold uppercase font-mono block">Member Products:</span>
                        <div className="flex flex-wrap gap-1">
                          {members.map((m) => (
                            <span
                              key={m.entity_id}
                              className={`px-1.5 py-0.5 rounded font-mono ${
                                m.entity_id === selectedProductId
                                  ? 'bg-amber-950 text-amber-300 border border-amber-700 font-bold'
                                  : 'bg-slate-900 text-slate-300 border border-slate-800'
                              }`}
                            >
                              {m.label.split('(')[0].trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <span className="text-slate-400 font-bold uppercase font-mono block">Applicable Analytical Models:</span>
                        <div className="flex flex-wrap gap-1">
                          {arch.applicable_models.map((modId) => (
                            <span key={modId} className="px-1.5 py-0.5 bg-slate-900 text-blue-300 rounded font-mono border border-blue-900/50">
                              {modId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Typed Entity Relationships Table */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Evidence-Backed Typed Entity Relationships ({relationshipGraph.getAllRelationships().length})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Epistemic Invariant: Inferred relations require human review before ground truth promotion
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {relationshipGraph.getAllRelationships().map((rel) => {
                    const src = relationshipGraph.getEntity(rel.source_entity_id);
                    const tgt = relationshipGraph.getEntity(rel.target_entity_id);
                    return (
                      <div
                        key={rel.relationship_id}
                        className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">{src?.label || rel.source_entity_id}</span>
                            <span className="text-slate-500">
                              {rel.direction === 'BIDIRECTIONAL' ? '⟷' : '⟶'}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded text-[10px] border border-slate-800 font-bold">
                              {rel.relationship_type}
                            </span>
                            <span className="text-slate-500">
                              {rel.direction === 'BIDIRECTIONAL' ? '⟷' : '⟶'}
                            </span>
                            <span className="text-white font-bold">{tgt?.label || rel.target_entity_id}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                rel.status === 'REVIEWED_CONFIRMED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : rel.status === 'INFERRED_UNVERIFIED'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {rel.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Strength: {rel.strength_score}/100
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 font-sans leading-relaxed flex flex-wrap items-center gap-2">
                          <span><strong>Methodology:</strong> {rel.methodology}</span>
                          {rel.caveats.length > 0 && (
                            <span className="text-amber-300/80"><strong>Caveats:</strong> {rel.caveats[0]}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: EQUATION & ANALYTICAL MODEL REGISTRY EXPLORER */}
          {activeTab === 'EQUATION_MODELS' && (
            <FormulaRegistryAndTrends />
          )}

          {/* TAB 7: VERIFICATION SUITE AUDIT */}
          {activeTab === 'VERIFICATION' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-sm font-sans">
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Dual Verification Suite: Research Engine &amp; Governance Architecture
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Combined automated verification: 9 Research Epistemic Tests + 10 Architectural Governance Tests = 19 Automated Invariant Checks.
                  </p>
                </div>
                <button
                  onClick={handleRunVerification}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold font-mono cursor-pointer"
                >
                  Run Full Verification Suites
                </button>
              </div>

              {verificationReport && (
                <div className="space-y-4 font-mono text-xs">
                  {/* Suite 1 Summary */}
                  <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Suite 1: Research Engine Invariants</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {verificationReport.executive_verdict}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-200 font-bold text-sm">
                        {verificationReport.passed_tests}/{verificationReport.total_tests} Tests Passed
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {verificationReport.test_results.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">
                            {idx + 1}. {res.test_name}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              res.passed ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {res.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] font-sans">{res.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {governanceReport && (
                <div className="space-y-4 font-mono text-xs pt-4 border-t border-slate-800">
                  {/* Suite 2 Summary */}
                  <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Suite 2: Architectural Governance Amendment</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {governanceReport.executive_verdict}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-200 font-bold text-sm">
                        {governanceReport.passed_tests}/{governanceReport.total_tests} Tests Passed
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {governanceReport.test_results.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">
                            {idx + 1}. {res.test_name}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              res.passed ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {res.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] font-sans">{res.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!verificationReport && !governanceReport && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Click "Run Full Verification Suites" above to execute all 19 automated tests.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
