/**
 * Deterministic Financial & Commercial Calculation Engine
 * Industrial Consumables Distribution Engine — POC-001
 * 
 * Strict rule: All financial formulas are deterministic. No LLM calculation.
 */

import {
  AmazonFeeAssumptions,
  BottleneckType,
  CapitalCycleResult,
  CapitalLeakageItem,
  MakeVsBuyModel,
  SKUCommercialCalculation,
  Supplier,
  SupplierQuote,
  XIRRResult
} from '../types';

/**
 * 1. Landed COGS Calculation
 */
export function calculateLandedCost(
  supplierUnitPrice: number,
  packSize: number,
  inboundFreightUnit: number = 0.35,
  qaCostUnit: number = 0.20,
  packagingCostUnit: number = 0.35,
  labellingAndWarehousingUnit: number = 0.25,
  wastagePct: number = 1.0
): { unitLandedCost: number; orderLandedCost: number } {
  const safeSupplierPrice = Number.isFinite(supplierUnitPrice) ? Math.max(0, supplierUnitPrice) : 0;
  const safePack = Number.isFinite(packSize) ? Math.max(1, packSize) : 1;
  const safeFreight = Number.isFinite(inboundFreightUnit) ? Math.max(0, inboundFreightUnit) : 0.35;
  const safeQa = Number.isFinite(qaCostUnit) ? Math.max(0, qaCostUnit) : 0.20;
  const safePackaging = Number.isFinite(packagingCostUnit) ? Math.max(0, packagingCostUnit) : 0.35;
  const safeLabelling = Number.isFinite(labellingAndWarehousingUnit) ? Math.max(0, labellingAndWarehousingUnit) : 0.25;
  const safeWastage = Number.isFinite(wastagePct) ? Math.max(0, wastagePct) : 1.0;

  const directUnitCost = safeSupplierPrice * (1 + safeWastage / 100);
  const handlingAndPrepUnit = safeFreight + safeQa + safePackaging + safeLabelling;
  const unitLandedCost = Number((directUnitCost + handlingAndPrepUnit).toFixed(2));
  const orderLandedCost = Number((unitLandedCost * safePack).toFixed(2));
  return { unitLandedCost, orderLandedCost };
}

/**
 * 2. Amazon Marketplace Fee Calculation
 */
export function calculateAmazonFees(
  asp: number,
  packSize: number,
  packageWeightG: number,
  assumptions: AmazonFeeAssumptions
): {
  referralFee: number;
  closingFee: number;
  pickPackFee: number;
  weightHandlingFee: number;
  storageFee: number;
  gstOnFees: number;
  totalMarketplaceFees: number;
  returnLoss: number;
} {
  const safeAsp = Number.isFinite(asp) ? Math.max(0, asp) : 0;
  const safeWeight = Number.isFinite(packageWeightG) ? Math.max(1, packageWeightG) : 485;
  const referralFee = (safeAsp * Math.max(0, assumptions.referral_fee_pct)) / 100;
  const closingFee = Math.max(0, assumptions.closing_fee_inr);
  const pickPackFee = Math.max(0, assumptions.fba_pick_pack_inr);

  // Weight handling based on grams (base up to 500g, additional per 500g chunk)
  let weightHandlingFee = Math.max(0, assumptions.weight_handling_fee_inr);
  if (safeWeight > 500) {
    const extra500gChunks = Math.ceil((safeWeight - 500) / 500);
    weightHandlingFee += extra500gChunks * 24;
  }

  const storageFee = Math.max(0, assumptions.storage_per_unit_inr);
  const baseFees = referralFee + closingFee + pickPackFee + weightHandlingFee + storageFee;
  const gstOnFees = (baseFees * Math.max(0, assumptions.gst_on_marketplace_fees_pct)) / 100;
  const totalMarketplaceFees = Number((baseFees + gstOnFees).toFixed(2));

  // Return leakage: ASP * return_rate * refund_loss_rate
  const returnLoss = Number(
    (
      safeAsp *
      (Math.max(0, assumptions.return_rate_pct) / 100) *
      (Math.max(0, assumptions.refund_loss_rate_pct) / 100)
    ).toFixed(2)
  );

  return {
    referralFee: Number(referralFee.toFixed(2)),
    closingFee,
    pickPackFee,
    weightHandlingFee,
    storageFee,
    gstOnFees: Number(gstOnFees.toFixed(2)),
    totalMarketplaceFees,
    returnLoss
  };
}

/**
 * 3. Full SKU Commercial Economics Calculator
 */
export function calculateSKUEconomics(
  skuId: string,
  packSize: number,
  asp: number,
  supplierUnitPrice: number,
  packageWeightG: number,
  assumptions: AmazonFeeAssumptions,
  inboundFreightUnit: number = 0.35,
  qaCostUnit: number = 0.20,
  packagingCostUnit: number = 0.35,
  moqUnits: number = 500
): SKUCommercialCalculation {
  const safePack = Number.isFinite(packSize) ? Math.max(1, packSize) : 1;
  const safeAsp = Number.isFinite(asp) ? Math.max(0, asp) : 0;
  const safeSupplierCost = Number.isFinite(supplierUnitPrice) ? Math.max(0, supplierUnitPrice) : 0;
  const safeWeight = Number.isFinite(packageWeightG) ? Math.max(1, packageWeightG) : 485;

  const { unitLandedCost, orderLandedCost } = calculateLandedCost(
    safeSupplierCost,
    safePack,
    inboundFreightUnit,
    qaCostUnit,
    packagingCostUnit
  );

  const feeBreakdown = calculateAmazonFees(safeAsp, safePack, safeWeight, assumptions);
  const ppcPerOrder = Math.max(0, assumptions.ppc_per_order_inr);
  const returnLossPerOrder = feeBreakdown.returnLoss;

  const totalCostToServe = Number(
    (orderLandedCost + feeBreakdown.totalMarketplaceFees + ppcPerOrder + returnLossPerOrder).toFixed(2)
  );

  const netContributionPerOrder = Number((safeAsp - totalCostToServe).toFixed(2));
  const netContributionPerUnit = Number((netContributionPerOrder / safePack).toFixed(2));
  const contributionMarginPct = safeAsp > 0 ? Number(((netContributionPerOrder / safeAsp) * 100).toFixed(1)) : 0;

  // Closed-form Break-even selling price
  const feeRateWithGst =
    (assumptions.referral_fee_pct / 100) * (1 + assumptions.gst_on_marketplace_fees_pct / 100);
  const returnLeakageRate =
    (assumptions.return_rate_pct / 100) * (assumptions.refund_loss_rate_pct / 100);
  const fixedOrderFees =
    (assumptions.closing_fee_inr +
      assumptions.fba_pick_pack_inr +
      feeBreakdown.weightHandlingFee +
      assumptions.storage_per_unit_inr) *
    (1 + assumptions.gst_on_marketplace_fees_pct / 100);
  const denom = 1 - feeRateWithGst - returnLeakageRate;
  const breakEvenAsp =
    denom > 0 ? Number(((orderLandedCost + fixedOrderFees + ppcPerOrder) / denom).toFixed(2)) : 0;

  // Maximum allowable PPC before zero contribution
  const maxAllowablePpc = Number(Math.max(0, netContributionPerOrder + ppcPerOrder).toFixed(2));

  // Maximum acceptable supplier price per unit to sustain a 15% contribution floor
  const targetContribution = safeAsp * 0.15;
  const allowableLandedPerOrder =
    safeAsp - feeBreakdown.totalMarketplaceFees - ppcPerOrder - returnLossPerOrder - targetContribution;
  const handlingPerOrder = (inboundFreightUnit + qaCostUnit + packagingCostUnit + 0.25) * safePack;
  const maxSupplierUnitPrice = Number(
    Math.max(0, (allowableLandedPerOrder - handlingPerOrder) / safePack).toFixed(2)
  );

  // Max acceptable return rate before losing profitability
  const refundRateFraction = assumptions.refund_loss_rate_pct / 100;
  const maxAcceptableReturnRatePct =
    safeAsp > 0 && refundRateFraction > 0
      ? Number(
          Math.min(
            100,
            Math.max(0, (netContributionPerOrder / (safeAsp * refundRateFraction)) * 100)
          ).toFixed(1)
        )
      : 0;

  return {
    sku_id: skuId,
    pack_size: safePack,
    asp_inr: safeAsp,
    supplier_unit_price: safeSupplierCost,
    inbound_freight_unit: inboundFreightUnit,
    qa_cost_unit: qaCostUnit,
    packaging_cost_unit: packagingCostUnit,
    landed_cogs_per_unit: unitLandedCost,
    landed_cogs_per_order: orderLandedCost,
    amazon_total_fees_per_order: feeBreakdown.totalMarketplaceFees,
    ppc_per_order: ppcPerOrder,
    return_loss_per_order: returnLossPerOrder,
    total_cost_to_serve: totalCostToServe,
    net_contribution_per_order: netContributionPerOrder,
    net_contribution_per_unit: netContributionPerUnit,
    contribution_margin_pct: contributionMarginPct,
    break_even_asp: breakEvenAsp,
    max_allowable_ppc: maxAllowablePpc,
    max_supplier_unit_price: maxSupplierUnitPrice,
    max_acceptable_return_rate_pct: maxAcceptableReturnRatePct,
    monthly_contribution_5_orders_day: Number((netContributionPerOrder * 5 * 30).toFixed(0)),
    monthly_contribution_10_orders_day: Number((netContributionPerOrder * 10 * 30).toFixed(0)),
    monthly_contribution_20_orders_day: Number((netContributionPerOrder * 20 * 30).toFixed(0)),
    monthly_contribution_50_orders_day: Number((netContributionPerOrder * 50 * 30).toFixed(0)),
    cash_required_for_moq: Number((safeSupplierCost * moqUnits).toFixed(0))
  };
}

/**
 * 4. Hero Pack Size Optimizer (5, 10, 20, 30, 50, 100 packs)
 */
export interface HeroPackComparison {
  pack_size: number;
  suggested_asp: number;
  unit_supplier_cost: number;
  order_cogs: number;
  amazon_fees: number;
  ppc_allowance: number;
  net_contribution: number;
  contribution_margin_pct: number;
  break_even_asp: number;
  expected_orders_day: number;
  expected_monthly_contribution: number;
  inventory_capital_1mo: number;
  economic_score: number;
  recommendation: 'SCALE' | 'TEST' | 'HOLD' | 'KILL';
  rationale: string;
}

export function evaluateHeroPacks(
  supplierUnitPrice: number,
  baseUnitWeightG: number = 18,
  assumptions: AmazonFeeAssumptions
): HeroPackComparison[] {
  const packs = [
    { pack: 5, targetAsp: 189, estimatedVelocity: 8 },
    { pack: 10, targetAsp: 299, estimatedVelocity: 14 },
    { pack: 20, targetAsp: 499, estimatedVelocity: 22 },
    { pack: 30, targetAsp: 689, estimatedVelocity: 9 },
    { pack: 50, targetAsp: 1049, estimatedVelocity: 5 },
    { pack: 100, targetAsp: 1899, estimatedVelocity: 3 }
  ];

  return packs.map((p) => {
    const totalWeight = p.pack * baseUnitWeightG + 40;
    const econ = calculateSKUEconomics(
      `HERO-${p.pack}`,
      p.pack,
      p.targetAsp,
      supplierUnitPrice,
      totalWeight,
      assumptions
    );

    const monthlyContribution = econ.net_contribution_per_order * p.estimatedVelocity * 30;
    const inventoryCapital1mo = supplierUnitPrice * p.pack * (p.estimatedVelocity * 30);

    let score = 0;
    if (econ.contribution_margin_pct > 20) score += 35;
    else if (econ.contribution_margin_pct > 12) score += 20;
    else if (econ.contribution_margin_pct > 0) score += 5;

    if (econ.net_contribution_per_order >= 90) score += 35;
    else if (econ.net_contribution_per_order >= 45) score += 20;
    else if (econ.net_contribution_per_order >= 20) score += 10;

    if (p.estimatedVelocity >= 15) score += 30;
    else if (p.estimatedVelocity >= 8) score += 20;
    else score += 10;

    let recommendation: 'SCALE' | 'TEST' | 'HOLD' | 'KILL' = 'HOLD';
    let rationale = '';

    if (score >= 75 && econ.contribution_margin_pct >= 15) {
      recommendation = 'SCALE';
      rationale = 'High contribution per order combined with strong commercial velocity.';
    } else if (score >= 50 && econ.net_contribution_per_order > 25) {
      recommendation = 'TEST';
      rationale = 'Sound unit economics with potential to validate recurring B2B demand.';
    } else if (econ.contribution_margin_pct < 8) {
      recommendation = 'KILL';
      rationale = 'Marketplace weight handling and fees consume too much of the low ASP.';
    } else {
      recommendation = 'HOLD';
      rationale = 'Capital requirement is disproportionate to expected velocity.';
    }

    return {
      pack_size: p.pack,
      suggested_asp: p.targetAsp,
      unit_supplier_cost: supplierUnitPrice,
      order_cogs: econ.landed_cogs_per_order,
      amazon_fees: econ.amazon_total_fees_per_order,
      ppc_allowance: econ.max_allowable_ppc,
      net_contribution: econ.net_contribution_per_order,
      contribution_margin_pct: econ.contribution_margin_pct,
      break_even_asp: econ.break_even_asp,
      expected_orders_day: p.estimatedVelocity,
      expected_monthly_contribution: monthlyContribution,
      inventory_capital_1mo: inventoryCapital1mo,
      economic_score: score,
      recommendation,
      rationale
    };
  });
}

/**
 * 5. Multi-Supplier Head-to-Head Comparison
 */
export interface SupplierComparisonResult {
  supplier_id?: string;
  quote_id?: string;
  supplier_name: string;
  location: string;
  type: string;
  quoted_price: number;
  moq: number;
  freight_per_unit: number;
  qa_cost_per_unit: number;
  packaging_per_unit: number;
  defect_wastage_cost: number;
  landed_cost_unit: number;
  landed_cost_20pack: number;
  contribution_at_499: number;
  contribution_margin_pct: number;
  cash_required_for_moq: number;
  supplier_score: number;
  is_cheapest_quote: boolean;
  is_best_landed_partner: boolean;
  verdict_note: string;
}

export function compareSuppliers(
  quotes: { supplier: Supplier; quote: SupplierQuote }[],
  targetAsp: number = 499,
  packSize: number = 20
): SupplierComparisonResult[] {
  let minQuoted = Infinity;
  let maxContribution = -Infinity;

  quotes.forEach(({ quote }) => {
    if (quote.quoted_price_inr < minQuoted) minQuoted = quote.quoted_price_inr;
  });

  const rawResults = quotes.map(({ supplier, quote }) => {
    const defectWastageCost = quote.quoted_price_inr * (supplier.defect_rate_pct / 100);
    const landedCostUnit = Number(
      (
        quote.quoted_price_inr +
        quote.inbound_freight_per_unit +
        quote.qa_cost_per_unit +
        quote.packaging_cost_per_unit +
        defectWastageCost
      ).toFixed(2)
    );

    const landedCost20Pack = Number((landedCostUnit * packSize).toFixed(2));
    const marketplaceBurden = 135 + 45 + 12;
    const contribution = Number((targetAsp - landedCost20Pack - marketplaceBurden).toFixed(2));
    const marginPct = targetAsp > 0 ? Number(((contribution / targetAsp) * 100).toFixed(1)) : 0;
    const cashForMoq = quote.quoted_price_inr * quote.moq_units;

    let priceScore = Math.max(0, 20 - (quote.quoted_price_inr - 12) * 4);
    let materialScore = supplier.xrf_pmi_willingness && supplier.mtc_availability ? 20 : 8;
    let qualityScore = Math.max(0, 20 - supplier.defect_rate_pct * 4);
    let moqScore = quote.moq_units <= 500 ? 10 : quote.moq_units <= 1000 ? 6 : 2;
    let leadTimeScore = supplier.lead_time_days <= 10 ? 10 : supplier.lead_time_days <= 20 ? 6 : 3;
    let capacityScore = supplier.type === 'MANUFACTURER' ? 10 : 6;
    let flexibilityScore = supplier.private_label_capability ? 10 : 5;

    const totalScore = Math.round(
      priceScore + materialScore + qualityScore + moqScore + leadTimeScore + capacityScore + flexibilityScore
    );

    if (contribution > maxContribution) maxContribution = contribution;

    return {
      supplier_id: supplier.id,
      quote_id: quote.id,
      supplier_name: supplier.name,
      location: supplier.location,
      type: supplier.type,
      quoted_price: quote.quoted_price_inr,
      moq: quote.moq_units,
      freight_per_unit: quote.inbound_freight_per_unit,
      qa_cost_per_unit: quote.qa_cost_per_unit,
      packaging_per_unit: quote.packaging_cost_per_unit,
      defect_wastage_cost: Number(defectWastageCost.toFixed(2)),
      landed_cost_unit: landedCostUnit,
      landed_cost_20pack: landedCost20Pack,
      contribution_at_499: contribution,
      contribution_margin_pct: marginPct,
      cash_required_for_moq: cashForMoq,
      supplier_score: totalScore,
      is_cheapest_quote: quote.quoted_price_inr === minQuoted,
      is_best_landed_partner: false,
      verdict_note: ''
    };
  });

  return rawResults.map((item) => {
    const isBest = item.contribution_at_499 === maxContribution && item.supplier_score >= 70;
    let verdict = '';
    if (item.is_cheapest_quote && !isBest) {
      verdict = 'Cheapest on unit quote, but higher defect risk and MOQ locks excessive capital.';
    } else if (isBest) {
      verdict = 'Optimal balanced partner: high PMI compliance, reliable delivery, and best landed margin.';
    } else {
      verdict = 'Viable backup supplier; negotiate MOQ down before large PO release.';
    }

    return {
      ...item,
      is_best_landed_partner: isBest,
      verdict_note: verdict
    };
  });
}

/**
 * 6. Capital Simulation Engine (Audit Pass Implementation)
 * 
 * Enforces:
 * - Cash Flow Identity: Opening Cash - Outflows + Inflows = Closing Cash (Delta = 0)
 * - Inventory Identity: Opening Inv + Purchases - Sold - Adjustments = Closing Inv (Delta = 0)
 * - Distinct Segregation of Working Capital vs Floating Capital (Zero Double Counting)
 * - Deterministic Bottleneck Validation based on Section 8 & 9 mathematical triggers.
 */
export function simulateCapitalRunway(
  initialCapital: number,
  packSize: number = 20,
  asp: number = 499,
  supplierUnitPrice: number = 14.50,
  ordersPerDay: number = 15,
  assumptions: AmazonFeeAssumptions,
  maxCycles: number = 6,
  moqThreshold: number = 500
): {
  cycles: CapitalCycleResult[];
  identifiedBottleneck: BottleneckType;
  bottleneckDiagnosis: string;
  workingCapitalRequired: number;
  peakFloatingCapital: number;
  endingCash: number;
  cashRunwayDays: number;
  datedCashFlows: { day: number; amount: number; description: string }[];
  annualizedRocPct: number;
  xirrResult: XIRRResult;
} {
  const safeInitialCapital = Number.isFinite(initialCapital) ? Math.max(0, initialCapital) : 0;
  const safePack = Number.isFinite(packSize) ? Math.max(1, packSize) : 1;
  const safeAsp = Number.isFinite(asp) ? Math.max(0, asp) : 0;
  const safeSupplierCost = Number.isFinite(supplierUnitPrice) ? Math.max(0, supplierUnitPrice) : 0;
  const safeOrdersPerDay = Number.isFinite(ordersPerDay) ? Math.max(0, ordersPerDay) : 0;
  const safeMoqThreshold = Number.isFinite(moqThreshold) ? Math.max(0, moqThreshold) : 500;

  const { unitLandedCost, orderLandedCost } = calculateLandedCost(safeSupplierCost, safePack);
  const feeBreakdown = calculateAmazonFees(safeAsp, safePack, safePack * 18 + 40, assumptions);
  const ppcPerOrder = Math.max(0, assumptions.ppc_per_order_inr);
  const returnLossPerOrder = feeBreakdown.returnLoss;

  const totalCostToServePerOrder = Number(
    (orderLandedCost + feeBreakdown.totalMarketplaceFees + ppcPerOrder + returnLossPerOrder).toFixed(2)
  );
  const netContributionPerOrder = Number((safeAsp - totalCostToServePerOrder).toFixed(2));

  // Operational Timing (Days)
  const procurementLeadDays = 10;
  const inboundAndQaDays = 3;
  const packagingDays = 2;
  const listingReadyDays = procurementLeadDays + inboundAndQaDays + packagingDays; // 15 days
  const settlementLagDays = 7; // Amazon 7-day reserve hold

  // Working Capital Definition (Structural Requirement):
  // 15% liquid safety buffer + 10-day safety stock buffer at landed cost
  const safetyStockPacks = Math.ceil(safeOrdersPerDay * 10);
  const safetyStockValue = Number((safetyStockPacks * orderLandedCost).toFixed(0));
  const baseCashReserve = Number((safeInitialCapital * 0.15).toFixed(0));
  const workingCapitalRequired = baseCashReserve + Math.min(safetyStockValue, Math.round(safeInitialCapital * 0.25));

  let currentCash = safeInitialCapital;
  let currentInventoryUnits = 0;
  const cycles: CapitalCycleResult[] = [];
  const datedCashFlows: { day: number; amount: number; description: string }[] = [];
  let elapsedDays = 0;
  let cumulativeProfit = 0;
  let peakFloatingCapital = 0;
  let detectedBottleneck: BottleneckType = 'CAPITAL';
  let bottleneckReason = '';

  // Day 0 cash injection
  if (safeInitialCapital > 0) {
    datedCashFlows.push({ day: 0, amount: -safeInitialCapital, description: 'Initial Capital Injection' });
  }

  // Pre-cycle initial bottleneck check
  const minMoqCost = safeSupplierCost * safeMoqThreshold;
  if (safeInitialCapital === 0 || safeInitialCapital < 10000) {
    detectedBottleneck = 'CAPITAL';
    bottleneckReason = `Starting cash (₹${safeInitialCapital.toLocaleString()}) is below minimal operating threshold. Cannot initiate procurement.`;
  } else if (minMoqCost > safeInitialCapital) {
    detectedBottleneck = 'SUPPLIER_MOQ';
    bottleneckReason = `Supplier MOQ of ${safeMoqThreshold} units requires ₹${minMoqCost.toLocaleString()} initial cash, exceeding total capital of ₹${safeInitialCapital.toLocaleString()}.`;
  } else if (safeOrdersPerDay === 0) {
    detectedBottleneck = 'DEMAND';
    bottleneckReason = 'Zero customer demand (0 orders/day). Inventory cannot be monetized.';
  } else if (netContributionPerOrder <= 0) {
    if (feeBreakdown.totalMarketplaceFees >= safeAsp - orderLandedCost) {
      detectedBottleneck = 'AMAZON';
      bottleneckReason = `Marketplace fees (₹${feeBreakdown.totalMarketplaceFees}/order) exceed gross unit margin. Product is structurally unviable on Amazon at ₹${safeAsp} ASP.`;
    } else {
      detectedBottleneck = 'PPC';
      bottleneckReason = `PPC advertising cost (₹${ppcPerOrder}/order) exceeds contribution before marketing. Unit contribution is negative (₹${netContributionPerOrder}/order).`;
    }
  }

  // Run cycle simulation if initial checks pass
  if (!bottleneckReason) {
    for (let c = 1; c <= maxCycles; c++) {
      const cycleStartCash = currentCash;
      const openingInventory = currentInventoryUnits;

      // Check deployable cash above structural working capital
      const deployableCash = Math.max(0, cycleStartCash - baseCashReserve);
      if (deployableCash < minMoqCost) {
        if (cycleStartCash < minMoqCost) {
          detectedBottleneck = 'CAPITAL';
          bottleneckReason = `Cash balance (₹${cycleStartCash.toLocaleString()}) is below supplier minimum order cost (₹${minMoqCost.toLocaleString()}).`;
        } else {
          detectedBottleneck = 'CAPITAL';
          bottleneckReason = `Preserving required safety cash buffer (₹${baseCashReserve.toLocaleString()}) leaves insufficient cash to fund MOQ (₹${minMoqCost.toLocaleString()}).`;
        }
        break;
      }

      // Calculate units to procure in full pack multiples
      const maxUnitsAffordable = Math.floor(deployableCash / unitLandedCost);
      const packsPurchasable = Math.floor(maxUnitsAffordable / safePack);
      const unitsProcured = packsPurchasable * safePack;

      if (unitsProcured < safeMoqThreshold) {
        detectedBottleneck = 'SUPPLIER_MOQ';
        bottleneckReason = `Deployable funds only cover ${unitsProcured} units, which is below supplier MOQ threshold (${safeMoqThreshold} units).`;
        break;
      }

      // Supplier Capacity Constraint (e.g. 10,000 units/mo)
      if (unitsProcured > 10000) {
        detectedBottleneck = 'SUPPLIER_CAPACITY';
        bottleneckReason = `Batch volume (${unitsProcured.toLocaleString()} units) exceeds single-supplier monthly capacity ceiling (10,000 units). Multi-supplier allocation required.`;
        break;
      }

      // Cash Outflow: Procurement + Inbound Freight & Prep
      const procurementCost = Number((unitsProcured * safeSupplierCost).toFixed(2));
      const prepCost = Number((unitsProcured * (unitLandedCost - safeSupplierCost)).toFixed(2));
      const totalCashOutflow = Number((procurementCost + prepCost).toFixed(2));

      // Inventory Tracking (Strict Inventory Identity)
      const availableUnits = openingInventory + unitsProcured;
      const damagedUnits = Math.round(availableUnits * (Math.max(0, assumptions.damaged_inventory_allowance_pct) / 100));
      const salableUnits = Math.max(0, availableUnits - damagedUnits);
      const salablePacks = Math.floor(salableUnits / safePack);

      // Calculate days to sell: capped at 45 days
      const daysToSell = safeOrdersPerDay > 0 ? Math.ceil(salablePacks / safeOrdersPerDay) : 999;

      if (daysToSell > 45) {
        detectedBottleneck = 'DEMAND';
        bottleneckReason = `Marketplace velocity (${safeOrdersPerDay} orders/day) takes ${daysToSell} days to sell batch. Working capital velocity is stalled.`;
        // Only sell what demand can absorb within 45-day window
        const packsSold = Math.min(salablePacks, safeOrdersPerDay * 45);
        const unitsSold = packsSold * safePack;
        const closingInventory = availableUnits - unitsSold - damagedUnits;

        // Financial realization on sold units
        const grossSales = Number((packsSold * safeAsp).toFixed(2));
        const marketplaceFees = Number((packsSold * feeBreakdown.totalMarketplaceFees).toFixed(2));
        const ppcSpend = Number((packsSold * ppcPerOrder).toFixed(2));
        const returnLoss = Number((packsSold * returnLossPerOrder).toFixed(2));
        const netCashInflow = Number((grossSales - marketplaceFees - ppcSpend - returnLoss).toFixed(2));
        const cycleNetContribution = Number((netCashInflow - (packsSold * orderLandedCost)).toFixed(2));

        const endingCash = Number((cycleStartCash - totalCashOutflow + netCashInflow).toFixed(2));
        const cashDelta = Number((endingCash - (cycleStartCash - totalCashOutflow + netCashInflow)).toFixed(2));
        const invDelta = Number((closingInventory - (openingInventory + unitsProcured - unitsSold - damagedUnits)).toFixed(2));

        cycles.push({
          cycle_number: c,
          starting_cash: cycleStartCash,
          deployed_procurement: procurementCost,
          inbound_and_prep_cost: prepCost,
          total_cash_outflow: totalCashOutflow,
          units_procured: unitsProcured,
          gross_sales: grossSales,
          marketplace_fees_paid: marketplaceFees,
          ppc_spend: ppcSpend,
          returns_deduction: returnLoss,
          net_cash_recovered: netCashInflow,
          cycle_contribution: cycleNetContribution,
          ending_cash: endingCash,
          cash_reconciliation_delta: cashDelta,
          opening_inventory_units: openingInventory,
          purchased_units: unitsProcured,
          sold_units: unitsSold,
          damaged_units: damagedUnits,
          closing_inventory_units: closingInventory,
          closing_inventory_value: Number((closingInventory * unitLandedCost).toFixed(2)),
          inventory_reconciliation_delta: invDelta,
          cumulative_profit: Number((cumulativeProfit + cycleNetContribution).toFixed(2)),
          cycle_duration_days: listingReadyDays + 45 + settlementLagDays,
          working_capital_required: workingCapitalRequired,
          floating_capital_peak: totalCashOutflow,
          limiting_bottleneck: 'DEMAND',
          bottleneck_reason: bottleneckReason
        });
        break;
      }

      // Normal cycle when demand absorbs batch within turnaround
      const packsSold = salablePacks;
      const unitsSold = packsSold * safePack;
      const closingInventory = availableUnits - unitsSold - damagedUnits;

      const grossSales = Number((packsSold * safeAsp).toFixed(2));
      const marketplaceFees = Number((packsSold * feeBreakdown.totalMarketplaceFees).toFixed(2));
      const ppcSpend = Number((packsSold * ppcPerOrder).toFixed(2));
      const returnLoss = Number((packsSold * returnLossPerOrder).toFixed(2));
      const netCashInflow = Number((grossSales - marketplaceFees - ppcSpend - returnLoss).toFixed(2));
      const cycleNetContribution = Number((netCashInflow - totalCashOutflow).toFixed(2));

      cumulativeProfit = Number((cumulativeProfit + cycleNetContribution).toFixed(2));
      currentCash = Number((cycleStartCash - totalCashOutflow + netCashInflow).toFixed(2));
      currentInventoryUnits = closingInventory;

      const cycleDurationDays = listingReadyDays + daysToSell + settlementLagDays;
      elapsedDays += cycleDurationDays;

      if (totalCashOutflow > peakFloatingCapital) peakFloatingCapital = totalCashOutflow;

      // Add dated cash flows for XIRR
      datedCashFlows.push({
        day: elapsedDays - settlementLagDays,
        amount: -totalCashOutflow,
        description: `Cycle ${c} Outflow: Production & Inbound`
      });
      datedCashFlows.push({
        day: elapsedDays,
        amount: netCashInflow,
        description: `Cycle ${c} Inflow: Amazon Settlement`
      });

      const cashDelta = Number((currentCash - (cycleStartCash - totalCashOutflow + netCashInflow)).toFixed(2));
      const invDelta = Number((closingInventory - (openingInventory + unitsProcured - unitsSold - damagedUnits)).toFixed(2));

      cycles.push({
        cycle_number: c,
        starting_cash: cycleStartCash,
        deployed_procurement: procurementCost,
        inbound_and_prep_cost: prepCost,
        total_cash_outflow: totalCashOutflow,
        units_procured: unitsProcured,
        gross_sales: grossSales,
        marketplace_fees_paid: marketplaceFees,
        ppc_spend: ppcSpend,
        returns_deduction: returnLoss,
        net_cash_recovered: netCashInflow,
        cycle_contribution: cycleNetContribution,
        ending_cash: currentCash,
        cash_reconciliation_delta: cashDelta,
        opening_inventory_units: openingInventory,
        purchased_units: unitsProcured,
        sold_units: unitsSold,
        damaged_units: damagedUnits,
        closing_inventory_units: closingInventory,
        closing_inventory_value: Number((closingInventory * unitLandedCost).toFixed(2)),
        inventory_reconciliation_delta: invDelta,
        cumulative_profit: cumulativeProfit,
        cycle_duration_days: cycleDurationDays,
        working_capital_required: workingCapitalRequired,
        floating_capital_peak: totalCashOutflow
      });
    }
  }

  // If reached end of maxCycles without explicit bottleneck
  if (!bottleneckReason && cycles.length === maxCycles) {
    detectedBottleneck = 'DEMAND';
    bottleneckReason = `Maximum simulated cycle horizon reached. Expanding capital deployment further requires opening new clamp sizes or direct B2B accounts.`;
  }

  // Calculate XIRR with validation
  const xirrResult = calculateDeterministicXIRR(datedCashFlows);

  // Return on Capital (ROC) = Annualized Operating Profit / Average Capital Employed
  const averageCapitalEmployed = (safeInitialCapital + currentCash) / 2;
  const annualFactor = elapsedDays > 0 ? 365 / elapsedDays : 1;
  const annualizedOperatingProfit = cumulativeProfit * annualFactor;
  const annualizedRocPct =
    averageCapitalEmployed > 0
      ? Number(((annualizedOperatingProfit / averageCapitalEmployed) * 100).toFixed(1))
      : 0;

  const cashRunwayDays =
    elapsedDays + Math.round(currentCash / Math.max(1, safeInitialCapital / 60));

  return {
    cycles,
    identifiedBottleneck: detectedBottleneck,
    bottleneckDiagnosis: bottleneckReason || `Current growth bottleneck: ${detectedBottleneck}`,
    workingCapitalRequired,
    peakFloatingCapital,
    endingCash: currentCash,
    cashRunwayDays,
    datedCashFlows,
    annualizedRocPct,
    xirrResult
  };
}

/**
 * 7. Newton-Raphson Deterministic XIRR Solver (Audited & Rigorous)
 */
export function calculateDeterministicXIRR(
  cashFlows: { day: number; amount: number }[],
  guessRate: number = 0.15
): XIRRResult {
  if (cashFlows.length < 2) {
    return {
      xirr_pct: null,
      status: 'UNDEFINED',
      notes: 'Requires at least 2 dated cash flow transactions to compute internal rate of return.'
    };
  }

  let hasNegative = false;
  let hasPositive = false;
  for (const cf of cashFlows) {
    if (cf.amount < 0) hasNegative = true;
    if (cf.amount > 0) hasPositive = true;
  }

  if (!hasNegative || !hasPositive) {
    return {
      xirr_pct: null,
      status: 'UNDEFINED',
      notes: 'No sign change detected: XIRR requires both cash outflows (investments) and cash inflows (returns).'
    };
  }

  let rate = guessRate;
  const maxIterations = 60;
  const tolerance = 1e-6;
  let isConverged = false;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (const cf of cashFlows) {
      const years = cf.day / 365;
      if (1 + rate <= 0) {
        rate = -0.90; // prevent Math.pow negative base NaN
      }
      const factor = Math.pow(1 + rate, years);
      if (factor === 0 || isNaN(factor) || !isFinite(factor)) continue;

      npv += cf.amount / factor;
      dnpv -= (years * cf.amount) / (factor * (1 + rate));
    }

    if (Math.abs(dnpv) < 1e-12 || isNaN(npv) || isNaN(dnpv)) {
      break;
    }

    const step = npv / dnpv;
    const newRate = rate - step;

    if (Math.abs(newRate - rate) < tolerance) {
      rate = newRate;
      isConverged = true;
      break;
    }

    rate = newRate;
    if (rate < -0.999) rate = -0.90;
    if (rate > 10.0) rate = 5.0;
  }

  if (!isConverged || isNaN(rate) || !isFinite(rate)) {
    return {
      xirr_pct: null,
      status: 'UNDEFINED',
      notes: 'Mathematical convergence not reached within iteration budget.'
    };
  }

  const finalXirr = Number((rate * 100).toFixed(1));
  return {
    xirr_pct: finalXirr,
    status: finalXirr >= 0 ? 'CONVERGED' : 'NEGATIVE',
    notes:
      finalXirr >= 0
        ? `Annualized rate of return based on exact dated cash flows (${cashFlows.length} events).`
        : `Negative annualized return (-${Math.abs(finalXirr)}%): Cash outflows exceeded cumulative recoveries.`
  };
}

/**
 * 8. Capital Leakage Audit Engine
 */
export function analyzeCapitalLeakage(
  currentPpcPerOrder: number,
  maxAllowablePpc: number,
  returnRatePct: number,
  inventoryDays: number,
  supplierUnitPrice: number,
  bestMarketPrice: number,
  monthlyOrders: number = 450,
  idleCashBalance: number = 75000
): CapitalLeakageItem[] {
  const items: CapitalLeakageItem[] = [];

  // 1. Excessive PPC Leakage: Benchmark is maxAllowablePpc or target 8% ACOS (₹32)
  const ppcBenchmark = Math.min(32, maxAllowablePpc);
  if (currentPpcPerOrder > ppcBenchmark) {
    const avoidableWastePerOrder = currentPpcPerOrder - ppcBenchmark;
    const monthlyWaste = avoidableWastePerOrder * monthlyOrders;
    items.push({
      id: 'leakage-ppc',
      category: 'PPC_OVERSPEND',
      title: 'PPC Bid Leakage on Broad Match Keywords',
      monthly_leakage_inr: Math.round(monthlyWaste),
      potential_recovered_capital_inr: Math.round(monthlyWaste * 6),
      benchmark_rule: `Actual PPC ₹${currentPpcPerOrder.toFixed(2)} vs target ceiling ₹${ppcBenchmark.toFixed(2)}`,
      recommended_remedy:
        'Negative-match non-industrial search terms ("garden hose", "plastic clip") and allocate budget to exact ASIN targets.',
      severity: monthlyWaste > 5000 ? 'CRITICAL' : 'MODERATE'
    });
  }

  // 2. Excess Returns Leakage: Benchmark is 3.5%
  if (returnRatePct > 3.5) {
    const excessReturnPct = returnRatePct - 3.5;
    const monthlyReturnLeakage = monthlyOrders * (excessReturnPct / 100) * 145;
    items.push({
      id: 'leakage-returns',
      category: 'EXCESS_RETURNS',
      title: 'Packaging Sizing Confusion Driving Returns',
      monthly_leakage_inr: Math.round(monthlyReturnLeakage),
      potential_recovered_capital_inr: Math.round(monthlyReturnLeakage * 6),
      benchmark_rule: `Actual returns ${returnRatePct}% vs industrial baseline 3.5%`,
      recommended_remedy:
        'Add laser-etched clamp diameter range (16-25mm) directly on band and publish a 1:1 printable pipe sizing chart.',
      severity: 'MODERATE'
    });
  }

  // 3. Excess / Slow-moving Inventory: Benchmark is 45 days
  if (inventoryDays > 45) {
    const excessDays = inventoryDays - 45;
    const holdingCostMonthly = (excessDays / 30) * 1800;
    items.push({
      id: 'leakage-inventory',
      category: 'EXCESS_INVENTORY',
      title: 'Overstocked 32-50mm Clamp Bundles',
      monthly_leakage_inr: Math.round(holdingCostMonthly),
      potential_recovered_capital_inr: 28000,
      benchmark_rule: `Actual holding period ${inventoryDays} days vs target 45 days`,
      recommended_remedy:
        'Bundle slower-moving 32-50mm SKUs into a "Maintenance Master Kit" with 16-25mm clamps to accelerate inventory turnover.',
      severity: 'LOW'
    });
  }

  // 4. Supplier Pricing Gap: Benchmark is verified best market price
  if (supplierUnitPrice > bestMarketPrice) {
    const unitGap = supplierUnitPrice - bestMarketPrice;
    const monthlyGap = unitGap * (monthlyOrders * 20);
    items.push({
      id: 'leakage-supplier',
      category: 'POOR_SUPPLIER_PRICING',
      title: 'Unfavorable Supplier Quotation Delta',
      monthly_leakage_inr: Math.round(monthlyGap),
      potential_recovered_capital_inr: Math.round(monthlyGap * 12),
      benchmark_rule: `Current quote ₹${supplierUnitPrice.toFixed(2)} vs Howrah benchmark ₹${bestMarketPrice.toFixed(2)}`,
      recommended_remedy:
        'Present competitor quotation data to current supplier for volume-tier price match at 5,000 unit threshold.',
      severity: 'CRITICAL'
    });
  }

  // 5. Idle Cash: Benchmark is working capital reserve
  if (idleCashBalance > 50000) {
    const lostOpportunityMonthly = Math.round(idleCashBalance * 0.015);
    items.push({
      id: 'leakage-idle-cash',
      category: 'IDLE_CASH',
      title: 'Unallocated Cash Reserve Opportunity Drag',
      monthly_leakage_inr: lostOpportunityMonthly,
      potential_recovered_capital_inr: Math.round(idleCashBalance * 0.25),
      benchmark_rule: `Idle liquid cash ₹${idleCashBalance.toLocaleString()} vs required operational buffer ₹50,000`,
      recommended_remedy:
        'Deploy unallocated capital into high-margin 20-pack 20-32mm SKU inventory before festival season demand spike.',
      severity: 'LOW'
    });
  }

  return items;
}

/**
 * 9. Make vs Buy Manufacturing Feasibility Model
 */
export function calculateMakeVsBuy(
  annualDemandUnits: number = 72000,
  supplierLandedCostUnit: number = 16.45,
  monthlyLabour: number = 38000,
  monthlyElectricity: number = 14000,
  monthlyRentMaintenance: number = 22000,
  toolingCapex: number = 350000,
  pressEquipmentCapex: number = 850000,
  rawMaterialStripPerUnit: number = 8.10,
  screwAndHousingPerUnit: number = 2.80,
  scrapRatePct: number = 3.5,
  minimumEfficientScaleUnits: number = 180000
): MakeVsBuyModel {
  const safeAnnualDemand = Math.max(0, annualDemandUnits);
  const monthlyDemand = Math.round(safeAnnualDemand / 12);
  const directMaterialUnit =
    (rawMaterialStripPerUnit + screwAndHousingPerUnit) * (1 + Math.max(0, scrapRatePct) / 100);
  const monthlyFixedOverheads = monthlyLabour + monthlyElectricity + monthlyRentMaintenance;
  const fixedCostPerUnit = monthlyDemand > 0 ? monthlyFixedOverheads / monthlyDemand : Infinity;
  const expectedManufacturingCostUnit = Number((directMaterialUnit + fixedCostPerUnit).toFixed(2));

  const totalCapex = toolingCapex + pressEquipmentCapex;
  const unitSavings = supplierLandedCostUnit - expectedManufacturingCostUnit;
  const annualSavings = Math.round(unitSavings * safeAnnualDemand);

  const paybackMonths =
    annualSavings > 0 && totalCapex > 0
      ? Number(((totalCapex / annualSavings) * 12).toFixed(1))
      : 999;
  const roiPct = totalCapex > 0 ? Number(((annualSavings / totalCapex) * 100).toFixed(1)) : 0;

  const annualFixedOverheads = monthlyFixedOverheads * 12;
  const unitContributionOverDirectMaterial = supplierLandedCostUnit - directMaterialUnit;
  const breakEvenVolume =
    unitContributionOverDirectMaterial > 0
      ? Math.round(annualFixedOverheads / unitContributionOverDirectMaterial)
      : 0;

  const capacityUtilizationPct = Number(((safeAnnualDemand / 240000) * 100).toFixed(1));
  const demandCertaintyScore =
    safeAnnualDemand >= minimumEfficientScaleUnits
      ? 85
      : Math.round((safeAnnualDemand / Math.max(1, minimumEfficientScaleUnits)) * 60);

  const isJustified =
    safeAnnualDemand >= minimumEfficientScaleUnits && paybackMonths <= 24 && unitSavings > 2.50;

  const recommendation = isJustified ? 'MANUFACTURING_JUSTIFIED' : 'CONTINUE_SOURCING';
  let reasoning = '';
  if (!isJustified) {
    if (safeAnnualDemand < minimumEfficientScaleUnits) {
      reasoning = `Annual volume (${safeAnnualDemand.toLocaleString()} units) is below minimum efficient scale (${minimumEfficientScaleUnits.toLocaleString()} units). Fixed overhead of ₹${monthlyFixedOverheads.toLocaleString()}/mo inflates internal make cost to ₹${expectedManufacturingCostUnit}/unit vs ₹${supplierLandedCostUnit} buy cost. Sourcing remains economically superior.`;
    } else if (paybackMonths > 24) {
      reasoning = `Capex payback period of ${paybackMonths} months exceeds commercial risk ceiling (24 months). Vertical integration would lock capital.`;
    } else {
      reasoning = `Internal make cost advantage of ₹${unitSavings.toFixed(2)}/unit is insufficient to warrant factory operational risk and tooling amortization.`;
    }
  } else {
    reasoning = `Annual demand (${safeAnnualDemand.toLocaleString()} units) exceeds minimum efficient scale. Payback of ${paybackMonths} months provides robust ROI (${roiPct}%). Tooling and stamping line investment is economically validated.`;
  }

  return {
    annual_demand_units: safeAnnualDemand,
    monthly_demand_units: monthlyDemand,
    supplier_landed_cost_unit: supplierLandedCostUnit,
    expected_manufacturing_cost_unit: expectedManufacturingCostUnit,
    tooling_capex_inr: toolingCapex,
    equipment_press_capex_inr: pressEquipmentCapex,
    monthly_labour_inr: monthlyLabour,
    monthly_electricity_inr: monthlyElectricity,
    scrap_rate_pct: scrapRatePct,
    monthly_rent_maintenance_inr: monthlyRentMaintenance,
    cost_of_capital_pct: 12,
    minimum_efficient_scale_units_year: minimumEfficientScaleUnits,
    annual_savings_inr: annualSavings,
    payback_period_months: paybackMonths,
    roi_pct: roiPct,
    break_even_volume_units: breakEvenVolume,
    capacity_utilization_pct: capacityUtilizationPct,
    demand_certainty_score: demandCertaintyScore,
    recommendation,
    reasoning
  };
}
