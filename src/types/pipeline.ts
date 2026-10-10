/**
 * Industrial Consumables Distribution Engine — Pipeline Architecture
 * POC-001: Structured Shared Pipeline State & Epistemic Boundaries
 */

import { ConfidenceLevel, ProvenanceType } from './index';
import { EpistemicStatus } from './contract';

export type PipelineStageId =
  | 'DISCOVERY'
  | 'CONTRACT'
  | 'REGISTRY'
  | 'SUPPLIERS'
  | 'QA'
  | 'ECONOMICS'
  | 'PACK_OPTIMIZER'
  | 'AMAZON'
  | 'B2B'
  | 'FINANCE'
  | 'MAKE_VS_BUY'
  | 'ANALYTICS'
  | 'UNIVERSE';

export type StageStatus =
  | 'NOT_STARTED'
  | 'DATA_REQUIRED'
  | 'READY'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'VALIDATED'
  | 'WARNING';

export interface PipelineIdentity {
  /** Canonical Product Identifier (Step 3 domain abstraction) */
  selectedProductId: string;
  /** Canonical Opportunity Identifier (Step 3 domain abstraction) */
  selectedOpportunityId: string;
  /** Migration adapter: legacy SKU reference */
  selectedSkuId: string;
  selectedPackSize: number;
  selectedSupplierId: string;
  selectedBatchId: string;
  selectedQuoteId?: string;
}

export interface PipelineActiveScenario {
  supplierUnitPrice: number;
  asp: number;
  ordersPerDay: number;
  ppcPerOrder: number;
  capital: number;
  feeScenario: 'Conservative' | 'Base' | 'Optimistic';
  moqThreshold: number;
  supplierCapacityUnits?: number;
}

export interface PipelineEvidenceLineage {
  provenance: ProvenanceType;
  epistemicStatus: EpistemicStatus;
  confidence: ConfidenceLevel;
  source: string;
  effectiveDate: string;
  evidenceQualityScore: number;
  notes?: string;
}

export interface PipelineSnapshot {
  snapshotId: string;
  timestamp: string;
  label: string;
  contractVersion: string;
  engineVersion: string;
  identity: PipelineIdentity;
  activeScenario: PipelineActiveScenario;
  evidenceLineage: PipelineEvidenceLineage;
  stageStatuses: Record<PipelineStageId, StageStatus>;
  calculatedSummary: {
    landedCogsPerOrder: number;
    amazonFeesPerOrder: number;
    netContributionPerOrder: number;
    decision: string;
  };
}

export interface PipelineState {
  identity: PipelineIdentity;
  activeScenario: PipelineActiveScenario;
  evidenceLineage: PipelineEvidenceLineage;
  stageStatuses: Record<PipelineStageId, StageStatus>;
  blockers: string[];
  decisions: Record<string, string>;
  snapshots: PipelineSnapshot[];
}

export type PipelineAction =
  | { type: 'SELECT_PRODUCT'; productId: string }
  | { type: 'SELECT_OPPORTUNITY'; opportunityId: string }
  | { type: 'SELECT_SKU'; skuId: string }
  | { type: 'SELECT_PACK_SIZE'; packSize: number }
  | { type: 'SELECT_SUPPLIER'; supplierId: string }
  | { type: 'SELECT_QA_BATCH'; batchId: string }
  | {
      type: 'SELECT_ACTIVE_SUPPLIER_QUOTE';
      quoteId: string;
      supplierId: string;
      unitPrice: number;
      source: string;
      confidence: ConfidenceLevel;
      effectiveDate: string;
    }
  | { type: 'SET_QA_STATUS'; batchId: string; status: 'PASS' | 'QUARANTINE' }
  | { type: 'UPDATE_ACTIVE_SCENARIO'; params: Partial<PipelineActiveScenario> }
  | { type: 'PROMOTE_CALIBRATED_DEMAND'; ordersPerDay: number; ppcPerOrder: number; source: string }
  | { type: 'SET_STAGE_STATUS'; stageId: PipelineStageId; status: StageStatus }
  | { type: 'SET_DECISION'; key: string; decision: string }
  | { type: 'ADD_BLOCKER'; blocker: string }
  | { type: 'REMOVE_BLOCKER'; blocker: string }
  | { type: 'SAVE_SNAPSHOT'; label: string; summary: PipelineSnapshot['calculatedSummary'] }
  | { type: 'RESTORE_SNAPSHOT'; snapshotId: string }
  | { type: 'RESET_TO_DEFAULTS' };
