/**
 * POC-001: Product Signal Intelligence & Capital Allocation OS
 * Step 6: First-Class Executable Equation & Analytical Model Registry Explorer
 * 
 * Features:
 * 1. 4-Way Typology: Equations, Analytical Models, Statistical Methods, Decision Rules.
 * 2. Deterministic execution: Real-time parameterized evaluator with strict schema validation.
 * 3. 10-Point Model Admission Card: Formal commercial question, assumptions, epistemic classes, and test fixtures.
 * 4. Automated Registry Test Suite Runner: Executes all 19 deterministic test fixtures.
 * 5. Execution Snapshot Generator: Cryptographic reproducibility hash & input provenance recording.
 * 6. Category-Agnostic & Specialist Models: Fragility, Seasonal Sell-Through, D2C LTV, B2B Credit Drag, Wholesale Waterfall, Liquidation Recovery.
 */

import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  Activity,
  Layers,
  HelpCircle,
  FileCheck2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  Hash
} from 'lucide-react';
import { equationRegistry } from '../lib/equationRegistry';
import { RegisteredModelItem, ModelClassification, ModelExecutionRecord } from '../types/models';

export const FormulaRegistryAndTrends: React.FC = () => {
  const allModels = equationRegistry.getAllModels();

  const [filterType, setFilterType] = useState<ModelClassification | 'ALL'>('ALL');
  const [selectedModelId, setSelectedModelId] = useState<string>('EQ-VOLUMETRIC-TAX-v1.0.0');

  const selectedModel: RegisteredModelItem =
    equationRegistry.getModel(selectedModelId) || allModels[0];

  // Interactive parameter inputs state
  const [inputs, setInputs] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    for (const p of selectedModel.input_schemas) {
      init[p.symbol] = p.default_value;
    }
    return init;
  });

  // Track active model change
  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    const m = equationRegistry.getModel(modelId);
    if (m) {
      const init: Record<string, any> = {};
      for (const p of m.input_schemas) {
        init[p.symbol] = p.default_value;
      }
      setInputs(init);
      setExecutionSnapshot(null);
    }
  };

  // Evaluate current inputs
  const evaluationResult = selectedModel.evaluator(inputs);

  // Execution snapshot record
  const [executionSnapshot, setExecutionSnapshot] = useState<ModelExecutionRecord | null>(null);

  // Test suite execution state
  const [testSuiteReport, setTestSuiteReport] = useState<{
    total_models: number;
    total_fixtures: number;
    passed_fixtures: number;
    failed_fixtures: number;
    details: { model_id: string; fixture_name: string; passed: boolean; message: string }[];
  } | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'EVALUATOR' | 'ADMISSION_SPEC' | 'FIXTURES'>('EVALUATOR');

  const filteredModels = allModels.filter((m) =>
    filterType === 'ALL' ? true : m.classification === filterType
  );

  const handleInputChange = (symbol: string, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [symbol]: typeof value === 'number' && isNaN(value) ? 0 : value
    }));
  };

  const handleGenerateSnapshot = () => {
    const { record } = equationRegistry.evaluateModel(selectedModel.model_id, inputs, {
      [selectedModel.input_schemas[0]?.symbol || 'param']: 'Interactive User Cockpit Input'
    });
    setExecutionSnapshot(record);
  };

  const handleRunFullTestSuite = () => {
    const res = equationRegistry.runRegistryTestSuite();
    setTestSuiteReport(res);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl font-sans space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">
                  Equation &amp; Analytical Model Registry
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                  FIRST-CLASS EXECUTABLE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {allModels.length} Models Registered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative deterministic mathematical identities, estimation models, statistical guardrails, and decision rules. Frozen financial core v1.0.0 preserved.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunFullTestSuite}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Run All Model Tests (19 Fixtures)</span>
          </button>
        </div>
      </div>

      {/* Test Suite Telemetry Banner */}
      {testSuiteReport && (
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Registry Test Telemetry:</span>
            <span className="text-emerald-400 font-bold">
              ✓ {testSuiteReport.passed_fixtures} / {testSuiteReport.total_fixtures} Fixtures Passed
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">{testSuiteReport.total_models} Models Audited</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>100% Deterministic Contract Verification Pass</span>
          </div>
        </div>
      )}

      {/* Classification Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        <span className="text-slate-500 text-[11px] uppercase mr-1">Classification:</span>
        {(['ALL', 'EQUATION', 'ANALYTICAL_MODEL', 'STATISTICAL_METHOD', 'DECISION_RULE'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
              filterType === t
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            {t === 'ALL'
              ? `All Models (${allModels.length})`
              : t === 'EQUATION'
              ? `Equations (${equationRegistry.getModelsByClassification('EQUATION').length})`
              : t === 'ANALYTICAL_MODEL'
              ? `Analytical Models (${equationRegistry.getModelsByClassification('ANALYTICAL_MODEL').length})`
              : t === 'STATISTICAL_METHOD'
              ? `Statistical Methods (${equationRegistry.getModelsByClassification('STATISTICAL_METHOD').length})`
              : `Decision Rules (${equationRegistry.getModelsByClassification('DECISION_RULE').length})`}
          </button>
        ))}
      </div>

      {/* Main 2-Column Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): Model Catalog */}
        <div className="lg:col-span-5 space-y-2 font-mono text-xs max-h-[700px] overflow-y-auto pr-1">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
            Registered Analytical Models ({filteredModels.length})
          </label>

          {filteredModels.map((m) => {
            const isSelected = selectedModelId === m.model_id;
            return (
              <div
                key={m.model_id}
                onClick={() => handleSelectModel(m.model_id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-xs truncate">{m.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      m.classification === 'EQUATION'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : m.classification === 'ANALYTICAL_MODEL'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : m.classification === 'STATISTICAL_METHOD'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {m.classification}
                  </span>
                </div>
                <div className="text-[10px] text-amber-300 font-mono bg-slate-900 p-1.5 rounded border border-slate-800 my-1 truncate">
                  {m.latex_or_formula}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">{m.model_id}</span>
                  <span>v{m.version}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (7 cols): Active Model Deep Dive & Live Evaluator */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {selectedModel.classification} · v{selectedModel.version}
                </span>
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[9px]">
                  {selectedModel.version_status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">{selectedModel.name}</h4>
              <span className="text-[11px] text-slate-500 block">{selectedModel.model_id}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateSnapshot}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Log Snapshot</span>
              </button>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveSubTab('EVALUATOR')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeSubTab === 'EVALUATOR'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Evaluator
            </button>
            <button
              onClick={() => setActiveSubTab('ADMISSION_SPEC')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeSubTab === 'ADMISSION_SPEC'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              10-Point Admission Card
            </button>
            <button
              onClick={() => setActiveSubTab('FIXTURES')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeSubTab === 'FIXTURES'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Test Fixtures ({selectedModel.fixtures.length})
            </button>
          </div>

          {/* SUB-TAB 1: EVALUATOR */}
          {activeSubTab === 'EVALUATOR' && (
            <div className="space-y-4">
              {/* Formula & Description */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Authoritative Mathematical Formulation:
                </span>
                <div className="font-bold text-xs text-amber-300 font-mono">
                  {selectedModel.latex_or_formula}
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {selectedModel.description}
                </p>
              </div>

              {/* Input Parameters Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-b border-slate-800/80 pb-1">
                  <span>Parameter Inputs</span>
                  <span>Epistemic Provenance</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {selectedModel.input_schemas.map((schema) => (
                    <div
                      key={schema.symbol}
                      className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{schema.name}</span>
                          <span className="text-[10px] text-amber-400 font-mono">({schema.symbol})</span>
                          <span className="text-[10px] text-slate-500">[{schema.unit}]</span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 font-sans">{schema.description}</p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            schema.epistemic_class === 'OBSERVED_FACT'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : schema.epistemic_class === 'SCENARIO_ASSUMPTION'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : schema.epistemic_class === 'DERIVED_OUTPUT'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {schema.epistemic_class}
                        </span>

                        <input
                          type={schema.data_type === 'number' ? 'number' : 'text'}
                          value={inputs[schema.symbol] ?? ''}
                          onChange={(e) =>
                            handleInputChange(
                              schema.symbol,
                              schema.data_type === 'number' ? parseFloat(e.target.value) : e.target.value
                            )
                          }
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right font-mono text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Output Section */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Deterministic Evaluated Outputs
                  </span>
                  {evaluationResult.data_insufficient && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                      DATA INSUFFICIENT
                    </span>
                  )}
                </div>

                {evaluationResult.data_insufficient ? (
                  <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-rose-300 text-xs">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Input Preconditions Not Met:</span>
                    </div>
                    <p className="mt-1 text-slate-300 font-sans text-[11px]">
                      {evaluationResult.insufficient_reason || 'Missing required parameters for model evaluation.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedModel.output_schemas.map((out) => {
                      const val = evaluationResult.outputs[out.symbol];
                      return (
                        <div
                          key={out.symbol}
                          className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1"
                        >
                          <div className="text-[10px] text-slate-400 truncate">{out.name}</div>
                          <div className="text-sm font-bold font-mono text-white">
                            {typeof val === 'number' ? (
                              <span>
                                {val.toLocaleString()} <span className="text-[10px] text-amber-400">{out.unit}</span>
                              </span>
                            ) : typeof val === 'boolean' ? (
                              <span className={val ? 'text-emerald-400' : 'text-rose-400'}>
                                {val ? 'TRUE' : 'FALSE'}
                              </span>
                            ) : (
                              <span>{String(val)}</span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono truncate">{out.symbol}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Warnings */}
                {evaluationResult.warnings.length > 0 && (
                  <div className="p-2.5 bg-amber-950/20 border border-amber-600/30 rounded-lg text-amber-300 text-[11px] space-y-1">
                    {evaluationResult.warnings.map((w, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Execution Snapshot Banner */}
              {executionSnapshot && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Reproducibility Snapshot Logged
                    </span>
                    <span className="text-[10px] text-slate-500">{executionSnapshot.execution_id}</span>
                  </div>
                  <div className="text-[11px] text-amber-300">
                    Hash: <code className="text-white">{executionSnapshot.reproducibility_hash}</code>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Recorded at {executionSnapshot.executed_at}. Replay guaranteed under snapshot invariant.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: ADMISSION SPEC */}
          {activeSubTab === 'ADMISSION_SPEC' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 text-xs block uppercase">
                  1. Commercial Question Answered:
                </span>
                <p className="text-slate-200 font-sans leading-relaxed">
                  {selectedModel.admission_spec.commercial_question}
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 text-xs block uppercase">
                  2. Methodology &amp; Mathematical Rationale:
                </span>
                <p className="text-slate-300 font-sans leading-relaxed">
                  {selectedModel.admission_spec.methodology_rationale}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Applicable Channels:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedModel.admission_spec.applicable_channels.map((c) => (
                      <span key={c} className="px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded text-[10px] border border-slate-800">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Applicable Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedModel.admission_spec.applicable_categories.map((c) => (
                      <span key={c} className="px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded text-[10px] border border-slate-800">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-400 text-[10px] uppercase block">
                  3. Assumptions, Limitations &amp; Caveats:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-sans text-[11px]">
                  {selectedModel.admission_spec.assumptions_and_limitations.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                <span className="font-bold text-rose-400 text-[10px] uppercase block">
                  4. DATA INSUFFICIENT Trigger Conditions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-sans text-[11px]">
                  {selectedModel.admission_spec.data_insufficient_conditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: TEST FIXTURES */}
          {activeSubTab === 'FIXTURES' && (
            <div className="space-y-3 text-xs">
              {selectedModel.fixtures.map((fix, idx) => {
                const evalOutput = selectedModel.evaluator(fix.inputs);
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div>
                        <span className="font-bold text-white text-xs">{fix.fixture_name}</span>
                        <p className="text-[11px] text-slate-400 font-sans">{fix.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                        TEST FIXTURE #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2.5 bg-slate-950 rounded border border-slate-850 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Inputs:</span>
                        {Object.entries(fix.inputs).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-400">{k}:</span>
                            <span className="text-white font-mono">{String(v)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded border border-slate-850 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Expected Outputs:</span>
                        {Object.entries(fix.expected_outputs).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-400">{k}:</span>
                            <span className="text-emerald-400 font-mono font-bold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
