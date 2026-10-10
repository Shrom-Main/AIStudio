import { AmazonFeeAssumptions } from '../types';
import { calculateLandedCost, calculateAmazonFees } from './calculators';

export interface SensitivityPoint {
  asp: number;
  estimatedDailyOrders: number;
  grossDailyRevenue: number;
  landedCogsPerOrder: number;
  amazonFeesPerOrder: number;
  netContributionPerOrder: number;
  contributionMarginPct: number;
  dailyContribution: number;
  // Monte Carlo confidence intervals (simulating PPC & return variance)
  monteCarloP10MarginPct: number; // pessimistic (PPC +25%, returns +3%)
  monteCarloP90MarginPct: number; // optimistic (PPC -20%, returns -1.5%)
  isProfitable: boolean;
  isCompetitiveWithMarket: boolean;
}

export interface SensitivityResult {
  points: SensitivityPoint[];
  optimalAsp: number;
  maxDailyContribution: number;
  breakEvenAsp: number;
  currentAsp: number;
  currentContributionMarginPct: number;
  priceElasticityScore: number; // derived elasticity index
}

export interface ArbitrageAnalysis {
  annualVolume: number;
  rawCoilPricePerKg: number;
  toolingCapex: number;
  
  // Per unit costs
  buyUnitCost: number;       // Direct finished clamp procurement
  kitUnitCost: number;       // Buying band + screw & assembling in-house
  makeUnitCost: number;      // Full in-house stamping + assembly
  
  // Cost breakdown for Make model
  makeRawMaterialCost: number;
  makeToolingAmortization: number;
  makeLaborAndPower: number;
  
  // Annual totals
  annualBuySpend: number;
  annualKitSpend: number;
  annualMakeSpend: number;
  
  // Strategic inflection thresholds
  buyToKitCrossoverVolume: number;   // Volume where kitting beats direct buy
  kitToMakeCrossoverVolume: number;  // Volume where full stamping beats kitting
  
  // Arbitrage gaps
  kitSavingsAnnual: number;
  makeSavingsAnnual: number;
  optimalStrategy: 'DIRECT_BUY' | 'COMPONENT_ASSEMBLY' | 'FULL_IN_HOUSE';
  reasoning: string;
}

/**
 * Calculates continuous price sensitivity, profit curves, and Monte Carlo failure bounds.
 */
export function calculatePriceSensitivity(
  currentAsp: number,
  baseDailyOrders: number,
  packSize: number,
  supplierUnitPrice: number,
  feeAssumptions: AmazonFeeAssumptions,
  options: {
    season: 'LEAN' | 'BASE' | 'PEAK';
    discountPct: number; // 0 to 30% promotional discount
    returnRateOffsetPct: number; // -2% to +5% return rate shock
    elasticityFactor: number; // standard default ~ 1.35
  } = { season: 'BASE', discountPct: 0, returnRateOffsetPct: 0, elasticityFactor: 1.35 }
): SensitivityResult {
  const points: SensitivityPoint[] = [];

  const seasonMultiplier =
    options.season === 'LEAN' ? 0.72 : options.season === 'PEAK' ? 1.48 : 1.0;

  const minAsp = 249;
  const maxAsp = 849;
  const step = 20;

  let optimalAsp = currentAsp;
  let maxDailyContribution = -Infinity;
  let breakEvenAsp = 0;

  // Landed COGS per pack
  const { orderLandedCost } = calculateLandedCost(supplierUnitPrice, packSize);
  const packageWeightG = Math.max(100, packSize * 24.25);
  const basePpc = Math.max(0, feeAssumptions.ppc_per_order_inr);

  for (let asp = minAsp; asp <= maxAsp; asp += step) {
    // Effective ASP after consumer discount
    const effectiveAsp = Math.max(150, asp * (1 - options.discountPct / 100));

    // Elastic demand modeling: Q = Q0 * [1 - e * ((P - P0) / P0)] * season
    const relativePriceDiff = (effectiveAsp - currentAsp) / currentAsp;
    const elasticityDrop = 1 - options.elasticityFactor * relativePriceDiff;
    const estimatedDailyOrders = Math.max(
      0.5,
      Math.round(baseDailyOrders * elasticityDrop * seasonMultiplier * 10) / 10
    );

    // Calculate marketplace fees at this ASP
    const fees = calculateAmazonFees(effectiveAsp, packSize, packageWeightG, feeAssumptions);
    const totalMarketplaceFees = fees.totalMarketplaceFees + basePpc;

    // Apply return rate offset
    const adjustedReturnLoss =
      effectiveAsp * ((feeAssumptions.return_rate_pct + options.returnRateOffsetPct) / 100) * 0.4;
    const adjustedNetContribution =
      effectiveAsp - orderLandedCost - totalMarketplaceFees - adjustedReturnLoss;
    const contributionMarginPct =
      effectiveAsp > 0 ? (adjustedNetContribution / effectiveAsp) * 100 : 0;
    const dailyContribution = estimatedDailyOrders * adjustedNetContribution;

    // Monte Carlo simulation:
    // P10 (Ad cost +25%, returns +3%)
    const p10AmazonFees = totalMarketplaceFees + basePpc * 0.25;
    const p10Net = effectiveAsp - orderLandedCost - p10AmazonFees - (adjustedReturnLoss * 1.3);
    const p10Margin = effectiveAsp > 0 ? (p10Net / effectiveAsp) * 100 : 0;

    // P90 (Ad cost -20%, organic referral strength, returns -1.5%)
    const p90AmazonFees = totalMarketplaceFees - basePpc * 0.20;
    const p90Net = effectiveAsp - orderLandedCost - p90AmazonFees - (adjustedReturnLoss * 0.7);
    const p90Margin = effectiveAsp > 0 ? (p90Net / effectiveAsp) * 100 : 0;

    const isProfitable = adjustedNetContribution > 0;
    if (breakEvenAsp === 0 && isProfitable) {
      breakEvenAsp = asp;
    }

    if (dailyContribution > maxDailyContribution && isProfitable) {
      maxDailyContribution = dailyContribution;
      optimalAsp = asp;
    }

    points.push({
      asp,
      estimatedDailyOrders,
      grossDailyRevenue: Math.round(effectiveAsp * estimatedDailyOrders),
      landedCogsPerOrder: Math.round(orderLandedCost * 100) / 100,
      amazonFeesPerOrder: Math.round(totalMarketplaceFees * 100) / 100,
      netContributionPerOrder: Math.round(adjustedNetContribution * 100) / 100,
      contributionMarginPct: Math.round(contributionMarginPct * 10) / 10,
      dailyContribution: Math.round(dailyContribution),
      monteCarloP10MarginPct: Math.round(p10Margin * 10) / 10,
      monteCarloP90MarginPct: Math.round(p90Margin * 10) / 10,
      isProfitable,
      isCompetitiveWithMarket: asp >= 399 && asp <= 549
    });
  }

  // Calculate current ASP margin
  const currentFees = calculateAmazonFees(currentAsp, packSize, packageWeightG, feeAssumptions);
  const currentTotalFees = currentFees.totalMarketplaceFees + basePpc;
  const currentReturnLoss = currentAsp * (feeAssumptions.return_rate_pct / 100) * 0.4;
  const currentNet = currentAsp - orderLandedCost - currentTotalFees - currentReturnLoss;
  const currentContributionMarginPct = currentAsp > 0 ? (currentNet / currentAsp) * 100 : 0;

  return {
    points,
    optimalAsp,
    maxDailyContribution: Math.round(maxDailyContribution),
    breakEvenAsp: breakEvenAsp || minAsp,
    currentAsp,
    currentContributionMarginPct: Math.round(currentContributionMarginPct * 10) / 10,
    priceElasticityScore: Math.round(options.elasticityFactor * 100) / 100
  };
}

/**
 * Three-tier Floor Pricing & Arbitrage Engine
 * Evaluates Direct Buy vs Component Assembly vs Full Stamping
 */
export function calculateMakeAssembleBuyArbitrage(
  annualVolume: number,
  rawCoilPricePerKg: number = 240, // Jindal SS304 prime coil ₹/kg
  supplierBuyCost: number = 13.50, // Howrah finished clamp
  toolingCapex: number = 280000 // Progressive die + screw threading tooling ₹
): ArbitrageAnalysis {
  // Option 1: Direct Buy
  const buyInboundFreightPerUnit = 0.45;
  const buyQaAllowancePerUnit = 0.25;
  const buyUnitCost = Math.round((supplierBuyCost + buyInboundFreightPerUnit + buyQaAllowancePerUnit) * 100) / 100;

  // Option 2: Component Assembly & Kitting
  // Stamped band sourced from Howrah (₹6.20), SS304 Worm screw from Rajkot (₹3.30),
  // in-house kitting, riveting & inspection (₹1.60), packaging (₹0.50)
  const stampedBandCost = 6.20;
  const screwHardwareCost = 3.30;
  const assemblyLaborCost = 1.60;
  const assemblyPackaging = 0.50;
  const kitUnitCost = Math.round((stampedBandCost + screwHardwareCost + assemblyLaborCost + assemblyPackaging) * 100) / 100;

  // Option 3: Full In-House Manufacturing
  // Raw coil: ~24 grams SS304 per clamp + 14% stamping slitting scrap
  const rawWeightGrams = 24;
  const scrapMultiplier = 1.14;
  const rawMaterialPerClamp = ((rawWeightGrams * scrapMultiplier) / 1000) * rawCoilPricePerKg;

  // Tooling amortization (amortized over 3 years or 150,000 units max)
  const amortizationUnits = Math.max(10000, Math.min(annualVolume * 3, 150000));
  const toolingAmortPerUnit = toolingCapex / amortizationUnits;

  // Press electricity, tool maintenance, and operator labor
  const inHouseLaborPower = 2.40;
  const makeUnitCost = Math.round((rawMaterialPerClamp + toolingAmortPerUnit + inHouseLaborPower) * 100) / 100;

  // Annual Totals
  const annualBuySpend = Math.round(annualVolume * buyUnitCost);
  const annualKitSpend = Math.round(annualVolume * kitUnitCost);
  const annualMakeSpend = Math.round(annualVolume * makeUnitCost);

  // Strategic Crossover Calculations
  // Volume where Assembly beats Buy: Immediate if kitUnitCost < buyUnitCost
  const buyToKitCrossoverVolume = kitUnitCost < buyUnitCost ? 500 : 50000;

  // Volume where Full Make beats Assembly:
  // annualVolume * kitUnitCost = annualVolume * (rawMaterial + inHouseLabor) + toolingCapex
  const variableMakeCost = rawMaterialPerClamp + inHouseLaborPower;
  const unitSavingsOverKit = kitUnitCost - variableMakeCost;
  const kitToMakeCrossoverVolume =
    unitSavingsOverKit > 0 ? Math.round(toolingCapex / (unitSavingsOverKit * 3)) : 999999;

  const kitSavingsAnnual = Math.max(0, annualBuySpend - annualKitSpend);
  const makeSavingsAnnual = Math.max(0, annualBuySpend - annualMakeSpend);

  let optimalStrategy: 'DIRECT_BUY' | 'COMPONENT_ASSEMBLY' | 'FULL_IN_HOUSE' = 'DIRECT_BUY';
  let reasoning = '';

  if (annualVolume >= kitToMakeCrossoverVolume && makeUnitCost < kitUnitCost) {
    optimalStrategy = 'FULL_IN_HOUSE';
    reasoning = `At ${annualVolume.toLocaleString()} units/yr, tooling amortization drops to ₹${toolingAmortPerUnit.toFixed(2)}/unit. Full in-house stamping saves ₹${makeSavingsAnnual.toLocaleString()}/yr over direct purchasing.`;
  } else if (annualVolume >= buyToKitCrossoverVolume && kitUnitCost < buyUnitCost) {
    optimalStrategy = 'COMPONENT_ASSEMBLY';
    reasoning = `Component Kitting (buying Howrah stamped bands @ ₹6.20 + Rajkot screws @ ₹3.30) achieves immediate arbitrage: ₹${kitUnitCost.toFixed(2)} vs ₹${buyUnitCost.toFixed(2)} buy cost (saving ₹${kitSavingsAnnual.toLocaleString()}/yr with zero capex risk).`;
  } else {
    optimalStrategy = 'DIRECT_BUY';
    reasoning = `Current volume of ${annualVolume.toLocaleString()} units/yr is best served by direct procurement to preserve liquid capital and avoid assembly overhead.`;
  }

  return {
    annualVolume,
    rawCoilPricePerKg,
    toolingCapex,
    buyUnitCost,
    kitUnitCost,
    makeUnitCost,
    makeRawMaterialCost: Math.round(rawMaterialPerClamp * 100) / 100,
    makeToolingAmortization: Math.round(toolingAmortPerUnit * 100) / 100,
    makeLaborAndPower: inHouseLaborPower,
    annualBuySpend,
    annualKitSpend,
    annualMakeSpend,
    buyToKitCrossoverVolume,
    kitToMakeCrossoverVolume,
    kitSavingsAnnual,
    makeSavingsAnnual,
    optimalStrategy,
    reasoning
  };
}
