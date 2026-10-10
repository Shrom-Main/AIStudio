/**
 * Dynamic logic-based text generators
 * Ensures that every recommendation, alert, placeholder, and summary across
 * all workspaces is computed from live mathematical variables rather than static text.
 */

export function getPricingVerdictText(
  asp: number,
  marginPct: number,
  netContributionPerOrder: number,
  breakEvenAsp: number,
  dailyOrders: number
): {
  headline: string;
  detail: string;
  badgeType: 'SUCCESS' | 'WARNING' | 'CRITICAL';
} {
  const dailyProfit = Math.round(netContributionPerOrder * dailyOrders);
  const deltaFromFloor = Math.round((asp - breakEvenAsp) * 100) / 100;

  if (marginPct < 0) {
    return {
      headline: `STRUCTURAL CASH DEFICIT (₹${Math.abs(dailyProfit).toLocaleString()}/day bleed)`,
      detail: `At ₹${asp}, your landed cost and marketplace fees exceed selling price by ₹${Math.abs(netContributionPerOrder).toFixed(2)}/order. You must raise ASP by at least ₹${Math.abs(deltaFromFloor).toFixed(2)} to cross the ₹${breakEvenAsp} break-even threshold.`,
      badgeType: 'CRITICAL'
    };
  }

  if (marginPct < 12) {
    return {
      headline: `FRAGILE MARGIN BAND (${marginPct.toFixed(1)}% contribution)`,
      detail: `At ₹${asp}, you are only ₹${deltaFromFloor.toFixed(2)} above the ₹${breakEvenAsp} floor. A 2% spike in PPC bids or customer returns will flip daily contribution into negative territory.`,
      badgeType: 'WARNING'
    };
  }

  if (marginPct >= 25) {
    return {
      headline: `OPTIMAL COMMERCIAL ZONE (${marginPct.toFixed(1)}% margin · ₹${dailyProfit.toLocaleString()}/day)`,
      detail: `Strong unit economics. Selling at ₹${asp} yields ₹${netContributionPerOrder.toFixed(2)} net cash per order (${deltaFromFloor.toFixed(2)} safety cushion above ₹${breakEvenAsp} floor). Recommended for aggressive scaling.`,
      badgeType: 'SUCCESS'
    };
  }

  return {
    headline: `VIABLE OPERATING RANGE (${marginPct.toFixed(1)}% margin)`,
    detail: `Selling at ₹${asp} produces ₹${netContributionPerOrder.toFixed(2)} per order with ₹${dailyProfit.toLocaleString()} daily profit across ${dailyOrders} orders/day. Cushion of ₹${deltaFromFloor.toFixed(2)} over cost floor.`,
    badgeType: 'SUCCESS'
  };
}

export function getArbitrageVerdictText(
  buyCost: number,
  kitCost: number,
  makeCost: number,
  annualVolume: number,
  crossoverVolume: number,
  rawCoilPrice: number
): string {
  const kitSpread = Math.round((buyCost - kitCost) * 100) / 100;
  const makeSpread = Math.round((buyCost - makeCost) * 100) / 100;

  if (annualVolume < 3000) {
    return `At low run-rate (${annualVolume.toLocaleString()} units/yr), Outright Buy at ₹${buyCost.toFixed(2)} is optimal. In-house tooling amortizes at a steep ₹${(makeCost - buyCost > 0 ? makeCost - buyCost : 2.5).toFixed(2)} penalty per unit.`;
  }

  if (kitSpread > 1.20 && annualVolume < crossoverVolume) {
    const annualKitSavings = Math.round(annualVolume * kitSpread);
    return `Arbitrage Opportunity: Component Kitting (stamped bands from Howrah + screws from Rajkot) lands at ₹${kitCost.toFixed(2)} vs ₹${buyCost.toFixed(2)} finished buy cost, saving ₹${annualKitSavings.toLocaleString()}/yr with zero capex. Full tooling remains unviable until ${crossoverVolume.toLocaleString()} units/yr.`;
  }

  if (annualVolume >= crossoverVolume && makeCost < kitCost) {
    const annualMakeSavings = Math.round(annualVolume * makeSpread);
    return `Scale Threshold Breached: At ${annualVolume.toLocaleString()} units/yr and SS304 prime coil at ₹${rawCoilPrice}/kg, in-house progressive die stamping reduces unit cost to ₹${makeCost.toFixed(2)}, generating ₹${annualMakeSavings.toLocaleString()}/yr in net savings. Tooling capex pays back in ${Math.max(4, Math.round(280000 / (annualMakeSavings / 12)))} months.`;
  }

  return `Current volume of ${annualVolume.toLocaleString()} units/yr sits near the boundary. Finished buy costs ₹${buyCost.toFixed(2)}, sub-component kitting costs ₹${kitCost.toFixed(2)}, and in-house stamping lands at ₹${makeCost.toFixed(2)}.`;
}

export function getMarketCompetitivenessText(
  asp: number,
  marketListings: { title: string; price: number; platform: string }[]
): {
  status: 'UNDERCUTTING' | 'PARITY' | 'PREMIUM' | 'OVERPRICED';
  message: string;
} {
  if (!marketListings || marketListings.length === 0) {
    return {
      status: 'PARITY',
      message: `No active market benchmarks configured. Standard target bracket: ₹449 - ₹549.`
    };
  }

  const prices = marketListings.map((l) => l.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  if (asp < minPrice) {
    return {
      status: 'UNDERCUTTING',
      message: `Your price of ₹${asp} is ₹${minPrice - asp} below the lowest market listing (₹${minPrice}). Expect rapid buy-box velocity but verify margin sustainability.`
    };
  }

  if (asp > maxPrice) {
    return {
      status: 'OVERPRICED',
      message: `Your price of ₹${asp} exceeds the highest observed listing (₹${maxPrice} by ₹${asp - maxPrice}). Unless bundling high-grade SS304 MTC certification, organic conversion will drop significantly.`
    };
  }

  if (Math.abs(asp - avgPrice) <= 30) {
    return {
      status: 'PARITY',
      message: `Your price of ₹${asp} is directly aligned with the market median (₹${avgPrice}). Competition hinges on review count, QA documentation, and FBA Prime delivery speed.`
    };
  }

  return {
    status: 'PREMIUM',
    message: `Your price of ₹${asp} sits in the upper industrial tier (market average ₹${avgPrice}). Targets institutional contractors and maintenance buyers requiring DIN 3017 compliance.`
  };
}

export function getSeasonalElasticityNote(
  season: 'LEAN' | 'BASE' | 'PEAK',
  discountPct: number,
  returnRate: number,
  baseOrders: number,
  effectiveDailyOrders: number
): string {
  const deltaOrders = Math.round((effectiveDailyOrders - baseOrders) * 10) / 10;
  const direction = deltaOrders >= 0 ? `+${deltaOrders}` : `${deltaOrders}`;

  if (season === 'PEAK') {
    return `Peak festive/quarter-end industrial demand multiplier (1.48x) active. Daily run-rate lifted by ${direction} orders/day (${effectiveDailyOrders} total). Discount promo of ${discountPct}% applied; return rate tracked at ${returnRate}%.`;
  }

  if (season === 'LEAN') {
    return `Lean monsoon / factory shutdown period multiplier (0.72x) applied. Expected demand contracts by ${Math.abs(deltaOrders)} orders/day to ${effectiveDailyOrders} orders/day. Price sensitivity is elevated.`;
  }

  return `Baseline operating period. Standard daily volume at ${effectiveDailyOrders} orders/day with ${discountPct}% promotional coupon and ${returnRate}% return reserve.`;
}
