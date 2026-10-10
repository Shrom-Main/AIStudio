/**
 * Industrial Consumables Distribution Engine — POC-001
 * Commercial Decision & Capital Allocation OS
 * Regional Focus: Kolkata / Howrah SS304 Worm-Drive Hose Clamps (DIN 3017)
 */

import React, { useState, useReducer, useEffect } from 'react';
import {
  ActionRequiredItem,
  AmazonFeeAssumptions,
  B2BCustomer,
  ConfidenceLevel,
  IntelligenceObservation,
  QABatch,
  ResearchTask,
  SKUProduct,
  Supplier,
  SupplierQuote
} from './types';
import {
  baseFeeAssumptions,
  conservativeFeeAssumptions,
  optimisticFeeAssumptions,
  seedActionRequiredQueue,
  seedB2BCustomers,
  seedIntelligenceObservations,
  seedQABatches,
  seedResearchTasks,
  seedSKUs,
  seedSupplierQuotes,
  seedSuppliers
} from './data/seedData';
import { Header } from './components/Header';
import { ExecutiveControlTower } from './components/ExecutiveControlTower';
import { FinanceBoard } from './components/FinanceBoard';
import { SKUEconomicsSandbox } from './components/SKUEconomicsSandbox';
import { HeroPackOptimizer } from './components/HeroPackOptimizer';
import { SupplierIntelligence } from './components/SupplierIntelligence';
import { QAVerification } from './components/QAVerification';
import { IntelligenceRegistry } from './components/IntelligenceRegistry';
import { AmazonExperiment } from './components/AmazonExperiment';
import { B2BFunnel } from './components/B2BFunnel';
import { MakeVsBuy } from './components/MakeVsBuy';
import { ContractInspector } from './components/ContractInspector';
import { PipelineNavbar, capabilityToStage } from './components/PipelineNavbar';
import { ProductUniverse } from './components/ProductUniverse';
import { SupplyDemandGeoMap } from './components/SupplyDemandGeoMap';
import { AnalyticsWorkspace } from './components/AnalyticsWorkspace';
import { LogisticsPackagingDiagnostics } from './components/LogisticsPackagingDiagnostics';
import { OpportunityDiscovery } from './components/OpportunityDiscovery';
import { ResearchCockpit } from './components/ResearchCockpit';
import { initialPipelineState, pipelineReducer } from './lib/pipelineState';
import { PipelineStageId } from './types/pipeline';

export default function App() {
  // Navigation State
  const [activeWorkspace, setActiveWorkspace] = useState<
    | 'CONTROL_TOWER'
    | 'DISCOVERY'
    | 'RESEARCH_COCKPIT'
    | 'GEOMAP'
    | 'ANALYTICS'
    | 'PACKAGING_LOGISTICS'
    | 'CONTRACT'
    | 'INTELLIGENCE_REGISTRY'
    | 'SUPPLIERS'
    | 'QA_METALLURGY'
    | 'ECONOMICS'
    | 'PACK_OPTIMIZER'
    | 'AMAZON_FUNNEL'
    | 'B2B_FUNNEL'
    | 'FINANCE'
    | 'MAKE_VS_BUY'
    | 'UNIVERSE'
  >('CONTROL_TOWER');

  // Shared Structured Pipeline State (Workstream B)
  const [pipelineState, dispatchPipeline] = useReducer(pipelineReducer, initialPipelineState);

  // Global Scenarios & Isolated State
  const [feeScenario, setFeeScenario] = useState<'Conservative' | 'Base' | 'Optimistic'>('Base');
  const [scenariosState, setScenariosState] = useState<
    Record<'Conservative' | 'Base' | 'Optimistic', AmazonFeeAssumptions>
  >({
    Conservative: { ...conservativeFeeAssumptions },
    Base: { ...baseFeeAssumptions },
    Optimistic: { ...optimisticFeeAssumptions }
  });
  const activeFeeAssumptions = scenariosState[feeScenario];

  const handleUpdateActiveAssumptions = (updated: AmazonFeeAssumptions) => {
    setScenariosState((prev) => ({
      ...prev,
      [feeScenario]: updated
    }));
  };

  const handleScenarioChange = (scenario: 'Conservative' | 'Base' | 'Optimistic') => {
    setFeeScenario(scenario);
    dispatchPipeline({
      type: 'UPDATE_ACTIVE_SCENARIO',
      params: { feeScenario: scenario }
    });
  };

  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceLevel | 'ALL'>('ALL');

  // Datasets State
  const [observations, setObservations] = useState<IntelligenceObservation[]>(seedIntelligenceObservations);
  const [tasks, setTasks] = useState<ResearchTask[]>(seedResearchTasks);
  const [actionItems, setActionItems] = useState<ActionRequiredItem[]>(seedActionRequiredQueue);
  const [skus, setSkus] = useState<SKUProduct[]>(seedSKUs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem('app_custom_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map((p) => p.id));
          const baseOnly = seedSuppliers.filter((s) => !customIds.has(s.id));
          return [...parsed, ...baseOnly];
        }
      }
    } catch {}
    return seedSuppliers;
  });

  const [quotes, setQuotes] = useState<SupplierQuote[]>(() => {
    try {
      const saved = localStorage.getItem('app_custom_quotes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map((p) => p.id));
          const baseOnly = seedSupplierQuotes.filter((q) => !customIds.has(q.id));
          return [...parsed, ...baseOnly];
        }
      }
    } catch {}
    return seedSupplierQuotes;
  });

  const [qaBatches, setQaBatches] = useState<QABatch[]>(seedQABatches);

  const [b2bCustomers, setB2bCustomers] = useState<B2BCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('app_custom_buyers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map((p) => p.id));
          const baseOnly = seedB2BCustomers.filter((b) => !customIds.has(b.id));
          return [...parsed, ...baseOnly];
        }
      }
    } catch {}
    return seedB2BCustomers;
  });

  // Persistent Cross-Tab Selections State (backed by localStorage)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(() => {
    return localStorage.getItem('app_selected_supplier_id') || 'sup-howrah-precision';
  });

  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(() => {
    return localStorage.getItem('app_selected_buyer_id') || 'cust-b2b-001';
  });

  const [activeAnalyticsChartView, setActiveAnalyticsChartView] = useState<
    | 'PRICE_ELASTICITY'
    | 'ARBITRAGE_FLOOR'
    | 'SEASONAL_BANDS'
    | 'MONTE_CARLO'
    | 'BUYER_SELLER_ECONOMICS'
    | 'PROCUREMENT_LADDER'
    | 'MARGIN_HEATMAP'
    | 'MARKET_PRICING_RADAR'
    | 'AI_PROCUREMENT_MODELING'
  >(() => {
    return (localStorage.getItem('app_analytics_chart_view') as any) || 'PRICE_ELASTICITY';
  });

  const [geoMapPreset, setGeoMapPreset] = useState<string>(() => {
    return localStorage.getItem('app_geomap_preset') || 'KOLKATA_HOWRAH';
  });

  const [geoMapRoleFilter, setGeoMapRoleFilter] = useState<'ALL' | 'SELLERS' | 'BUYERS'>(() => {
    return (localStorage.getItem('app_geomap_role_filter') as any) || 'ALL';
  });

  const [geoMapCenter, setGeoMapCenter] = useState<{ lat: number; lng: number }>(() => {
    const saved = localStorage.getItem('app_geomap_center');
    return saved ? JSON.parse(saved) : { lat: 22.5958, lng: 88.2936 };
  });

  const [geoMapZoom, setGeoMapZoom] = useState<number>(() => {
    const saved = localStorage.getItem('app_geomap_zoom');
    return saved ? Number(saved) : 11;
  });

  // Sync selections to localStorage
  useEffect(() => {
    localStorage.setItem('app_selected_supplier_id', selectedSupplierId);
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    const quo = quotes.find((q) => q.supplier_id === selectedSupplierId);
    if (sup) {
      dispatchPipeline({
        type: 'SELECT_ACTIVE_SUPPLIER_QUOTE',
        quoteId: quo?.id || 'sq-custom',
        supplierId: sup.id,
        unitPrice: quo?.quoted_price_inr || 13.50,
        source: sup.name,
        confidence: 'HIGH',
        effectiveDate: '2026-10-04'
      });
    }
  }, [selectedSupplierId, suppliers, quotes]);

  useEffect(() => {
    localStorage.setItem('app_selected_buyer_id', selectedBuyerId);
  }, [selectedBuyerId]);

  useEffect(() => {
    localStorage.setItem('app_analytics_chart_view', activeAnalyticsChartView);
  }, [activeAnalyticsChartView]);

  useEffect(() => {
    localStorage.setItem('app_geomap_preset', geoMapPreset);
  }, [geoMapPreset]);

  useEffect(() => {
    localStorage.setItem('app_geomap_role_filter', geoMapRoleFilter);
  }, [geoMapRoleFilter]);

  useEffect(() => {
    localStorage.setItem('app_geomap_center', JSON.stringify(geoMapCenter));
    localStorage.setItem('app_geomap_zoom', String(geoMapZoom));
  }, [geoMapCenter, geoMapZoom]);

  // Reset all data to baseline pre-seeded state
  const handleResetData = () => {
    setObservations(seedIntelligenceObservations);
    setTasks(seedResearchTasks);
    setActionItems(seedActionRequiredQueue);
    setSkus(seedSKUs);
    setSuppliers(seedSuppliers);
    setQuotes(seedSupplierQuotes);
    setQaBatches(seedQABatches);
    setB2bCustomers(seedB2BCustomers);
    try {
      localStorage.removeItem('app_custom_suppliers');
      localStorage.removeItem('app_custom_quotes');
      localStorage.removeItem('app_custom_buyers');
      localStorage.removeItem('app_recently_created_entities');
    } catch {}
    setScenariosState({
      Conservative: { ...conservativeFeeAssumptions },
      Base: { ...baseFeeAssumptions },
      Optimistic: { ...optimisticFeeAssumptions }
    });
    setFeeScenario('Base');
    setConfidenceFilter('ALL');
    dispatchPipeline({ type: 'RESET_TO_DEFAULTS' });
  };

  // Execute Action Required item
  const handleExecuteAction = (item: ActionRequiredItem) => {
    switch (item.action_verb) {
      case 'HOLD':
      case 'KILL':
        setActiveWorkspace('QA_METALLURGY');
        break;
      case 'SCALE':
        setActiveWorkspace('ECONOMICS');
        break;
      case 'NEGOTIATE':
        setActiveWorkspace('SUPPLIERS');
        break;
      case 'MOVE_TO_B2B':
        setActiveWorkspace('B2B_FUNNEL');
        break;
      case 'MANUFACTURING_REVIEW':
        setActiveWorkspace('MAKE_VS_BUY');
        break;
      default:
        setActiveWorkspace('FINANCE');
    }
  };

  const handleAddObservation = (obs: IntelligenceObservation) => {
    setObservations([obs, ...observations]);
  };

  const handleAddTask = (task: ResearchTask) => {
    setTasks([task, ...tasks]);
  };

  const handleAddQABatch = (batch: QABatch) => {
    setQaBatches([batch, ...qaBatches]);
  };

  // Convert Stage ID to Workspace ID
  const stageToWorkspace = (stage: PipelineStageId | 'CONTROL_TOWER' | 'GEOMAP' | 'RESEARCH_COCKPIT'): typeof activeWorkspace => {
    if (stage === 'GEOMAP') return 'GEOMAP';
    if (stage === 'ANALYTICS') return 'ANALYTICS';
    if (stage === 'RESEARCH_COCKPIT') return 'RESEARCH_COCKPIT';
    switch (stage) {
      case 'DISCOVERY':
        return 'DISCOVERY';
      case 'CONTRACT':
        return 'CONTRACT';
      case 'REGISTRY':
        return 'INTELLIGENCE_REGISTRY';
      case 'SUPPLIERS':
        return 'SUPPLIERS';
      case 'QA':
        return 'QA_METALLURGY';
      case 'ECONOMICS':
        return 'ECONOMICS';
      case 'PACK_OPTIMIZER':
        return 'PACK_OPTIMIZER';
      case 'AMAZON':
        return 'AMAZON_FUNNEL';
      case 'B2B':
        return 'B2B_FUNNEL';
      case 'FINANCE':
        return 'FINANCE';
      case 'MAKE_VS_BUY':
        return 'MAKE_VS_BUY';
      case 'UNIVERSE':
        return 'UNIVERSE';
      case 'CONTROL_TOWER':
      default:
        return 'CONTROL_TOWER';
    }
  };

  const workspaceToStage = (ws: typeof activeWorkspace): PipelineStageId | 'CONTROL_TOWER' | 'GEOMAP' => {
    if (ws === 'GEOMAP') return 'GEOMAP';
    if (ws === 'ANALYTICS') return 'ANALYTICS';
    if (ws === 'PACKAGING_LOGISTICS') return 'PACK_OPTIMIZER';
    if (ws === 'RESEARCH_COCKPIT') return 'REGISTRY';
    switch (ws) {
      case 'DISCOVERY':
        return 'DISCOVERY';
      case 'CONTRACT':
        return 'CONTRACT';
      case 'INTELLIGENCE_REGISTRY':
        return 'REGISTRY';
      case 'SUPPLIERS':
        return 'SUPPLIERS';
      case 'QA_METALLURGY':
        return 'QA';
      case 'ECONOMICS':
        return 'ECONOMICS';
      case 'PACK_OPTIMIZER':
        return 'PACK_OPTIMIZER';
      case 'AMAZON_FUNNEL':
        return 'AMAZON';
      case 'B2B_FUNNEL':
        return 'B2B';
      case 'FINANCE':
        return 'FINANCE';
      case 'MAKE_VS_BUY':
        return 'MAKE_VS_BUY';
      case 'UNIVERSE':
        return 'UNIVERSE';
      case 'CONTROL_TOWER':
      default:
        return 'CONTROL_TOWER';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Global Header Bar */}
      <Header
        confidenceFilter={confidenceFilter}
        onConfidenceChange={setConfidenceFilter}
        selectedScenario={feeScenario}
        onScenarioChange={handleScenarioChange}
        onResetData={handleResetData}
        observationCount={observations.length}
        onOpenResearchCockpit={() => setActiveWorkspace('RESEARCH_COCKPIT')}
        onOpenDiscovery={() => setActiveWorkspace('DISCOVERY')}
        onOpenContract={() => setActiveWorkspace('CONTRACT')}
        onOpenGeoMap={() => setActiveWorkspace('GEOMAP')}
        onOpenAnalytics={() => setActiveWorkspace('ANALYTICS')}
        onOpenPackaging={() => setActiveWorkspace('PACKAGING_LOGISTICS')}
      />

      {/* Sequential Pipeline Navigation Bar with 10 Stages, Status Badges & Snapshots */}
      <PipelineNavbar
        currentStage={workspaceToStage(activeWorkspace)}
        pipelineState={pipelineState}
        onNavigate={(stage) => setActiveWorkspace(stageToWorkspace(stage))}
        onSaveSnapshot={(label) =>
          dispatchPipeline({
            type: 'SAVE_SNAPSHOT',
            label,
            summary: {
              landedCogsPerOrder: 326.00,
              amazonFeesPerOrder: 160.97,
              netContributionPerOrder: -38.21,
              decision: pipelineState.decisions.AMAZON_DECISION || 'KILL'
            }
          })
        }
        onRestoreSnapshot={(snapshotId) =>
          dispatchPipeline({ type: 'RESTORE_SNAPSHOT', snapshotId })
        }
      />

      {/* Primary Viewport Canvas */}
      <main className={`flex-1 w-full ${activeWorkspace === 'GEOMAP' ? 'p-0 max-w-none' : 'p-4 lg:p-6 max-w-7xl mx-auto'}`}>
        {/* Opportunity Discovery & Signal Ingestion (Step 5) */}
        {activeWorkspace === 'DISCOVERY' && (
          <OpportunityDiscovery
            pipelineState={pipelineState}
            onNavigateToCapability={(capId) => {
              const targetStage = capabilityToStage(capId);
              setActiveWorkspace(stageToWorkspace(targetStage));
            }}
          />
        )}

        {/* Multi-Product Research Cockpit & Thesis Engine (Step 6) */}
        {activeWorkspace === 'RESEARCH_COCKPIT' && (
          <ResearchCockpit
            onNavigateToCapability={(capId) => {
              const targetStage = capabilityToStage(capId as any);
              setActiveWorkspace(stageToWorkspace(targetStage));
            }}
          />
        )}

        {/* Product Universe & Capability System (Step 4) */}
        {activeWorkspace === 'UNIVERSE' && (
          <ProductUniverse
            selectedProductId={pipelineState.identity.selectedProductId}
            selectedOpportunityId={pipelineState.identity.selectedOpportunityId}
            onSelectProduct={(productId) => {
              dispatchPipeline({ type: 'SELECT_PRODUCT', productId });
            }}
            onSelectOpportunity={(opportunityId) => {
              dispatchPipeline({ type: 'SELECT_OPPORTUNITY', opportunityId });
            }}
            onNavigateToCapability={(capId) => {
              const targetStage = capabilityToStage(capId);
              setActiveWorkspace(stageToWorkspace(targetStage));
            }}
          />
        )}

        {activeWorkspace === 'CONTROL_TOWER' && (
          <ExecutiveControlTower
            actionItems={actionItems}
            skus={skus}
            suppliers={suppliers}
            b2bCustomers={b2bCustomers}
            feeAssumptions={activeFeeAssumptions}
            activeCapital={pipelineState.activeScenario.capital}
            activePackSize={pipelineState.identity.selectedPackSize}
            activeAsp={pipelineState.activeScenario.asp}
            activeSupplierCost={pipelineState.activeScenario.supplierUnitPrice}
            activeOrdersPerDay={pipelineState.activeScenario.ordersPerDay}
            activePpc={pipelineState.activeScenario.ppcPerOrder}
            activeMoqThreshold={pipelineState.activeScenario.moqThreshold}
            onExecuteAction={handleExecuteAction}
            onNavigateToTab={(tab) => setActiveWorkspace(tab as any)}
          />
        )}

        {/* Supply & Demand Geographic Intelligence (Google Maps & Groq Ingestion) */}
        {activeWorkspace === 'GEOMAP' && (
          <SupplyDemandGeoMap
            suppliers={suppliers}
            quotes={quotes}
            b2bCustomers={b2bCustomers}
            activeSupplierId={selectedSupplierId || pipelineState.identity.selectedSupplierId}
            activeBuyerId={selectedBuyerId}
            onSelectSupplierAsActive={(supplierId, quoteId) => {
              setSelectedSupplierId(supplierId);
              localStorage.setItem('app_selected_supplier_id', supplierId);
              const sup = suppliers.find((s) => s.id === supplierId);
              const q = quotes.find((quo) => quo.supplier_id === supplierId);
              if (sup) {
                dispatchPipeline({
                  type: 'SELECT_ACTIVE_SUPPLIER_QUOTE',
                  quoteId: quoteId || q?.id || 'sq-custom',
                  supplierId,
                  unitPrice: q?.quoted_price_inr || 13.50,
                  source: sup.name,
                  confidence: 'HIGH',
                  effectiveDate: '2026-10-04'
                });
              }
            }}
            onSelectBuyerAsActive={(buyerId) => {
              setSelectedBuyerId(buyerId);
              localStorage.setItem('app_selected_buyer_id', buyerId);
            }}
            initialPreset={geoMapPreset}
            onPresetChange={(preset) => {
              setGeoMapPreset(preset);
              localStorage.setItem('app_geomap_preset', preset);
            }}
            initialRoleFilter={geoMapRoleFilter}
            onRoleFilterChange={(role) => {
              setGeoMapRoleFilter(role);
              localStorage.setItem('app_geomap_role_filter', role);
            }}
            initialCenter={geoMapCenter}
            initialZoom={geoMapZoom}
            onCameraChange={(center, zoom) => {
              setGeoMapCenter(center);
              setGeoMapZoom(zoom);
              localStorage.setItem('app_geomap_center', JSON.stringify(center));
              localStorage.setItem('app_geomap_zoom', String(zoom));
            }}
            onNavigateToStage={(stg) => {
              if (stg === 'SUPPLIERS') setActiveWorkspace('SUPPLIERS');
              else if (stg === 'QA') setActiveWorkspace('QA_METALLURGY');
              else if (stg === 'B2B') setActiveWorkspace('B2B_FUNNEL');
              else if (stg === 'ECONOMICS') setActiveWorkspace('ECONOMICS');
            }}
            onAddIngestedSupplier={(newSup, newQuote) => {
              setSuppliers((prev) => {
                const updated = [newSup, ...prev.filter((s) => s.id !== newSup.id)];
                try {
                  localStorage.setItem('app_custom_suppliers', JSON.stringify(updated.slice(0, 60)));
                } catch (e) {
                  console.warn('Failed to save custom suppliers to localStorage:', e);
                }
                return updated;
              });
              if (newQuote) {
                setQuotes((prev) => {
                  const updated = [newQuote, ...prev.filter((q) => q.id !== newQuote.id)];
                  try {
                    localStorage.setItem('app_custom_quotes', JSON.stringify(updated.slice(0, 60)));
                  } catch (e) {
                    console.warn('Failed to save custom quotes to localStorage:', e);
                  }
                  return updated;
                });
              }
            }}
            onAddIngestedBuyer={(newBuyer) => {
              setB2bCustomers((prev) => {
                const updated = [newBuyer, ...prev.filter((b) => b.id !== newBuyer.id)];
                try {
                  localStorage.setItem('app_custom_buyers', JSON.stringify(updated.slice(0, 60)));
                } catch (e) {
                  console.warn('Failed to save custom buyers to localStorage:', e);
                }
                return updated;
              });
            }}
          />
        )}

        {/* Stage 1: Engine Control Contract */}
        {activeWorkspace === 'CONTRACT' && (
          <ContractInspector feeAssumptions={activeFeeAssumptions} />
        )}

        {/* Stage 2: Intelligence Registry */}
        {activeWorkspace === 'INTELLIGENCE_REGISTRY' && (
          <IntelligenceRegistry
            observations={observations}
            tasks={tasks}
            onAddObservation={handleAddObservation}
            onAddTask={handleAddTask}
            confidenceFilter={confidenceFilter}
          />
        )}

        {/* Stage 3: Supplier Intelligence */}
        {activeWorkspace === 'SUPPLIERS' && (
          <SupplierIntelligence
            suppliers={suppliers}
            quotes={quotes}
            activeQuoteId={pipelineState.identity.selectedQuoteId}
            activeSupplierId={selectedSupplierId || pipelineState.identity.selectedSupplierId}
            onSelectActiveQuote={(quoteId, supplierId, unitPrice, supplierName) => {
              setSelectedSupplierId(supplierId);
              localStorage.setItem('app_selected_supplier_id', supplierId);
              dispatchPipeline({
                type: 'SELECT_ACTIVE_SUPPLIER_QUOTE',
                quoteId,
                supplierId,
                unitPrice,
                source: supplierName,
                confidence: 'HIGH',
                effectiveDate: '2026-10-04'
              });
            }}
            onNavigateNext={() => setActiveWorkspace('QA_METALLURGY')}
          />
        )}

        {/* Stage 4: QA & Metallurgy Batching */}
        {activeWorkspace === 'QA_METALLURGY' && (
          <QAVerification
            batches={qaBatches}
            suppliers={suppliers}
            activeBatchId={pipelineState.identity.selectedBatchId}
            onAddBatch={handleAddQABatch}
            onSetQaStatus={(batchId, status) =>
              dispatchPipeline({ type: 'SET_QA_STATUS', batchId, status })
            }
            onNavigateNext={() => setActiveWorkspace('ECONOMICS')}
          />
        )}

        {/* Stage 5: SKU Economics Sandbox */}
        {activeWorkspace === 'ECONOMICS' && (
          <SKUEconomicsSandbox
            feeAssumptions={activeFeeAssumptions}
            onUpdateFeeAssumptions={handleUpdateActiveAssumptions}
            activeSupplierCost={pipelineState.activeScenario.supplierUnitPrice}
            activePackSize={pipelineState.identity.selectedPackSize}
            activeAsp={pipelineState.activeScenario.asp}
            onUpdateActiveScenario={(params) =>
              dispatchPipeline({ type: 'UPDATE_ACTIVE_SCENARIO', params })
            }
            onNavigateNext={() => setActiveWorkspace('PACK_OPTIMIZER')}
          />
        )}

        {/* Stage 6: Hero Pack Optimizer */}
        {activeWorkspace === 'PACK_OPTIMIZER' && (
          <HeroPackOptimizer
            feeAssumptions={activeFeeAssumptions}
            activePackSize={pipelineState.identity.selectedPackSize}
            activeSupplierCost={pipelineState.activeScenario.supplierUnitPrice}
            onSelectHeroPack={(packSize, targetAsp) => {
              dispatchPipeline({ type: 'SELECT_PACK_SIZE', packSize });
              dispatchPipeline({
                type: 'UPDATE_ACTIVE_SCENARIO',
                params: { asp: targetAsp }
              });
            }}
            onNavigateNext={() => setActiveWorkspace('AMAZON_FUNNEL')}
          />
        )}

        {/* Stage 7: Amazon Experiment Funnel */}
        {activeWorkspace === 'AMAZON_FUNNEL' && (
          <AmazonExperiment
            skus={skus}
            activeOrdersPerDay={pipelineState.activeScenario.ordersPerDay}
            activePpc={pipelineState.activeScenario.ppcPerOrder}
            onPromoteCalibratedDemand={(ordersPerDay, ppcPerOrder, source) =>
              dispatchPipeline({
                type: 'PROMOTE_CALIBRATED_DEMAND',
                ordersPerDay,
                ppcPerOrder,
                source
              })
            }
            onNavigateNext={() => setActiveWorkspace('B2B_FUNNEL')}
          />
        )}

        {/* Stage 8: B2B Accounts & CRM Wholesale */}
        {activeWorkspace === 'B2B_FUNNEL' && (
          <B2BFunnel
            customers={b2bCustomers}
            activeSupplierCost={pipelineState.activeScenario.supplierUnitPrice}
            activePackSize={pipelineState.identity.selectedPackSize}
            activeAsp={pipelineState.activeScenario.asp}
            activeBuyerId={selectedBuyerId}
            onSelectBuyer={(buyerId) => {
              setSelectedBuyerId(buyerId);
              localStorage.setItem('app_selected_buyer_id', buyerId);
            }}
            onNavigateNext={() => setActiveWorkspace('FINANCE')}
          />
        )}

        {/* Stage 9: Finance Board & Capital Runway */}
        {activeWorkspace === 'FINANCE' && (
          <FinanceBoard
            feeAssumptions={activeFeeAssumptions}
            activeCapital={pipelineState.activeScenario.capital}
            activeSupplierCost={pipelineState.activeScenario.supplierUnitPrice}
            activePackSize={pipelineState.identity.selectedPackSize}
            activeAsp={pipelineState.activeScenario.asp}
            activeOrdersPerDay={pipelineState.activeScenario.ordersPerDay}
            onNavigateNext={() => setActiveWorkspace('MAKE_VS_BUY')}
          />
        )}

        {/* Stage 10: Make-vs-Buy Engine */}
        {activeWorkspace === 'MAKE_VS_BUY' && (
          <MakeVsBuy
            activeSupplierCost={pipelineState.activeScenario.supplierUnitPrice}
            activeOrdersPerDay={pipelineState.activeScenario.ordersPerDay}
            activePackSize={pipelineState.identity.selectedPackSize}
            onNavigateToStage={(stg) => setActiveWorkspace(stageToWorkspace(stg as any))}
          />
        )}

        {/* Stage 11: Analytics, Price Sensitivity & Floor Arbitrage Engine */}
        {activeWorkspace === 'ANALYTICS' && (
          <AnalyticsWorkspace
            currentAsp={pipelineState.activeScenario.asp}
            packSize={pipelineState.identity.selectedPackSize}
            supplierUnitPrice={pipelineState.activeScenario.supplierUnitPrice}
            ordersPerDay={pipelineState.activeScenario.ordersPerDay}
            feeAssumptions={activeFeeAssumptions}
            feeScenario={feeScenario}
            observations={observations}
            suppliers={suppliers}
            quotes={quotes}
            b2bCustomers={b2bCustomers}
            selectedSupplierId={selectedSupplierId}
            selectedBuyerId={selectedBuyerId}
            onSelectSupplier={(supId) => {
              setSelectedSupplierId(supId);
              localStorage.setItem('app_selected_supplier_id', supId);
              const quo = quotes.find((q) => q.supplier_id === supId);
              const sup = suppliers.find((s) => s.id === supId);
              if (sup) {
                dispatchPipeline({
                  type: 'SELECT_ACTIVE_SUPPLIER_QUOTE',
                  quoteId: quo?.id || 'sq-custom',
                  supplierId: supId,
                  unitPrice: quo?.quoted_price_inr || 13.50,
                  source: sup.name,
                  confidence: 'HIGH',
                  effectiveDate: '2026-10-04'
                });
              }
            }}
            onSelectBuyer={(buyId) => {
              setSelectedBuyerId(buyId);
              localStorage.setItem('app_selected_buyer_id', buyId);
            }}
            activeChartView={activeAnalyticsChartView}
            onChartViewChange={(view) => {
              setActiveAnalyticsChartView(view);
              localStorage.setItem('app_analytics_chart_view', view);
            }}
            onApplyStateUpdates={(updates) => {
              dispatchPipeline({
                type: 'UPDATE_ACTIVE_SCENARIO',
                params: updates
              });
              if (updates.packSize) {
                dispatchPipeline({
                  type: 'SELECT_PACK_SIZE',
                  packSize: updates.packSize
                });
              }
            }}
            onNavigateToStage={(stg) => setActiveWorkspace(stageToWorkspace(stg as any))}
          />
        )}

        {/* Packaging Diagnostics & Volumetric Freight Engine */}
        {activeWorkspace === 'PACKAGING_LOGISTICS' && (
          <LogisticsPackagingDiagnostics
            activePackSize={pipelineState.identity.selectedPackSize}
            activeAsp={pipelineState.activeScenario.asp}
            activeSupplierPrice={pipelineState.activeScenario.supplierUnitPrice}
            selectedSupplierId={selectedSupplierId}
            selectedBuyerId={selectedBuyerId}
            suppliers={suppliers}
            b2bCustomers={b2bCustomers}
            onNavigateToStage={(stg) => setActiveWorkspace(stageToWorkspace(stg as any))}
            onSyncToPipeline={(data) => {
              dispatchPipeline({
                type: 'SELECT_PACK_SIZE',
                packSize: data.packSize
              });
            }}
          />
        )}
      </main>

      {/* Industrial Audit Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-4 lg:px-6 py-3 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Product Signal Intelligence OS</span>
          <span aria-hidden="true">&middot;</span>
          <span>POC-001 · Opportunity Signal #001 (SS304 DIN 3017)</span>
          <span aria-hidden="true">&middot;</span>
          <span className="text-amber-500/80">Discover &rarr; Model &rarr; Simulate &rarr; Compare &rarr; Allocate</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Active Observations: {observations.length}</span>
          <span aria-hidden="true">&middot;</span>
          <span>Snapshots: {pipelineState.snapshots.length}</span>
          <span aria-hidden="true">&middot;</span>
          <span>Financial Truth: Deterministic Algorithmic</span>
        </div>
      </footer>
    </div>
  );
}
