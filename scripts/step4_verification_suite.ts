/**
 * POC-001: Step 4 Verification & Regression Suite
 * Tests Product Universe, Registry, Capability System, and Non-Divergence
 */

import { productRegistry } from '../src/lib/productRegistry';
import { capabilityToStage } from '../src/components/PipelineNavbar';
import { runContractVerificationSuite, runFullAdversarialSuite } from '../src/lib/financialContract';
import { baseFeeAssumptions, seedSKUs } from '../src/data/seedData';
import { canonicalPackOffers, canonicalProduct, canonicalOpportunity } from '../src/data/canonicalCatalog';
import { calculateLandedCost, calculateAmazonFees, calculateSKUEconomics, simulateCapitalRunway } from '../src/lib/calculators';

console.log('====================================================');
console.log('POC-001 — STEP 4 VERIFICATION & REGRESSION SUITE');
console.log('====================================================\n');

let allPassed = true;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}${detail ? ` (${detail})` : ''}`);
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` — ${detail}` : ''}`);
    allPassed = false;
  }
}

// -----------------------------------------------------------------
// A. Product Registry Test
// -----------------------------------------------------------------
console.log('--- TEST A: Product Registry Test ---');
const prod = productRegistry.getProduct('prod_ss304_din3017_canonical');
assert(!!prod, 'Canonical Product exists in Product Registry', prod?.name);
assert(prod?.standard === 'DIN 3017', 'Canonical standard is DIN 3017', prod?.standard);
assert(prod?.category_id === 'cat_industrial_fasteners', 'Canonical category resolves', prod?.category_id);
const allProds = productRegistry.getAllProducts();
assert(allProds.length === 1, 'Product Universe contains exactly 1 real product (no fake products)', `Count: ${allProds.length}`);

// -----------------------------------------------------------------
// B. Opportunity Resolution Test
// -----------------------------------------------------------------
console.log('\n--- TEST B: Opportunity Resolution Test ---');
const opp = productRegistry.getOpportunity('opp_ss304_howrah_arb_001');
assert(!!opp, 'Canonical Opportunity exists', opp?.opportunity_id);
assert(opp?.product_id === 'prod_ss304_din3017_canonical', 'Opportunity links to canonical product', opp?.product_id);
assert(opp?.variant_id === 'var_ss304_16_25mm', 'Opportunity links to canonical variant', opp?.variant_id);
assert(opp?.pack_id === 'pack_ss304_16_25mm_20p', 'Opportunity links to canonical pack offer', opp?.pack_id);

const context = productRegistry.resolveProductContext('prod_ss304_din3017_canonical', 'opp_ss304_howrah_arb_001');
assert(!!context, 'Relational Context resolves successfully');
assert(context?.product.product_id === 'prod_ss304_din3017_canonical', 'Context resolves product');
assert(context?.activeVariant?.variant_id === 'var_ss304_16_25mm', 'Context resolves active variant');
assert(context?.activePack?.pack_size === 20, 'Context resolves active 20-pack offer');
assert(context?.buyerSegment?.segment_id === 'seg_oem_irrigation_pumps', 'Context resolves buyer segment');
assert(context?.useCase?.use_case_id === 'uc_irrigation_discharge_coupling', 'Context resolves use case');

// -----------------------------------------------------------------
// C. Capability Resolution Test
// -----------------------------------------------------------------
console.log('\n--- TEST C: Capability Resolution Test ---');
const applicableCaps = productRegistry.getApplicableCapabilities('prod_ss304_din3017_canonical');
assert(applicableCaps.length === 14, 'Canonical product resolves 14 applicable capabilities', `Found: ${applicableCaps.length}`);
const capIds = applicableCaps.map(c => c.id);
assert(capIds.includes('STRATEGY'), 'Includes STRATEGY capability');
assert(capIds.includes('SUPPLY'), 'Includes SUPPLY capability');
assert(capIds.includes('SPECIFICATION_QUALITY'), 'Includes SPECIFICATION_QUALITY capability');
assert(capIds.includes('OFFER_DESIGN'), 'Includes OFFER_DESIGN capability');
assert(capIds.includes('ECONOMICS'), 'Includes ECONOMICS capability');
assert(capIds.includes('CHANNELS_D2C'), 'Includes CHANNELS_D2C capability');
assert(capIds.includes('CHANNELS_B2B'), 'Includes CHANNELS_B2B capability');
assert(capIds.includes('SIMULATION'), 'Includes SIMULATION capability');
assert(capIds.includes('SUPPLY_STRATEGY'), 'Includes SUPPLY_STRATEGY capability');
assert(capIds.includes('SYSTEM'), 'Includes SYSTEM capability');
assert(capIds.includes('UNIVERSE'), 'Includes UNIVERSE capability');

const profile = productRegistry.getCapabilityProfile('prod_ss304_din3017_canonical');
assert(profile?.module_bindings.SPECIFICATION_QUALITY === 'metallurgy_torque_din3017', 'Module binding for SPECIFICATION_QUALITY is metallurgy_torque_din3017');

// -----------------------------------------------------------------
// D. Navigation Mechanism Test
// -----------------------------------------------------------------
console.log('\n--- TEST D: Navigation Mechanism Test ---');
assert(capabilityToStage('STRATEGY') === 'CONTROL_TOWER', 'STRATEGY maps to CONTROL_TOWER');
assert(capabilityToStage('SUPPLY') === 'SUPPLIERS', 'SUPPLY maps to SUPPLIERS');
assert(capabilityToStage('SPECIFICATION_QUALITY') === 'QA', 'SPECIFICATION_QUALITY maps to QA');
assert(capabilityToStage('OFFER_DESIGN') === 'PACK_OPTIMIZER', 'OFFER_DESIGN maps to PACK_OPTIMIZER');
assert(capabilityToStage('CHANNELS_D2C') === 'AMAZON', 'CHANNELS_D2C maps to AMAZON');
assert(capabilityToStage('CHANNELS_B2B') === 'B2B', 'CHANNELS_B2B maps to B2B');
assert(capabilityToStage('ECONOMICS') === 'ECONOMICS', 'ECONOMICS maps to ECONOMICS');
assert(capabilityToStage('SIMULATION') === 'FINANCE', 'SIMULATION maps to FINANCE');
assert(capabilityToStage('SUPPLY_STRATEGY') === 'MAKE_VS_BUY', 'SUPPLY_STRATEGY maps to MAKE_VS_BUY');
assert(capabilityToStage('RESEARCH') === 'REGISTRY', 'RESEARCH maps to REGISTRY');
assert(capabilityToStage('SYSTEM') === 'CONTRACT', 'SYSTEM maps to CONTRACT');
assert(capabilityToStage('UNIVERSE') === 'UNIVERSE', 'UNIVERSE maps to UNIVERSE');

// Test hypothetical unknown product resolution (verifies mechanism is generic and not hardcoded to SS304)
const fallbackCaps = productRegistry.getApplicableCapabilities('hypothetical_product_non_existent');
assert(fallbackCaps.length > 0 && !fallbackCaps.map(c => c.id).includes('SPECIFICATION_QUALITY'), 'Hypothetical unconfigured product does not automatically expose SS304-specific metallurgy', `Count: ${fallbackCaps.length}`);

// -----------------------------------------------------------------
// F & G. Frozen Contract Suite & Adversarial Suite
// -----------------------------------------------------------------
console.log('\n--- TEST F & G: Frozen Financial Engine Suite ---');
const auditReport = runContractVerificationSuite(baseFeeAssumptions);
assert(auditReport.audit_status === 'PASSED', 'Contract Verification Suite Status PASSED');
assert(auditReport.tests_passed === 6 && auditReport.tests_executed === 6, 'Contract Verification Suite Tests', `${auditReport.tests_passed}/${auditReport.tests_executed}`);

const advReport = runFullAdversarialSuite(baseFeeAssumptions);
assert(advReport.executive_verdict.includes('PASS'), 'Adversarial Suite Status PASS');
assert(advReport.passed_tests === 60 && advReport.total_tests === 60, 'Adversarial Suite Tests', `${advReport.passed_tests}/${advReport.total_tests}`);

// -----------------------------------------------------------------
// H. Golden Scenario Equivalence Comparison
// -----------------------------------------------------------------
console.log('\n--- TEST H: Golden Scenario Equivalence ---');
const legacySku = seedSKUs.find(s => s.id === 'sku-ss304-1625-20p')!;
const canonicalPack = canonicalPackOffers.find(p => p.pack_id === canonicalOpportunity.pack_id)!;

const legacyLanded = calculateLandedCost(15.00, legacySku.pack_size);
const canonicalLanded = calculateLandedCost(15.00, canonicalPack.pack_size);
const deltaLanded = Number(Math.abs(legacyLanded.orderLandedCost - canonicalLanded.orderLandedCost).toFixed(4));
assert(deltaLanded === 0, 'Landed COGS Delta is ₹0.00', `Legacy: ₹${legacyLanded.orderLandedCost}, Canonical: ₹${canonicalLanded.orderLandedCost}`);

const legacyFees = calculateAmazonFees(499, legacySku.pack_size, legacySku.package_weight_g, baseFeeAssumptions);
const canonicalFees = calculateAmazonFees(499, canonicalPack.pack_size, canonicalPack.package_weight_g, baseFeeAssumptions);
const deltaFees = Number(Math.abs(legacyFees.totalMarketplaceFees - canonicalFees.totalMarketplaceFees).toFixed(4));
assert(deltaFees === 0, 'Marketplace Fees Delta is ₹0.00', `Legacy: ₹${legacyFees.totalMarketplaceFees}, Canonical: ₹${canonicalFees.totalMarketplaceFees}`);

const legacyEcon = calculateSKUEconomics(legacySku.id, legacySku.pack_size, 499, 15.00, legacySku.package_weight_g, baseFeeAssumptions);
const canonicalEcon = calculateSKUEconomics(canonicalPack.pack_id, canonicalPack.pack_size, 499, 15.00, canonicalPack.package_weight_g, baseFeeAssumptions);
const deltaNet = Number(Math.abs(legacyEcon.net_contribution_per_order - canonicalEcon.net_contribution_per_order).toFixed(4));
assert(deltaNet === 0, 'Net Contribution Delta is ₹0.00', `Legacy: ₹${legacyEcon.net_contribution_per_order}, Canonical: ₹${canonicalEcon.net_contribution_per_order}`);

const legacySim = simulateCapitalRunway(50000, 20, 499, 15.00, 10, baseFeeAssumptions, 4, 500);
const canonicalSim = simulateCapitalRunway(50000, canonicalPack.pack_size, 499, 15.00, 10, baseFeeAssumptions, 4, 500);
const deltaWorkingCap = Math.abs(legacySim.workingCapitalRequired - canonicalSim.workingCapitalRequired);
assert(deltaWorkingCap === 0, 'Working Capital Delta is ₹0.00', `Legacy: ₹${legacySim.workingCapitalRequired}, Canonical: ₹${canonicalSim.workingCapitalRequired}`);

console.log('\n====================================================');
if (allPassed) {
  console.log('ALL STEP 4 VERIFICATION TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('STEP 4 VERIFICATION FAILED! SEE ERRORS ABOVE.');
  process.exit(1);
}
console.log('====================================================');
