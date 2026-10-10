/**
 * POC-001: Product Signal Intelligence & Capital Allocation OS
 * Architectural Governance Amendment: First-Class Executable Equation & Analytical Model Registry
 * 
 * Strict Epistemic Invariants:
 * 1. Equations: Explicit mathematical identities with deterministic evaluators.
 * 2. Analytical Models: Methods that estimate, forecast, classify or explain commercial phenomena.
 * 3. Statistical Methods: Correlations, regressions, time-series analysis and uncertainty estimation.
 * 4. Decision Rules: Explicit, testable rules that transform validated outputs into recommendations.
 * 5. Frozen Financial Core (v1.0.0-FROZEN) is strictly read-only and preserved untouched.
 * 6. Deterministic execution: LLMs may suggest or explain, but never substitute arithmetic.
 * 7. When evidence is insufficient (e.g. sample size N < 10), returns data_insufficient: true.
 */

import {
  RegisteredModelItem,
  ModelExecutionRecord,
  ModelClassification,
  ModelValidationErrorDetail
} from '../types/models';

export class ModelAdmissionValidationError extends Error {
  public readonly errors: ModelValidationErrorDetail[];
  public readonly modelId?: string;

  constructor(message: string, errors: ModelValidationErrorDetail[], modelId?: string) {
    super(message);
    this.name = 'ModelAdmissionValidationError';
    this.errors = errors;
    this.modelId = modelId;
    Object.setPrototypeOf(this, ModelAdmissionValidationError.prototype);
  }
}

const VALID_CLASSIFICATIONS: ModelClassification[] = [
  'EQUATION',
  'ANALYTICAL_MODEL',
  'STATISTICAL_METHOD',
  'DECISION_RULE'
];

const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

export function validateModelDefinition(
  item: any,
  existingModels: Map<string, RegisteredModelItem>,
  options: { allowOverwrite?: boolean } = {}
): ModelValidationErrorDetail[] {
  const errors: ModelValidationErrorDetail[] = [];

  if (!item || typeof item !== 'object') {
    return [{ field: 'root', message: 'Model definition must be a non-null object.', receivedValue: item }];
  }

  // 1. Model ID
  if (!item.model_id || typeof item.model_id !== 'string' || item.model_id.trim().length === 0) {
    errors.push({ field: 'model_id', message: 'Model ID is required and must be a non-empty string.', receivedValue: item.model_id });
  } else {
    const trimmedId = item.model_id.trim();
    if (existingModels.has(trimmedId) && !options.allowOverwrite) {
      errors.push({
        field: 'model_id',
        message: `Duplicate registration rejected: Model with ID "${trimmedId}" is already registered.`,
        receivedValue: trimmedId
      });
    }
  }

  // 2. Semantic Version
  if (!item.version || typeof item.version !== 'string' || !SEMVER_REGEX.test(item.version.trim())) {
    errors.push({
      field: 'version',
      message: 'Valid semantic version required (e.g. "1.0.0" or "1.2.0-beta.1").',
      receivedValue: item.version
    });
  }

  // 3. Classification
  if (!item.classification || !VALID_CLASSIFICATIONS.includes(item.classification)) {
    errors.push({
      field: 'classification',
      message: `Supported classification required: ${VALID_CLASSIFICATIONS.join(', ')}.`,
      receivedValue: item.classification
    });
  }

  // 4. Name & Description
  if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Model name is required and must be non-empty.', receivedValue: item.name });
  }
  if (!item.description || typeof item.description !== 'string' || item.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Model description is required and must be non-empty.', receivedValue: item.description });
  }

  // 5. Evaluator
  if (typeof item.evaluator !== 'function') {
    errors.push({
      field: 'evaluator',
      message: 'Model evaluator must be an executable function.',
      receivedValue: typeof item.evaluator
    });
  }

  // 6. Schemas
  if (!Array.isArray(item.output_schemas) || item.output_schemas.length === 0) {
    errors.push({
      field: 'output_schemas',
      message: 'At least one output schema must be defined.',
      receivedValue: item.output_schemas
    });
  } else {
    item.output_schemas.forEach((out: any, idx: number) => {
      if (!out?.symbol || !out?.name || !out?.unit || !out?.data_type) {
        errors.push({
          field: `output_schemas[${idx}]`,
          message: `Output schema at index ${idx} is incomplete (symbol, name, unit, and data_type are required).`,
          receivedValue: out
        });
      }
    });
  }

  if (!Array.isArray(item.input_schemas)) {
    errors.push({
      field: 'input_schemas',
      message: 'input_schemas must be an array of parameter schemas.',
      receivedValue: item.input_schemas
    });
  } else {
    item.input_schemas.forEach((inp: any, idx: number) => {
      if (!inp?.symbol || !inp?.name || !inp?.unit || !inp?.data_type || !inp?.epistemic_class) {
        errors.push({
          field: `input_schemas[${idx}]`,
          message: `Input schema at index ${idx} is incomplete (symbol, name, unit, data_type, and epistemic_class are required).`,
          receivedValue: inp
        });
      }
    });
  }

  // 7. Admission Spec & Declared Assumptions
  if (!item.admission_spec || typeof item.admission_spec !== 'object') {
    errors.push({
      field: 'admission_spec',
      message: 'admission_spec object is required containing formal admission metadata.',
      receivedValue: item.admission_spec
    });
  } else {
    const spec = item.admission_spec;
    if (!spec.commercial_question || typeof spec.commercial_question !== 'string' || spec.commercial_question.trim().length === 0) {
      errors.push({ field: 'admission_spec.commercial_question', message: 'Formal commercial question is required.', receivedValue: spec.commercial_question });
    }
    if (!spec.methodology_rationale || typeof spec.methodology_rationale !== 'string' || spec.methodology_rationale.trim().length === 0) {
      errors.push({ field: 'admission_spec.methodology_rationale', message: 'Methodology rationale is required.', receivedValue: spec.methodology_rationale });
    }
    if (!Array.isArray(spec.applicable_entities) || spec.applicable_entities.length === 0) {
      errors.push({ field: 'admission_spec.applicable_entities', message: 'At least one applicable entity must be declared.', receivedValue: spec.applicable_entities });
    }
    if (!Array.isArray(spec.applicable_categories) || spec.applicable_categories.length === 0) {
      errors.push({ field: 'admission_spec.applicable_categories', message: 'At least one applicable category must be declared.', receivedValue: spec.applicable_categories });
    }
    if (!Array.isArray(spec.applicable_channels) || spec.applicable_channels.length === 0) {
      errors.push({ field: 'admission_spec.applicable_channels', message: 'At least one applicable channel must be declared.', receivedValue: spec.applicable_channels });
    }
    if (!Array.isArray(spec.assumptions_and_limitations) || spec.assumptions_and_limitations.length === 0) {
      errors.push({ field: 'admission_spec.assumptions_and_limitations', message: 'Declared assumptions and limitations are required.', receivedValue: spec.assumptions_and_limitations });
    }
    if (!Array.isArray(spec.data_insufficient_conditions) || spec.data_insufficient_conditions.length === 0) {
      errors.push({ field: 'admission_spec.data_insufficient_conditions', message: 'Declared data insufficient conditions are required.', receivedValue: spec.data_insufficient_conditions });
    }
  }

  return errors;
}

/**
 * Genuine FIPS 180-4 standard SHA-256 implementation in pure TypeScript.
 * Zero external dependencies; 100% synchronous; identical behavior across Node.js and browser runtimes.
 */
export function sha256(input: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let ascii = unescape(encodeURIComponent(input));
  const asciiBitLength = ascii.length * 8;
  const words: number[] = [];

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime = (candidate: number) => {
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) return false;
    }
    return true;
  };

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 16; i < 64; i++) {
      const s0 =
        ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^
        ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^
        (w[i - 15] >>> 3);
      const s1 =
        ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^
        ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^
        (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    for (let i = 0; i < 64; i++) {
      const s1 =
        ((hash[4] >>> 6) | (hash[4] << 26)) ^
        ((hash[4] >>> 11) | (hash[4] << 21)) ^
        ((hash[4] >>> 25) | (hash[4] << 7));
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1 + ch + k[i] + w[i]) | 0;
      const s0 =
        ((hash[0] >>> 2) | (hash[0] << 30)) ^
        ((hash[0] >>> 13) | (hash[0] << 19)) ^
        ((hash[0] >>> 22) | (hash[0] << 10));
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Deterministic canonical value representation:
 * - Sorts object keys recursively (RFC 8785 style)
 * - Normalizes numbers and arrays
 * - Preserves nulls, maps undefined out
 */
export function canonicalizeValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return null;
    return val;
  }
  if (typeof val !== 'object') return val;
  if (Array.isArray(val)) {
    return val.map(canonicalizeValue);
  }
  const keys = Object.keys(val).sort();
  const res: Record<string, any> = {};
  for (const k of keys) {
    if (val[k] !== undefined) {
      res[k] = canonicalizeValue(val[k]);
    }
  }
  return res;
}

export function canonicalJsonStringify(val: any): string {
  return JSON.stringify(canonicalizeValue(val));
}

export class EquationRegistry {
  private models = new Map<string, RegisteredModelItem>();
  private executionLog: ModelExecutionRecord[] = [];

  constructor() {
    this.seedAuthoritativeModels();
  }

  // ============================================================================
  // Registration & Retrieval
  // ============================================================================

  public registerModel(item: RegisteredModelItem, options: { allowOverwrite?: boolean } = {}): void {
    const errors = validateModelDefinition(item, this.models, options);
    if (errors.length > 0) {
      const summaryMsg = `Model admission validation failed for "${item?.model_id || 'unknown'}": ${errors.map((e) => `${e.field}: ${e.message}`).join('; ')}`;
      throw new ModelAdmissionValidationError(summaryMsg, errors, item?.model_id);
    }
    this.models.set(item.model_id, item);
  }

  public unregisterModel(modelId: string): boolean {
    return this.models.delete(modelId);
  }

  public getModel(modelId: string): RegisteredModelItem | undefined {
    return this.models.get(modelId);
  }

  public getAllModels(): RegisteredModelItem[] {
    return Array.from(this.models.values());
  }

  public getModelsByClassification(classification: ModelClassification): RegisteredModelItem[] {
    return this.getAllModels().filter((m) => m.classification === classification);
  }

  public getModelsForEntity(entityType: string, category?: string, channel?: string): RegisteredModelItem[] {
    return this.getAllModels().filter((m) => {
      const matchEntity = m.admission_spec.applicable_entities.includes('*') ||
        m.admission_spec.applicable_entities.includes(entityType);
      const matchCategory = !category || m.admission_spec.applicable_categories.includes('*') ||
        m.admission_spec.applicable_categories.includes(category);
      const matchChannel = !channel || m.admission_spec.applicable_channels.includes('*') ||
        m.admission_spec.applicable_channels.includes(channel);
      return matchEntity && matchCategory && matchChannel;
    });
  }

  // ============================================================================
  // Deterministic Execution & Snapshot Logging
  // ============================================================================

  public evaluateModel(
    modelId: string,
    inputs: Record<string, any>,
    provenanceMap: Record<string, string> = {}
  ): {
    record: ModelExecutionRecord;
    result: ReturnType<RegisteredModelItem['evaluator']>;
  } {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model with ID "${modelId}" not found in EquationRegistry.`);
    }

    // Validate required inputs
    for (const schema of model.input_schemas) {
      if (schema.required && (inputs[schema.symbol] === undefined || inputs[schema.symbol] === null)) {
        throw new Error(
          `Validation failed for model ${modelId}: Required input parameter "${schema.name}" (${schema.symbol}) is missing.`
        );
      }
    }

    // Execute deterministic evaluator
    const result = model.evaluator(inputs);

    // Build deterministic reproducibility snapshot
    const timestamp = new Date().toISOString();
    const executionId = `exec_${model.model_id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const snapshotPayload = {
      model_id: model.model_id,
      version: model.version,
      inputs,
      outputs: result.outputs,
      data_insufficient: result.data_insufficient,
      warnings: result.warnings,
      input_provenance: provenanceMap,
      input_schemas: model.input_schemas.map((s) => ({
        symbol: s.symbol,
        unit: s.unit,
        epistemic_class: s.epistemic_class
      })),
      declared_assumptions: model.admission_spec.assumptions_and_limitations
    };

    // Genuine SHA-256 digest on canonicalized payload (RFC 6234 / FIPS 180-4 standard)
    const reproducibilityHash = `sha256_${sha256(canonicalJsonStringify(snapshotPayload))}`;

    const record: ModelExecutionRecord = {
      execution_id: executionId,
      model_id: model.model_id,
      model_version: model.version,
      executed_at: timestamp,
      inputs_used: { ...inputs },
      outputs_generated: { ...result.outputs },
      input_provenance: { ...provenanceMap },
      data_insufficient: result.data_insufficient,
      warnings: [...result.warnings],
      reproducibility_hash: reproducibilityHash,
      calculation_authority: model.authoritative_reference
    };

    this.executionLog.unshift(record);
    return { record, result };
  }

  public getExecutionLog(): ModelExecutionRecord[] {
    return [...this.executionLog];
  }

  // ============================================================================
  // Automated Test Suite Execution
  // ============================================================================

  public runRegistryTestSuite(): {
    total_models: number;
    total_fixtures: number;
    passed_fixtures: number;
    failed_fixtures: number;
    details: { model_id: string; fixture_name: string; passed: boolean; message: string }[];
  } {
    const details: { model_id: string; fixture_name: string; passed: boolean; message: string }[] = [];
    let totalFixtures = 0;
    let passedFixtures = 0;

    for (const model of this.getAllModels()) {
      for (const fixture of model.fixtures) {
        totalFixtures++;
        try {
          const evalRes = model.evaluator(fixture.inputs);
          let fixturePassed = true;
          let failureMsg = '';

          for (const [key, expectedVal] of Object.entries(fixture.expected_outputs)) {
            const actualVal = evalRes.outputs[key];
            if (typeof expectedVal === 'number' && typeof actualVal === 'number') {
              const tol = fixture.tolerance ?? 0.01;
              if (Math.abs(actualVal - expectedVal) > tol) {
                fixturePassed = false;
                failureMsg += `Output [${key}] expected ${expectedVal} but received ${actualVal} (tolerance: ${tol}). `;
              }
            } else if (actualVal !== expectedVal) {
              fixturePassed = false;
              failureMsg += `Output [${key}] expected "${expectedVal}" but received "${actualVal}". `;
            }
          }

          if (fixturePassed) {
            passedFixtures++;
            details.push({
              model_id: model.model_id,
              fixture_name: fixture.fixture_name,
              passed: true,
              message: 'Verified against expected analytical outputs.'
            });
          } else {
            details.push({
              model_id: model.model_id,
              fixture_name: fixture.fixture_name,
              passed: false,
              message: failureMsg
            });
          }
        } catch (err: any) {
          details.push({
            model_id: model.model_id,
            fixture_name: fixture.fixture_name,
            passed: false,
            message: `Evaluator threw error: ${err.message}`
          });
        }
      }
    }

    return {
      total_models: this.models.size,
      total_fixtures: totalFixtures,
      passed_fixtures: passedFixtures,
      failed_fixtures: totalFixtures - passedFixtures,
      details
    };
  }

  // ============================================================================
  // Seed Authoritative Equation & Model Library
  // ============================================================================

  private seedAuthoritativeModels(): void {
    // --------------------------------------------------------------------------
    // A. EQUATIONS (Explicit Mathematical Identities)
    // --------------------------------------------------------------------------

    // 1. Volumetric Freight Tax Ratio
    this.registerModel({
      model_id: 'EQ-VOLUMETRIC-TAX-v1.0.0',
      version: '1.0.0',
      classification: 'EQUATION',
      name: 'Volumetric Freight Tax Ratio (VTR)',
      description: 'Dimensional penalty index measuring whether courier bills for air volume rather than physical dead weight.',
      latex_or_formula: 'VTR = (L * W * H) / (5000 * W_gross)',
      admission_spec: {
        commercial_question: 'Is the packaging configuration wasting money on dimensional weight courier penalties?',
        methodology_rationale: 'Courier cubic divisor identity (IATA/Domestic standard divisor of 5000 cm³/kg).',
        applicable_entities: ['PackOffer', 'ProductVariant'],
        applicable_categories: ['*'],
        applicable_channels: ['D2C', 'B2B', 'MARKETPLACE'],
        assumptions_and_limitations: ['Assumes standard domestic road/air divisor of 5000 cm³/kg.'],
        uncertainty_methodology: 'Deterministic exact physical geometry measurement.',
        data_insufficient_conditions: ['Package dimensions or actual weight missing or non-positive.'],
        empirical_validation_protocol: 'Cross-check against actual carrier airway bills and volumetric charges.'
      },
      input_schemas: [
        { name: 'Length', symbol: 'L', description: 'Carton Length', unit: 'cm', data_type: 'number', required: true, default_value: 14, min_value: 0.1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Width', symbol: 'W', description: 'Carton Width', unit: 'cm', data_type: 'number', required: true, default_value: 11, min_value: 0.1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Height', symbol: 'H', description: 'Carton Height', unit: 'cm', data_type: 'number', required: true, default_value: 6.5, min_value: 0.1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Actual Weight', symbol: 'W_gross', description: 'Actual dead weight', unit: 'kg', data_type: 'number', required: true, default_value: 0.53, min_value: 0.001, epistemic_class: 'OBSERVED_FACT' }
      ],
      output_schemas: [
        { name: 'Volumetric Weight Ratio', symbol: 'vtr', description: 'Ratio of volumetric weight to actual weight', unit: 'ratio', data_type: 'number', precision: 3 },
        { name: 'Dimensional Weight', symbol: 'volumetric_weight_kg', description: 'Billable volumetric weight', unit: 'kg', data_type: 'number', precision: 3 },
        { name: 'Is Penalty Active', symbol: 'is_penalty_active', description: 'True if VTR > 1.0 (paying for dead air)', unit: 'boolean', data_type: 'boolean' }
      ],
      sensitivities: [
        { variable_symbol: 'H', variable_name: 'Carton Height', base_value: 6.5, test_range: [4, 10], expected_direction: 'POSITIVE', notes: 'Height expansion directly inflates cubic volume' }
      ],
      fixtures: [
        {
          fixture_name: 'Standard 20-Pack SS304 Clamp Box',
          description: 'Compact carton fitting within physical steel weight',
          inputs: { L: 14, W: 11, H: 6.5, W_gross: 0.53 },
          expected_outputs: { vtr: 0.378, volumetric_weight_kg: 0.2, is_penalty_active: false },
          tolerance: 0.02
        },
        {
          fixture_name: 'Bulky Oversized Diya Gift Box',
          description: 'Large decorative box with low weight paying severe volumetric tax',
          inputs: { L: 30, W: 30, H: 20, W_gross: 0.8 },
          expected_outputs: { vtr: 4.5, volumetric_weight_kg: 3.6, is_penalty_active: true },
          tolerance: 0.05
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'IATA & Domestic Freight Volumetric Standards',
      evaluator: (inputs) => {
        const { L, W, H, W_gross } = inputs;
        if (!L || !W || !H || !W_gross || L <= 0 || W <= 0 || H <= 0 || W_gross <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Non-positive or missing dimensional/weight values.',
            outputs: { vtr: 0, volumetric_weight_kg: 0, is_penalty_active: false },
            warnings: ['DATA INSUFFICIENT: Packaging dimensions must be strictly positive.'],
            execution_notes: 'Failed geometry invariant check.'
          };
        }
        const volWeight = Number(((L * W * H) / 5000).toFixed(3));
        const vtr = Number((volWeight / W_gross).toFixed(3));
        const penalty = vtr > 1.0;
        return {
          success: true,
          data_insufficient: false,
          outputs: {
            vtr,
            volumetric_weight_kg: volWeight,
            is_penalty_active: penalty
          },
          warnings: penalty ? ['Volumetric penalty active: Billable weight exceeds physical weight.'] : [],
          execution_notes: `Evaluated exact VTR of ${vtr} across ${volWeight}kg vs ${W_gross}kg.`
        };
      }
    });

    // 1b. Unit Contribution Margin & Margin Percentage (Common Economics Layer)
    this.registerModel({
      model_id: 'EQ-CONTRIBUTION-MARGIN-v1.0.0',
      version: '1.0.0',
      classification: 'EQUATION',
      name: 'Common Unit Contribution Margin & Margin Pct',
      description: 'Standardized comparison layer identity: Net contribution per unit/order and contribution margin percentage after landed COGS and direct channel fulfillment/marketplace fees.',
      latex_or_formula: 'Net_CM = ASP - Landed_COGS - Direct_Channel_Fees; CM% = (Net_CM / ASP) * 100',
      admission_spec: {
        commercial_question: 'What is the true net contribution cash flow per order after accounting for all landed direct costs and channel fees?',
        methodology_rationale: 'Fundamental managerial accounting unit contribution identity.',
        applicable_entities: ['Opportunity', 'PackOffer', 'ProductVariant'],
        applicable_categories: ['*'],
        applicable_channels: ['*'],
        assumptions_and_limitations: ['ASP and COGS strictly non-negative.'],
        uncertainty_methodology: 'Deterministic accounting identity.',
        data_insufficient_conditions: ['ASP <= 0 or Landed COGS <= 0.'],
        empirical_validation_protocol: 'Cross-audited against unit P&L statements across all product categories.'
      },
      input_schemas: [
        { name: 'Average Selling Price (ASP)', symbol: 'asp', description: 'Net realized selling price per order/pack', unit: 'INR', data_type: 'number', required: true, default_value: 499.00, min_value: 1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Landed COGS Per Order', symbol: 'landed_cogs', description: 'Direct unit material + packaging + freight', unit: 'INR', data_type: 'number', required: true, default_value: 326.00, min_value: 0, epistemic_class: 'DERIVED_OUTPUT' },
        { name: 'Direct Channel & Fulfillment Fees', symbol: 'channel_fees', description: 'Total marketplace commission + shipping fees', unit: 'INR', data_type: 'number', required: true, default_value: 160.97, min_value: 0, epistemic_class: 'DERIVED_OUTPUT' }
      ],
      output_schemas: [
        { name: 'Net Contribution Per Order', symbol: 'net_contribution_inr', description: 'Cash contribution generated per sale', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Contribution Margin Percentage', symbol: 'contribution_margin_pct', description: 'Margin percentage over ASP', unit: '%', data_type: 'number', precision: 2 },
        { name: 'Positive Contribution Flag', symbol: 'is_contribution_positive', description: 'True if Net CM > 0', unit: 'boolean', data_type: 'boolean' }
      ],
      sensitivities: [
        { variable_symbol: 'asp', variable_name: 'Selling Price', base_value: 499, test_range: [449, 549], expected_direction: 'POSITIVE', notes: 'Direct leverage on dollar contribution' }
      ],
      fixtures: [
        {
          fixture_name: 'SS304 20-Pack Amazon Baseline',
          description: 'Standard 20-pack baseline calculation',
          inputs: { asp: 499.00, landed_cogs: 326.00, channel_fees: 160.97 },
          expected_outputs: { net_contribution_inr: 12.03, contribution_margin_pct: 2.41, is_contribution_positive: true },
          tolerance: 0.05
        },
        {
          fixture_name: 'Handcrafted Soy Candle High Margin',
          description: 'Direct D2C candle sale with high contribution margin',
          inputs: { asp: 899.00, landed_cogs: 210.00, channel_fees: 95.00 },
          expected_outputs: { net_contribution_inr: 594.00, contribution_margin_pct: 66.07, is_contribution_positive: true },
          tolerance: 0.1
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Management Accounting: Standard Unit Contribution Framework',
      evaluator: (inputs) => {
        const { asp, landed_cogs, channel_fees } = inputs;
        if (!asp || asp <= 0 || landed_cogs === undefined || channel_fees === undefined) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Non-positive ASP or undefined costs.',
            outputs: { net_contribution_inr: 0, contribution_margin_pct: 0, is_contribution_positive: false },
            warnings: ['DATA INSUFFICIENT: Valid ASP and cost inputs required.'],
            execution_notes: 'Contribution evaluation aborted.'
          };
        }
        const netCm = asp - landed_cogs - channel_fees;
        const cmPct = (netCm / asp) * 100;
        const isPos = netCm > 0;
        return {
          success: true,
          data_insufficient: false,
          outputs: {
            net_contribution_inr: Number(netCm.toFixed(2)),
            contribution_margin_pct: Number(cmPct.toFixed(2)),
            is_contribution_positive: isPos
          },
          warnings: !isPos ? ['NEGATIVE CONTRIBUTION: Order generates a cash loss on every sale.'] : [],
          execution_notes: `Net contribution of ₹${netCm.toFixed(2)} (${cmPct.toFixed(1)}%).`
        };
      }
    });

    // 2. Amazon FBA Weight Handling Surcharge Cliff
    this.registerModel({
      model_id: 'EQ-FBA-WEIGHT-CLIFF-v1.0.0',
      version: '1.0.0',
      classification: 'EQUATION',
      name: 'Amazon FBA Step-Function Weight Surcharge',
      description: 'Calculates the discontinuous non-linear jump in Amazon weight handling fees at the 500g threshold.',
      latex_or_formula: 'Fee = Base + [W > 500] * (StepFee + ceil((W - 500)/500) * SlabFee)',
      admission_spec: {
        commercial_question: 'Does package gross weight exceed the critical 500g FBA fee tier boundary?',
        methodology_rationale: 'Published Amazon India FBA rate card slab calculation identity.',
        applicable_entities: ['PackOffer'],
        applicable_categories: ['*'],
        applicable_channels: ['D2C', 'MARKETPLACE'],
        assumptions_and_limitations: ['Standard parcel national handling rates.'],
        uncertainty_methodology: 'Deterministic rate card identity.',
        data_insufficient_conditions: ['Package weight <= 0.'],
        empirical_validation_protocol: 'Reconciled against monthly Amazon settlement fee report.'
      },
      input_schemas: [
        { name: 'Gross Weight', symbol: 'package_weight_g', description: 'Total packaged shipment weight', unit: 'g', data_type: 'number', required: true, default_value: 485, min_value: 1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Base Fee Under 500g', symbol: 'base_fee', description: 'Base handling under 500g', unit: 'INR', data_type: 'number', required: true, default_value: 35, min_value: 0, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Incremental Slab Surcharge', symbol: 'slab_surcharge', description: 'Cost per additional 500g slab', unit: 'INR', data_type: 'number', required: true, default_value: 24, min_value: 0, epistemic_class: 'OBSERVED_FACT' }
      ],
      output_schemas: [
        { name: 'Weight Handling Fee', symbol: 'weight_fee_inr', description: 'Total Amazon weight fee', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Cliff Breach Flag', symbol: 'cliff_breached', description: 'True if weight exceeds 500g', unit: 'boolean', data_type: 'boolean' },
        { name: 'Weight Headroom', symbol: 'headroom_g', description: 'Grams remaining before next slab', unit: 'g', data_type: 'number' }
      ],
      sensitivities: [
        { variable_symbol: 'package_weight_g', variable_name: 'Weight', base_value: 485, test_range: [450, 550], expected_direction: 'NON_LINEAR', notes: 'Severe fee discontinuity jump at 500.01g' }
      ],
      fixtures: [
        {
          fixture_name: 'Sub-500g Hero Pack (485g)',
          description: 'Under 500g boundary enjoying base rate',
          inputs: { package_weight_g: 485, base_fee: 35, slab_surcharge: 24 },
          expected_outputs: { weight_fee_inr: 35.0, cliff_breached: false, headroom_g: 15 },
          tolerance: 0.1
        },
        {
          fixture_name: 'Over-500g Pack (520g)',
          description: 'Crossing 500g trigger +24 INR fee penalty',
          inputs: { package_weight_g: 520, base_fee: 35, slab_surcharge: 24 },
          expected_outputs: { weight_fee_inr: 59.0, cliff_breached: true, headroom_g: 480 },
          tolerance: 0.1
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Amazon India FBA Rate Card 2026',
      evaluator: (inputs) => {
        const { package_weight_g, base_fee, slab_surcharge } = inputs;
        if (!package_weight_g || package_weight_g <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Weight missing or non-positive.',
            outputs: { weight_fee_inr: 0, cliff_breached: false, headroom_g: 0 },
            warnings: ['DATA INSUFFICIENT: Gross weight must be specified.'],
            execution_notes: 'Weight handling calculation aborted.'
          };
        }
        if (package_weight_g <= 500) {
          return {
            success: true,
            data_insufficient: false,
            outputs: {
              weight_fee_inr: Number(base_fee.toFixed(2)),
              cliff_breached: false,
              headroom_g: 500 - package_weight_g
            },
            warnings: package_weight_g > 480 ? ['WARNING: Weight within 20g of the 500g cliff boundary.'] : [],
            execution_notes: 'Under 500g base tier.'
          };
        }
        const extraGrams = package_weight_g - 500;
        const slabs = Math.ceil(extraGrams / 500);
        const totalFee = base_fee + slabs * slab_surcharge;
        const headroom = slabs * 500 - extraGrams;
        return {
          success: true,
          data_insufficient: false,
          outputs: {
            weight_fee_inr: Number(totalFee.toFixed(2)),
            cliff_breached: true,
            headroom_g: headroom
          },
          warnings: ['FBA WEIGHT CLIFF BREACHED: Fee inflated by additional weight tier.'],
          execution_notes: `Weight of ${package_weight_g}g pushed into ${slabs} additional 500g slab(s).`
        };
      }
    });

    // 3. Make-vs-Buy Tooling Crossover Break-Even
    this.registerModel({
      model_id: 'EQ-MAKE-BUY-CROSSOVER-v1.0.0',
      version: '1.0.0',
      classification: 'EQUATION',
      name: 'Make-vs-Buy Tooling Inflection Crossover',
      description: 'Unit inflection volume and payback timeline where capital investment in tooling beats third-party finished procurement, parameterized by monthly production run rate.',
      latex_or_formula: 'Q* = Capex / (Unit_Buy_Price - Unit_Make_Cost); Months = Q* / Monthly_Run_Rate',
      admission_spec: {
        commercial_question: 'At what production volume and timeline does in-house tooling beat third-party procurement?',
        methodology_rationale: 'Classical microeconomic capital expenditure payback identity.',
        applicable_entities: ['Product', 'Opportunity'],
        applicable_categories: ['Industrial Hardware & Consumables', 'Plumbing', 'Electrical'],
        applicable_channels: ['*'],
        assumptions_and_limitations: [
          'Unit buy price strictly exceeds unit make cost (positive unit savings).',
          'Payback duration requires explicit monthly run-rate volume; null is returned if volume is unspecified or zero.'
        ],
        uncertainty_methodology: 'Deterministic algebraic crossover.',
        data_insufficient_conditions: [
          'Tooling capex <= 0 or unit make cost >= unit buy price (no manufacturing savings).'
        ],
        empirical_validation_protocol: 'Validated against quoting quotes from tooling machine shops in Howrah / Jalandhar.'
      },
      input_schemas: [
        { name: 'Tooling Capex', symbol: 'tooling_capex_inr', description: 'Die, mold or press capex', unit: 'INR', data_type: 'number', required: true, default_value: 380000, min_value: 1000, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Finished Unit Buy Price', symbol: 'unit_buy_price', description: 'Outsourced unit purchase cost', unit: 'INR', data_type: 'number', required: true, default_value: 14.20, min_value: 0.1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'In-House Unit Make Cost', symbol: 'unit_make_cost', description: 'Raw material + labor + power cost', unit: 'INR', data_type: 'number', required: true, default_value: 9.45, min_value: 0.1, epistemic_class: 'ESTIMATED_VALUE' },
        { name: 'Monthly Run-Rate Volume', symbol: 'monthly_run_rate_units', description: 'Expected monthly sales/production volume to amortize tooling', unit: 'units/month', data_type: 'number', required: false, default_value: 10000, min_value: 0, epistemic_class: 'SCENARIO_ASSUMPTION' }
      ],
      output_schemas: [
        { name: 'Inflection Units', symbol: 'break_even_units', description: 'Units required to amortize tooling', unit: 'units', data_type: 'number', precision: 0 },
        { name: 'Unit Savings', symbol: 'unit_savings_inr', description: 'Gross savings per unit manufactured', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Payback Months', symbol: 'months_to_payback', description: 'Payback duration at specified monthly run rate (null if run-rate missing or zero)', unit: 'months', data_type: 'number', precision: 1 },
        { name: 'Payback at 10k Monthly', symbol: 'months_to_payback_at_10k', description: 'Payback duration at 10,000 units/month (reference benchmark)', unit: 'months', data_type: 'number', precision: 1 }
      ],
      sensitivities: [
        { variable_symbol: 'unit_buy_price', variable_name: 'Buy Price', base_value: 14.20, test_range: [11, 18], expected_direction: 'NEGATIVE', notes: 'Higher buy price lowers inflection unit volume' }
      ],
      fixtures: [
        {
          fixture_name: 'Howrah Progressive Stamping Die #001',
          description: 'Standard 4-stage progressive die for SS304 worm gear clamp band with 10k/mo run rate',
          inputs: { tooling_capex_inr: 380000, unit_buy_price: 14.20, unit_make_cost: 9.45, monthly_run_rate_units: 10000 },
          expected_outputs: { break_even_units: 80000, unit_savings_inr: 4.75, months_to_payback: 8.0, months_to_payback_at_10k: 8.0 },
          tolerance: 0.5
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Managerial Economics & Operations Research',
      evaluator: (inputs) => {
        const { tooling_capex_inr, unit_buy_price, unit_make_cost, monthly_run_rate_units } = inputs;
        if (!tooling_capex_inr || tooling_capex_inr <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Tooling capex must be strictly positive (> 0).',
            outputs: { break_even_units: 0, unit_savings_inr: 0, months_to_payback: null, months_to_payback_at_10k: null },
            warnings: ['DATA INSUFFICIENT: Tooling investment must be positive.'],
            execution_notes: 'Capex non-positive; crossover evaluation aborted.'
          };
        }
        if (!unit_buy_price || unit_buy_price <= 0 || !unit_make_cost || unit_make_cost <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Unit buy price and unit make cost must be strictly positive (> 0).',
            outputs: { break_even_units: 0, unit_savings_inr: 0, months_to_payback: null, months_to_payback_at_10k: null },
            warnings: ['DATA INSUFFICIENT: Positive pricing parameters required.'],
            execution_notes: 'Pricing non-positive; crossover evaluation aborted.'
          };
        }
        const delta = unit_buy_price - unit_make_cost;
        if (delta <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Unit buy price does not exceed unit make cost (no manufacturing arbitrage).',
            outputs: { break_even_units: 0, unit_savings_inr: Number(delta.toFixed(2)), months_to_payback: null, months_to_payback_at_10k: null },
            warnings: ['DATA INSUFFICIENT: In-house manufacturing provides zero unit margin advantage over procurement.'],
            execution_notes: 'Make-vs-buy crossover unachievable (non-positive savings per unit).'
          };
        }
        const beUnits = Math.round(tooling_capex_inr / delta);
        const monthsAt10k = Number((beUnits / 10000).toFixed(1));
        let monthsToPayback: number | null = null;
        const warnings: string[] = [];

        if (monthly_run_rate_units !== undefined && monthly_run_rate_units !== null) {
          if (monthly_run_rate_units > 0) {
            monthsToPayback = Number((beUnits / monthly_run_rate_units).toFixed(1));
          } else {
            warnings.push('ZERO RUN-RATE: Monthly volume is 0; payback timeline cannot amortize tooling investment.');
          }
        }

        if (beUnits > 200000) {
          warnings.push('HIGH AMORTIZATION RISK: Break-even volume exceeds 200,000 units; multi-year volume commitments required.');
        }

        return {
          success: true,
          data_insufficient: false,
          outputs: {
            break_even_units: beUnits,
            unit_savings_inr: Number(delta.toFixed(2)),
            months_to_payback: monthsToPayback,
            months_to_payback_at_10k: monthsAt10k
          },
          warnings,
          execution_notes: monthsToPayback !== null
            ? `Tooling amortized at ${beUnits.toLocaleString()} units (${monthsToPayback} months at ${monthly_run_rate_units}/mo).`
            : `Tooling amortized at ${beUnits.toLocaleString()} units (monthly run-rate unspecified; payback months omitted).`
        };
      }
    });

    // 4. B2B Accounts Receivable Credit Drag
    this.registerModel({
      model_id: 'EQ-B2B-CREDIT-DRAG-v1.0.0',
      version: '1.0.0',
      classification: 'EQUATION',
      name: 'B2B Trade Credit Capital Drag & Financing Cost',
      description: 'Calculates the tied-up working capital and annual financing cost imposed by net-30 / net-60 / net-90 payment terms.',
      latex_or_formula: 'Locked_Capital = (Annual_Sales * DSO) / 365; Financing_Cost = Locked_Capital * Cost_Of_Capital_Pct',
      admission_spec: {
        commercial_question: 'What is the true working capital burden of offering 60-day credit to wholesale distributors?',
        methodology_rationale: 'Corporate working capital and cash conversion cycle identity.',
        applicable_entities: ['Opportunity', 'BuyerSegment'],
        applicable_categories: ['*'],
        applicable_channels: ['B2B', 'DISTRIBUTOR'],
        assumptions_and_limitations: ['DSO reflects actual collection experience, not merely invoice terms.'],
        uncertainty_methodology: 'Exact accounting working capital identity.',
        data_insufficient_conditions: ['Annual sales <= 0 or DSO < 0.'],
        empirical_validation_protocol: 'Audit against audited balance sheet trade receivables.'
      },
      input_schemas: [
        { name: 'Annual Wholesale Sales', symbol: 'annual_sales_inr', description: 'Annualized gross invoice value', unit: 'INR', data_type: 'number', required: true, default_value: 2400000, min_value: 1, epistemic_class: 'SCENARIO_ASSUMPTION' },
        { name: 'Days Sales Outstanding', symbol: 'dso_days', description: 'Average collection cycle in days', unit: 'days', data_type: 'number', required: true, default_value: 60, min_value: 0, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Cost of Working Capital', symbol: 'cost_of_capital_pct', description: 'Bank overdraft / credit facility interest rate', unit: '%', data_type: 'number', required: true, default_value: 12.0, min_value: 0, epistemic_class: 'OBSERVED_FACT' }
      ],
      output_schemas: [
        { name: 'Locked Working Capital', symbol: 'locked_receivables_inr', description: 'Average receivables balance', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Annual Financing Drag', symbol: 'annual_financing_cost_inr', description: 'Cost of funding receivables', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Margin Erosion Pct', symbol: 'effective_margin_drag_pct', description: 'Percentage of revenue lost to credit financing', unit: '%', data_type: 'number', precision: 2 }
      ],
      sensitivities: [
        { variable_symbol: 'dso_days', variable_name: 'DSO', base_value: 60, test_range: [30, 90], expected_direction: 'POSITIVE', notes: 'Linear inflation of locked capital' }
      ],
      fixtures: [
        {
          fixture_name: 'Industrial Distributor 60-Day Terms',
          description: '₹24L turnover with 60-day credit at 12% bank interest',
          inputs: { annual_sales_inr: 2400000, dso_days: 60, cost_of_capital_pct: 12.0 },
          expected_outputs: { locked_receivables_inr: 394520.55, annual_financing_cost_inr: 47342.47, effective_margin_drag_pct: 1.97 },
          tolerance: 10
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Corporate Finance & Working Capital Management',
      evaluator: (inputs) => {
        const { annual_sales_inr, dso_days, cost_of_capital_pct } = inputs;
        if (!annual_sales_inr || annual_sales_inr <= 0 || dso_days < 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Sales non-positive or negative DSO.',
            outputs: { locked_receivables_inr: 0, annual_financing_cost_inr: 0, effective_margin_drag_pct: 0 },
            warnings: ['DATA INSUFFICIENT: Sales volume and DSO required.'],
            execution_notes: 'Credit calculation aborted.'
          };
        }
        const locked = (annual_sales_inr * dso_days) / 365;
        const financingCost = locked * (cost_of_capital_pct / 100);
        const dragPct = (financingCost / annual_sales_inr) * 100;
        return {
          success: true,
          data_insufficient: false,
          outputs: {
            locked_receivables_inr: Number(locked.toFixed(2)),
            annual_financing_cost_inr: Number(financingCost.toFixed(2)),
            effective_margin_drag_pct: Number(dragPct.toFixed(2))
          },
          warnings: dso_days > 75 ? ['High credit drag: DSO > 75 days severely impairs working capital velocity.'] : [],
          execution_notes: `₹${Math.round(locked).toLocaleString()} locked continuously in trade receivables.`
        };
      }
    });

    // 5. Fragility, Spoilage & Breakage Margin Erosion
    this.registerModel({
      model_id: 'EQ-BREAKAGE-SPOILAGE-COST-v1.0.0',
      version: '1.0.0',
      classification: 'EQUATION',
      name: 'Transit Fragility & Spoilage Margin Erosion',
      description: 'Quantifies the landed cost inflation and replacement burden caused by transit breakage in fragile categories (clay diyas, glass candles). Operable for 0 <= breakage < 100%.',
      latex_or_formula: 'Effective_Unit_Cost = Landed_Cost / (1 - Breakage_Rate)',
      admission_spec: {
        commercial_question: 'How much does in-transit breakage and unrecoverable damage inflate true COGS in fragile product categories?',
        methodology_rationale: 'Shrinkage & breakage replacement accounting identity.',
        applicable_entities: ['Product', 'Opportunity'],
        applicable_categories: ['Home & Seasonal Handicrafts', 'Wellness & Home Fragrance', 'Décor'],
        applicable_channels: ['D2C', 'MARKETPLACE', 'RETAIL'],
        assumptions_and_limitations: [
          'Mathematical formula operable across domain 0 <= breakage < 100% (at 100%, replacement is impossible).',
          'Operational viability threshold is < 50%; breakage rates >= 50% trigger high-severity operational hazard alerts.'
        ],
        uncertainty_methodology: 'Deterministic shrinkage replacement formula.',
        data_insufficient_conditions: ['Breakage rate < 0% or >= 100%, or base landed cost <= 0.'],
        empirical_validation_protocol: 'Cross-checked against customer return reason reports and courier damage claims.'
      },
      input_schemas: [
        { name: 'Base Landed Unit Cost', symbol: 'base_landed_cost_inr', description: 'Nominal ex-warehouse unit cost', unit: 'INR', data_type: 'number', required: true, default_value: 8.50, min_value: 0.1, epistemic_class: 'DERIVED_OUTPUT' },
        { name: 'Observed Breakage / Spoilage Rate', symbol: 'breakage_rate_pct', description: 'Percentage of units damaged in transit', unit: '%', data_type: 'number', required: true, default_value: 8.5, min_value: 0, max_value: 99.9, epistemic_class: 'OBSERVED_FACT' }
      ],
      output_schemas: [
        { name: 'Adjusted Unit Landed Cost', symbol: 'adjusted_unit_cost_inr', description: 'True effective landed cost per deliverable unit', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Breakage Penalty Per Unit', symbol: 'breakage_cost_per_unit_inr', description: 'Incremental cost per good unit', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Cost Inflation Pct', symbol: 'cogs_inflation_pct', description: 'Percentage inflation in COGS', unit: '%', data_type: 'number', precision: 2 }
      ],
      sensitivities: [
        { variable_symbol: 'breakage_rate_pct', variable_name: 'Breakage Rate', base_value: 8.5, test_range: [2, 18], expected_direction: 'POSITIVE', notes: 'Severe margin erosion above 10%' }
      ],
      fixtures: [
        {
          fixture_name: 'Terracotta Diya 8.5% Breakage',
          description: 'Fragile terracotta pottery during Diwali shipping courier handling',
          inputs: { base_landed_cost_inr: 8.50, breakage_rate_pct: 8.5 },
          expected_outputs: { adjusted_unit_cost_inr: 9.29, breakage_cost_per_unit_inr: 0.79, cogs_inflation_pct: 9.29 },
          tolerance: 0.05
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Supply Chain Loss Prevention & Inventory Shrinkage Standards',
      evaluator: (inputs) => {
        const { base_landed_cost_inr, breakage_rate_pct } = inputs;
        if (!base_landed_cost_inr || base_landed_cost_inr <= 0 || breakage_rate_pct === undefined || breakage_rate_pct < 0 || breakage_rate_pct >= 100) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Invalid breakage rate (must be 0 <= rate < 100%) or non-positive base landed cost.',
            outputs: { adjusted_unit_cost_inr: base_landed_cost_inr || 0, breakage_cost_per_unit_inr: 0, cogs_inflation_pct: 0 },
            warnings: ['DATA INSUFFICIENT: Breakage rate outside operable mathematical domain [0%, 100%).'],
            execution_notes: 'Breakage evaluation aborted.'
          };
        }
        const r = breakage_rate_pct / 100;
        const adjusted = base_landed_cost_inr / (1 - r);
        const penalty = adjusted - base_landed_cost_inr;
        const inflation = (penalty / base_landed_cost_inr) * 100;
        const warnings: string[] = [];

        if (breakage_rate_pct >= 50) {
          warnings.push('HIGH OPERATIONAL HAZARD: Breakage rate >= 50% indicates severe packaging or carrier failure. Commercial distribution unviable without structural packaging overhaul.');
        } else if (breakage_rate_pct > 10) {
          warnings.push('ELEVATED FRAGILITY: Breakage exceeds 10%, necessitating protective packaging redesign.');
        }

        return {
          success: true,
          data_insufficient: false,
          outputs: {
            adjusted_unit_cost_inr: Number(adjusted.toFixed(2)),
            breakage_cost_per_unit_inr: Number(penalty.toFixed(2)),
            cogs_inflation_pct: Number(inflation.toFixed(2))
          },
          warnings,
          execution_notes: `True unit COGS inflated from ₹${base_landed_cost_inr} to ₹${adjusted.toFixed(2)} (${inflation.toFixed(1)}% inflation).`
        };
      }
    });

    // 5b. Deterministic Scenario Factor Sensitivity Slope
    this.registerModel({
      model_id: 'EQ-FACTOR-SENSITIVITY-SLOPE-v1.0.0',
      version: '1.0.0',
      classification: 'EQUATION',
      name: 'Deterministic Scenario Factor Sensitivity Ratio',
      description: 'Calculates the linear deterministic ratio of unit margin shift per 1% change in underlying factor (commodity, freight, currency). Declares explicit units (INR/%) and safe zero-denominator handling.',
      latex_or_formula: 'Sensitivity_Slope = Delta_Unit_Margin / Delta_Factor_Pct',
      admission_spec: {
        commercial_question: 'What is the deterministic margin shift per 1% change in a specified cost or market factor under scenario assumptions?',
        methodology_rationale: 'Linear comparative-static sensitivity quotient identity.',
        applicable_entities: ['Product', 'Opportunity', 'MarketFactor'],
        applicable_categories: ['*'],
        applicable_channels: ['*'],
        assumptions_and_limitations: [
          'Linear sensitivity without cross-factor interactions or nonlinear substitution curves.',
          'Zero-denominator factor volatility is safely trapped and returns DATA INSUFFICIENT.'
        ],
        uncertainty_methodology: 'Deterministic sensitivity arithmetic.',
        data_insufficient_conditions: ['Factor volatility percentage <= 0 or missing.'],
        empirical_validation_protocol: 'Cross-audited against single-factor stress test scenarios.'
      },
      input_schemas: [
        { name: 'Factor Volatility Movement', symbol: 'factor_volatility_pct', description: 'Percentage change in underlying factor', unit: '%', data_type: 'number', required: true, default_value: 28.0, min_value: 0.1, epistemic_class: 'SCENARIO_ASSUMPTION' },
        { name: 'Derived Unit Margin Shift', symbol: 'unit_margin_shift_inr', description: 'Simulated unit margin impact', unit: 'INR', data_type: 'number', required: true, default_value: -3.20, epistemic_class: 'DERIVED_OUTPUT' }
      ],
      output_schemas: [
        { name: 'Sensitivity Slope', symbol: 'sensitivity_slope_inr_per_pct', description: 'Margin impact in INR per 1% factor move', unit: 'INR/%', data_type: 'number', precision: 3 },
        { name: 'Is Negative Exposure', symbol: 'is_negative_exposure', description: 'True if factor increase reduces margins', unit: 'boolean', data_type: 'boolean' }
      ],
      sensitivities: [],
      fixtures: [
        {
          fixture_name: 'LME Nickel 28% Surge to -₹3.20 Margin Shock',
          description: '+28% nickel spike driving ₹3.20 margin drop yields -0.114 INR/%',
          inputs: { factor_volatility_pct: 28.0, unit_margin_shift_inr: -3.20 },
          expected_outputs: { sensitivity_slope_inr_per_pct: -0.114, is_negative_exposure: true },
          tolerance: 0.005
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Managerial Economics: Comparative Statics & Sensitivity Analysis',
      evaluator: (inputs) => {
        const { factor_volatility_pct, unit_margin_shift_inr } = inputs;
        if (factor_volatility_pct === undefined || !Number.isFinite(factor_volatility_pct) || factor_volatility_pct <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Factor volatility percentage must be strictly positive and finite (> 0).',
            outputs: { sensitivity_slope_inr_per_pct: 0, is_negative_exposure: false },
            warnings: ['ZERO DENOMINATOR: Cannot divide by zero or negative factor volatility.'],
            execution_notes: 'Sensitivity slope undefined with zero or non-positive denominator; non-finite return prevented.'
          };
        }
        if (unit_margin_shift_inr === undefined || !Number.isFinite(unit_margin_shift_inr)) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Unit margin shift must be a valid finite number.',
            outputs: { sensitivity_slope_inr_per_pct: 0, is_negative_exposure: false },
            warnings: ['DATA INSUFFICIENT: Unit margin shift missing or non-finite.'],
            execution_notes: 'Sensitivity evaluation aborted.'
          };
        }
        const slope = Number((unit_margin_shift_inr / factor_volatility_pct).toFixed(3));
        return {
          success: true,
          data_insufficient: false,
          outputs: {
            sensitivity_slope_inr_per_pct: slope,
            is_negative_exposure: slope < 0
          },
          warnings: [],
          execution_notes: `Deterministic sensitivity slope of ${slope} INR/% across factor shock of ${factor_volatility_pct}%.`
        };
      }
    });

    // --------------------------------------------------------------------------
    // B. ANALYTICAL MODELS (Estimation, Simulation & Behavioral)
    // --------------------------------------------------------------------------

    // 6. Seasonal Sell-Through & Clearance Liquidation Model
    this.registerModel({
      model_id: 'MOD-SEASONAL-SELLTHROUGH-v1.0.0',
      version: '1.0.0',
      classification: 'ANALYTICAL_MODEL',
      name: 'Festive Seasonal Sell-Through & Markdown Liquidation Model',
      description: 'Simulates net campaign profitability across a tight seasonal demand window (e.g. Diwali diyas, Rakhi gifting), accounting for post-event unsold inventory markdown liquidation.',
      latex_or_formula: 'Net_Profit = (Q_sold * (ASP - Fees) + Q_unsold * Salvage_Price) - Q_total * Landed_Cost',
      admission_spec: {
        commercial_question: 'What is the risk-adjusted profit of seasonal procurement given that unsold units lose 70% value after the event?',
        methodology_rationale: 'Newsvendor-style seasonal inventory clearance expectation framework.',
        applicable_entities: ['Opportunity', 'EventSeason'],
        applicable_categories: ['Home & Seasonal Handicrafts', 'Gifting', 'Seasonal Home Decor'],
        applicable_channels: ['D2C', 'MARKETPLACE', 'RETAIL'],
        assumptions_and_limitations: ['Post-event salvage price is strictly below landed cost.'],
        uncertainty_methodology: 'Scenario-based expected value across sell-through percentages.',
        data_insufficient_conditions: ['Procurement volume <= 0 or ASP <= 0.'],
        empirical_validation_protocol: 'Historical reconciliation across Q3/Q4 festival sales cycles.'
      },
      input_schemas: [
        { name: 'Procured Batch Volume', symbol: 'total_batch_units', description: 'Total units pre-ordered for seasonal run', unit: 'units', data_type: 'number', required: true, default_value: 2000, min_value: 10, epistemic_class: 'SCENARIO_ASSUMPTION' },
        { name: 'Landed Unit Cost', symbol: 'unit_landed_cost', description: 'All-in cost to procure and package', unit: 'INR', data_type: 'number', required: true, default_value: 11.50, min_value: 0.5, epistemic_class: 'DERIVED_OUTPUT' },
        { name: 'Peak Season ASP', symbol: 'peak_asp', description: 'Target retail price during event peak', unit: 'INR', data_type: 'number', required: true, default_value: 39.00, min_value: 1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Marketplace Fees Per Unit', symbol: 'channel_fees_per_unit', description: 'Fulfillment & commission during peak', unit: 'INR', data_type: 'number', required: true, default_value: 12.00, min_value: 0, epistemic_class: 'DERIVED_OUTPUT' },
        { name: 'Observed Sell-Through Rate', symbol: 'sell_through_pct', description: 'Percentage sold before event cutoff', unit: '%', data_type: 'number', required: true, default_value: 80, min_value: 10, max_value: 100, epistemic_class: 'ESTIMATED_VALUE' },
        { name: 'Post-Event Salvage Recovery Rate', symbol: 'salvage_recovery_pct', description: 'Percentage of landed cost recovered at salvage', unit: '%', data_type: 'number', required: true, default_value: 30, min_value: 0, max_value: 100, epistemic_class: 'ESTIMATED_VALUE' }
      ],
      output_schemas: [
        { name: 'Total Revenue Generated', symbol: 'total_revenue_inr', description: 'Peak revenue + salvage revenue', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Net Campaign Profit', symbol: 'net_campaign_profit_inr', description: 'Total revenue less COGS and fees', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Campaign ROI Pct', symbol: 'campaign_roi_pct', description: 'Return on capital deployed', unit: '%', data_type: 'number', precision: 2 },
        { name: 'Unsold Inventory Write-Off', symbol: 'unsold_units_loss_inr', description: 'Dead capital loss from unsold stock', unit: 'INR', data_type: 'number', precision: 2 }
      ],
      sensitivities: [
        { variable_symbol: 'sell_through_pct', variable_name: 'Sell Through', base_value: 80, test_range: [50, 95], expected_direction: 'POSITIVE', notes: 'Severe downside cliff below 65% sell-through' }
      ],
      fixtures: [
        {
          fixture_name: 'Terracotta Diya 2000 Units Campaign',
          description: '2000 units pre-ordered for Diwali peak at 80% sell-through',
          inputs: { total_batch_units: 2000, unit_landed_cost: 11.50, peak_asp: 39.00, channel_fees_per_unit: 12.00, sell_through_pct: 80, salvage_recovery_pct: 30 },
          expected_outputs: { total_revenue_inr: 63780.0, net_campaign_profit_inr: 21580.0, campaign_roi_pct: 93.83, unsold_units_loss_inr: 3220.0 },
          tolerance: 0.1
        }
      ],
      dependencies: ['EQ-BREAKAGE-SPOILAGE-COST-v1.0.0'],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Operations Management: Newsvendor & Seasonal Inventory Control',
      evaluator: (inputs) => {
        const { total_batch_units, unit_landed_cost, peak_asp, channel_fees_per_unit, sell_through_pct, salvage_recovery_pct } = inputs;
        if (!total_batch_units || total_batch_units <= 0 || !unit_landed_cost || unit_landed_cost <= 0 || !peak_asp || peak_asp <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Batch size, landed cost, and peak ASP must be strictly positive (> 0).',
            outputs: { total_revenue_inr: 0, net_campaign_profit_inr: 0, campaign_roi_pct: 0, unsold_units_loss_inr: 0 },
            warnings: ['DATA INSUFFICIENT: Seasonal simulation requires non-zero positive batch and price parameters.'],
            execution_notes: 'Simulation aborted.'
          };
        }
        if (sell_through_pct === undefined || sell_through_pct < 0 || sell_through_pct > 100 || salvage_recovery_pct === undefined || salvage_recovery_pct < 0 || salvage_recovery_pct > 100) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Sell-through and salvage recovery percentages must be bounded between 0% and 100%.',
            outputs: { total_revenue_inr: 0, net_campaign_profit_inr: 0, campaign_roi_pct: 0, unsold_units_loss_inr: 0 },
            warnings: ['DATA INSUFFICIENT: Percentage inputs out of valid domain [0, 100].'],
            execution_notes: 'Simulation aborted due to invalid percentage range.'
          };
        }
        const soldUnits = Math.round((total_batch_units * sell_through_pct) / 100);
        const unsoldUnits = total_batch_units - soldUnits;
        const peakGross = soldUnits * peak_asp;
        const peakFees = soldUnits * channel_fees_per_unit;
        const salvagePerUnit = unit_landed_cost * (salvage_recovery_pct / 100);
        const salvageRevenue = unsoldUnits * salvagePerUnit;
        const totalRev = peakGross + salvageRevenue;
        const totalCogs = total_batch_units * unit_landed_cost;
        const netProfit = (peakGross - peakFees + salvageRevenue) - totalCogs;
        const roi = (netProfit / totalCogs) * 100;
        const unsoldLoss = unsoldUnits * (unit_landed_cost - salvagePerUnit);

        return {
          success: true,
          data_insufficient: false,
          outputs: {
            total_revenue_inr: Number(totalRev.toFixed(2)),
            net_campaign_profit_inr: Number(netProfit.toFixed(2)),
            campaign_roi_pct: Number(roi.toFixed(2)),
            unsold_units_loss_inr: Number(unsoldLoss.toFixed(2))
          },
          warnings: sell_through_pct < 70 ? ['HIGH CLEARANCE RISK: Sell-through under 70% results in severe markdown drag.'] : [],
          execution_notes: `Simulated ${soldUnits} peak sales and ${unsoldUnits} salvage clearance units.`
        };
      }
    });

    // 7. D2C CAC, Repeat Frequency & 12-Month Cohort LTV Payback Model
    this.registerModel({
      model_id: 'MOD-D2C-LTV-CAC-PAYBACK-v1.0.0',
      version: '1.0.0',
      classification: 'ANALYTICAL_MODEL',
      name: 'D2C Unit Economics, Repeat Velocity & 12-Month Cohort Contribution Model',
      description: 'Calculates Customer Acquisition Cost (CAC), Average Order Value (AOV), and 12-month cohort gross margin contribution (12M LTV Proxy) for branded D2C products (e.g. Soy Candles, Fragrance). Assumes zero retention beyond 12 months.',
      latex_or_formula: 'Cohort_12M_CM = CM_first + (Annual_Repeat_Orders * CM_repeat); Payback_Ratio = Cohort_12M_CM / CAC',
      admission_spec: {
        commercial_question: 'Does the 12-month customer repurchase frequency justify initial digital marketing acquisition costs?',
        methodology_rationale: '12-month cohort customer margin contribution and acquisition payback model (finite-horizon LTV proxy).',
        applicable_entities: ['Opportunity', 'Product'],
        applicable_categories: ['Wellness & Home Fragrance', 'Gifting', 'D2C White-Label'],
        applicable_channels: ['D2C'],
        assumptions_and_limitations: [
          'Calculates cumulative margin contribution over a strictly bounded 12-month horizon (12M LTV Proxy).',
          'Assumes 0% customer retention beyond 12 months unless extended cohort retention curve data is supplied.',
          'Annual repeat orders must be non-negative (>= 0).'
        ],
        uncertainty_methodology: 'Cohort sensitivity analysis across acquisition CAC and repeat frequency.',
        data_insufficient_conditions: ['CAC <= 0, AOV <= 0, or annual repeat orders < 0.'],
        empirical_validation_protocol: 'Cross-checked with Meta/Google Ads blended ROAS and Shopify repeat purchase cohorts.'
      },
      input_schemas: [
        { name: 'Customer Acquisition Cost (CAC)', symbol: 'cac_inr', description: 'Blended cost to acquire one paying customer', unit: 'INR', data_type: 'number', required: true, default_value: 320, min_value: 10, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Average Order Value (AOV)', symbol: 'aov_inr', description: 'Average gross checkout basket size', unit: 'INR', data_type: 'number', required: true, default_value: 899, min_value: 50, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Contribution Margin Pct', symbol: 'contribution_margin_pct', description: 'Net margin after COGS, picking, and shipping', unit: '%', data_type: 'number', required: true, default_value: 52.0, min_value: 5, epistemic_class: 'DERIVED_OUTPUT' },
        { name: 'Annual Repeat Orders Per Customer', symbol: 'annual_repeat_orders', description: 'Average repurchases within 12 months', unit: 'orders', data_type: 'number', required: true, default_value: 1.4, min_value: 0, epistemic_class: 'ESTIMATED_VALUE' }
      ],
      output_schemas: [
        { name: 'First Order Contribution', symbol: 'first_order_cm_inr', description: 'Contribution on transaction #1', unit: 'INR', data_type: 'number', precision: 2 },
        { name: '12-Month LTV Contribution', symbol: 'ltv_contribution_inr', description: '12-month cohort cumulative gross margin contribution (LTV proxy)', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'LTV to CAC Ratio', symbol: 'ltv_cac_ratio', description: 'Ratio of 12-month cohort value to CAC', unit: 'ratio', data_type: 'number', precision: 2 },
        { name: 'First Order Payback Flag', symbol: 'is_profitable_on_first_order', description: 'True if First Order CM > CAC', unit: 'boolean', data_type: 'boolean' }
      ],
      sensitivities: [
        { variable_symbol: 'cac_inr', variable_name: 'CAC', base_value: 320, test_range: [200, 600], expected_direction: 'NEGATIVE', notes: 'Higher CAC directly compresses payback ratio' }
      ],
      fixtures: [
        {
          fixture_name: 'Luxury Soy Candle D2C Cohort',
          description: 'Aromatherapy candle basket with ₹899 AOV and ₹320 CAC',
          inputs: { cac_inr: 320, aov_inr: 899, contribution_margin_pct: 52.0, annual_repeat_orders: 1.4 },
          expected_outputs: { first_order_cm_inr: 467.48, ltv_contribution_inr: 1121.95, ltv_cac_ratio: 3.51, is_profitable_on_first_order: true },
          tolerance: 0.1
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Direct-to-Consumer Unit Economics & Finite-Horizon Retention Frameworks',
      evaluator: (inputs) => {
        const { cac_inr, aov_inr, contribution_margin_pct, annual_repeat_orders } = inputs;
        if (!cac_inr || cac_inr <= 0 || !aov_inr || aov_inr <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'CAC and AOV must be strictly positive (> 0).',
            outputs: { first_order_cm_inr: 0, ltv_contribution_inr: 0, ltv_cac_ratio: 0, is_profitable_on_first_order: false },
            warnings: ['DATA INSUFFICIENT: D2C unit economics requires positive acquisition and order values.'],
            execution_notes: 'LTV evaluation aborted.'
          };
        }
        if (annual_repeat_orders === undefined || annual_repeat_orders < 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Annual repeat orders must be non-negative (>= 0).',
            outputs: { first_order_cm_inr: 0, ltv_contribution_inr: 0, ltv_cac_ratio: 0, is_profitable_on_first_order: false },
            warnings: ['DATA INSUFFICIENT: Negative repeat order frequency rejected.'],
            execution_notes: 'Repeat rate invalid.'
          };
        }
        const cmOrder = (aov_inr * contribution_margin_pct) / 100;
        const totalOrders = 1 + annual_repeat_orders;
        const ltv = cmOrder * totalOrders;
        const ratio = ltv / cac_inr;
        const profitableFirst = cmOrder >= cac_inr;
        const warnings: string[] = [];

        if (contribution_margin_pct <= 0) {
          warnings.push('NEGATIVE UNIT MARGIN: Product generates negative contribution before marketing acquisition expense.');
        }
        if (ratio < 2.0) {
          warnings.push('POOR UNIT ECONOMICS: 12-month LTV:CAC < 2.0 indicates unsustainable acquisition burn.');
        }

        return {
          success: true,
          data_insufficient: false,
          outputs: {
            first_order_cm_inr: Number(cmOrder.toFixed(2)),
            ltv_contribution_inr: Number(ltv.toFixed(2)),
            ltv_cac_ratio: Number(ratio.toFixed(2)),
            is_profitable_on_first_order: profitableFirst
          },
          warnings,
          execution_notes: `Evaluated 12-month cohort customer value (LTV proxy) of ₹${ltv.toFixed(2)} (${ratio.toFixed(2)}x CAC). Zero retention beyond 12m.`
        };
      }
    });

    // 8. Multi-Tier Distributor & Wholesale Margin Waterfall
    this.registerModel({
      model_id: 'MOD-DISTRIBUTOR-TIERED-MARGIN-v1.0.0',
      version: '1.0.0',
      classification: 'ANALYTICAL_MODEL',
      name: 'Multi-Tier B2B Wholesale & Trade Discount Waterfall',
      description: 'Models margin distribution across Super Stockist, Wholesale Distributor, and Retailer tiers.',
      latex_or_formula: 'P_ex_factory = MRP * (1 - Retail_Disc) * (1 - Dist_Disc) * (1 - Stockist_Disc)',
      admission_spec: {
        commercial_question: 'What is the required ex-factory price to support multi-tier B2B wholesale distribution margins?',
        methodology_rationale: 'Standard Indian FMCG & Hardware trade discount waterfall identity.',
        applicable_entities: ['Product', 'Opportunity'],
        applicable_categories: ['Industrial Hardware & Consumables', 'Plumbing', 'Electrical'],
        applicable_channels: ['DISTRIBUTOR', 'B2B', 'RETAIL'],
        assumptions_and_limitations: ['Discounts compound sequentially down the distribution chain.'],
        uncertainty_methodology: 'Deterministic price waterfall algebra.',
        data_insufficient_conditions: ['MRP non-positive or discount percentages total >= 80%.'],
        empirical_validation_protocol: 'Validated against physical distributor price lists in Kolkata Ezra Street & Chandni Chowk.'
      },
      input_schemas: [
        { name: 'Maximum Retail Price (MRP)', symbol: 'mrp_inr', description: 'End-consumer maximum retail price', unit: 'INR', data_type: 'number', required: true, default_value: 120.0, min_value: 1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Retailer Trade Margin', symbol: 'retailer_margin_pct', description: 'Discount given to local retailer', unit: '%', data_type: 'number', required: true, default_value: 25.0, min_value: 5, max_value: 45, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Distributor Margin', symbol: 'distributor_margin_pct', description: 'Discount given to regional distributor', unit: '%', data_type: 'number', required: true, default_value: 12.0, min_value: 2, max_value: 25, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Super Stockist Margin', symbol: 'super_stockist_margin_pct', description: 'Discount given to state C&F agent', unit: '%', data_type: 'number', required: true, default_value: 6.0, min_value: 0, max_value: 15, epistemic_class: 'OBSERVED_FACT' }
      ],
      output_schemas: [
        { name: 'Retailer Purchase Price', symbol: 'retailer_buy_price_inr', description: 'Price paid by retailer to distributor', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Distributor Purchase Price', symbol: 'distributor_buy_price_inr', description: 'Price paid by distributor to stockist', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Ex-Factory Net Realization', symbol: 'ex_factory_realization_inr', description: 'Net revenue realized by manufacturer', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Total Trade Margin Spread', symbol: 'total_trade_spread_inr', description: 'Difference between MRP and ex-factory', unit: 'INR', data_type: 'number', precision: 2 }
      ],
      sensitivities: [
        { variable_symbol: 'retailer_margin_pct', variable_name: 'Retailer Margin', base_value: 25, test_range: [15, 35], expected_direction: 'NEGATIVE', notes: 'Higher retailer cut directly shrinks ex-factory realization' }
      ],
      fixtures: [
        {
          fixture_name: 'Brass Ball Valve 1/2" Wholesale Waterfall',
          description: 'MRP ₹120 valve through 3-tier distribution channel',
          inputs: { mrp_inr: 120.0, retailer_margin_pct: 25.0, distributor_margin_pct: 12.0, super_stockist_margin_pct: 6.0 },
          expected_outputs: { retailer_buy_price_inr: 90.0, distributor_buy_price_inr: 79.2, ex_factory_realization_inr: 74.45, total_trade_spread_inr: 45.55 },
          tolerance: 0.1
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Indian Wholesale Distribution Trade Practices',
      evaluator: (inputs) => {
        const { mrp_inr, retailer_margin_pct, distributor_margin_pct, super_stockist_margin_pct } = inputs;
        if (!mrp_inr || mrp_inr <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'MRP must be strictly positive (> 0).',
            outputs: { retailer_buy_price_inr: 0, distributor_buy_price_inr: 0, ex_factory_realization_inr: 0, total_trade_spread_inr: 0 },
            warnings: ['DATA INSUFFICIENT: MRP must be specified and positive.'],
            execution_notes: 'Waterfall aborted.'
          };
        }
        if (
          retailer_margin_pct === undefined || retailer_margin_pct < 0 || retailer_margin_pct >= 100 ||
          distributor_margin_pct === undefined || distributor_margin_pct < 0 || distributor_margin_pct >= 100 ||
          super_stockist_margin_pct === undefined || super_stockist_margin_pct < 0 || super_stockist_margin_pct >= 100
        ) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Trade margin percentages must be bounded between 0% and 100%.',
            outputs: { retailer_buy_price_inr: 0, distributor_buy_price_inr: 0, ex_factory_realization_inr: 0, total_trade_spread_inr: 0 },
            warnings: ['DATA INSUFFICIENT: Invalid or unbounded margin percentage supplied.'],
            execution_notes: 'Waterfall aborted due to invalid margin parameters.'
          };
        }
        const retPrice = mrp_inr * (1 - retailer_margin_pct / 100);
        const distPrice = retPrice * (1 - distributor_margin_pct / 100);
        const exFactory = distPrice * (1 - super_stockist_margin_pct / 100);
        const spread = mrp_inr - exFactory;

        return {
          success: true,
          data_insufficient: false,
          outputs: {
            retailer_buy_price_inr: Number(retPrice.toFixed(2)),
            distributor_buy_price_inr: Number(distPrice.toFixed(2)),
            ex_factory_realization_inr: Number(exFactory.toFixed(2)),
            total_trade_spread_inr: Number(spread.toFixed(2))
          },
          warnings: exFactory < mrp_inr * 0.5 ? ['HEAVY TRADE DISCOUNT: Ex-factory realization below 50% of MRP.'] : [],
          execution_notes: `MRP ₹${mrp_inr} yields ex-factory realization of ₹${exFactory.toFixed(2)}.`
        };
      }
    });

    // 8b. Secondary Market Surplus & Liquidation Recovery Spread Model
    this.registerModel({
      model_id: 'MOD-SECONDARY-MARKET-LIQUIDATION-v1.0.0',
      version: '1.0.0',
      classification: 'ANALYTICAL_MODEL',
      name: 'Secondary Market Liquidation & Surplus Recovery Spread Model',
      description: 'Estimates gross salvage recovery, disposal freight logistics, net realized cash, and residual capital loss for surplus inventory lots. Unclamped net cash recovery correctly distinguishes positive salvage from underwater disposal cash drains.',
      latex_or_formula: 'Net_Salvage = (Lot_Units * Unit_Cost * Recovery_Rate%) - Disposal_Freight; Economic_Loss = Total_Cost - Net_Salvage',
      admission_spec: {
        commercial_question: 'What net cash recovery and economic capital loss will be realized when liquidating surplus inventory through secondary channels?',
        methodology_rationale: 'Unclamped secondary market distress liquidation cash recovery and write-down model.',
        applicable_entities: ['Opportunity', 'Product'],
        applicable_categories: ['Secondary Surplus & Liquidation', 'Industrial Hardware & Consumables', 'Home & Seasonal Handicrafts'],
        applicable_channels: ['SECONDARY_SURPLUS', 'DISTRIBUTOR'],
        assumptions_and_limitations: [
          'Gross proceeds equal wholesale bid rate applied to original invoice cost.',
          'Disposal freight is accounted without artificial clamping: if freight exceeds gross salvage, net recovery is negative (net cash outflow).',
          'Recovery rate bid must be between 0% and 100%.'
        ],
        uncertainty_methodology: 'Historical secondary lot recovery price spread analysis.',
        data_insufficient_conditions: ['Lot units <= 0, unit cost <= 0, recovery rate outside [0%, 100%], or negative freight.'],
        empirical_validation_protocol: 'Validated against physical secondary market bids from Chandni Chowk / Liluah scrap and surplus traders.'
      },
      input_schemas: [
        { name: 'Surplus Lot Units', symbol: 'lot_units', description: 'Quantity of surplus/distressed items in lot', unit: 'units', data_type: 'number', required: true, default_value: 5000, min_value: 10, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Original Unit Cost', symbol: 'original_unit_cost_inr', description: 'Original invoice cost of goods', unit: 'INR', data_type: 'number', required: true, default_value: 13.50, min_value: 0.1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Secondary Bid Recovery Rate', symbol: 'recovery_rate_pct', description: 'Wholesale salvage bid as % of cost', unit: '%', data_type: 'number', required: true, default_value: 55.0, min_value: 0, max_value: 100, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Disposal Logistics & Freight', symbol: 'disposal_freight_inr', description: 'Bulk transport cost to liquidator', unit: 'INR', data_type: 'number', required: true, default_value: 2500, min_value: 0, epistemic_class: 'ESTIMATED_VALUE' }
      ],
      output_schemas: [
        { name: 'Gross Liquidation Value', symbol: 'gross_liquidation_inr', description: 'Total gross cash from liquidator', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Disposal Freight Cost', symbol: 'disposal_freight_costs_inr', description: 'Transport and handling fee deducted', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Net Realized Salvage', symbol: 'net_salvage_inr', description: 'Net cash recovered (can be negative if freight exceeds salvage)', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Inventory Write-Down', symbol: 'inventory_write_down_inr', description: 'Loss on inventory book value prior to freight', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Net Economic Loss', symbol: 'net_economic_loss_inr', description: 'Total economic loss including freight shortfall', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Effective Cost Recovery Pct', symbol: 'effective_recovery_pct', description: 'Net cash recovered divided by original capital (can be negative)', unit: '%', data_type: 'number', precision: 2 },
        { name: 'Capital Write-Off Loss', symbol: 'capital_loss_inr', description: 'Unrecoverable loss on lot capital (backward-compatibility alias)', unit: 'INR', data_type: 'number', precision: 2 },
        { name: 'Is Cash Shortfall Active', symbol: 'is_cash_shortfall', description: 'True if disposal freight exceeds gross recovery', unit: 'boolean', data_type: 'boolean' }
      ],
      sensitivities: [
        { variable_symbol: 'recovery_rate_pct', variable_name: 'Bid Rate', base_value: 55, test_range: [30, 80], expected_direction: 'POSITIVE', notes: 'Higher bid directly improves capital salvage' }
      ],
      fixtures: [
        {
          fixture_name: 'Surplus SS304 Clamps 5000 Units Lot',
          description: '5000 surplus clamps sold to local MRO reseller at 55% recovery',
          inputs: { lot_units: 5000, original_unit_cost_inr: 13.50, recovery_rate_pct: 55.0, disposal_freight_inr: 2500 },
          expected_outputs: { gross_liquidation_inr: 37125.0, net_salvage_inr: 34625.0, effective_recovery_pct: 51.30, capital_loss_inr: 32875.0 },
          tolerance: 0.1
        },
        {
          fixture_name: 'Underwater Liquidation Lot (Freight Deficit)',
          description: '1000 units at ₹10 with 15% recovery (₹1500 gross) and ₹3000 freight produces net cash shortfall of -₹1500',
          inputs: { lot_units: 1000, original_unit_cost_inr: 10.00, recovery_rate_pct: 15.0, disposal_freight_inr: 3000 },
          expected_outputs: { gross_liquidation_inr: 1500.0, net_salvage_inr: -1500.0, effective_recovery_pct: -15.0, capital_loss_inr: 11500.0, is_cash_shortfall: true },
          tolerance: 1.0
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Distressed Asset Recovery & Secondary Market Liquidation Studies',
      evaluator: (inputs) => {
        const { lot_units, original_unit_cost_inr, recovery_rate_pct, disposal_freight_inr } = inputs;
        if (!lot_units || lot_units <= 0 || !original_unit_cost_inr || original_unit_cost_inr <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Lot units and original unit cost must be strictly positive (> 0).',
            outputs: {
              gross_liquidation_inr: 0,
              disposal_freight_costs_inr: 0,
              net_salvage_inr: 0,
              inventory_write_down_inr: 0,
              net_economic_loss_inr: 0,
              effective_recovery_pct: 0,
              capital_loss_inr: 0,
              is_cash_shortfall: false
            },
            warnings: ['DATA INSUFFICIENT: Liquidation evaluation requires positive lot size and cost.'],
            execution_notes: 'Liquidation evaluation aborted.'
          };
        }
        if (recovery_rate_pct === undefined || recovery_rate_pct < 0 || recovery_rate_pct > 100) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Recovery rate percentage must be between 0% and 100%.',
            outputs: {
              gross_liquidation_inr: 0,
              disposal_freight_costs_inr: 0,
              net_salvage_inr: 0,
              inventory_write_down_inr: 0,
              net_economic_loss_inr: 0,
              effective_recovery_pct: 0,
              capital_loss_inr: 0,
              is_cash_shortfall: false
            },
            warnings: ['DATA INSUFFICIENT: Recovery bid rate must be between 0% and 100%.'],
            execution_notes: 'Invalid recovery rate.'
          };
        }
        const freight = Number(disposal_freight_inr || 0);
        if (freight < 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Disposal freight cost cannot be negative.',
            outputs: {
              gross_liquidation_inr: 0,
              disposal_freight_costs_inr: 0,
              net_salvage_inr: 0,
              inventory_write_down_inr: 0,
              net_economic_loss_inr: 0,
              effective_recovery_pct: 0,
              capital_loss_inr: 0,
              is_cash_shortfall: false
            },
            warnings: ['DATA INSUFFICIENT: Freight cost cannot be negative.'],
            execution_notes: 'Negative freight rejected.'
          };
        }

        const totalOrigCost = Number((lot_units * original_unit_cost_inr).toFixed(2));
        const grossValue = Number((totalOrigCost * (recovery_rate_pct / 100)).toFixed(2));
        const netSalvage = Number((grossValue - freight).toFixed(2)); // UNCLAMPED: preserves negative cash flows
        const writeDown = Number((totalOrigCost - grossValue).toFixed(2));
        const netEconomicLoss = Number((totalOrigCost - netSalvage).toFixed(2));
        const effectivePct = Number(((netSalvage / totalOrigCost) * 100).toFixed(2));
        const isCashShortfall = netSalvage < 0;

        const warnings: string[] = [];
        if (isCashShortfall) {
          warnings.push(`CASH DEFICIT WARNING: Disposal freight (₹${freight.toFixed(2)}) exceeds gross liquidation proceeds (₹${grossValue.toFixed(2)}). Offloading this lot creates a net cash drain of ₹${Math.abs(netSalvage).toFixed(2)}.`);
        } else if (effectivePct < 40) {
          warnings.push('SEVERE LIQUIDATION LOSS: Recovery is below 40% of deployed capital.');
        }

        return {
          success: true,
          data_insufficient: false,
          outputs: {
            gross_liquidation_inr: grossValue,
            disposal_freight_costs_inr: freight,
            net_salvage_inr: netSalvage,
            inventory_write_down_inr: writeDown,
            net_economic_loss_inr: netEconomicLoss,
            effective_recovery_pct: effectivePct,
            capital_loss_inr: netEconomicLoss,
            is_cash_shortfall: isCashShortfall
          },
          warnings,
          execution_notes: isCashShortfall
            ? `Underwater liquidation: Net cash drain of ₹${Math.abs(netSalvage).toFixed(2)} (${effectivePct}% of inventory cost).`
            : `Salvaged ₹${netSalvage.toFixed(2)} net cash (${effectivePct}% of ₹${totalOrigCost}).`
        };
      }
    });

    // --------------------------------------------------------------------------
    // C. STATISTICAL METHODS (Guardrails, Regressions & Correlations)
    // --------------------------------------------------------------------------

    // 9. Statistical Cross-Factor Sensitivity & Correlation Guardrail (Deprecated v1.0.0)
    this.registerModel({
      model_id: 'STAT-CROSS-FACTOR-SENSITIVITY-v1.0.0',
      version: '1.0.0',
      classification: 'STATISTICAL_METHOD',
      name: 'Sample-Size Guardrailed Cross-Factor Correlation Method (Deprecated)',
      description: '[DEPRECATED] Historical scalar sensitivity quotient. Guarded against zero-denominator and small-sample (N < 10) conditions. Superseded by EQ-FACTOR-SENSITIVITY-SLOPE-v1.0.0 (deterministic slope) and STAT-PAIRED-FACTOR-REGRESSION-v1.0.0 (empirical paired OLS regression).',
      latex_or_formula: 'Sensitivity = Delta_Margin / Factor_Volatility; Guardrails: N >= 10, Volatility != 0',
      admission_spec: {
        commercial_question: 'Is there a preliminary sensitivity relationship between raw material index shifts and product margins?',
        methodology_rationale: 'Scalar quotient sensitivity heuristic with mandatory small-sample hypothesis quarantine.',
        applicable_entities: ['Product', 'MarketFactor'],
        applicable_categories: ['*'],
        applicable_channels: ['*'],
        assumptions_and_limitations: [
          'Historical scalar division model; does not compute empirical covariance or regression standard error.',
          'Zero-denominator factor volatility is trapped and returns DATA INSUFFICIENT without returning Infinity.'
        ],
        uncertainty_methodology: 'Small-sample quarantine (N < 10) and non-causation invariant.',
        data_insufficient_conditions: ['Sample size N < 10 or factor volatility percentage <= 0.'],
        empirical_validation_protocol: 'Tested against historical commodity indices (LME Nickel, MCX Copper).'
      },
      input_schemas: [
        { name: 'Observation Count', symbol: 'sample_size_n', description: 'Number of paired historical observations', unit: 'count', data_type: 'number', required: true, default_value: 14, min_value: 1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Factor Historical Volatility', symbol: 'factor_volatility_pct', description: 'Percentage range of factor movement', unit: '%', data_type: 'number', required: true, default_value: 28.0, min_value: 0.1, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Derived Unit Margin Shift', symbol: 'unit_margin_shift_inr', description: 'Observed change in unit margin', unit: 'INR', data_type: 'number', required: true, default_value: -3.20, epistemic_class: 'DERIVED_OUTPUT' }
      ],
      output_schemas: [
        { name: 'Data Sufficient Flag', symbol: 'data_sufficient', description: 'True if sample size >= 10 and volatility > 0', unit: 'boolean', data_type: 'boolean' },
        { name: 'Calculated Beta Sensitivity', symbol: 'beta_sensitivity', description: 'Margin impact per 1% factor shift', unit: 'INR/%', data_type: 'number', precision: 3 },
        { name: 'Correlation != Causation Invariant', symbol: 'correlation_does_not_equal_causation', description: 'Mandatory epistemic declaration', unit: 'boolean', data_type: 'boolean' }
      ],
      sensitivities: [
        { variable_symbol: 'sample_size_n', variable_name: 'Sample Size', base_value: 14, test_range: [4, 30], expected_direction: 'POSITIVE', notes: 'N < 10 trips data insufficient guardrail' }
      ],
      fixtures: [
        {
          fixture_name: 'Sufficient Sample LME Nickel Exposure (N=14)',
          description: '14 audited historical quotes demonstrating negative correlation to Nickel',
          inputs: { sample_size_n: 14, factor_volatility_pct: 28.0, unit_margin_shift_inr: -3.20 },
          expected_outputs: { data_sufficient: true, beta_sensitivity: -0.114, correlation_does_not_equal_causation: true },
          tolerance: 0.01
        },
        {
          fixture_name: 'Insufficient Sample Brass Valve (N=5)',
          description: 'Only 5 quotes available; must return DATA INSUFFICIENT',
          inputs: { sample_size_n: 5, factor_volatility_pct: 12.0, unit_margin_shift_inr: -1.50 },
          expected_outputs: { data_sufficient: false, beta_sensitivity: 0, correlation_does_not_equal_causation: true },
          tolerance: 0.01
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'DEPRECATED',
      authoritative_reference: 'Econometrics & Small-Sample Robust Statistics',
      evaluator: (inputs) => {
        const { sample_size_n, factor_volatility_pct, unit_margin_shift_inr } = inputs;
        if (factor_volatility_pct === undefined || !Number.isFinite(factor_volatility_pct) || factor_volatility_pct <= 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Factor volatility must be strictly positive and finite (> 0).',
            outputs: {
              data_sufficient: false,
              beta_sensitivity: 0,
              correlation_does_not_equal_causation: true
            },
            warnings: ['ZERO DENOMINATOR: Cannot divide by zero or negative factor volatility.'],
            execution_notes: 'Zero/negative denominator prevented; non-finite return rejected.'
          };
        }
        if (!sample_size_n || sample_size_n < 10) {
          return {
            success: true,
            data_insufficient: true,
            insufficient_reason: `Sample size N=${sample_size_n || 0} is below the mandatory statistical threshold of 10 observations.`,
            outputs: {
              data_sufficient: false,
              beta_sensitivity: 0,
              correlation_does_not_equal_causation: true
            },
            warnings: ['DATA INSUFFICIENT: Inadequate sample size to assert statistically valid factor correlation.'],
            execution_notes: 'Enforced small-sample epistemic quarantine.'
          };
        }
        const beta = Number((unit_margin_shift_inr / factor_volatility_pct).toFixed(3));
        return {
          success: true,
          data_insufficient: false,
          outputs: {
            data_sufficient: true,
            beta_sensitivity: beta,
            correlation_does_not_equal_causation: true
          },
          warnings: [],
          execution_notes: `Scalar sensitivity quotient of ${beta} INR/% across reported sample size N=${sample_size_n} (heuristic; superseded by EQ-FACTOR-SENSITIVITY-SLOPE and STAT-PAIRED-FACTOR-REGRESSION).`
        };
      }
    });

    // 9b. Empirical Paired Factor-Margin OLS Linear Regression Method
    this.registerModel({
      model_id: 'STAT-PAIRED-FACTOR-REGRESSION-v1.0.0',
      version: '1.0.0',
      classification: 'STATISTICAL_METHOD',
      name: 'Empirical Paired Factor-Margin OLS Linear Regression Method',
      description: 'Performs authentic ordinary least squares (OLS) linear regression on paired historical observations of factor movement (%) and unit margin shift (INR). Enforces sample-size guardrail (N >= 10), non-zero factor variance, and computes beta slope, alpha intercept, Pearson r, R^2, and standard error.',
      latex_or_formula: 'beta = Cov(X, Y) / Var(X); alpha = mean(Y) - beta * mean(X); r = Cov(X, Y) / (s_x * s_y); R^2 = r^2; Guardrail: N >= 10',
      admission_spec: {
        commercial_question: 'Is there a statistically verified empirical linear relationship between historical factor movements and unit margin shifts?',
        methodology_rationale: 'Ordinary Least Squares (OLS) bivariate regression with sample-size guardrail (N >= 10) and parameter standard error estimation.',
        applicable_entities: ['Product', 'MarketFactor'],
        applicable_categories: ['*'],
        applicable_channels: ['*'],
        assumptions_and_limitations: [
          'Requires paired historical observations (equal length arrays of factor % and margin INR shifts).',
          'Enforces small-sample quarantine: returns DATA INSUFFICIENT when N < 10.',
          'Enforces zero-variance check: returns DATA INSUFFICIENT when independent factor variance is zero.',
          'Strict invariant: correlation does not equal causation.'
        ],
        uncertainty_methodology: 'Standard error of regression slope and coefficient of determination (R^2).',
        data_insufficient_conditions: ['Sample size N < 10, array lengths mismatch, or factor variance equals zero.'],
        empirical_validation_protocol: 'Validated against paired historical commodity quotes and supplier pricing ledgers.'
      },
      input_schemas: [
        { name: 'Factor Observations (X)', symbol: 'factor_observations_x', description: 'Array of historical percentage moves in market factor', unit: '% array', data_type: 'array', required: true, default_value: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50], epistemic_class: 'OBSERVED_FACT' },
        { name: 'Margin Shift Observations (Y)', symbol: 'margin_shift_observations_y', description: 'Array of observed unit margin shifts in INR', unit: 'INR array', data_type: 'array', required: true, default_value: [-0.5, -1.0, -1.5, -2.0, -2.5, -3.0, -3.5, -4.0, -4.5, -5.0], epistemic_class: 'OBSERVED_FACT' }
      ],
      output_schemas: [
        { name: 'Sample Size (N)', symbol: 'sample_size_n', description: 'Count of paired observations evaluated', unit: 'count', data_type: 'number', precision: 0 },
        { name: 'Sample Sufficient Flag', symbol: 'is_sample_sufficient', description: 'True if N >= 10 with non-zero variance', unit: 'boolean', data_type: 'boolean' },
        { name: 'Regression Slope (Beta)', symbol: 'beta_slope', description: 'Change in margin (INR) per 1% factor move', unit: 'INR/%', data_type: 'number', precision: 4 },
        { name: 'Regression Intercept (Alpha)', symbol: 'alpha_intercept', description: 'Baseline margin shift when factor move is 0%', unit: 'INR', data_type: 'number', precision: 4 },
        { name: 'Pearson Correlation (r)', symbol: 'pearson_r', description: 'Bivariate correlation coefficient (-1 to +1)', unit: 'ratio', data_type: 'number', precision: 4 },
        { name: 'Coefficient of Determination (R^2)', symbol: 'r_squared', description: 'Proportion of variance explained by linear model', unit: 'ratio', data_type: 'number', precision: 4 },
        { name: 'Standard Error of Beta', symbol: 'standard_error_beta', description: 'Estimated standard deviation of slope estimator', unit: 'INR/%', data_type: 'number', precision: 4 },
        { name: 'Correlation != Causation Invariant', symbol: 'correlation_does_not_equal_causation', description: 'Mandatory epistemic declaration', unit: 'boolean', data_type: 'boolean' }
      ],
      sensitivities: [],
      fixtures: [
        {
          fixture_name: 'Paired Nickel vs Margin Linear Shift (N=10)',
          description: '10 paired data points with perfect -0.10 slope and R^2=1.0',
          inputs: {
            factor_observations_x: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
            margin_shift_observations_y: [-0.5, -1.0, -1.5, -2.0, -2.5, -3.0, -3.5, -4.0, -4.5, -5.0]
          },
          expected_outputs: {
            sample_size_n: 10,
            is_sample_sufficient: true,
            beta_slope: -0.10,
            alpha_intercept: 0.0,
            pearson_r: -1.0,
            r_squared: 1.0,
            correlation_does_not_equal_causation: true
          },
          tolerance: 0.005
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Greene, W. H. — Econometric Analysis (Bivariate OLS Estimation)',
      evaluator: (inputs) => {
        const x: number[] = inputs.factor_observations_x;
        const y: number[] = inputs.margin_shift_observations_y;

        if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 10) {
          const n = Array.isArray(x) ? x.length : 0;
          return {
            success: true,
            data_insufficient: true,
            insufficient_reason: `Sample size N=${n} is below mandatory threshold of 10 observations or observation array lengths mismatch.`,
            outputs: {
              sample_size_n: n,
              is_sample_sufficient: false,
              beta_slope: 0,
              alpha_intercept: 0,
              pearson_r: 0,
              r_squared: 0,
              standard_error_beta: 0,
              correlation_does_not_equal_causation: true
            },
            warnings: ['DATA INSUFFICIENT: Inadequate paired sample size for statistical regression.'],
            execution_notes: 'Enforced small-sample epistemic quarantine (N < 10).'
          };
        }

        const n = x.length;
        // Verify all elements are finite numbers
        for (let i = 0; i < n; i++) {
          if (!Number.isFinite(x[i]) || !Number.isFinite(y[i])) {
            return {
              success: false,
              data_insufficient: true,
              insufficient_reason: `Non-finite observation detected at index ${i}.`,
              outputs: {
                sample_size_n: n,
                is_sample_sufficient: false,
                beta_slope: 0,
                alpha_intercept: 0,
                pearson_r: 0,
                r_squared: 0,
                standard_error_beta: 0,
                correlation_does_not_equal_causation: true
              },
              warnings: ['INVALID INPUT: All paired observations must be finite numbers.'],
              execution_notes: 'Non-finite input rejected.'
            };
          }
        }

        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;

        let ssXX = 0;
        let ssYY = 0;
        let ssXY = 0;

        for (let i = 0; i < n; i++) {
          const dx = x[i] - meanX;
          const dy = y[i] - meanY;
          ssXX += dx * dx;
          ssYY += dy * dy;
          ssXY += dx * dy;
        }

        if (ssXX <= 1e-9) {
          return {
            success: true,
            data_insufficient: true,
            insufficient_reason: 'Independent factor variance is zero across the sample. Regression slope undefined.',
            outputs: {
              sample_size_n: n,
              is_sample_sufficient: false,
              beta_slope: 0,
              alpha_intercept: 0,
              pearson_r: 0,
              r_squared: 0,
              standard_error_beta: 0,
              correlation_does_not_equal_causation: true
            },
            warnings: ['ZERO VARIANCE: Independent variable exhibits zero variation.'],
            execution_notes: 'Zero variance prevented division by zero.'
          };
        }

        const beta = Number((ssXY / ssXX).toFixed(4));
        const alpha = Number((meanY - beta * meanX).toFixed(4));
        const pearsonR = ssYY > 1e-9 ? Number((ssXY / Math.sqrt(ssXX * ssYY)).toFixed(4)) : 0;
        const rSquared = Number((pearsonR * pearsonR).toFixed(4));

        let rss = 0;
        for (let i = 0; i < n; i++) {
          const predicted = alpha + beta * x[i];
          const residual = y[i] - predicted;
          rss += residual * residual;
        }

        const sResidual = n > 2 ? Math.sqrt(rss / (n - 2)) : 0;
        const seBeta = Number((sResidual / Math.sqrt(ssXX)).toFixed(4));

        return {
          success: true,
          data_insufficient: false,
          outputs: {
            sample_size_n: n,
            is_sample_sufficient: true,
            beta_slope: beta,
            alpha_intercept: alpha,
            pearson_r: pearsonR,
            r_squared: rSquared,
            standard_error_beta: seBeta,
            correlation_does_not_equal_causation: true
          },
          warnings: rSquared < 0.25 ? ['WEAK CORRELATION: R^2 < 0.25 indicates poor explanatory power of linear model.'] : [],
          execution_notes: `Estimated OLS slope beta=${beta} (SE=${seBeta}), R^2=${rSquared} across N=${n} paired observations.`
        };
      }
    });

    // --------------------------------------------------------------------------
    // D. DECISION RULES (Testable Commercial Gating Logic)
    // --------------------------------------------------------------------------

    // 10. Channel Feasibility Viability Gate
    this.registerModel({
      model_id: 'RULE-CHANNEL-FEASIBILITY-GATE-v1.0.0',
      version: '1.0.0',
      classification: 'DECISION_RULE',
      name: 'Channel Viability Economic Gating Rule',
      description: 'Tests whether an opportunity meets minimum threshold economics (Contribution Margin >= 15% and Working Capital Days <= 60).',
      latex_or_formula: 'Verdict = (Net_Margin >= 15% AND Working_Capital_Days <= 60) ? VIABLE : UNVIABLE',
      admission_spec: {
        commercial_question: 'Does this channel and SKU configuration satisfy the minimum economic hurdle for capital deployment?',
        methodology_rationale: 'Executive capital hurdle gating rule.',
        applicable_entities: ['Opportunity', 'PackOffer'],
        applicable_categories: ['*'],
        applicable_channels: ['*'],
        assumptions_and_limitations: ['Hurdle thresholds calibrated for bootstrapped working capital velocity.'],
        uncertainty_methodology: 'Deterministic boolean gating.',
        data_insufficient_conditions: ['Net margin or working capital days missing.'],
        empirical_validation_protocol: 'Validated against historical business failure patterns in undercapitalized channels.'
      },
      input_schemas: [
        { name: 'Net Contribution Margin Pct', symbol: 'net_margin_pct', description: 'Realized net contribution margin', unit: '%', data_type: 'number', required: true, default_value: 18.5, epistemic_class: 'DERIVED_OUTPUT' },
        { name: 'Working Capital Runway Days', symbol: 'working_capital_days', description: 'Days of operating cash buffer', unit: 'days', data_type: 'number', required: true, default_value: 45, min_value: 1, epistemic_class: 'DERIVED_OUTPUT' }
      ],
      output_schemas: [
        { name: 'Channel Viability Verdict', symbol: 'verdict', description: 'VIABLE, MARGINAL, or UNVIABLE', unit: 'string', data_type: 'string' },
        { name: 'Margin Threshold Passed', symbol: 'margin_gate_passed', description: 'True if margin >= 15%', unit: 'boolean', data_type: 'boolean' },
        { name: 'Working Capital Gate Passed', symbol: 'working_capital_gate_passed', description: 'True if days <= 60', unit: 'boolean', data_type: 'boolean' }
      ],
      sensitivities: [],
      fixtures: [
        {
          fixture_name: 'Viable D2C 20-Pack Configuration',
          description: '18.5% margin and 45 days working capital',
          inputs: { net_margin_pct: 18.5, working_capital_days: 45 },
          expected_outputs: { verdict: 'VIABLE', margin_gate_passed: true, working_capital_gate_passed: true }
        },
        {
          fixture_name: 'Unviable Low Margin Configuration',
          description: '9.2% margin fails the 15% margin threshold',
          inputs: { net_margin_pct: 9.2, working_capital_days: 40 },
          expected_outputs: { verdict: 'UNVIABLE', margin_gate_passed: false, working_capital_gate_passed: true }
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Capital Allocation & Operational Hurdle Rules',
      evaluator: (inputs) => {
        const { net_margin_pct, working_capital_days } = inputs;
        if (net_margin_pct === undefined || working_capital_days === undefined) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Missing margin or working capital metrics.',
            outputs: { verdict: 'DATA_INSUFFICIENT', margin_gate_passed: false, working_capital_gate_passed: false },
            warnings: ['DATA INSUFFICIENT: Gating evaluation requires margin and cash cycle metrics.'],
            execution_notes: 'Gate evaluation aborted.'
          };
        }
        const marginPass = net_margin_pct >= 15.0;
        const wcPass = working_capital_days <= 60;
        let verdict = 'UNVIABLE';
        if (marginPass && wcPass) {
          verdict = 'VIABLE';
        } else if (net_margin_pct >= 10.0 && wcPass) {
          verdict = 'MARGINAL';
        } else {
          verdict = 'UNVIABLE';
        }

        return {
          success: true,
          data_insufficient: false,
          outputs: {
            verdict,
            margin_gate_passed: marginPass,
            working_capital_gate_passed: wcPass
          },
          warnings: verdict === 'UNVIABLE' ? ['DECISION GATE REJECTED: Candidate opportunity fails hurdle criteria.'] : [],
          execution_notes: `Evaluated gating verdict: ${verdict}.`
        };
      }
    });

    // 11. Seasonal Inventory Clearance Alert Rule
    this.registerModel({
      model_id: 'RULE-INVENTORY-CLEARANCE-ALERT-v1.0.0',
      version: '1.0.0',
      classification: 'DECISION_RULE',
      name: 'Seasonal Inventory Clearance Cutoff Rule',
      description: 'Determines whether to maintain regular price, trigger 25% promotional markdown, or execute emergency bulk liquidation based on days-to-event cutoff.',
      latex_or_formula: 'Action = Days_To_Event < 7 ? BULK_LIQUIDATE : (Days_To_Event < 21 ? PROMO_MARKDOWN_25 : MAINTAIN_PRICE)',
      admission_spec: {
        commercial_question: 'At what point prior to a seasonal event must inventory be aggressively marked down to prevent complete post-event write-off?',
        methodology_rationale: 'Time-decay perishable inventory clearance rule.',
        applicable_entities: ['Opportunity', 'EventSeason'],
        applicable_categories: ['Home & Seasonal Handicrafts', 'Gifting', 'Seasonal Home Decor'],
        applicable_channels: ['D2C', 'MARKETPLACE', 'RETAIL'],
        assumptions_and_limitations: ['Applies to time-perishable seasonal event products.'],
        uncertainty_methodology: 'Deterministic countdown rules.',
        data_insufficient_conditions: ['Days to event undefined or negative.'],
        empirical_validation_protocol: 'Validated against e-commerce festive sell-through curves.'
      },
      input_schemas: [
        { name: 'Days to Event Peak', symbol: 'days_to_event', description: 'Days remaining until holiday/event', unit: 'days', data_type: 'number', required: true, default_value: 14, min_value: 0, epistemic_class: 'OBSERVED_FACT' },
        { name: 'Remaining Unsold Inventory Pct', symbol: 'unsold_inventory_pct', description: 'Percentage of initial stock remaining', unit: '%', data_type: 'number', required: true, default_value: 45, min_value: 0, epistemic_class: 'OBSERVED_FACT' }
      ],
      output_schemas: [
        { name: 'Recommended Clearance Action', symbol: 'action', description: 'HOLD_PRICE, PROMO_MARKDOWN_25, or EMERGENCY_BULK_LIQUIDATION', unit: 'string', data_type: 'string' },
        { name: 'Risk Alert Level', symbol: 'alert_level', description: 'GREEN, AMBER, or RED', unit: 'string', data_type: 'string' }
      ],
      sensitivities: [],
      fixtures: [
        {
          fixture_name: 'Mid-Campaign 14 Days Out (45% Unsold)',
          description: '14 days before Diwali with 45% inventory remaining triggers 25% markdown',
          inputs: { days_to_event: 14, unsold_inventory_pct: 45 },
          expected_outputs: { action: 'PROMO_MARKDOWN_25', alert_level: 'AMBER' }
        },
        {
          fixture_name: 'Critical 5 Days Out (30% Unsold)',
          description: '5 days before event requires emergency liquidation',
          inputs: { days_to_event: 5, unsold_inventory_pct: 30 },
          expected_outputs: { action: 'EMERGENCY_BULK_LIQUIDATION', alert_level: 'RED' }
        }
      ],
      dependencies: [],
      effective_date: '2026-10-09',
      version_status: 'ACTIVE',
      authoritative_reference: 'Retail Markdown & Clearance Timing Strategies',
      evaluator: (inputs) => {
        const { days_to_event, unsold_inventory_pct } = inputs;
        if (days_to_event === undefined || days_to_event < 0) {
          return {
            success: false,
            data_insufficient: true,
            insufficient_reason: 'Days to event non-positive.',
            outputs: { action: 'DATA_INSUFFICIENT', alert_level: 'GRAY' },
            warnings: ['DATA INSUFFICIENT: Valid event countdown required.'],
            execution_notes: 'Clearance rule aborted.'
          };
        }
        if (days_to_event < 7 && unsold_inventory_pct > 15) {
          return {
            success: true,
            data_insufficient: false,
            outputs: { action: 'EMERGENCY_BULK_LIQUIDATION', alert_level: 'RED' },
            warnings: ['CRITICAL INVENTORY ALERT: Under 7 days to event with high unsold stock. Emergency liquidation required.'],
            execution_notes: 'Triggered emergency bulk liquidation.'
          };
        }
        if (days_to_event < 21 && unsold_inventory_pct > 35) {
          return {
            success: true,
            data_insufficient: false,
            outputs: { action: 'PROMO_MARKDOWN_25', alert_level: 'AMBER' },
            warnings: ['WARNING: Sell-through pace behind schedule. Initiate 25% promotional markdown.'],
            execution_notes: 'Triggered 25% promotional clearance.'
          };
        }
        return {
          success: true,
          data_insufficient: false,
          outputs: { action: 'HOLD_PRICE', alert_level: 'GREEN' },
          warnings: [],
          execution_notes: 'Inventory trajectory on schedule.'
        };
      }
    });
  }
}

export const equationRegistry = new EquationRegistry();
