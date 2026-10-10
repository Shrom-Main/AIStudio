/**
 * Industrial Consumables Distribution Engine — Pipeline State Management
 * POC-001: Deterministic state container, action reducers, and initial seed
 */

import {
  PipelineAction,
  PipelineSnapshot,
  PipelineState
} from '../types/pipeline';

export const initialPipelineState: PipelineState = {
  identity: {
    selectedProductId: 'prod_ss304_din3017_canonical',
    selectedOpportunityId: 'opp_ss304_howrah_arb_001',
    selectedSkuId: 'sku-ss304-1625-20p',
    selectedPackSize: 20,
    selectedSupplierId: 'sup-howrah-precision',
    selectedBatchId: 'BATCH-2026-10-01',
    selectedQuoteId: 'sq-001'
  },
  activeScenario: {
    supplierUnitPrice: 15.00,
    asp: 499,
    ordersPerDay: 10,
    ppcPerOrder: 45,
    capital: 50000,
    feeScenario: 'Base',
    moqThreshold: 500,
    supplierCapacityUnits: 10000
  },
  evidenceLineage: {
    provenance: 'SUPPLIER_QUOTED',
    epistemicStatus: 'SUPPLIER_QUOTATION',
    confidence: 'HIGH',
    source: 'Howrah Precision Clamps (Direct Quotation)',
    effectiveDate: '2026-10-04',
    evidenceQualityScore: 88,
    notes: 'Quotation verified with factory visit in Howrah Industrial Area.'
  },
  stageStatuses: {
    DISCOVERY: 'READY',
    CONTRACT: 'VALIDATED',
    REGISTRY: 'READY',
    SUPPLIERS: 'ACTIVE',
    QA: 'READY',
    ECONOMICS: 'ACTIVE',
    PACK_OPTIMIZER: 'READY',
    AMAZON: 'ACTIVE',
    B2B: 'READY',
    FINANCE: 'ACTIVE',
    MAKE_VS_BUY: 'READY',
    ANALYTICS: 'ACTIVE',
    UNIVERSE: 'VALIDATED'
  },
  blockers: [],
  decisions: {
    AMAZON_DECISION: 'KILL',
    B2B_DECISION: 'SCALE',
    MAKE_VS_BUY_DECISION: 'SOURCE_FIRST'
  },
  snapshots: [
    {
      snapshotId: 'SNAP-SEED-001',
      timestamp: '2026-10-04T12:00:00Z',
      label: 'Baseline Canonical 20-Pack (₹499 ASP / ₹15 Unit Cost)',
      contractVersion: 'v1.0.0-FROZEN',
      engineVersion: 'v1.0.0',
      identity: {
        selectedProductId: 'prod_ss304_din3017_canonical',
        selectedOpportunityId: 'opp_ss304_howrah_arb_001',
        selectedSkuId: 'sku-ss304-1625-20p',
        selectedPackSize: 20,
        selectedSupplierId: 'sup-howrah-precision',
        selectedBatchId: 'BATCH-2026-10-01',
        selectedQuoteId: 'sq-001'
      },
      activeScenario: {
        supplierUnitPrice: 15.00,
        asp: 499,
        ordersPerDay: 10,
        ppcPerOrder: 45,
        capital: 50000,
        feeScenario: 'Base',
        moqThreshold: 500,
        supplierCapacityUnits: 10000
      },
      evidenceLineage: {
        provenance: 'SUPPLIER_QUOTED',
        epistemicStatus: 'SUPPLIER_QUOTATION',
        confidence: 'HIGH',
        source: 'Howrah Precision Clamps (Direct Quotation)',
        effectiveDate: '2026-10-04',
        evidenceQualityScore: 88
      },
      stageStatuses: {
        DISCOVERY: 'READY',
        CONTRACT: 'VALIDATED',
        REGISTRY: 'READY',
        SUPPLIERS: 'ACTIVE',
        QA: 'READY',
        ECONOMICS: 'ACTIVE',
        PACK_OPTIMIZER: 'READY',
        AMAZON: 'ACTIVE',
        B2B: 'READY',
        FINANCE: 'ACTIVE',
        MAKE_VS_BUY: 'READY',
        ANALYTICS: 'ACTIVE',
        UNIVERSE: 'VALIDATED'
      },
      calculatedSummary: {
        landedCogsPerOrder: 326.00,
        amazonFeesPerOrder: 160.97,
        netContributionPerOrder: -38.21,
        decision: 'KILL'
      }
    }
  ]
};

export function pipelineReducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {
    case 'SELECT_PRODUCT':
      return {
        ...state,
        identity: {
          ...state.identity,
          selectedProductId: action.productId
        }
      };

    case 'SELECT_OPPORTUNITY':
      return {
        ...state,
        identity: {
          ...state.identity,
          selectedOpportunityId: action.opportunityId
        }
      };

    case 'SELECT_SKU':
      return {
        ...state,
        identity: {
          ...state.identity,
          selectedSkuId: action.skuId
        }
      };

    case 'SELECT_PACK_SIZE':
      return {
        ...state,
        identity: {
          ...state.identity,
          selectedPackSize: action.packSize
        }
      };

    case 'SELECT_SUPPLIER':
      return {
        ...state,
        identity: {
          ...state.identity,
          selectedSupplierId: action.supplierId
        }
      };

    case 'SELECT_QA_BATCH':
      return {
        ...state,
        identity: {
          ...state.identity,
          selectedBatchId: action.batchId
        }
      };

    case 'SELECT_ACTIVE_SUPPLIER_QUOTE':
      return {
        ...state,
        identity: {
          ...state.identity,
          selectedSupplierId: action.supplierId,
          selectedQuoteId: action.quoteId
        },
        activeScenario: {
          ...state.activeScenario,
          supplierUnitPrice: action.unitPrice
        },
        evidenceLineage: {
          ...state.evidenceLineage,
          provenance: 'SUPPLIER_QUOTED',
          epistemicStatus: 'SUPPLIER_QUOTATION',
          confidence: action.confidence,
          source: action.source,
          effectiveDate: action.effectiveDate,
          evidenceQualityScore: action.confidence === 'HIGH' ? 88 : action.confidence === 'MEDIUM' ? 74 : 60
        }
      };

    case 'SET_QA_STATUS': {
      const isPass = action.status === 'PASS';
      const updatedBlockers = isPass
        ? state.blockers.filter((b) => !b.includes('QA Quarantine'))
        : [...state.blockers.filter((b) => !b.includes('QA Quarantine')), `QA Quarantine on Batch ${action.batchId}`];
      return {
        ...state,
        stageStatuses: {
          ...state.stageStatuses,
          QA: isPass ? 'VALIDATED' : 'BLOCKED'
        },
        blockers: updatedBlockers
      };
    }

    case 'UPDATE_ACTIVE_SCENARIO':
      return {
        ...state,
        activeScenario: {
          ...state.activeScenario,
          ...action.params
        }
      };

    case 'PROMOTE_CALIBRATED_DEMAND':
      return {
        ...state,
        activeScenario: {
          ...state.activeScenario,
          ordersPerDay: action.ordersPerDay,
          ppcPerOrder: action.ppcPerOrder
        },
        evidenceLineage: {
          ...state.evidenceLineage,
          epistemicStatus: 'ESTIMATE_CALIBRATED',
          notes: `Calibrated from Amazon live experiment observation (${action.source})`
        }
      };

    case 'SET_STAGE_STATUS':
      return {
        ...state,
        stageStatuses: {
          ...state.stageStatuses,
          [action.stageId]: action.status
        }
      };

    case 'SET_DECISION':
      return {
        ...state,
        decisions: {
          ...state.decisions,
          [action.key]: action.decision
        }
      };

    case 'ADD_BLOCKER':
      return {
        ...state,
        blockers: state.blockers.includes(action.blocker)
          ? state.blockers
          : [...state.blockers, action.blocker]
      };

    case 'REMOVE_BLOCKER':
      return {
        ...state,
        blockers: state.blockers.filter((b) => b !== action.blocker)
      };

    case 'SAVE_SNAPSHOT': {
      const newSnapshot: PipelineSnapshot = {
        snapshotId: `SNAP-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        label: action.label || `Snapshot ${state.snapshots.length + 1}`,
        contractVersion: 'v1.0.0-FROZEN',
        engineVersion: 'v1.0.0',
        identity: { ...state.identity },
        activeScenario: { ...state.activeScenario },
        evidenceLineage: { ...state.evidenceLineage },
        stageStatuses: { ...state.stageStatuses },
        calculatedSummary: action.summary
      };
      return {
        ...state,
        snapshots: [newSnapshot, ...state.snapshots]
      };
    }

    case 'RESTORE_SNAPSHOT': {
      const found = state.snapshots.find((s) => s.snapshotId === action.snapshotId);
      if (!found) return state;
      return {
        ...state,
        identity: { ...found.identity },
        activeScenario: { ...found.activeScenario },
        evidenceLineage: { ...found.evidenceLineage },
        stageStatuses: { ...found.stageStatuses }
      };
    }

    case 'RESET_TO_DEFAULTS':
      return {
        ...initialPipelineState,
        snapshots: state.snapshots
      };

    default:
      return state;
  }
}
