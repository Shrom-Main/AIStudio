import React from 'react';
import { ConfidenceLevel, ProvenanceType } from '../types';
import { ShieldCheck, RefreshCw, BarChart3, Database, Compass, Box } from 'lucide-react';

interface HeaderProps {
  confidenceFilter: ConfidenceLevel | 'ALL';
  onConfidenceChange: (level: ConfidenceLevel | 'ALL') => void;
  selectedScenario: 'Conservative' | 'Base' | 'Optimistic';
  onScenarioChange: (scenario: 'Conservative' | 'Base' | 'Optimistic') => void;
  onResetData: () => void;
  observationCount: number;
  onOpenResearchCockpit?: () => void;
  onOpenDiscovery?: () => void;
  onOpenContract?: () => void;
  onOpenGeoMap?: () => void;
  onOpenAnalytics?: () => void;
  onOpenPackaging?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  confidenceFilter,
  onConfidenceChange,
  selectedScenario,
  onScenarioChange,
  onResetData,
  observationCount,
  onOpenResearchCockpit,
  onOpenDiscovery,
  onOpenContract,
  onOpenGeoMap,
  onOpenAnalytics,
  onOpenPackaging
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100 sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand Zone: Clean, unboxed text wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-sm tracking-wider">
            OS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white">
                Industrial Consumables Distribution Engine
              </h1>
              <span className="text-xs text-slate-400 font-mono">POC-001</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>SS304 Worm-Drive Hose Clamps (DIN 3017)</span>
              <span aria-hidden="true">·</span>
              <span>Kolkata & Howrah Cluster</span>
            </div>
          </div>
        </div>

        {/* Global Controls & Filters with responsive horizontal scroll */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 py-1 flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 min-w-max">
            {/* Fee Scenario Segmented Control */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              <span className="px-2 py-1 text-slate-400 font-medium">Scenario:</span>
              {(['Conservative', 'Base', 'Optimistic'] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => onScenarioChange(sc)}
                  className={`px-2.5 py-1 rounded transition-colors font-medium whitespace-nowrap cursor-pointer ${
                    selectedScenario === sc
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>

            {/* Confidence Filter Control */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              <span className="px-2 py-1 text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Evidence:
              </span>
              {(['ALL', 'HIGH', 'MEDIUM'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onConfidenceChange(lvl)}
                  className={`px-2.5 py-1 rounded transition-colors font-mono whitespace-nowrap cursor-pointer ${
                    confidenceFilter === lvl
                      ? 'bg-slate-700 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Data' : `${lvl} Only`}
                </button>
              ))}
            </div>

            {/* Multi-Product Research Cockpit & Thesis Engine (Step 6) */}
            {onOpenResearchCockpit && (
              <button
                onClick={onOpenResearchCockpit}
                title="Open Multi-Product Research Cockpit, Surveillance & Thesis Engine (Step 6)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/50 rounded text-amber-300 transition-colors font-mono cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Research Cockpit</span>
              </button>
            )}

            {/* Opportunity Discovery & Signal Ingestion (Step 5) */}
            {onOpenDiscovery && (
              <button
                onClick={onOpenDiscovery}
                title="Open Opportunity Discovery & Empirical Signal Ingestion Workspace (Step 5)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/50 rounded text-indigo-300 transition-colors font-mono cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Opportunity Discovery</span>
              </button>
            )}

            {/* Supply & Demand GeoMap */}
            {onOpenGeoMap && (
              <button
                onClick={onOpenGeoMap}
                title="Open Google Maps Supply & Demand Geographic Intelligence"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 rounded text-blue-300 transition-colors font-mono cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>GeoMap (Sellers & Buyers)</span>
              </button>
            )}

            {/* Analytics & Price Sensitivity Cockpit */}
            {onOpenAnalytics && (
              <button
                onClick={onOpenAnalytics}
                title="Open Commercial Analytics, Price Sensitivity & Arbitrage Cockpit"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 rounded text-indigo-300 transition-colors font-mono cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Analytics &amp; Trends</span>
              </button>
            )}

            {/* Volumetric Packaging & Freight Diagnostics */}
            {onOpenPackaging && (
              <button
                onClick={onOpenPackaging}
                title="Open Volumetric Weight, Packaging Schemes & Freight Diagnostics"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded text-emerald-300 transition-colors font-mono cursor-pointer"
              >
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                <span>Packaging &amp; Corridors</span>
              </button>
            )}

            {/* Frozen Financial Engine Contract Badge */}
            {onOpenContract && (
              <button
                onClick={onOpenContract}
                title="Inspect Frozen Financial Contract & Research Boundary (Pure Deterministic Core)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded text-emerald-300 transition-colors font-mono cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Core Frozen v1.0.0</span>
              </button>
            )}

            {/* Reset Baseline Action */}
            <button
              onClick={onResetData}
              title="Reset active sandbox to baseline pre-seeded Howrah datasets"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
