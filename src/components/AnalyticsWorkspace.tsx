import React, { useState, useEffect, useMemo } from 'react';
import { AmazonFeeAssumptions, IntelligenceObservation, Supplier, SupplierQuote, B2BCustomer } from '../types';
import {
  calculatePriceSensitivity,
  calculateMakeAssembleBuyArbitrage,
  SensitivityPoint
} from '../lib/sensitivityCalculators';
import {
  getPricingVerdictText,
  getArbitrageVerdictText,
  getMarketCompetitivenessText,
  getSeasonalElasticityNote
} from '../lib/dynamicTextGenerators';
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  saveDatasetToDrive,
  listDriveDatasets,
  DriveDatasetMetadata,
  initGoogleAuth,
  auth
} from '../lib/googleDriveService';
import {
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
  RefreshCw,
  HardDrive,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  Sliders,
  ExternalLink,
  Cpu,
  BarChart2,
  BarChart3,
  PieChart,
  Activity,
  Package,
  Calendar,
  Compass,
  Crosshair,
  TrendingDown,
  Building2,
  Factory
} from 'lucide-react';

interface AnalyticsWorkspaceProps {
  currentAsp: number;
  packSize: number;
  supplierUnitPrice: number;
  ordersPerDay: number;
  feeAssumptions: AmazonFeeAssumptions;
  feeScenario: 'Conservative' | 'Base' | 'Optimistic';
  observations: IntelligenceObservation[];
  suppliers?: Supplier[];
  quotes?: SupplierQuote[];
  b2bCustomers?: B2BCustomer[];
  onApplyStateUpdates: (updates: {
    asp?: number;
    packSize?: number;
    ordersPerDay?: number;
    supplierUnitPrice?: number;
  }) => void;
  onNavigateToStage: (stage: string) => void;
  activeChartView?:
    | 'PRICE_ELASTICITY'
    | 'ARBITRAGE_FLOOR'
    | 'SEASONAL_BANDS'
    | 'MONTE_CARLO'
    | 'BUYER_SELLER_ECONOMICS'
    | 'PROCUREMENT_LADDER'
    | 'MARGIN_HEATMAP'
    | 'MARKET_PRICING_RADAR'
    | 'AI_PROCUREMENT_MODELING';
  onChartViewChange?: (
    view:
      | 'PRICE_ELASTICITY'
      | 'ARBITRAGE_FLOOR'
      | 'SEASONAL_BANDS'
      | 'MONTE_CARLO'
      | 'BUYER_SELLER_ECONOMICS'
      | 'PROCUREMENT_LADDER'
      | 'MARGIN_HEATMAP'
      | 'MARKET_PRICING_RADAR'
      | 'AI_PROCUREMENT_MODELING'
  ) => void;
  selectedSupplierId?: string;
  selectedBuyerId?: string;
  onSelectSupplier?: (supplierId: string) => void;
  onSelectBuyer?: (buyerId: string) => void;
}

interface CompetitorListing {
  title: string;
  platform: string;
  price: number;
  packSize: number;
  unitPrice: number;
  seller: string;
  materialGrade: string;
  rating: number;
  reviewCount: number;
}

export const AnalyticsWorkspace: React.FC<AnalyticsWorkspaceProps> = ({
  currentAsp,
  packSize,
  supplierUnitPrice,
  ordersPerDay,
  feeAssumptions,
  feeScenario,
  observations,
  suppliers = [],
  quotes = [],
  b2bCustomers = [],
  onApplyStateUpdates,
  onNavigateToStage,
  activeChartView: parentChartView = 'PRICE_ELASTICITY',
  onChartViewChange,
  selectedSupplierId,
  selectedBuyerId,
  onSelectSupplier,
  onSelectBuyer
}) => {
  // 1. Dynamic Controls & Parameter Overrides
  const [activeAsp, setActiveAsp] = useState<number>(currentAsp);
  const [season, setSeason] = useState<'LEAN' | 'BASE' | 'PEAK'>('BASE');
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [returnRateOffset, setReturnRateOffset] = useState<number>(0);
  const [activeChartView, setActiveChartView] = useState<
    | 'PRICE_ELASTICITY'
    | 'ARBITRAGE_FLOOR'
    | 'SEASONAL_BANDS'
    | 'MONTE_CARLO'
    | 'BUYER_SELLER_ECONOMICS'
    | 'PROCUREMENT_LADDER'
    | 'MARGIN_HEATMAP'
    | 'MARKET_PRICING_RADAR'
    | 'AI_PROCUREMENT_MODELING'
  >(parentChartView);

  // Active Supplier and Active Buyer entities from pipeline
  const activeSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0] || null;
  }, [suppliers, selectedSupplierId]);

  const activeBuyer = useMemo(() => {
    return b2bCustomers.find((b) => b.id === selectedBuyerId) || b2bCustomers[0] || null;
  }, [b2bCustomers, selectedBuyerId]);

  // AI Procurement Modeling State
  const [modelSteelPrice, setModelSteelPrice] = useState<number>(240); // ₹/kg
  const [modelBatchVolume, setModelBatchVolume] = useState<number>(25000); // units/batch
  const [modelCreditTerms, setModelCreditTerms] = useState<'ADVANCE' | '15_DAYS' | '30_DAYS' | '45_DAYS'>('15_DAYS');
  const [isAiModelingRates, setIsAiModelingRates] = useState<boolean>(false);
  const [aiModeledInsight, setAiModeledInsight] = useState<string | null>(null);

  // Sync with parent chart view prop
  useEffect(() => {
    if (parentChartView) {
      setActiveChartView(parentChartView);
    }
  }, [parentChartView]);

  const handleSetChartView = (view: typeof activeChartView) => {
    setActiveChartView(view);
    onChartViewChange?.(view);
  };

  // Buyer & Seller Economics State
  const [buyerSellerEconomics, setBuyerSellerEconomics] = useState<any>(null);
  const [loadingBuyerSeller, setLoadingBuyerSeller] = useState<boolean>(false);

  // Arbitrage Variables
  const [annualVolume, setAnnualVolume] = useState<number>(18000);
  const [rawCoilPrice, setRawCoilPrice] = useState<number>(240);
  const [toolingCapex, setToolingCapex] = useState<number>(280000);

  // Sync activeAsp if parent props change
  useEffect(() => {
    setActiveAsp(currentAsp);
  }, [currentAsp]);

  // 2. Google Drive Auth & Dataset State
  const [driveUser, setDriveUser] = useState<any>(null);
  const [driveConnecting, setDriveConnecting] = useState(false);
  const [driveDatasets, setDriveDatasets] = useState<DriveDatasetMetadata[]>([]);
  const [driveStatusMsg, setDriveStatusMsg] = useState<string>('');
  const [autoSyncDrive, setAutoSyncDrive] = useState<boolean>(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user) => {
        setDriveUser(user);
        refreshDriveFiles();
      },
      () => {
        setDriveUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const refreshDriveFiles = async () => {
    try {
      const files = await listDriveDatasets();
      setDriveDatasets(files);
    } catch (e) {
      console.error('Error refreshing Drive files', e);
    }
  };

  const handleGoogleSignIn = async () => {
    setDriveConnecting(true);
    setDriveStatusMsg('');
    try {
      const { user } = await signInWithGoogleDrive();
      setDriveUser(user);
      setDriveStatusMsg('Successfully connected to Google Drive');
      refreshDriveFiles();
    } catch (err: any) {
      setDriveStatusMsg(err.message || 'Google Drive connection failed');
    } finally {
      setDriveConnecting(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogleDrive();
    setDriveUser(null);
    setDriveDatasets([]);
    setDriveStatusMsg('Disconnected from Google Drive');
  };

  // 3. Observed Market Benchmarks
  const [marketListings, setMarketListings] = useState<CompetitorListing[]>([
    {
      title: 'Generic SS304 Worm Drive Hose Clamp Pack of 20 (16-25mm)',
      platform: 'Amazon India',
      price: 499,
      packSize: 20,
      unitPrice: 24.95,
      seller: 'Apex Fasteners India',
      materialGrade: 'SS304 W4',
      rating: 4.2,
      reviewCount: 148
    },
    {
      title: 'Industrial Heavy Duty Hose Clamp Stainless Steel 304 Pack of 20',
      platform: 'Amazon India',
      price: 549,
      packSize: 20,
      unitPrice: 27.45,
      seller: 'Kolkata Clamp Depot',
      materialGrade: 'SS304 German Type',
      rating: 4.4,
      reviewCount: 312
    },
    {
      title: 'SS304 DIN 3017 Hose Clips Wholesale Lot',
      platform: 'IndiaMART',
      price: 360,
      packSize: 20,
      unitPrice: 18.00,
      seller: 'Howrah Precision Dies',
      materialGrade: 'SS304 Prime',
      rating: 4.0,
      reviewCount: 45
    },
    {
      title: 'Moglix Industrial Worm Drive Clamp Pack of 10',
      platform: 'Moglix',
      price: 289,
      packSize: 10,
      unitPrice: 28.90,
      seller: 'Industrial Supply Mart',
      materialGrade: 'SS201/304 Hybrid',
      rating: 3.9,
      reviewCount: 78
    }
  ]);

  const [scrapeQuery, setScrapeQuery] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  const handleScrapeListing = async () => {
    if (!scrapeQuery.trim()) return;
    setIsScraping(true);
    try {
      const res = await fetch('/api/ai/scrape-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlOrQuery: scrapeQuery })
      });
      const data = await res.json();
      if (data.success && data.listing) {
        setMarketListings((prev) => [
          {
            title: data.listing.title || scrapeQuery,
            platform: data.listing.platform || 'Scraped Listing',
            price: data.listing.price || 480,
            packSize: data.listing.packSize || 20,
            unitPrice: Math.round(((data.listing.price || 480) / (data.listing.packSize || 20)) * 100) / 100,
            seller: data.listing.seller || 'Verified Merchant',
            materialGrade: data.listing.materialGrade || 'SS304',
            rating: data.listing.rating || 4.1,
            reviewCount: data.listing.reviewCount || 60
          },
          ...prev
        ]);
        setScrapeQuery('');
      }
    } catch (err) {
      console.error('Scrape error:', err);
    } finally {
      setIsScraping(false);
    }
  };

  // 4. Dual-AI (Groq + Gemini) Recommendations State
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState(false);
  const [aiConsensus, setAiConsensus] = useState<{
    recommendedAsp: number;
    confidenceScore: number;
    recommendedChart: 'PRICE_ELASTICITY' | 'ARBITRAGE_FLOOR' | 'SEASONAL_BANDS' | 'MONTE_CARLO';
    elasticityFactor: number;
    macroAnalysis: string;
    competitiveVerdict: string;
    groqCalculationsSummary: string;
    arbitrageAction: string;
    proposedStateUpdates: any;
  } | null>(null);

  const handleRunDualAiAnalysis = async () => {
    setAiAnalysisRunning(true);
    try {
      const res = await fetch('/api/ai/analytics-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAsp: activeAsp,
          packSize,
          supplierUnitPrice,
          ordersPerDay,
          feeScenario,
          season,
          marketListings
        })
      });
      const data = await res.json();
      if (data.success && data.consensus) {
        setAiConsensus(data.consensus);
        if (data.consensus.recommendedChart) {
          setActiveChartView(data.consensus.recommendedChart);
        }
      }
    } catch (err) {
      console.error('Failed to run dual-ai analysis:', err);
    } finally {
      setAiAnalysisRunning(false);
    }
  };

  const handleApplyAiUpdates = () => {
    if (!aiConsensus?.proposedStateUpdates) return;
    const { asp, packSize: pSize, ordersPerDay: opd, supplierUnitPrice: supPrice } = aiConsensus.proposedStateUpdates;
    onApplyStateUpdates({
      asp: asp || activeAsp,
      packSize: pSize || packSize,
      ordersPerDay: opd || ordersPerDay,
      supplierUnitPrice: supPrice || supplierUnitPrice
    });
    if (asp) setActiveAsp(asp);
  };

  const fetchBuyerSellerEconomics = async () => {
    setLoadingBuyerSeller(true);
    try {
      const res = await fetch('/api/ai/buyer-seller-economics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierFloorInr: supplierUnitPrice,
          packSize
        })
      });
      const data = await res.json();
      if (data.success && data.economics) {
        setBuyerSellerEconomics(data.economics);
      }
    } catch (e) {
      console.error('Failed to load buyer seller economics:', e);
    } finally {
      setLoadingBuyerSeller(false);
    }
  };

  useEffect(() => {
    if (activeChartView === 'BUYER_SELLER_ECONOMICS' && !buyerSellerEconomics) {
      fetchBuyerSellerEconomics();
    }
  }, [activeChartView]);

  // 5. Calculations
  const sensitivityData = useMemo(() => {
    return calculatePriceSensitivity(
      activeAsp,
      ordersPerDay,
      packSize,
      supplierUnitPrice,
      feeAssumptions,
      {
        season,
        discountPct,
        returnRateOffsetPct: returnRateOffset,
        elasticityFactor: aiConsensus?.elasticityFactor || 1.35
      }
    );
  }, [
    activeAsp,
    ordersPerDay,
    packSize,
    supplierUnitPrice,
    feeAssumptions,
    season,
    discountPct,
    returnRateOffset,
    aiConsensus
  ]);

  const arbitrageData = useMemo(() => {
    return calculateMakeAssembleBuyArbitrage(
      annualVolume,
      rawCoilPrice,
      supplierUnitPrice,
      toolingCapex
    );
  }, [annualVolume, rawCoilPrice, supplierUnitPrice, toolingCapex]);

  // Dynamic Logic Verdicts
  const pricingVerdict = useMemo(() => {
    const activePoint = sensitivityData.points.find((p) => p.asp === activeAsp) || {
      netContributionPerOrder: activeAsp * 0.15,
      contributionMarginPct: 15,
      estimatedDailyOrders: ordersPerDay
    };
    return getPricingVerdictText(
      activeAsp,
      activePoint.contributionMarginPct,
      activePoint.netContributionPerOrder,
      sensitivityData.breakEvenAsp,
      activePoint.estimatedDailyOrders
    );
  }, [activeAsp, sensitivityData, ordersPerDay]);

  const arbitrageVerdict = useMemo(() => {
    return getArbitrageVerdictText(
      arbitrageData.buyUnitCost,
      arbitrageData.kitUnitCost,
      arbitrageData.makeUnitCost,
      arbitrageData.annualVolume,
      arbitrageData.kitToMakeCrossoverVolume,
      arbitrageData.rawCoilPricePerKg
    );
  }, [arbitrageData]);

  const competitivenessVerdict = useMemo(() => {
    return getMarketCompetitivenessText(activeAsp, marketListings);
  }, [activeAsp, marketListings]);

  const seasonalNote = useMemo(() => {
    const activePt = sensitivityData.points.find((p) => p.asp === activeAsp);
    const effOrders = activePt?.estimatedDailyOrders || ordersPerDay;
    return getSeasonalElasticityNote(
      season,
      discountPct,
      feeAssumptions.return_rate_pct + returnRateOffset,
      ordersPerDay,
      effOrders
    );
  }, [season, discountPct, feeAssumptions, returnRateOffset, ordersPerDay, sensitivityData, activeAsp]);

  // 6. Save Snapshot to Google Drive
  const handleSaveToDrive = async (format: 'json' | 'csv' = 'json') => {
    if (!driveUser) {
      handleGoogleSignIn();
      return;
    }
    setIsSavingToDrive(true);
    setDriveStatusMsg('');
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      if (format === 'json') {
        const payload = {
          exportTimestamp: new Date().toISOString(),
          parameters: {
            activeAsp,
            packSize,
            supplierUnitPrice,
            ordersPerDay,
            season,
            discountPct,
            feeScenario
          },
          sensitivitySummary: {
            breakEvenAsp: sensitivityData.breakEvenAsp,
            optimalAsp: sensitivityData.optimalAsp,
            maxDailyContribution: sensitivityData.maxDailyContribution,
            currentContributionMarginPct: sensitivityData.currentContributionMarginPct
          },
          arbitrageSummary: {
            annualVolume: arbitrageData.annualVolume,
            buyUnitCost: arbitrageData.buyUnitCost,
            kitUnitCost: arbitrageData.kitUnitCost,
            makeUnitCost: arbitrageData.makeUnitCost,
            optimalStrategy: arbitrageData.optimalStrategy,
            savingsAnnual: arbitrageData.kitSavingsAnnual
          },
          sensitivityPoints: sensitivityData.points
        };
        const filename = `industrial_pricing_snapshot_${activeAsp}inr_${timestamp}.json`;
        await saveDatasetToDrive(filename, JSON.stringify(payload, null, 2), 'application/json');
      } else {
        // CSV Export
        const headers = 'ASP,Daily_Orders,Gross_Revenue,Landed_COGS,Amazon_Fees,Net_Contribution,Margin_Pct,Daily_Contribution,MonteCarlo_P10,MonteCarlo_P90\n';
        const rows = sensitivityData.points
          .map(
            (p) =>
              `${p.asp},${p.estimatedDailyOrders},${p.grossDailyRevenue},${p.landedCogsPerOrder},${p.amazonFeesPerOrder},${p.netContributionPerOrder},${p.contributionMarginPct},${p.dailyContribution},${p.monteCarloP10MarginPct},${p.monteCarloP90MarginPct}`
          )
          .join('\n');
        const filename = `price_sensitivity_dataset_${timestamp}.csv`;
        await saveDatasetToDrive(filename, headers + rows, 'text/csv');
      }
      setDriveStatusMsg(`Saved ${format.toUpperCase()} dataset directly to your Google Drive.`);
      refreshDriveFiles();
    } catch (err: any) {
      setDriveStatusMsg(`Failed to save to Drive: ${err.message}`);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  // Auto-sync when toggled
  useEffect(() => {
    if (autoSyncDrive && driveUser) {
      const timer = setTimeout(() => {
        handleSaveToDrive('json');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeAsp, season, discountPct, annualVolume, autoSyncDrive]);

  // Chart Rendering Helpers (SVG-based for zero-dependency high reliability)
  const chartPoints = sensitivityData.points;
  const minChartAsp = chartPoints[0]?.asp || 249;
  const maxChartAsp = chartPoints[chartPoints.length - 1]?.asp || 849;
  const maxMargin = Math.max(35, ...chartPoints.map((p) => p.contributionMarginPct));
  const minMargin = Math.min(-15, ...chartPoints.map((p) => p.contributionMarginPct));

  const svgWidth = 840;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const getX = (asp: number) => {
    return padding.left + ((asp - minChartAsp) / (maxChartAsp - minChartAsp)) * graphWidth;
  };

  const getY = (val: number, minVal: number, maxVal: number) => {
    const range = maxVal - minVal || 1;
    return padding.top + graphHeight - ((val - minVal) / range) * graphHeight;
  };

  // Build SVG path for Contribution Margin Curve
  const marginPath = chartPoints
    .map((p, idx) => {
      const x = getX(p.asp);
      const y = getY(p.contributionMarginPct, minMargin, maxMargin);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Build SVG polygon for Monte Carlo Confidence Envelope (P10 to P90)
  const monteCarloUpper = chartPoints.map((p) => `${getX(p.asp)},${getY(p.monteCarloP90MarginPct, minMargin, maxMargin)}`);
  const monteCarloLower = [...chartPoints].reverse().map((p) => `${getX(p.asp)},${getY(p.monteCarloP10MarginPct, minMargin, maxMargin)}`);
  const monteCarloPolygon = `${monteCarloUpper.join(' ')} ${monteCarloLower.join(' ')}`;

  // Break-even horizontal line Y
  const zeroMarginY = getY(0, minMargin, maxMargin);

  return (
    <div className="space-y-6">
      {/* 1. Header Control Bar & Dynamic KPI Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
                Stage 11 · Commercial Analytics
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">
                Price Sensitivity, Floor Pricing &amp; Dual-AI Arbitrage
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Dynamic Commercial Decision Cockpit</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                Hero SKU · Pack of {packSize}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Continuous price sensitivity, Monte Carlo risk boundaries, three-tier make/assemble/buy floor pricing, and Google Drive cloud ledger persistence.
            </p>
          </div>

          {/* Quick AI & Drive Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRunDualAiAnalysis}
              disabled={aiAnalysisRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${aiAnalysisRunning ? 'animate-spin' : ''}`} />
              <span>{aiAnalysisRunning ? 'Groq + Gemini Computing...' : 'Run Dual-AI Analysis'}</span>
            </button>

            {driveUser ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSaveToDrive('json')}
                  disabled={isSavingToDrive}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded text-xs font-mono transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSavingToDrive ? 'Saving...' : 'Sync to Drive'}</span>
                </button>
                <button
                  onClick={handleGoogleSignOut}
                  title={`Signed in as ${driveUser.email || 'Google User'}. Click to disconnect.`}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs transition-colors"
                >
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={driveConnecting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-mono transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>{driveConnecting ? 'Connecting...' : 'Connect Google Drive'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Badges derived strictly from active state */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active ASP</span>
            <div className="text-lg font-bold text-white mt-0.5">₹{activeAsp}</div>
            <span className="text-[10px] text-slate-500">Margin: {sensitivityData.currentContributionMarginPct}%</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Break-Even Floor</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">₹{sensitivityData.breakEvenAsp}</div>
            <span className="text-[10px] text-slate-500">Landed: ₹{(supplierUnitPrice * packSize + 22).toFixed(2)}</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Optimal Profit ASP</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">₹{sensitivityData.optimalAsp}</div>
            <span className="text-[10px] text-slate-500">Max: ₹{sensitivityData.maxDailyContribution}/day</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Arbitrage Winning Floor</span>
            <div className="text-lg font-bold text-blue-400 mt-0.5">
              {arbitrageData.optimalStrategy === 'COMPONENT_ASSEMBLY'
                ? `Kit @ ₹${arbitrageData.kitUnitCost}`
                : arbitrageData.optimalStrategy === 'FULL_IN_HOUSE'
                ? `Make @ ₹${arbitrageData.makeUnitCost}`
                : `Buy @ ₹${arbitrageData.buyUnitCost}`}
            </div>
            <span className="text-[10px] text-slate-500">
              Savings: ₹{arbitrageData.kitSavingsAnnual.toLocaleString()}/yr
            </span>
          </div>
        </div>

        {/* Dynamic Verdict Bar (Derived from live logic) */}
        <div className={`mt-4 p-3 rounded border text-xs font-mono flex items-start gap-2.5 ${
          pricingVerdict.badgeType === 'CRITICAL'
            ? 'bg-rose-950/50 border-rose-800/60 text-rose-300'
            : pricingVerdict.badgeType === 'WARNING'
            ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
            : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
        }`}>
          {pricingVerdict.badgeType === 'CRITICAL' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : pricingVerdict.badgeType === 'WARNING' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">{pricingVerdict.headline}</div>
            <div className="text-slate-300 text-[11px] mt-0.5">{pricingVerdict.detail}</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Controls & Scenario Adjusters */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 font-mono text-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Active ASP Slider */}
          <div className="w-full md:w-1/3">
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Active ASP Slider:</span>
              <span className="font-bold text-white text-sm">₹{activeAsp}</span>
            </div>
            <input
              type="range"
              min={299}
              max={799}
              step={10}
              value={activeAsp}
              onChange={(e) => setActiveAsp(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>₹299 (Discount Entry)</span>
              <span>₹499 (Baseline)</span>
              <span>₹799 (Premium MRO)</span>
            </div>
          </div>

          {/* Seasonal Demand Profile */}
          <div className="w-full md:w-1/3">
            <span className="text-slate-300 block mb-1.5">Demand Seasonality:</span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded">
              {(['LEAN', 'BASE', 'PEAK'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  className={`py-1 rounded text-center transition-colors ${
                    season === s
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s === 'LEAN' ? 'Lean (0.72x)' : s === 'PEAK' ? 'Peak (1.48x)' : 'Base (1.0x)'}
                </button>
              ))}
            </div>
          </div>

          {/* Promotional Coupon & Return Offset Sliders */}
          <div className="w-full md:w-1/3 grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Promo Discount:</span>
                <span className="text-white">{discountPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={5}
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Return Rate:</span>
                <span className="text-white">{feeAssumptions.return_rate_pct + returnRateOffset}%</span>
              </div>
              <input
                type="range"
                min={-2}
                max={6}
                step={1}
                value={returnRateOffset}
                onChange={(e) => setReturnRateOffset(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Contextual Guidance Note */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{seasonalNote}</span>
          {activeAsp !== currentAsp && (
            <button
              onClick={() => onApplyStateUpdates({ asp: activeAsp })}
              className="text-blue-400 hover:text-blue-300 font-bold ml-2 underline"
            >
              Push ₹{activeAsp} to Global Pipeline &rarr;
            </button>
          )}
        </div>
      </div>

      {/* 3. Primary Chart Visualizer Canvas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs">
            <button
              onClick={() => handleSetChartView('PRICE_ELASTICITY')}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                activeChartView === 'PRICE_ELASTICITY'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Price Elasticity &amp; Margins
            </button>
            <button
              onClick={() => handleSetChartView('ARBITRAGE_FLOOR')}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                activeChartView === 'ARBITRAGE_FLOOR'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Floor Pricing &amp; Arbitrage
            </button>
            <button
              onClick={() => handleSetChartView('BUYER_SELLER_ECONOMICS')}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                activeChartView === 'BUYER_SELLER_ECONOMICS'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buyer vs. Seller Economics
            </button>
            <button
              onClick={() => handleSetChartView('PROCUREMENT_LADDER')}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                activeChartView === 'PROCUREMENT_LADDER'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Procurement Rate Ladder
            </button>
            <button
              onClick={() => handleSetChartView('MARGIN_HEATMAP')}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                activeChartView === 'MARGIN_HEATMAP'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2D Profitability Heatmap
            </button>
            <button
              onClick={() => handleSetChartView('MARKET_PRICING_RADAR')}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                activeChartView === 'MARKET_PRICING_RADAR'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Market Price Radar
            </button>
            <button
              onClick={() => handleSetChartView('AI_PROCUREMENT_MODELING')}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                activeChartView === 'AI_PROCUREMENT_MODELING'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Rate &amp; Procurement Modeler
            </button>
            <button
              onClick={() => handleSetChartView('MONTE_CARLO')}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                activeChartView === 'MONTE_CARLO'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monte Carlo Bounds
            </button>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Contribution Margin %</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Optimal ASP (₹{sensitivityData.optimalAsp})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Active ASP (₹{activeAsp})</span>
            </span>
          </div>
        </div>

        {/* View A: Price Elasticity & Margin Curve */}
        {activeChartView === 'PRICE_ELASTICITY' && (
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[340px] select-none font-mono"
            >
              {/* Grid Lines & Horizontal Axis */}
              <line
                x1={padding.left}
                y1={zeroMarginY}
                x2={svgWidth - padding.right}
                y2={zeroMarginY}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - padding.right + 5}
                y={zeroMarginY + 3}
                fill="#ef4444"
                fontSize="9"
              >
                0% Break-Even
              </text>

              {/* Shaded Monte Carlo Envelope */}
              <polygon
                points={monteCarloPolygon}
                fill="#3b82f6"
                fillOpacity="0.12"
              />

              {/* Main Margin Line */}
              <path
                d={marginPath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Break-Even ASP Vertical Line */}
              {sensitivityData.breakEvenAsp > 0 && (
                <g>
                  <line
                    x1={getX(sensitivityData.breakEvenAsp)}
                    y1={padding.top}
                    x2={getX(sensitivityData.breakEvenAsp)}
                    y2={svgHeight - padding.bottom}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={getX(sensitivityData.breakEvenAsp)}
                    y={padding.top - 8}
                    fill="#f59e0b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    Floor ₹{sensitivityData.breakEvenAsp}
                  </text>
                </g>
              )}

              {/* Active ASP Vertical Marker */}
              <g>
                <line
                  x1={getX(activeAsp)}
                  y1={padding.top}
                  x2={getX(activeAsp)}
                  y2={svgHeight - padding.bottom}
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <circle
                  cx={getX(activeAsp)}
                  cy={getY(sensitivityData.currentContributionMarginPct, minMargin, maxMargin)}
                  r="5"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={getX(activeAsp)}
                  y={padding.top - 8}
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Active ₹{activeAsp}
                </text>
              </g>

              {/* Optimal ASP Marker */}
              <g>
                <circle
                  cx={getX(sensitivityData.optimalAsp)}
                  cy={getY(
                    chartPoints.find((p) => p.asp === sensitivityData.optimalAsp)?.contributionMarginPct || 25,
                    minMargin,
                    maxMargin
                  )}
                  r="5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={getX(sensitivityData.optimalAsp)}
                  y={svgHeight - padding.bottom + 15}
                  fill="#10b981"
                  fontSize="9"
                  textAnchor="middle"
                >
                  Optimal ₹{sensitivityData.optimalAsp}
                </text>
              </g>

              {/* X-Axis labels */}
              {[300, 400, 500, 600, 700, 800].map((tickAsp) => (
                <text
                  key={tickAsp}
                  x={getX(tickAsp)}
                  y={svgHeight - padding.bottom + 30}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="middle"
                >
                  ₹{tickAsp}
                </text>
              ))}

              {/* Y-Axis labels (Margins) */}
              {[-10, 0, 10, 20, 30].map((tickMargin) => (
                <text
                  key={tickMargin}
                  x={padding.left - 10}
                  y={getY(tickMargin, minMargin, maxMargin) + 3}
                  fill="#64748b"
                  fontSize="9"
                  textAnchor="end"
                >
                  {tickMargin}%
                </text>
              ))}
            </svg>

            {/* Quick Interactive Data Table Row */}
            <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded font-mono text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500 block">Daily Volume at ₹{activeAsp}:</span>
                <span className="font-bold text-white">
                  {chartPoints.find((p) => p.asp === activeAsp)?.estimatedDailyOrders || ordersPerDay} orders/day
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Gross Daily Sales:</span>
                <span className="font-bold text-white">
                  ₹{(chartPoints.find((p) => p.asp === activeAsp)?.grossDailyRevenue || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Daily Net Contribution:</span>
                <span className="font-bold text-emerald-400">
                  ₹{(chartPoints.find((p) => p.asp === activeAsp)?.dailyContribution || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">P10 - P90 Margin Range:</span>
                <span className="font-bold text-blue-400">
                  {chartPoints.find((p) => p.asp === activeAsp)?.monteCarloP10MarginPct}% to{' '}
                  {chartPoints.find((p) => p.asp === activeAsp)?.monteCarloP90MarginPct}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* View B: Floor Pricing & Make vs Assemble vs Buy Arbitrage */}
        {activeChartView === 'ARBITRAGE_FLOOR' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Direct Buy */}
              <div className={`p-4 rounded border ${
                arbitrageData.optimalStrategy === 'DIRECT_BUY'
                  ? 'bg-amber-950/40 border-amber-500/50'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-200">1. Finished Direct Buy</span>
                  {arbitrageData.optimalStrategy === 'DIRECT_BUY' && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Active Choice</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  ₹{arbitrageData.buyUnitCost.toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal"> / unit</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Supplier Quote:</span>
                    <span>₹{supplierUnitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inbound Freight &amp; QA:</span>
                    <span>₹0.70</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-slate-300">
                    <span>Annual Spend ({annualVolume.toLocaleString()} u):</span>
                    <span>₹{arbitrageData.annualBuySpend.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Option 2: Component Assembly & Kitting */}
              <div className={`p-4 rounded border ${
                arbitrageData.optimalStrategy === 'COMPONENT_ASSEMBLY'
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-200">2. Component Kitting</span>
                  {arbitrageData.optimalStrategy === 'COMPONENT_ASSEMBLY' && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Arbitrage Winner</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-2">
                  ₹{arbitrageData.kitUnitCost.toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal"> / unit</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Howrah Stamped Band:</span>
                    <span>₹6.20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rajkot Worm Screw:</span>
                    <span>₹3.30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In-House Assembly/Box:</span>
                    <span>₹2.10</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-300 font-bold">
                    <span>Net Annual Savings:</span>
                    <span>₹{arbitrageData.kitSavingsAnnual.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Option 3: Full In-House Manufacturing */}
              <div className={`p-4 rounded border ${
                arbitrageData.optimalStrategy === 'FULL_IN_HOUSE'
                  ? 'bg-blue-950/40 border-blue-500/50'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-200">3. Full In-House Stamping</span>
                  {arbitrageData.optimalStrategy === 'FULL_IN_HOUSE' && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Scale Leader</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  ₹{arbitrageData.makeUnitCost.toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal"> / unit</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Raw SS304 Strip:</span>
                    <span>₹{arbitrageData.makeRawMaterialCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tooling Capex Amort:</span>
                    <span>₹{arbitrageData.makeToolingAmortization.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power &amp; Press Labor:</span>
                    <span>₹{arbitrageData.makeLaborAndPower.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-blue-300 font-bold">
                    <span>Crossover Threshold:</span>
                    <span>{arbitrageData.kitToMakeCrossoverVolume.toLocaleString()} units/yr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Volume Slider for Arbitrage */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Annual Commercial Volume:</span>
                <span className="font-bold text-white text-sm">{annualVolume.toLocaleString()} units / year</span>
              </div>
              <input
                type="range"
                min={2000}
                max={50000}
                step={1000}
                value={annualVolume}
                onChange={(e) => setAnnualVolume(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2,000 u/yr (Pilot Test)</span>
                <span>{arbitrageData.kitToMakeCrossoverVolume.toLocaleString()} u/yr (Tooling Crossover)</span>
                <span>50,000 u/yr (Factory Scale)</span>
              </div>
            </div>

            {/* Strategic Analysis Note */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded text-slate-300 text-[11px] leading-relaxed">
              <span className="text-emerald-400 font-bold">Arbitrage &amp; Floor Analysis: </span>
              {arbitrageVerdict}
            </div>
          </div>
        )}

        {/* View C: Monte Carlo Failure Bounds */}
        {activeChartView === 'MONTE_CARLO' && (
          <div className="space-y-3 font-mono text-xs">
            <p className="text-slate-400 text-[11px]">
              Simulates 1,000 algorithmic scenarios incorporating ±25% PPC bid inflation, delivery return leakage (2% to 8%), and supplier raw material adjustments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded">
                <span className="text-rose-400 font-bold block mb-1">P10 Pessimistic Floor</span>
                <div className="text-xl font-bold text-white">
                  {chartPoints.find((p) => p.asp === activeAsp)?.monteCarloP10MarginPct}% margin
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Occurs if PPC cost per acquisition jumps to ₹85/order and returns spike to 6.8%.
                </p>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded">
                <span className="text-blue-400 font-bold block mb-1">Expected Median Case</span>
                <div className="text-xl font-bold text-white">
                  {chartPoints.find((p) => p.asp === activeAsp)?.contributionMarginPct}% margin
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Baseline operating conditions with calibrated ₹49 PPC bid and standard 2.5% return rate.
                </p>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded">
                <span className="text-emerald-400 font-bold block mb-1">P90 Optimistic Ceiling</span>
                <div className="text-xl font-bold text-white">
                  {chartPoints.find((p) => p.asp === activeAsp)?.monteCarloP90MarginPct}% margin
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Achieved with strong organic keyword ranking (ACOS &lt; 8%) and repeat B2B contractor reorders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View D: Buyer vs. Seller Economics & Arbitrage Spread */}
        {activeChartView === 'BUYER_SELLER_ECONOMICS' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Cross-Segment Spread &amp; Commercial Hedging
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Charting manufacturer production floors against buyer willingness-to-pay across industrial sectors in India.
                </p>
              </div>

              <button
                onClick={fetchBuyerSellerEconomics}
                disabled={loadingBuyerSeller}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${loadingBuyerSeller ? 'animate-spin' : ''}`} />
                <span>{loadingBuyerSeller ? 'Analyzing Spread...' : 'Refresh AI Economics'}</span>
              </button>
            </div>

            {/* Active Pipeline Pair Strategic Card */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/40 border border-emerald-500/30 rounded-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-white font-bold text-xs uppercase tracking-wider">
                    Active Pipeline Pairing: Sourcing Partner &rarr; Commercial Account
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-400">Arbitrage Mode:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/60">
                    LIVE PIPELINE PAIR
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                {/* Active Sourcing Supplier */}
                <div className="p-2.5 bg-slate-950/80 border border-amber-900/40 rounded space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Factory className="w-3 h-3" />
                      Active Sourcing Partner (Origin)
                    </span>
                    <span className="text-slate-400">{activeSupplier?.city || 'Howrah, WB'}</span>
                  </div>
                  <div className="font-bold text-white text-xs">{activeSupplier?.name || 'Howrah Precision Fasteners'}</div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Sourcing Floor Quote:</span>
                    <span className="text-amber-400 font-bold font-mono">₹{supplierUnitPrice.toFixed(2)} / clamp</span>
                  </div>
                  {suppliers.length > 1 && onSelectSupplier && (
                    <div className="pt-1.5 flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-500">Switch:</span>
                      <select
                        value={selectedSupplierId || ''}
                        onChange={(e) => onSelectSupplier(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                      >
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.city || 'Hub'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Active Buyer Account */}
                <div className="p-2.5 bg-slate-950/80 border border-emerald-900/40 rounded space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Active B2B Buyer (Destination)
                    </span>
                    <span className="text-slate-400">{activeBuyer?.city || 'Pune / Kolkata'}</span>
                  </div>
                  <div className="font-bold text-white text-xs">{activeBuyer?.company_name || 'Kolkata Metro Cold Storage & HVAC'}</div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Target Purchase Price:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ₹{activeBuyer?.average_order_value_inr && activeBuyer?.estimated_annual_consumption_units ? (activeBuyer.average_order_value_inr / 2000).toFixed(2) : '24.00'} / clamp
                    </span>
                  </div>
                  {b2bCustomers.length > 1 && onSelectBuyer && (
                    <div className="pt-1.5 flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-500">Switch:</span>
                      <select
                        value={selectedBuyerId || ''}
                        onChange={(e) => onSelectBuyer(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                      >
                        {b2bCustomers.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.company_name} ({b.industry})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Net Pair Arbitrage Banner */}
              <div className="mt-2.5 p-2 bg-slate-950 border border-slate-800 rounded flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
                <span className="text-slate-300">
                  Direct Arbitrage Spread: <strong className="text-emerald-400 font-bold font-mono">
                    +₹{Math.max(0, ((activeBuyer?.average_order_value_inr && activeBuyer?.estimated_annual_consumption_units ? activeBuyer.average_order_value_inr / 2000 : 24.00) - supplierUnitPrice - 0.65)).toFixed(2)} / clamp
                  </strong> (after ₹0.65 road freight &amp; QA)
                </span>
                <span className="text-amber-300 text-[10px]">
                  Annual Gross Potential: ~₹{(Math.max(0, ((activeBuyer?.average_order_value_inr && activeBuyer?.estimated_annual_consumption_units ? activeBuyer.average_order_value_inr / 2000 : 24.00) - supplierUnitPrice - 0.65)) * (activeBuyer?.estimated_annual_consumption_units || 30000)).toLocaleString()} / yr
                </span>
              </div>
            </div>

            {/* SVG Dual-Bar Arbitrage Spread Visualizer */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  Comparative Arbitrage Economics: Landed Cost vs. Buyer Target Price (₹/clamp)
                </span>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
                    <span>Landed Cost</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                    <span>Buyer Target</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                    <span>Net Margin Spread</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <svg viewBox="0 0 760 160" className="w-full h-auto max-h-[170px] font-mono select-none">
                  {/* Grid lines */}
                  <line x1="50" y1="20" x2="730" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="50" y1="60" x2="730" y2="60" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="50" y1="100" x2="730" y2="100" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="50" y1="130" x2="730" y2="130" stroke="#475569" strokeWidth="1" />

                  {/* Y Axis labels */}
                  <text x="42" y="24" fill="#94a3b8" fontSize="9" textAnchor="end">₹30</text>
                  <text x="42" y="64" fill="#94a3b8" fontSize="9" textAnchor="end">₹20</text>
                  <text x="42" y="104" fill="#94a3b8" fontSize="9" textAnchor="end">₹10</text>
                  <text x="42" y="133" fill="#94a3b8" fontSize="9" textAnchor="end">₹0</text>

                  {/* 5 Grouped Bars */}
                  {[
                    { label: 'Auto OEM (Pune)', cost: 14.20, target: 24.50, spread: 10.30, x: 70 },
                    { label: 'Pumps (Coimbatore)', cost: 14.45, target: 23.00, spread: 8.55, x: 210 },
                    { label: 'Heavy Eng (Jamshedpur)', cost: 13.85, target: 22.00, spread: 8.15, x: 350 },
                    { label: 'Amazon D2C Retail', cost: 16.30, target: 24.95, spread: 8.65, x: 490 },
                    {
                      label: `Active Pair (${activeSupplier?.city || 'Howrah'} → ${activeBuyer?.city || 'Client'})`,
                      cost: Number((supplierUnitPrice + 0.65).toFixed(2)),
                      target: Number((activeBuyer?.average_order_value_inr && activeBuyer?.estimated_annual_consumption_units ? activeBuyer.average_order_value_inr / 2000 : 24.00).toFixed(2)),
                      spread: Number(Math.max(0, (activeBuyer?.average_order_value_inr && activeBuyer?.estimated_annual_consumption_units ? activeBuyer.average_order_value_inr / 2000 : 24.00) - supplierUnitPrice - 0.65).toFixed(2)),
                      x: 630,
                      isHighlighted: true
                    }
                  ].map((bar, i) => {
                    const costHeight = (bar.cost / 30) * 110;
                    const targetHeight = (bar.target / 30) * 110;
                    const costY = 130 - costHeight;
                    const targetY = 130 - targetHeight;

                    return (
                      <g key={i}>
                        {bar.isHighlighted && (
                          <rect
                            x={bar.x - 14}
                            y="10"
                            width="98"
                            height="125"
                            fill="#10b981"
                            fillOpacity="0.08"
                            rx="4"
                            stroke="#10b981"
                            strokeOpacity="0.3"
                          />
                        )}
                        {/* Cost Bar */}
                        <rect
                          x={bar.x - 8}
                          y={costY}
                          width="26"
                          height={costHeight}
                          fill={bar.isHighlighted ? '#f59e0b' : '#d97706'}
                          rx="2"
                        />
                        <text x={bar.x + 5} y={costY - 3} fill="#fcd34d" fontSize="8.5" textAnchor="middle" fontWeight="bold">
                          ₹{bar.cost}
                        </text>

                        {/* Target Price Bar */}
                        <rect
                          x={bar.x + 22}
                          y={targetY}
                          width="26"
                          height={targetHeight}
                          fill={bar.isHighlighted ? '#10b981' : '#059669'}
                          rx="2"
                        />
                        <text x={bar.x + 35} y={targetY - 3} fill="#6ee7b7" fontSize="8.5" textAnchor="middle" fontWeight="bold">
                          ₹{bar.target}
                        </text>

                        {/* Spread Badge */}
                        <rect
                          x={bar.x - 2}
                          y="15"
                          width="44"
                          height="14"
                          fill="#1e293b"
                          rx="3"
                          stroke="#3b82f6"
                          strokeWidth="0.8"
                        />
                        <text x={bar.x + 20} y="25" fill="#60a5fa" fontSize="8" textAnchor="middle" fontWeight="bold">
                          +{bar.spread}
                        </text>

                        {/* Group Label */}
                        <text x={bar.x + 20} y="146" fill={bar.isHighlighted ? '#34d399' : '#cbd5e1'} fontSize="8" textAnchor="middle" fontWeight={bar.isHighlighted ? 'bold' : 'normal'}>
                          {bar.label.length > 18 ? bar.label.substring(0, 16) + '..' : bar.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Clustered Visual Spread Bars */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Segment 1: Auto OEM */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-xs">Automotive Tier-1 (Pune)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Highest Margin
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buyer Target Price:</span>
                    <span className="text-white font-bold">₹24.50 / pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sourcing Floor (Howrah):</span>
                    <span className="text-amber-400 font-bold">₹13.50 / pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Arbitrage Spread:</span>
                    <span className="text-emerald-400 font-bold">+₹11.00 / pc (+44.9%)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500">Volume &amp; Terms:</span>
                    <span className="text-slate-300">80,000 u &middot; 30d PDC</span>
                  </div>
                </div>
              </div>

              {/* Segment 2: Submersible Pumps */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-xs">Pump OEMs (Coimbatore)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    Fast Velocity
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buyer Target Price:</span>
                    <span className="text-white font-bold">₹23.00 / pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sourcing Floor (Howrah):</span>
                    <span className="text-amber-400 font-bold">₹13.50 / pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Arbitrage Spread:</span>
                    <span className="text-emerald-400 font-bold">+₹9.50 / pc (+41.3%)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500">Volume &amp; Terms:</span>
                    <span className="text-slate-300">60,000 u &middot; 15d PDC</span>
                  </div>
                </div>
              </div>

              {/* Segment 3: Heavy Fabrication */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-xs">Heavy Eng (Jamshedpur)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Zero Credit Risk
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buyer Target Price:</span>
                    <span className="text-white font-bold">₹22.00 / pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sourcing Floor (Howrah):</span>
                    <span className="text-amber-400 font-bold">₹13.50 / pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Arbitrage Spread:</span>
                    <span className="text-emerald-400 font-bold">+₹8.50 / pc (+38.6%)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500">Volume &amp; Terms:</span>
                    <span className="text-slate-300">45,000 u &middot; Immediate LC</span>
                  </div>
                </div>
              </div>

              {/* Segment 4: Amazon D2C */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-xs">Amazon D2C Retail DIY</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    Instant Payout
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Effective ASP:</span>
                    <span className="text-white font-bold">₹24.95 / pc (₹499/pk)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Landed Pack COGS:</span>
                    <span className="text-amber-400 font-bold">₹16.30 / pc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Contribution:</span>
                    <span className="text-emerald-400 font-bold">+₹8.65 / pc (+34.6%)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500">Volume &amp; Terms:</span>
                    <span className="text-slate-300">36,000 u &middot; 7d FBA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Commercial Spread Strategy & Negotiation Playbook */}
            {buyerSellerEconomics?.strategicArbitrageSummary && (
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded text-[11px] text-slate-300 space-y-2">
                <div>
                  <strong className="text-emerald-400 font-bold block mb-0.5">
                    AI Commercial Arbitrage Synthesis:
                  </strong>
                  <p className="leading-relaxed">{buyerSellerEconomics.strategicArbitrageSummary}</p>
                </div>

                {buyerSellerEconomics.negotiationTactics?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 font-bold block mb-1">Recommended Negotiation Tactics:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {buyerSellerEconomics.negotiationTactics.map((tac: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-900/80 rounded border border-slate-800">
                          <span className="text-amber-400 font-bold block text-[10px]">{tac.title}</span>
                          <p className="text-[10px] text-slate-300 mt-0.5">{tac.tactic}</p>
                          <span className="text-[9px] text-emerald-400 mt-1 block">
                            Expected Lift: +{tac.expectedMarginLiftPct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* View E: Dynamic Procurement Rate Ladder & Volume Discount Optimizer */}
        {activeChartView === 'PROCUREMENT_LADDER' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  Volume-Tiered Procurement Rate Ladder &amp; Commodity Index
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Modeling supplier marginal stamping costs against Jindal SS304 cold-rolled coil indices (₹240/kg) across scale tiers.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Current Sourcing Base</span>
                <span className="text-sm font-bold text-white">₹{supplierUnitPrice.toFixed(2)} / clamp</span>
              </div>
            </div>

            {/* Interactive SVG Scale Curve & Learning Curve */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Marginal Procurement Cost Curve vs. Scale Tier (DIN 3017 W4)
                </span>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
                    <span>Stamping Unit Price</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-slate-500 inline-block"></span>
                    <span>Raw Steel Floor (₹5.82)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <span>Active Quote (₹{supplierUnitPrice.toFixed(2)})</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <svg viewBox="0 0 760 130" className="w-full h-auto max-h-[140px] font-mono select-none">
                  {/* Grid */}
                  <line x1="50" y1="15" x2="730" y2="15" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="50" y1="45" x2="730" y2="45" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="50" y1="75" x2="730" y2="75" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                  <line x1="50" y1="105" x2="730" y2="105" stroke="#475569" strokeWidth="1" />

                  {/* Y-axis */}
                  <text x="42" y="19" fill="#94a3b8" fontSize="8.5" textAnchor="end">₹15.00</text>
                  <text x="42" y="49" fill="#94a3b8" fontSize="8.5" textAnchor="end">₹13.50</text>
                  <text x="42" y="79" fill="#94a3b8" fontSize="8.5" textAnchor="end">₹12.00</text>
                  <text x="42" y="108" fill="#94a3b8" fontSize="8.5" textAnchor="end">₹10.50</text>

                  {/* Raw steel floor dashed line */}
                  <line x1="50" y1="92" x2="730" y2="92" stroke="#64748b" strokeDasharray="4 2" strokeWidth="1.2" />
                  <text x="725" y="88" fill="#64748b" fontSize="8" textAnchor="end">Jindal SS304 Raw Strip Floor (₹5.82)</text>

                  {/* Smooth Rate Curve Path */}
                  <path
                    d="M 60 15 Q 180 42, 320 62 T 520 78 T 720 86"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />

                  {/* Curve fill gradient */}
                  <path
                    d="M 60 15 Q 180 42, 320 62 T 520 78 T 720 86 L 720 105 L 60 105 Z"
                    fill="#f59e0b"
                    fillOpacity="0.08"
                  />

                  {/* Points on Curve */}
                  {[
                    { vol: '5k MOQ', rate: 15.00, x: 60, y: 15 },
                    { vol: '10k', rate: 14.10, x: 170, y: 39 },
                    { vol: '25k Hub', rate: 13.15, x: 330, y: 64 },
                    { vol: '50k Pan-IN', rate: 12.20, x: 520, y: 78 },
                    { vol: '100k Direct', rate: 11.65, x: 700, y: 86 }
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                      <text x={pt.x} y={pt.y - 7} fill="#fcd34d" fontSize="8.5" textAnchor="middle" fontWeight="bold">
                        ₹{pt.rate.toFixed(2)}
                      </text>
                      <text x={pt.x} y="118" fill="#94a3b8" fontSize="8" textAnchor="middle">
                        {pt.vol}
                      </text>
                    </g>
                  ))}

                  {/* Active Unit Cost Indicator */}
                  {(() => {
                    const activeY = 15 + ((15 - supplierUnitPrice) / (15 - 10.5)) * 90;
                    return (
                      <g>
                        <line x1="50" y1={activeY} x2="730" y2={activeY} stroke="#10b981" strokeDasharray="2 2" strokeWidth="1.2" />
                        <circle cx="280" cy={activeY} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        <text x="292" y={activeY - 4} fill="#34d399" fontSize="8.5" fontWeight="bold">
                          Active Sourcing Rate: ₹{supplierUnitPrice.toFixed(2)}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Volume Tiers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { tier: 'Tier 1: Pilot MOQ', volume: 5000, targetRate: 13.50, dieWearCost: 0.85, laborCost: 1.80, annualSavings: 0 },
                { tier: 'Tier 2: Regional Hub', volume: 20000, targetRate: 12.85, dieWearCost: 0.65, laborCost: 1.50, annualSavings: 13000 },
                { tier: 'Tier 3: Multi-Corridor', volume: 50000, targetRate: 12.20, dieWearCost: 0.45, laborCost: 1.25, annualSavings: 65000 },
                { tier: 'Tier 4: Pan-India Direct', volume: 100000, targetRate: 11.65, dieWearCost: 0.30, laborCost: 1.05, annualSavings: 185000 }
              ].map((tierItem, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-amber-400 text-xs">{tierItem.tier}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                      {tierItem.volume.toLocaleString()} u
                    </span>
                  </div>

                  <div className="text-xl font-bold text-white my-1">
                    ₹{tierItem.targetRate.toFixed(2)}
                    <span className="text-xs text-slate-500 font-normal"> / clamp</span>
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Raw Steel (SS304):</span>
                      <span>₹5.82</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Die Wear &amp; Press:</span>
                      <span>₹{tierItem.dieWearCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assembly &amp; Plating:</span>
                      <span>₹{tierItem.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/80 text-emerald-400 font-bold">
                      <span>Annual Cost Savings:</span>
                      <span>+₹{tierItem.annualSavings.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onApplyStateUpdates({ supplierUnitPrice: tierItem.targetRate })}
                    className="w-full mt-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-600/50 rounded text-amber-300 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Adopt ₹{tierItem.targetRate.toFixed(2)} as Pipeline Target
                  </button>
                </div>
              ))}
            </div>

            {/* Procurement Intelligence Insights */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-amber-400 block mb-1">Procurement Negotiation Stance:</strong>
              SS304 coil index at ₹240/kg yields 41 clamps per kg of cold-rolled strip. At scale of 50,000+ units, die amortization per piece drops from ₹0.85 to ₹0.45. By offering Howrah suppliers a guaranteed quarterly production run of 50,000 units with prompt 15-day bank transfer, our targeted benchmark of ₹12.20/clamp is commercially validated.
            </div>
          </div>
        )}

        {/* View F: 2D Pricing & Order Velocity Profitability Heatmap Matrix */}
        {activeChartView === 'MARGIN_HEATMAP' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                  2D Dynamic Profitability Heatmap (ASP vs. Velocity)
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Click any coordinate to adopt the exact ASP and Order Velocity into the live platform pipeline.
                </p>
              </div>

              <span className="text-[10px] text-slate-500">
                Green = High Monthly Profit (&gt;₹35k) &middot; Amber/Red = Sub-Optimal
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                    <th className="p-2 text-left">ASP / Daily Orders</th>
                    {[5, 10, 15, 20, 25, 30].map((ord) => (
                      <th key={ord} className="p-2">
                        {ord} ord/day ({(ord * packSize * 30).toLocaleString()} u/mo)
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[399, 449, 499, 549, 599, 649].map((asp) => {
                    const landedUnitCost = supplierUnitPrice * packSize + 22.00;
                    const feeRate = 0.42; // Amazon fees & fulfillment approx
                    const unitMargin = asp * (1 - feeRate) - landedUnitCost;
                    const isCurrentAsp = asp === activeAsp;

                    return (
                      <tr key={asp} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-2 text-left font-bold text-white">
                          <span className={isCurrentAsp ? 'text-amber-400 font-bold' : ''}>
                            ₹{asp} {isCurrentAsp && '(Active)'}
                          </span>
                        </td>
                        {[5, 10, 15, 20, 25, 30].map((ord) => {
                          const monthlyProfit = Math.round(unitMargin * ord * 30);
                          const isProfitable = monthlyProfit > 0;
                          const isHighProfit = monthlyProfit > 35000;
                          const isApex = monthlyProfit > 50000;

                          return (
                            <td key={ord} className="p-1.5">
                              <button
                                onClick={() => {
                                  setActiveAsp(asp);
                                  onApplyStateUpdates({ asp, ordersPerDay: ord });
                                }}
                                className={`w-full py-2 px-1 rounded transition-all cursor-pointer ${
                                  isApex
                                    ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold shadow-sm'
                                    : isHighProfit
                                    ? 'bg-emerald-950/40 border border-emerald-700/50 text-emerald-400'
                                    : isProfitable
                                    ? 'bg-slate-900 border border-slate-800 text-slate-300'
                                    : 'bg-rose-950/30 border border-rose-800/40 text-rose-400'
                                }`}
                              >
                                <div className="text-[11px]">₹{(monthlyProfit / 1000).toFixed(1)}k</div>
                                <div className="text-[9px] opacity-75">
                                  {Math.round((unitMargin / asp) * 100)}%
                                </div>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                Current selection: <strong className="text-white">₹{activeAsp} ASP</strong> at <strong className="text-white">{ordersPerDay} orders/day</strong>
              </span>
              <span className="text-emerald-400 font-bold">
                Profit Apex Zone: ₹499 - ₹549 ASP with 15 - 20 orders/day
              </span>
            </div>
          </div>
        )}

        {/* View G: Multi-Platform Market Price Distribution Radar */}
        {activeChartView === 'MARKET_PRICING_RADAR' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                  Cross-Platform Market Pricing Distribution &amp; Competitor Radar
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Benchmarking our active ASP (₹{activeAsp}) against real-world Amazon India, IndiaMART, and Moglix listings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Target Segment:</span>
                <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 font-bold border border-rose-800 text-[10px]">
                  DIN 3017 W4 (20-Pack)
                </span>
              </div>
            </div>

            {/* SVG Price Distribution Spectrum Plot */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                  Market Price Spectrum &amp; Quality Tiers (₹ / 20-Pack Equivalent)
                </span>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
                    <span>Active ASP (₹{activeAsp})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                    <span>Amazon Prime</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
                    <span>IndiaMART B2B</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <svg viewBox="0 0 760 150" className="w-full h-auto max-h-[160px] font-mono select-none">
                  {/* Axis line */}
                  <line x1="50" y1="100" x2="730" y2="100" stroke="#475569" strokeWidth="1.5" />

                  {/* Market Tier Background Regions */}
                  <rect x="50" y="20" width="160" height="75" fill="#f43f5e" fillOpacity="0.08" rx="4" />
                  <text x="130" y="35" fill="#fb7185" fontSize="8.5" textAnchor="middle" fontWeight="bold">Tier 1: Budget DIY (SS201)</text>
                  <text x="130" y="48" fill="#94a3b8" fontSize="7.5" textAnchor="middle">₹180 - ₹320 / pk</text>

                  <rect x="220" y="20" width="180" height="75" fill="#3b82f6" fillOpacity="0.08" rx="4" />
                  <text x="310" y="35" fill="#60a5fa" fontSize="8.5" textAnchor="middle" fontWeight="bold">Tier 2: General Wholesale</text>
                  <text x="310" y="48" fill="#94a3b8" fontSize="7.5" textAnchor="middle">₹340 - ₹460 / pk</text>

                  <rect x="410" y="20" width="170" height="75" fill="#10b981" fillOpacity="0.1" rx="4" stroke="#10b981" strokeOpacity="0.3" />
                  <text x="495" y="35" fill="#34d399" fontSize="8.5" textAnchor="middle" fontWeight="bold">Tier 3: Precision W4 (Our Moat)</text>
                  <text x="495" y="48" fill="#94a3b8" fontSize="7.5" textAnchor="middle">₹480 - ₹580 / pk</text>

                  <rect x="590" y="20" width="140" height="75" fill="#a855f7" fillOpacity="0.08" rx="4" />
                  <text x="660" y="35" fill="#c084fc" fontSize="8.5" textAnchor="middle" fontWeight="bold">Tier 4: Marine SS316</text>
                  <text x="660" y="48" fill="#94a3b8" fontSize="7.5" textAnchor="middle">₹600 - ₹780 / pk</text>

                  {/* Tick Marks */}
                  {[
                    { val: '₹200', x: 65 },
                    { val: '₹300', x: 190 },
                    { val: '₹400', x: 315 },
                    { val: '₹500', x: 440 },
                    { val: '₹600', x: 565 },
                    { val: '₹700', x: 690 }
                  ].map((tick, i) => (
                    <g key={i}>
                      <line x1={tick.x} y1="96" x2={tick.x} y2="104" stroke="#64748b" strokeWidth="1" />
                      <text x={tick.x} y="117" fill="#94a3b8" fontSize="8.5" textAnchor="middle">{tick.val}</text>
                    </g>
                  ))}

                  {/* Scraped Competitor Points */}
                  {marketListings.map((item, idx) => {
                    const priceNormalized = (item.price / item.packSize) * 20;
                    const xPos = 50 + Math.max(0, Math.min(680, ((priceNormalized - 150) / 600) * 680));
                    const isAmazon = item.platform.toLowerCase().includes('amazon');

                    return (
                      <g key={idx} className="cursor-pointer">
                        <circle
                          cx={xPos}
                          cy={65 + (idx % 3) * 8}
                          r="4"
                          fill={isAmazon ? '#3b82f6' : '#f59e0b'}
                          stroke="#0f172a"
                          strokeWidth="1.2"
                        />
                        <text x={xPos} y={60 + (idx % 3) * 8} fill="#cbd5e1" fontSize="7" textAnchor="middle">
                          ₹{Math.round(priceNormalized)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Active ASP Indicator (Vertical Pin) */}
                  {(() => {
                    const activeX = 50 + Math.max(0, Math.min(680, ((activeAsp - 150) / 600) * 680));
                    return (
                      <g>
                        <line x1={activeX} y1="12" x2={activeX} y2="100" stroke="#f43f5e" strokeWidth="2.5" />
                        <rect x={activeX - 35} y="4" width="70" height="16" fill="#f43f5e" rx="3" />
                        <text x={activeX} y="15" fill="#ffffff" fontSize="8.5" textAnchor="middle" fontWeight="bold">
                          ₹{activeAsp} ACTIVE
                        </text>
                        <circle cx={activeX} cy="100" r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Strategic Competitive Advantage Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Margin Cushion vs Floor Undercut</span>
                <div className="text-lg font-bold text-emerald-400">
                  +₹{(activeAsp - 349).toFixed(0)} / pack (+{(((activeAsp - 349) / activeAsp) * 100).toFixed(0)}%)
                </div>
                <p className="text-[10px] text-slate-400">
                  Buffer against Chinese non-spec imported clamps selling at ₹349. Our DIN 3017 certification anchors premium pricing.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Market Median Spread</span>
                <div className="text-lg font-bold text-blue-400">
                  ₹{(activeAsp - 449).toFixed(0)} vs Median (₹449)
                </div>
                <p className="text-[10px] text-slate-400">
                  Slight premium (+₹50) justified by included 2-day dispatch from Howrah and NABL-certified PMI test report.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Price Elasticity Rating</span>
                <div className="text-lg font-bold text-amber-400">
                  -0.84 (Inelastic Demand)
                </div>
                <p className="text-[10px] text-slate-400">
                  Industrial maintenance buyers prioritize torque reliability over ₹20-30 savings, limiting volume erosion at ₹499-549.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View H: AI-Powered Pricing & Procurement Rate Econometric Modeler */}
        {activeChartView === 'AI_PROCUREMENT_MODELING' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  AI Econometric Sourcing Engine: Steel Commodity &amp; Scale Modeler
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Dynamically model supplier stamped piece costs based on raw steel coil index, die stroke life, batch volume, and payment velocity.
                </p>
              </div>

              {/* Modeled Rate Badge */}
              <div className="text-right flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Sourcing Base:</span>
                  <span className="text-xs text-slate-300">₹{supplierUnitPrice.toFixed(2)}</span>
                </div>
                <div className="p-2 bg-cyan-950/80 border border-cyan-500/50 rounded text-center">
                  <span className="text-[9px] text-cyan-400 uppercase block font-bold">Modeled Target Rate</span>
                  <span className="text-sm font-bold text-white font-mono">
                    ₹{(() => {
                      const rawCost = modelSteelPrice / 41; // 41 clamps/kg
                      const toolingAmort = 280000 / modelBatchVolume;
                      const baseLabor = 1.80 * (1 - 0.12 * Math.log10(modelBatchVolume / 5000));
                      const creditBonus = modelCreditTerms === 'ADVANCE' ? 0.03 : modelCreditTerms === '15_DAYS' ? 0.015 : modelCreditTerms === '45_DAYS' ? -0.025 : 0;
                      const supplierMargin = 3.60;
                      return Math.max(10.50, (rawCost + toolingAmort + baseLabor + supplierMargin) * (1 - creditBonus)).toFixed(2);
                    })()} / clamp
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Econometric Parameter Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
              {/* 1. Raw Steel Strip Index */}
              <div>
                <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                  <span>Jindal SS304 Coil Index:</span>
                  <strong className="text-amber-400">₹{modelSteelPrice} / kg</strong>
                </div>
                <input
                  type="range"
                  min={200}
                  max={300}
                  step={5}
                  value={modelSteelPrice}
                  onChange={(e) => setModelSteelPrice(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>₹200 (Low Cycle)</span>
                  <span>₹240 (Current)</span>
                  <span>₹300 (Peak)</span>
                </div>
              </div>

              {/* 2. Batch Quantity Scale Commitment */}
              <div>
                <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                  <span>Production Batch Commitment:</span>
                  <strong className="text-cyan-400">{modelBatchVolume.toLocaleString()} units</strong>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={100000}
                  step={5000}
                  value={modelBatchVolume}
                  onChange={(e) => setModelBatchVolume(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>5k (Pilot MOQ)</span>
                  <span>50k (Regional)</span>
                  <span>100k (National)</span>
                </div>
              </div>

              {/* 3. Payment Terms Velocity */}
              <div>
                <span className="text-slate-300 text-[11px] block mb-1">Payment Velocity Discount:</span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 border border-slate-800 rounded text-[10px]">
                  {(['ADVANCE', '15_DAYS', '30_DAYS', '45_DAYS'] as const).map((term) => (
                    <button
                      key={term}
                      onClick={() => setModelCreditTerms(term)}
                      className={`py-1 rounded text-center transition-colors cursor-pointer ${
                        modelCreditTerms === term
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {term === 'ADVANCE' ? 'Adv (-3%)' : term === '15_DAYS' ? '15d (-1.5%)' : term === '30_DAYS' ? '30d (0%)' : '45d (+2.5%)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Formula Breakdown Breakdown Card */}
            {(() => {
              const rawCost = modelSteelPrice / 41;
              const toolingAmort = 280000 / modelBatchVolume;
              const baseLabor = 1.80 * (1 - 0.12 * Math.log10(modelBatchVolume / 5000));
              const creditBonus = modelCreditTerms === 'ADVANCE' ? 0.03 : modelCreditTerms === '15_DAYS' ? 0.015 : modelCreditTerms === '45_DAYS' ? -0.025 : 0;
              const supplierMargin = 3.60;
              const finalRate = Math.max(10.50, (rawCost + toolingAmort + baseLabor + supplierMargin) * (1 - creditBonus));

              return (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      Econometric Formula Breakdown (P(Q) = Raw + Tooling/Q + Labor(Q) + Margin)
                    </span>
                    <button
                      onClick={() => onApplyStateUpdates({ supplierUnitPrice: Number(finalRate.toFixed(2)) })}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Adopt ₹{finalRate.toFixed(2)} as Global Sourcing Rate &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">1. Raw SS304 Strip</span>
                      <strong className="text-white text-xs font-mono">₹{rawCost.toFixed(2)} / pc</strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5">24.25g @ ₹{modelSteelPrice}/kg</span>
                    </div>

                    <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">2. Die Amortization</span>
                      <strong className="text-amber-400 text-xs font-mono">₹{toolingAmort.toFixed(2)} / pc</strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5">₹2.8L over {modelBatchVolume / 1000}k units</span>
                    </div>

                    <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">3. Press Labor &amp; Deburr</span>
                      <strong className="text-blue-400 text-xs font-mono">₹{baseLabor.toFixed(2)} / pc</strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Learning curve factor</span>
                    </div>

                    <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">4. Supplier Net Profit</span>
                      <strong className="text-emerald-400 text-xs font-mono">₹{supplierMargin.toFixed(2)} / pc</strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5">24.5% producer ROCE</span>
                    </div>
                  </div>

                  {/* AI Strategic Synthesis on Modeled Rate */}
                  <div className="p-2.5 bg-cyan-950/20 border border-cyan-800/30 rounded text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-300 font-bold">Negotiation Protocol for {activeSupplier?.city || 'Howrah'} Cluster: </strong>
                      By committing to a quarterly production run of {modelBatchVolume.toLocaleString()} clamps with 15-day bank transfer, the supplier reduces inventory working capital cost by 1.5% and amortizes die wear down to ₹{toolingAmort.toFixed(2)}/pc.
                      This enables a target quotation of <strong className="text-white font-mono">₹{finalRate.toFixed(2)}</strong> (a savings of ₹{(supplierUnitPrice - finalRate).toFixed(2)}/clamp vs baseline), yielding an annualized savings of <strong className="text-emerald-400 font-mono">₹{Math.round((supplierUnitPrice - finalRate) * (activeBuyer?.estimated_annual_consumption_units || 40000)).toLocaleString()}</strong> on the active customer account.
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 4. Dual-AI Tandem Co-Pilot & Recommendations */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm">Dual-AI Tandem Modeling (Groq + Gemini)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Groq (Llama-3.3-70b) calculates fast mathematical sensitivities and supply arbitrage; Gemini validates macro buyer psychology and recommends chart perspectives.
            </p>
          </div>

          {aiConsensus && (
            <button
              onClick={handleApplyAiUpdates}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-xs font-bold transition-colors"
            >
              Apply AI Parameters to Engine &rarr;
            </button>
          )}
        </div>

        {aiConsensus ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* Groq Column */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded space-y-2">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>Groq Quantitative Engine</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                  Llama-3.3-70b
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {aiConsensus.groqCalculationsSummary}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold">Supply Arbitrage: </span>
                {aiConsensus.arbitrageAction}
              </div>
            </div>

            {/* Gemini Column */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Gemini Macro Strategy</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  Gemini 3.1 Pro · {aiConsensus.confidenceScore}% Consensus
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {aiConsensus.macroAnalysis}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold">Competitive Positioning: </span>
                {aiConsensus.competitiveVerdict}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded text-center text-xs font-mono text-slate-400">
            Click <strong className="text-blue-400">"Run Dual-AI Analysis"</strong> to generate cross-validated pricing formulas and optimal pack sizing.
          </div>
        )}
      </div>

      {/* 5. Observed Competitor Listings & Scraper */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-sm">Marketplace Competitor Benchmarking</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your active ASP (₹{activeAsp}) against real-world Amazon and wholesale listings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Scrape query or product link..."
              value={scrapeQuery}
              onChange={(e) => setScrapeQuery(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono w-56 focus:outline-hidden focus:border-blue-500"
            />
            <button
              onClick={handleScrapeListing}
              disabled={isScraping || !scrapeQuery.trim()}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono text-xs transition-colors disabled:opacity-50"
            >
              {isScraping ? 'Scraping...' : 'Fetch'}
            </button>
          </div>
        </div>

        {/* Competitor Listing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3">Listing Title</th>
                <th className="py-2 px-3">Platform</th>
                <th className="py-2 px-3">Price</th>
                <th className="py-2 px-3">Pack</th>
                <th className="py-2 px-3">Unit Price</th>
                <th className="py-2 px-3">Material Grade</th>
                <th className="py-2 px-3">Rating</th>
                <th className="py-2 px-3 text-right">Spread vs Our ASP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {marketListings.map((item, idx) => {
                const spread = activeAsp - item.price;
                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 max-w-[260px] truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{item.platform}</td>
                    <td className="py-2.5 px-3 font-bold text-white">₹{item.price}</td>
                    <td className="py-2.5 px-3">{item.packSize} pcs</td>
                    <td className="py-2.5 px-3">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-blue-300">{item.materialGrade}</td>
                    <td className="py-2.5 px-3 text-amber-400">★ {item.rating} ({item.reviewCount})</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {spread === 0 ? (
                        <span className="text-slate-400">Parity (₹0)</span>
                      ) : spread > 0 ? (
                        <span className="text-rose-400">+₹{spread} (Higher)</span>
                      ) : (
                        <span className="text-emerald-400">-₹{Math.abs(spread)} (Lower)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dynamic Competitiveness Assessment Note */}
        <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-300 flex items-center justify-between">
          <span>{competitivenessVerdict.message}</span>
          <span className="text-slate-500 uppercase text-[10px]">{competitivenessVerdict.status}</span>
        </div>
      </div>

      {/* 6. Google Drive Cloud Ledger & Historical Datasets */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Google Drive Dataset Persistence</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely store versioned pricing simulation runs and sensitivity CSV exports in Google Drive.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveToDrive('json')}
              disabled={isSavingToDrive}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors"
            >
              Export JSON to Drive
            </button>
            <button
              onClick={() => handleSaveToDrive('csv')}
              disabled={isSavingToDrive}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors"
            >
              Export CSV to Drive
            </button>
          </div>
        </div>

        {driveStatusMsg && (
          <div className="mb-3 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-blue-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{driveStatusMsg}</span>
          </div>
        )}

        {driveUser ? (
          <div>
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
              <span>Saved Datasets in Google Drive:</span>
              <span className="text-emerald-400">Authenticated: {driveUser.email}</span>
            </div>

            {driveDatasets.length > 0 ? (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded bg-slate-950">
                {driveDatasets.map((f) => (
                  <div key={f.id} className="p-2.5 flex items-center justify-between hover:bg-slate-900 transition-colors">
                    <div>
                      <div className="font-bold text-white text-[11px]">{f.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Modified: {new Date(f.modifiedTime).toLocaleString()} · {f.mimeType}
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 border border-emerald-800/60 bg-emerald-950/60 px-2 py-0.5 rounded">
                      Synced in Drive
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded text-center text-slate-500 text-[11px]">
                No previous datasets saved yet. Click "Export JSON to Drive" to log your first simulation run.
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
            <span>Connect your Google Account to automatically record simulations and retrieve datasets.</span>
            <button
              onClick={handleGoogleSignIn}
              disabled={driveConnecting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors whitespace-nowrap"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
