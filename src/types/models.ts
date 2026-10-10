/**
 * POC-001: Product Signal Intelligence & Capital Allocation OS
 * Architectural Governance Amendment: Equation & Analytical Model Registry Domain
 * 
 * Strict Epistemic Invariants:
 * 1. Equations: Explicit mathematical identities with deterministic evaluators.
 * 2. Analytical Models: Methods that estimate, forecast, classify or explain commercial phenomena.
 * 3. Statistical Methods: Correlations, regressions, time-series analysis and uncertainty estimation.
 * 4. Decision Rules: Explicit, testable rules that transform validated outputs into recommendations.
 * 5. Frozen Financial Core (v1.0.0-FROZEN) is strictly read-only and preserved untouched.
 * 6. Deterministic execution: LLMs may suggest or explain, but never substitute arithmetic.
 */

export type ModelClassification =
  | 'EQUATION'             // Explicit mathematical identities with deterministic algebraic evaluators
  | 'ANALYTICAL_MODEL'     // Estimation, simulation, forecasting or structural decomposition
  | 'STATISTICAL_METHOD'   // Statistical metrics, correlations, time-series, volatility
  | 'DECISION_RULE';       // Testable gating logic turning metrics into action recommendations

export type ModelVersionStatus =
  | 'ACTIVE'
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'DEPRECATED'
  | 'FROZEN_CORE';

export type ParameterEpistemicClass =
  | 'OBSERVED_FACT'        // Directly observed from verified source (e.g., LME price, supplier quote)
  | 'ESTIMATED_VALUE'      // Statistical or empirical estimation from sampling
  | 'SCENARIO_ASSUMPTION'  // User or scenario defined parameter (e.g., orders per day target)
  | 'DERIVED_OUTPUT';      // Deterministic output of a predecessor equation

export interface ModelParameterSchema {
  name: string;
  symbol: string;
  description: string;
  unit: string;
  data_type: 'number' | 'string' | 'boolean' | 'array';
  required: boolean;
  default_value: number | string | boolean | any[];
  min_value?: number;
  max_value?: number;
  epistemic_class: ParameterEpistemicClass;
  provenance_requirement?: string;
}

export interface ModelOutputSchema {
  name: string;
  symbol: string;
  description: string;
  unit: string;
  data_type: 'number' | 'string' | 'boolean' | 'object';
  precision?: number;
}

export interface ModelTestFixture {
  fixture_name: string;
  description: string;
  inputs: Record<string, any>;
  expected_outputs: Record<string, any>;
  tolerance?: number; // Numeric tolerance for floating point comparisons
  assert_invariants?: string[];
}

export interface ModelSensitivityVariable {
  variable_symbol: string;
  variable_name: string;
  base_value: number;
  test_range: [number, number]; // [min, max]
  expected_direction: 'POSITIVE' | 'NEGATIVE' | 'NON_LINEAR';
  notes: string;
}

export interface RegisteredModelItem {
  model_id: string;
  version: string;
  classification: ModelClassification;
  name: string;
  description: string;
  latex_or_formula: string;
  
  // Section 4 Admission Questions (Formal Documentation)
  admission_spec: {
    commercial_question: string;
    methodology_rationale: string;
    applicable_entities: string[];
    applicable_categories: string[];
    applicable_channels: string[];
    assumptions_and_limitations: string[];
    uncertainty_methodology: string;
    data_insufficient_conditions: string[];
    empirical_validation_protocol: string;
  };

  input_schemas: ModelParameterSchema[];
  output_schemas: ModelOutputSchema[];
  sensitivities: ModelSensitivityVariable[];
  fixtures: ModelTestFixture[];
  
  dependencies: string[]; // Model IDs of prerequisite equations
  effective_date: string;
  version_status: ModelVersionStatus;
  authoritative_reference: string;

  // Authoritative Deterministic Evaluator Function
  evaluator: (inputs: Record<string, any>) => {
    success: boolean;
    data_insufficient: boolean;
    insufficient_reason?: string;
    outputs: Record<string, any>;
    warnings: string[];
    execution_notes: string;
  };
}

export interface ModelExecutionRecord {
  execution_id: string;
  model_id: string;
  model_version: string;
  executed_at: string;
  inputs_used: Record<string, any>;
  outputs_generated: Record<string, any>;
  input_provenance: Record<string, string>;
  data_insufficient: boolean;
  warnings: string[];
  reproducibility_hash: string;
  calculation_authority: string;
}

export interface ModelValidationErrorDetail {
  field: string;
  message: string;
  receivedValue?: any;
}

