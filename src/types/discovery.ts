/**
 * POC-001: Opportunity Discovery & Signal Ingestion Domain Model
 * Step 5: Controlled Epistemic Discovery Architecture
 * 
 * Target Pipeline:
 * DISCOVERY SOURCE
 *       ↓
 * AGENT / RESEARCH RUN
 *       ↓
 * RAW DISCOVERY SIGNAL
 *       ↓
 * NORMALIZATION
 *       ↓
 * OBSERVATION ENVELOPE
 *       ↓
 * EVIDENCE / PROVENANCE
 *       ↓
 * CANDIDATE PRODUCT / OPPORTUNITY
 *       ↓
 * RESEARCH QUEUE
 *       ↓
 * HUMAN / SYSTEM REVIEW
 *       ↓
 * PRODUCT UNIVERSE (Isolated from Financial State)
 */

export type DiscoverySourceType =
  | 'WEB_SEARCH'
  | 'SUPPLIER_DIRECTORY'
  | 'MARKETPLACE'
  | 'PUBLIC_COMPANY_SITE'
  | 'PUBLIC_DOCUMENT'
  | 'MARKET_DATA'
  | 'USER_INPUT'
  | 'AGENT_RESEARCH';

export interface DiscoverySource {
  source_id: string;
  source_type: DiscoverySourceType;
  name: string;
  url?: string;
  publisher?: string;
  description?: string;
  reliability_class?: string;
  active: boolean;
}

export type DiscoveryRunStatus =
  | 'RUNNING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED'
  | 'TIMEOUT'
  | 'NO_RESULTS'
  | 'INVALID_OUTPUT'
  | 'SOURCE_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'REVIEW_REQUIRED';

export interface DiscoveryRun {
  run_id: string;
  agent_id?: string;
  provider?: string;
  started_at: string;
  completed_at?: string;
  query?: string;
  objective: string;
  source_ids: string[];
  status: DiscoveryRunStatus;
  observation_count: number;
  candidate_count: number;
  errors?: string[];
}

export type DiscoverySignalType =
  | 'PRODUCT'
  | 'SUPPLIER'
  | 'BUYER'
  | 'PRICE'
  | 'DEMAND'
  | 'MARKET'
  | 'COMPETITIVE'
  | 'SUPPLY_CLUSTER'
  | 'OPPORTUNITY';

export type SignalProvenanceType =
  | 'AGENT_OBSERVED'
  | 'USER_OBSERVED'
  | 'EXTERNAL_PUBLISHED'
  | 'SUPPLIER_QUOTED'
  | 'DIRECT_OBSERVATION';

export type DiscoverySignalStatus =
  | 'NEW'
  | 'REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'DUPLICATE';

export interface DiscoverySignal {
  signal_id: string;
  run_id: string;
  signal_type: DiscoverySignalType;
  title: string;
  description: string;
  observed_at: string;
  source_id?: string;
  source_url?: string;
  raw_payload?: unknown;
  normalized_payload?: unknown;
  provenance: SignalProvenanceType;
  evidence_quality?: number;
  status: DiscoverySignalStatus;
  linked_product_id?: string;
  linked_opportunity_id?: string;
  user_feedback?: UserDiscoveryFeedback;
}

export type ObservationSubjectType =
  | 'PRODUCT'
  | 'PRODUCT_VARIANT'
  | 'SUPPLIER'
  | 'BUYER'
  | 'MARKET'
  | 'PRICE'
  | 'DEMAND'
  | 'COMPETITOR'
  | 'OPPORTUNITY';

export type ObservationExtractionMethod =
  | 'MANUAL'
  | 'RULE'
  | 'LLM'
  | 'BROWSER_AGENT'
  | 'API';

export type ObservationVerificationStatus =
  | 'UNVERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'VERIFIED'
  | 'CONFLICTED';

export interface ObservationEnvelope {
  observation_id: string;
  run_id: string;
  subject_type: ObservationSubjectType;
  subject_candidate_id?: string;
  source: string;
  source_url?: string;
  observed_at: string;
  raw_value?: unknown;
  normalized_value?: unknown;
  unit?: string;
  category: string;
  provenance: string;
  evidence_reference?: string;
  extraction_method?: ObservationExtractionMethod;
  agent_run_id?: string;
  verification_status: ObservationVerificationStatus;
  notes?: string;
}

export type CandidateLifecycleStatus =
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'INSUFFICIENT_DATA';

export interface CandidateProduct {
  candidate_product_id: string;
  proposed_name: string;
  category_hint?: string;
  description?: string;
  observed_material?: string;
  observed_standard?: string;
  signal_ids: string[];
  evidence_ids: string[];
  duplicate_of_product_id?: string;
  status: CandidateLifecycleStatus;
  user_feedback?: UserDiscoveryFeedback;
  created_at: string;
  updated_at: string;
}

export interface CandidateOpportunity {
  candidate_opportunity_id: string;
  candidate_product_id?: string;
  proposed_title: string;
  thesis: string;
  channel?: string;
  buyer_segment?: string;
  use_case?: string;
  supply_thesis?: string;
  competitive_thesis?: string;
  signal_ids: string[];
  evidence_ids: string[];
  status: CandidateLifecycleStatus;
  user_feedback?: UserDiscoveryFeedback;
  created_at: string;
  updated_at: string;
}

export type DeduplicationVerdict =
  | 'NEW'
  | 'DUPLICATE'
  | 'POSSIBLE_DUPLICATE'
  | 'REVIEW';

export interface DeduplicationResult {
  verdict: DeduplicationVerdict;
  matchedEntityId?: string;
  matchedEntityType?: 'PRODUCT' | 'OPPORTUNITY' | 'SUPPLIER';
  confidenceScore: number;
  reasons: string[];
}

export interface ObservationConflict {
  conflict_id: string;
  subject: string;
  field: string;
  observations: {
    observation_id: string;
    source: string;
    observed_at: string;
    value: unknown;
    unit?: string;
  }[];
  status: 'UNRESOLVED' | 'RESOLVED';
  resolution_notes?: string;
  created_at: string;
}

export type UserDiscoveryFeedback =
  | 'RELEVANT'
  | 'NOT_RELEVANT'
  | 'DUPLICATE'
  | 'INSUFFICIENT_DATA'
  | 'RESEARCH_FURTHER';

export interface DiscoveryTask {
  task_id: string;
  objective: string;
  scope?: {
    category?: string;
    geography?: string;
    channel?: string;
    buyer_segment?: string;
  };
  constraints?: {
    max_results?: number;
    require_public_source?: boolean;
  };
  created_at: string;
  status:
    | 'QUEUED'
    | 'RUNNING'
    | 'COMPLETED'
    | 'FAILED';
}

export interface DiscoveryResult {
  run_id: string;
  signals: DiscoverySignal[];
  observations: ObservationEnvelope[];
  candidateProducts: CandidateProduct[];
  candidateOpportunities: CandidateOpportunity[];
  conflicts: ObservationConflict[];
  errors?: string[];
}

export interface DiscoveryAgent {
  agent_id: string;
  provider: string;
  discover(task: DiscoveryTask): Promise<DiscoveryResult>;
}
