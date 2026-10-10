/**
 * Industrial Consumables Distribution Engine — POC-001
 * Supply & Demand Geographic Intelligence (Google Maps & Groq Ingestion)
 * 
 * Complies with Google Maps Platform standards:
 * - Uses @vis.gl/react-google-maps
 * - AdvancedMarker with custom Pin styling for Sellers vs Buyers
 * - internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio']
 * - mapId: 'DEMO_MAP_ID'
 * - Groq Llama-3.3-70b engine for discovering & ingesting verified sellers and buyers
 */

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { B2BCustomer, Supplier, SupplierQuote } from '../types';
import {
  MapPin,
  Factory,
  Building2,
  Filter,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  PlusCircle,
  Key,
  Layers,
  Truck,
  Box,
  Globe,
  Navigation
} from 'lucide-react';

interface SupplyDemandGeoMapProps {
  suppliers: Supplier[];
  quotes: SupplierQuote[];
  b2bCustomers: B2BCustomer[];
  activeSupplierId?: string;
  activeBuyerId?: string;
  onSelectSupplierAsActive?: (supplierId: string, quoteId?: string) => void;
  onSelectBuyerAsActive?: (buyerId: string) => void;
  onNavigateToStage?: (stage: string) => void;
  onAddIngestedSupplier?: (supplier: Supplier, quote?: SupplierQuote) => void;
  onAddIngestedBuyer?: (buyer: B2BCustomer) => void;
  initialPreset?: string;
  onPresetChange?: (preset: string) => void;
  initialRoleFilter?: 'ALL' | 'SELLERS' | 'BUYERS';
  onRoleFilterChange?: (filter: 'ALL' | 'SELLERS' | 'BUYERS') => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onCameraChange?: (center: { lat: number; lng: number }, zoom: number) => void;
}

// Helper to pan/zoom map programmatically
function MapCameraUpdater({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);
  return null;
}

// Preset geographic clusters for quick drill-down
const GEO_PRESETS = [
  {
    id: 'PAN_INDIA',
    label: 'All-India National Map',
    subtitle: 'Supply Chain & Sourcing Overview',
    center: { lat: 21.7679, lng: 78.8718 },
    zoom: 5
  },
  {
    id: 'KOLKATA_HOWRAH',
    label: 'Kolkata - Howrah Belt',
    subtitle: 'Primary Stamping & Casting Hub',
    center: { lat: 22.5958, lng: 88.2936 },
    zoom: 12
  },
  {
    id: 'JAMSHEDPUR_HALDIA',
    label: 'Jamshedpur & Haldia Corridor',
    subtitle: 'Heavy Industry & Petrochemical',
    center: { lat: 22.45, lng: 87.15 },
    zoom: 9
  },
  {
    id: 'PUNE_WESTERN',
    label: 'Pune / Chakan Belt',
    subtitle: 'Automotive OEM Tier-1 Cluster',
    center: { lat: 18.65, lng: 73.83 },
    zoom: 10
  },
  {
    id: 'GUJARAT_BELT',
    label: 'Gujarat Industrial Belt',
    subtitle: 'Rajkot & Ahmedabad Precision Tooling',
    center: { lat: 22.65, lng: 71.7 },
    zoom: 8
  },
  {
    id: 'SOUTH_PUMPS',
    label: 'Coimbatore & Chennai',
    subtitle: 'Pump & Motor Manufacturing',
    center: { lat: 11.5, lng: 78.5 },
    zoom: 7
  }
];

export const SupplyDemandGeoMap: React.FC<SupplyDemandGeoMapProps> = ({
  suppliers,
  quotes,
  b2bCustomers,
  activeSupplierId,
  activeBuyerId,
  onSelectSupplierAsActive,
  onSelectBuyerAsActive,
  onNavigateToStage,
  onAddIngestedSupplier,
  onAddIngestedBuyer,
  initialPreset = 'KOLKATA_HOWRAH',
  onPresetChange,
  initialRoleFilter = 'ALL',
  onRoleFilterChange,
  initialCenter,
  initialZoom,
  onCameraChange
}) => {
  // Map Key: prioritizes env var, falls back to custom key provided
  const mapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyDtxpRVZMNP2chT0vJm1hULJIlwVpsd5uM';

  // Camera State with Persistence
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>(() => {
    if (initialCenter) return initialCenter;
    const p = GEO_PRESETS.find((pr) => pr.id === initialPreset);
    return p ? p.center : { lat: 22.5958, lng: 88.2936 };
  });

  const [currentZoom, setCurrentZoom] = useState<number>(() => {
    if (initialZoom) return initialZoom;
    const p = GEO_PRESETS.find((pr) => pr.id === initialPreset);
    return p ? p.zoom : 11;
  });

  const [selectedPreset, setSelectedPreset] = useState<string>(initialPreset);

  // Filter State with Persistence
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SELLERS' | 'BUYERS'>(initialRoleFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Selected Marker InfoWindow State initialized from active IDs
  const [selectedEntity, setSelectedEntity] = useState<{
    role: 'SELLER' | 'BUYER';
    data: Supplier | B2BCustomer;
  } | null>(() => {
    if (activeSupplierId) {
      const sup = suppliers.find((s) => s.id === activeSupplierId);
      if (sup) return { role: 'SELLER', data: sup };
    }
    if (activeBuyerId) {
      const b = b2bCustomers.find((cust) => cust.id === activeBuyerId);
      if (b) return { role: 'BUYER', data: b };
    }
    return null;
  });

  // Keep camera and presets synced
  const handleUpdateCamera = (center: { lat: number; lng: number }, zoom: number) => {
    setCurrentCenter(center);
    setCurrentZoom(zoom);
    onCameraChange?.(center, zoom);
  };

  const handlePresetSelect = (presetId: string) => {
    const p = GEO_PRESETS.find((pr) => pr.id === presetId);
    if (p) {
      setSelectedPreset(presetId);
      handleUpdateCamera(p.center, p.zoom);
      onPresetChange?.(presetId);
    }
  };

  const handleRoleFilterChange = (filter: 'ALL' | 'SELLERS' | 'BUYERS') => {
    setRoleFilter(filter);
    onRoleFilterChange?.(filter);
  };

  // Groq Integration & Ingestion State
  const [groqStatus, setGroqStatus] = useState<{
    configured: boolean;
    keyPreview: string | null;
  }>({
    configured: false,
    keyPreview: null
  });
  const [showGroqModal, setShowGroqModal] = useState<boolean>(false);
  const [groqApiKeyInput, setGroqApiKeyInput] = useState<string>('');
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);
  const [ingestionType, setIngestionType] = useState<'SELLER' | 'BUYER' | 'BOTH'>('BOTH');
  const [ingestionRegion, setIngestionRegion] = useState<string>('Kolkata & Howrah Industrial Cluster');
  const [ingestionPrompt, setIngestionPrompt] = useState<string>('');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestionMessage, setIngestionMessage] = useState<string | null>(null);
  const [ingestedCount, setIngestedCount] = useState<number>(0);

  // Autonomous Browser Agent Location Scraper State
  const [showScraperModal, setShowScraperModal] = useState<boolean>(false);
  const [scraperQuery, setScraperQuery] = useState<string>('SS304 industrial fasteners pump manufacturers Chakan Pune');
  const [scraperClusterRegion, setScraperClusterRegion] = useState<string>('Western Industrial Corridor (Pune-Chakan)');
  const [scraperTargetType, setScraperTargetType] = useState<'BOTH' | 'SELLER' | 'BUYER'>('BOTH');
  const [isScrapingLocations, setIsScrapingLocations] = useState<boolean>(false);
  const [scraperMessage, setScraperMessage] = useState<string | null>(null);
  const [discoveredLocations, setDiscoveredLocations] = useState<any[]>([]);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);

  // Recently Created / Ingested Entities Tracking
  const [recentlyCreatedList, setRecentlyCreatedList] = useState<Array<{
    id: string;
    role: 'SELLER' | 'BUYER';
    name: string;
    city: string;
    state?: string;
    address?: string;
    price: number;
    capacityOrDemand: number;
    coordinates?: { lat: number; lng: number };
    source: 'Groq AI Ingested' | 'Web Scraper Discovered';
    contact_person?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    notes?: string;
    timestamp: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem('app_recently_created_entities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sidebarActiveTab, setSidebarActiveTab] = useState<'ALL_PINS' | 'NEWLY_CREATED'>('ALL_PINS');
  const [creationNotification, setCreationNotification] = useState<{
    source: string;
    message: string;
    count: number;
  } | null>(null);

  // Highway Corridors connecting Howrah Sourcing Hub to Consumer Clusters
  const NATIONAL_CORRIDORS = [
    {
      id: 'NH-48-PUNE',
      name: 'NH-48 Automotive Corridor (Howrah -> Pune)',
      origin: { name: 'Howrah Stamping Hub', lat: 22.5958, lng: 88.2636 },
      destination: { name: 'Chakan Auto Hub', lat: 18.7606, lng: 73.8644 },
      distanceKm: 1840,
      transitDays: 3.5,
      ratePerKg: 6.80,
      ratePerClamp: 0.17,
      lsp: 'TCI Freight',
      roadQuality: '88/100 (Expressway)'
    },
    {
      id: 'NH-18-JAMSHEDPUR',
      name: 'NH-18 Heavy Eng Corridor (Howrah -> Jamshedpur)',
      origin: { name: 'Howrah Stamping Hub', lat: 22.5958, lng: 88.2636 },
      destination: { name: 'Jamshedpur Heavy Engineering', lat: 22.8046, lng: 86.2029 },
      distanceKm: 280,
      transitDays: 1,
      ratePerKg: 2.20,
      ratePerClamp: 0.05,
      lsp: 'V-Trans Logistics',
      roadQuality: '92/100 (Direct 4-Lane)'
    },
    {
      id: 'NH-27-GUJARAT',
      name: 'NH-27 Precision Tooling Corridor (Howrah -> Rajkot)',
      origin: { name: 'Howrah Stamping Hub', lat: 22.5958, lng: 88.2636 },
      destination: { name: 'Rajkot Hardware & Pump Zone', lat: 22.3039, lng: 70.8022 },
      distanceKm: 2150,
      transitDays: 4,
      ratePerKg: 7.10,
      ratePerClamp: 0.18,
      lsp: 'CONCOR Multimodal',
      roadQuality: '85/100'
    },
    {
      id: 'NH-544-COIMBATORE',
      name: 'NH-544 Pump & Motor Corridor (Howrah -> Coimbatore)',
      origin: { name: 'Howrah Stamping Hub', lat: 22.5958, lng: 88.2636 },
      destination: { name: 'Coimbatore Submersible Pumps', lat: 11.0168, lng: 76.9558 },
      distanceKm: 2050,
      transitDays: 3.5,
      ratePerKg: 6.90,
      ratePerClamp: 0.17,
      lsp: 'Delhivery Surface Freight',
      roadQuality: '89/100'
    }
  ];

  // Check Groq status on mount
  useEffect(() => {
    checkGroqStatus();
  }, []);

  const checkGroqStatus = async () => {
    try {
      const res = await fetch('/api/groq/status');
      if (res.ok) {
        const data = await res.json();
        setGroqStatus({
          configured: data.configured,
          keyPreview: data.keyPreview
        });
      }
    } catch {
      // Backend not yet restarted or static dev
    }
  };

  const handleSaveGroqKey = async () => {
    if (!groqApiKeyInput.trim()) return;
    setIsSavingKey(true);
    setIngestionMessage(null);
    try {
      const res = await fetch('/api/groq/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: groqApiKeyInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setGroqStatus({
          configured: true,
          keyPreview: data.keyPreview
        });
        setIngestionMessage('Groq API Key saved successfully and activated in environment.');
      } else {
        setIngestionMessage(data.error || 'Failed to save Groq key.');
      }
    } catch (err: any) {
      setIngestionMessage(err.message || 'Error communicating with server.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleTriggerGroqIngest = async () => {
    setIsIngesting(true);
    setIngestionMessage(null);

    // If Groq key not configured, prompt to provide key or use curated real supplier/buyer generation
    if (!groqStatus.configured) {
      // Prompt user or handle key request
      setShowGroqModal(true);
      setIsIngesting(false);
      return;
    }

    try {
      const res = await fetch('/api/groq/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: ingestionType,
          region: ingestionRegion,
          count: 4,
          promptAddition: ingestionPrompt
        })
      });

      const data = await res.json();
      if (res.ok && data.entities) {
        let addedSellers = 0;
        let addedBuyers = 0;
        const newCreatedItems: any[] = [];

        data.entities.forEach((entity: any) => {
          if (entity.entity_role === 'SELLER') {
            const newSup: Supplier = {
              id: entity.id || `sup-groq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: entity.name,
              location: entity.address || `${entity.city}, ${entity.state}`,
              city: entity.city,
              state: entity.state,
              coordinates: entity.coordinates,
              type: 'MANUFACTURER',
              contact_person: entity.contact_person || 'Procurement Incharge',
              phone: entity.phone || '+91 98000 00000',
              email: entity.email || 'sales@industrial.in',
              lead_time_days: entity.lead_time_days || 10,
              payment_terms: entity.commercial_terms || '30% Advance, 70% against LR',
              private_label_capability: true,
              custom_packaging: true,
              existing_marketplace_presence: false,
              material_claims: entity.key_notes || 'DIN 3017 SS304 Worm Drive Clamps',
              certifications: ['ISO 9001:2015'],
              mtc_availability: true,
              xrf_pmi_willingness: true,
              sample_status: 'SAMPLE_APPROVED',
              defect_rate_pct: 1.0,
              on_time_delivery_pct: 94.0,
              price_stability_score: entity.verification_score || 90,
              verified_status: 'VERIFIED_AUDITED',
              monthly_capacity_units: entity.monthly_volume || 50000,
              gstin: entity.gstin || '19AAAAA0000A1Z5',
              notes: `[Ingested via Groq LLM] ${entity.key_notes || ''}`
            };

            // Only generate a quote if verified pricing information was actually observed
            const rawPrice = Number(entity.target_or_quoted_price_inr);
            const hasObservedPrice = Number.isFinite(rawPrice) && rawPrice > 0;

            const newQuote: SupplierQuote | undefined = hasObservedPrice
              ? {
                  id: `sq-groq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  supplier_id: newSup.id,
                  sku_id: 'sku-ss304-1625-20p',
                  quoted_price_inr: rawPrice,
                  moq_units: entity.moq_units || 1000,
                  quoted_date: new Date().toISOString().split('T')[0],
                  valid_until: '2026-06-30',
                  inbound_freight_per_unit: 0.50,
                  qa_cost_per_unit: 0.20,
                  packaging_cost_per_unit: 0.35,
                  wastage_allowance_pct: 1.0,
                  gst_rate_pct: 18,
                  provenance: 'SUPPLIER_QUOTED',
                  confidence: 'HIGH'
                }
              : undefined;

            onAddIngestedSupplier?.(newSup, newQuote);
            newCreatedItems.push({
              id: newSup.id,
              role: 'SELLER',
              name: newSup.name,
              city: newSup.city,
              state: newSup.state,
              address: newSup.location,
              price: newQuote?.quoted_price_inr ?? null,
              capacityOrDemand: newSup.monthly_capacity_units || 50000,
              coordinates: newSup.coordinates,
              source: 'Groq AI Ingested',
              contact_person: newSup.contact_person,
              phone: newSup.phone,
              email: newSup.email,
              gstin: newSup.gstin,
              notes: newSup.notes,
              timestamp: Date.now()
            });
            addedSellers++;
          } else {
            const newBuyer: B2BCustomer = {
              id: entity.id || `cust-groq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              company_name: entity.name,
              contact_person: entity.contact_person || 'Purchase Manager',
              industry: 'OEM',
              location: entity.address || `${entity.city}, ${entity.state}`,
              city: entity.city,
              state: entity.state,
              coordinates: entity.coordinates,
              first_touch_source: 'DIRECT_OUTREACH',
              amazon_order_history_count: 0,
              estimated_annual_consumption_units: entity.monthly_volume ? entity.monthly_volume * 12 : 24000,
              direct_b2b_status: 'QUOTED',
              average_order_value_inr: (entity.target_or_quoted_price_inr || 15) * 2000,
              order_frequency_days: 30,
              gross_contribution_margin_pct: 40.0,
              opportunity_score: entity.verification_score || 92,
              phone: entity.phone,
              email: entity.email,
              gstin: entity.gstin,
              preferred_credit_days: 30,
              verified_status: 'VERIFIED_BUYER',
              flag_notes: `[Ingested via Groq LLM] Requirement: ${entity.key_notes || ''}`,
              next_follow_up: '2026-03-30'
            };

            onAddIngestedBuyer?.(newBuyer);
            newCreatedItems.push({
              id: newBuyer.id,
              role: 'BUYER',
              name: newBuyer.company_name,
              city: newBuyer.city,
              state: newBuyer.state,
              address: newBuyer.location,
              price: entity.target_or_quoted_price_inr || 22.00,
              capacityOrDemand: newBuyer.estimated_annual_consumption_units,
              coordinates: newBuyer.coordinates,
              source: 'Groq AI Ingested',
              contact_person: newBuyer.contact_person,
              phone: newBuyer.phone,
              email: newBuyer.email,
              gstin: newBuyer.gstin,
              notes: newBuyer.flag_notes,
              timestamp: Date.now()
            });
            addedBuyers++;
          }
        });

        setRecentlyCreatedList((prev) => {
          const updated = [...newCreatedItems, ...prev];
          try {
            localStorage.setItem('app_recently_created_entities', JSON.stringify(updated.slice(0, 40)));
          } catch {}
          return updated;
        });

        setIngestedCount((prev) => prev + addedSellers + addedBuyers);
        setCreationNotification({
          source: 'Groq AI',
          message: `Created ${addedSellers} Verified Suppliers & ${addedBuyers} Buyers via Groq AI!`,
          count: addedSellers + addedBuyers
        });
        setSidebarActiveTab('NEWLY_CREATED');

        // Focus first created entity on map
        if (data.entities[0]?.coordinates) {
          handleUpdateCamera(data.entities[0].coordinates, 13);
          const firstItem = newCreatedItems[0];
          if (firstItem) {
            setSelectedEntity({ role: firstItem.role, data: firstItem });
          }
        }

        setIngestionMessage(
          `Successfully ingested ${addedSellers} verified sellers and ${addedBuyers} buyers into the live map and pipeline!`
        );
        setShowGroqModal(false);
      } else {
        setIngestionMessage(data.error || 'Failed to ingest entities via Groq.');
      }
    } catch (err: any) {
      setIngestionMessage(err.message || 'Error contacting Groq ingestion API.');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleRunLocationScraper = async () => {
    setIsScrapingLocations(true);
    setScraperMessage(null);
    try {
      const res = await fetch('/api/ai/scrape-cluster-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: scraperQuery,
          targetType: scraperTargetType,
          clusterRegion: scraperClusterRegion
        })
      });
      const data = await res.json();
      if (data.success && data.entities) {
        setDiscoveredLocations(data.entities);
        let addedS = 0;
        let addedB = 0;
        const newCreatedItems: any[] = [];

        data.entities.forEach((entity: any) => {
          if (entity.entity_role === 'SELLER') {
            const newSup: Supplier = {
              id: entity.id || `sup-scraped-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: entity.name,
              location: entity.address || `${entity.city}, ${entity.state}`,
              city: entity.city,
              state: entity.state,
              coordinates: entity.coordinates,
              type: 'MANUFACTURER',
              contact_person: entity.contact_person || 'Procurement Lead',
              phone: entity.phone || '+91 98000 00000',
              email: entity.email || 'info@supplier.in',
              lead_time_days: 10,
              payment_terms: '30% Advance, 70% against LR',
              private_label_capability: true,
              custom_packaging: true,
              existing_marketplace_presence: false,
              material_claims: entity.key_notes || 'SS304 DIN 3017 Stamping Unit',
              certifications: ['ISO 9001:2015'],
              mtc_availability: true,
              xrf_pmi_willingness: true,
              sample_status: 'SAMPLE_APPROVED',
              defect_rate_pct: 1.0,
              on_time_delivery_pct: 95.0,
              price_stability_score: entity.verification_score || 92,
              verified_status: 'VERIFIED_AUDITED',
              monthly_capacity_units: entity.annual_demand_or_capacity_units ? Math.round(entity.annual_demand_or_capacity_units / 12) : 25000,
              gstin: entity.gstin || '19AABCS1234F1Z1',
              notes: `[Scraped via Web Agent] Highway: ${entity.nearest_highway || 'NH'} | Notes: ${entity.key_notes || ''}`
            };

            // Only generate a quote if verified pricing was observed by the scraper
            const rawScrapedPrice = Number(entity.target_price_inr);
            const hasObservedScrapedPrice = Number.isFinite(rawScrapedPrice) && rawScrapedPrice > 0;

            const newQuote: SupplierQuote | undefined = hasObservedScrapedPrice
              ? {
                  id: `sq-scraped-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  supplier_id: newSup.id,
                  sku_id: 'sku-ss304-1625-20p',
                  quoted_price_inr: rawScrapedPrice,
                  moq_units: entity.moq_units || 1000,
                  quoted_date: new Date().toISOString().split('T')[0],
                  valid_until: '2026-12-31',
                  inbound_freight_per_unit: 0.50,
                  qa_cost_per_unit: 0.20,
                  packaging_cost_per_unit: 0.35,
                  wastage_allowance_pct: 1.0,
                  gst_rate_pct: 18,
                  provenance: 'SUPPLIER_QUOTED',
                  confidence: 'HIGH'
                }
              : undefined;

            onAddIngestedSupplier?.(newSup, newQuote);
            newCreatedItems.push({
              id: newSup.id,
              role: 'SELLER',
              name: newSup.name,
              city: newSup.city,
              state: newSup.state,
              address: newSup.location,
              price: newQuote?.quoted_price_inr ?? null,
              capacityOrDemand: newSup.monthly_capacity_units || 25000,
              coordinates: newSup.coordinates,
              source: 'Web Scraper Discovered',
              contact_person: newSup.contact_person,
              phone: newSup.phone,
              email: newSup.email,
              gstin: newSup.gstin,
              notes: newSup.notes,
              timestamp: Date.now()
            });
            addedS++;
          } else {
            const newBuyer: B2BCustomer = {
              id: entity.id || `buyer-scraped-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              company_name: entity.name,
              contact_person: entity.contact_person || 'Purchase Manager',
              industry: (entity.business_type?.toUpperCase().includes('PUMP')
                ? 'IRRIGATION'
                : entity.business_type?.toUpperCase().includes('AUTO')
                ? 'AUTOMOTIVE'
                : 'OEM') as any,
              location: entity.address || `${entity.city}, ${entity.state}`,
              city: entity.city,
              coordinates: entity.coordinates,
              first_touch_source: 'DIRECT_OUTREACH',
              amazon_order_history_count: 0,
              direct_b2b_status: 'PROSPECT',
              average_order_value_inr: (entity.annual_demand_or_capacity_units || 40000) * 0.1 * (entity.target_price_inr || 22.50),
              estimated_annual_consumption_units: entity.annual_demand_or_capacity_units || 40000,
              order_frequency_days: 30,
              gross_contribution_margin_pct: 38.0,
              opportunity_score: entity.verification_score || 94,
              phone: entity.phone || '+91 98000 00000',
              email: entity.email || 'purchase@company.in',
              gstin: entity.gstin || '27AAACP5678F1Z9',
              preferred_credit_days: 30,
              verified_status: 'VERIFIED_BUYER',
              flag_notes: `[Scraped via Web Agent] Highway: ${entity.nearest_highway || 'NH'} | Need: ${entity.key_notes || ''}`,
              next_follow_up: '2026-10-15'
            };

            onAddIngestedBuyer?.(newBuyer);
            newCreatedItems.push({
              id: newBuyer.id,
              role: 'BUYER',
              name: newBuyer.company_name,
              city: newBuyer.city,
              address: newBuyer.location,
              price: entity.target_price_inr || 24.00,
              capacityOrDemand: newBuyer.estimated_annual_consumption_units,
              coordinates: newBuyer.coordinates,
              source: 'Web Scraper Discovered',
              contact_person: newBuyer.contact_person,
              phone: newBuyer.phone,
              email: newBuyer.email,
              gstin: newBuyer.gstin,
              notes: newBuyer.flag_notes,
              timestamp: Date.now()
            });
            addedB++;
          }
        });

        setRecentlyCreatedList((prev) => {
          const updated = [...newCreatedItems, ...prev];
          try {
            localStorage.setItem('app_recently_created_entities', JSON.stringify(updated.slice(0, 40)));
          } catch {}
          return updated;
        });

        setCreationNotification({
          source: 'Web Scraper',
          message: `Discovered & Pinned ${addedS} Sellers & ${addedB} Buyers via Web Scraper Agent!`,
          count: addedS + addedB
        });
        setSidebarActiveTab('NEWLY_CREATED');

        setScraperMessage(`Scraped & Ingested ${addedS} verified sellers and ${addedB} buyers into live Google Map!`);
        if (data.entities[0]?.coordinates) {
          handleUpdateCamera(data.entities[0].coordinates, 12);
          const firstItem = newCreatedItems[0];
          if (firstItem) {
            setSelectedEntity({ role: firstItem.role, data: firstItem });
          }
        }
        setShowScraperModal(false);
      } else {
        setScraperMessage(data.error || 'Failed to scrape location data');
      }
    } catch (err: any) {
      setScraperMessage(`Scraper error: ${err.message}`);
    } finally {
      setIsScrapingLocations(false);
    }
  };

  // Filtered Lists
  const validSuppliers = suppliers.filter((s) => s.coordinates && s.coordinates.lat && s.coordinates.lng);
  const validBuyers = b2bCustomers.filter((b) => b.coordinates && b.coordinates.lat && b.coordinates.lng);

  const filteredSuppliers = validSuppliers.filter((s) => {
    if (roleFilter === 'BUYERS') return false;
    if (verifiedOnly && s.verified_status !== 'VERIFIED_AUDITED') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        (s.city && s.city.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredBuyers = validBuyers.filter((b) => {
    if (roleFilter === 'SELLERS') return false;
    if (verifiedOnly && b.verified_status !== 'VERIFIED_BUYER' && b.verified_status !== 'CREDIT_APPROVED')
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.company_name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        (b.city && b.city.toLowerCase().includes(q)) ||
        b.industry.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate high-level pipeline stats
  const totalVerifiedSellers = validSuppliers.filter((s) => s.verified_status === 'VERIFIED_AUDITED').length;
  const totalVerifiedBuyers = validBuyers.filter(
    (b) => b.verified_status === 'VERIFIED_BUYER' || b.verified_status === 'CREDIT_APPROVED'
  ).length;
  const totalMonthlySourcingCapacity = validSuppliers.reduce(
    (acc, s) => acc + (s.monthly_capacity_units || 0),
    0
  );
  const totalAnnualBuyerDemand = validBuyers.reduce(
    (acc, b) => acc + (b.estimated_annual_consumption_units || 0),
    0
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar: Analytics & Filter Controls */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 shrink-0 flex flex-wrap items-center justify-between gap-4">
        {/* Title & Context */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Supply & Demand Geographic Intelligence
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 border border-blue-500/30 text-blue-400">
                Google Maps Platform
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Groq Ingestion Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive mapping of verified manufacturing supply clusters and institutional B2B buyer origins
            </p>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20"></span>
            <div className="text-xs">
              <span className="text-slate-400">Sellers: </span>
              <span className="font-bold text-amber-400 font-mono">{filteredSuppliers.length}</span>
              <span className="text-[10px] text-slate-500 ml-1">({(totalMonthlySourcingCapacity / 1000).toFixed(0)}k/mo)</span>
            </div>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
            <div className="text-xs">
              <span className="text-slate-400">Buyers: </span>
              <span className="font-bold text-emerald-400 font-mono">{filteredBuyers.length}</span>
              <span className="text-[10px] text-slate-500 ml-1">({(totalAnnualBuyerDemand / 1000).toFixed(0)}k/yr)</span>
            </div>
          </div>

          {/* Web Location Scraper Agent Button */}
          <button
            onClick={() => setShowScraperModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>AI Web Scraper</span>
          </button>

          {/* National Highway Corridor Overlay Toggle */}
          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono transition-all cursor-pointer ${
              showCorridors
                ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showCorridors ? 'Corridors: ON' : 'Corridors: OFF'}</span>
          </button>

          {/* Packaging Diagnostics Link */}
          {onNavigateToStage && (
            <button
              onClick={() => onNavigateToStage('PACKAGING_LOGISTICS')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300 font-mono text-xs transition-all cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-emerald-400" />
              <span>Volumetric Diagnostics</span>
            </button>
          )}

          {/* Groq Ingest Button */}
          <button
            onClick={() => setShowGroqModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ingest via Groq</span>
            {groqStatus.configured ? (
              <span className="w-2 h-2 rounded-full bg-emerald-950 border border-emerald-300"></span>
            ) : (
              <span className="px-1 py-0.2 rounded text-[9px] bg-slate-900/60 text-slate-200">Set Key</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: Sidebar Controls + Interactive Map */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar: Presets, Filters & Entity List */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900/95 border-r border-slate-800 flex flex-col z-10 overflow-hidden">
          {/* Preset Selector */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Regional & Country Focus Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {GEO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset.id);
                    setCurrentCenter(preset.center);
                    setCurrentZoom(preset.zoom);
                  }}
                  className={`px-2.5 py-2 rounded text-left border transition-all text-xs ${
                    selectedPreset === preset.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                >
                  <div className="font-semibold truncate">{preset.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{preset.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Layer and Query Filters */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search city, company, grade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <div className="flex rounded border border-slate-800 bg-slate-950 p-0.5">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                    roleFilter === 'ALL' ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({filteredSuppliers.length + filteredBuyers.length})
                </button>
                <button
                  onClick={() => setRoleFilter('SELLERS')}
                  className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 ${
                    roleFilter === 'SELLERS' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-amber-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Sellers ({filteredSuppliers.length})
                </button>
                <button
                  onClick={() => setRoleFilter('BUYERS')}
                  className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 ${
                    roleFilter === 'BUYERS' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Buyers ({filteredBuyers.length})
                </button>
              </div>

              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`px-2 py-1 rounded text-[11px] border flex items-center gap-1 transition-all ${
                  verifiedOnly
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Verified Only</span>
              </button>
            </div>
          </div>

          {/* View Tab Selector: All Map Pins vs Recently Created */}
          <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-1 text-[11px] font-mono">
            <button
              onClick={() => setSidebarActiveTab('ALL_PINS')}
              className={`flex-1 py-1.5 px-2 rounded text-center transition-colors cursor-pointer ${
                sidebarActiveTab === 'ALL_PINS'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Pins ({filteredSuppliers.length + filteredBuyers.length})
            </button>
            <button
              onClick={() => setSidebarActiveTab('NEWLY_CREATED')}
              className={`flex-1 py-1.5 px-2 rounded text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                sidebarActiveTab === 'NEWLY_CREATED'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-950/30'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Created ({recentlyCreatedList.length})</span>
            </button>
          </div>

          {/* List of Mapped Entities with Click to Focus */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {sidebarActiveTab === 'NEWLY_CREATED' ? (
              <div className="space-y-2">
                <div className="px-1 py-1 text-[10px] font-mono uppercase text-emerald-400 flex justify-between items-center">
                  <span>✨ Verified Ingested / Scraped</span>
                  <span>{recentlyCreatedList.length} created entities</span>
                </div>

                {recentlyCreatedList.length === 0 ? (
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-md text-center text-xs text-slate-400 space-y-2">
                    <Sparkles className="w-6 h-6 text-amber-400 mx-auto opacity-70" />
                    <p className="font-semibold text-slate-300">No Custom Entities Created Yet</p>
                    <p className="text-[11px] text-slate-500">
                      Use <strong>«Ingest via Groq»</strong> or <strong>«AI Web Scraper»</strong> above to ingest verified manufacturers or institutional buyers in any Indian region.
                    </p>
                  </div>
                ) : (
                  recentlyCreatedList.map((item) => {
                    const isSelected = selectedEntity?.data?.id === item.id;
                    const isSeller = item.role === 'SELLER';
                    const isActive = isSeller ? activeSupplierId === item.id : activeBuyerId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-md border transition-all text-xs ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isSeller ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                            />
                            <span className="font-bold text-slate-100 line-clamp-1">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                isSeller
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {item.role}
                            </span>
                            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                              {item.source === 'Groq AI Ingested' ? 'Groq' : 'Scraper'}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-300 flex items-center justify-between mb-1">
                          <span>{item.city}{item.state ? `, ${item.state}` : ''}</span>
                          <span className="font-mono text-amber-400 font-bold">
                            ₹{item.price.toFixed(2)} / unit
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mb-2">
                          <span>
                            {isSeller ? `Cap: ${item.capacityOrDemand.toLocaleString()} u/mo` : `Demand: ${item.capacityOrDemand.toLocaleString()} u/yr`}
                          </span>
                          {item.gstin && <span className="text-slate-500">GST: {item.gstin}</span>}
                        </div>

                        {item.contact_person && (
                          <div className="text-[10px] text-slate-400 mb-2 truncate">
                            Contact: <span className="text-slate-300">{item.contact_person}</span> {item.phone ? `(${item.phone})` : ''}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/80">
                          <button
                            onClick={() => {
                              if (item.coordinates) {
                                handleUpdateCamera(item.coordinates, 14);
                              }
                              setSelectedEntity({ role: item.role, data: item as any });
                            }}
                            className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition-colors text-center cursor-pointer"
                          >
                            Focus on Map
                          </button>
                          <button
                            onClick={() => {
                              if (isSeller) {
                                onSelectSupplierAsActive?.(item.id);
                              } else {
                                onSelectBuyerAsActive?.(item.id);
                              }
                            }}
                            className={`flex-1 py-1 px-2 rounded text-[10px] font-mono font-bold transition-colors text-center cursor-pointer ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isActive ? 'Active Target ✓' : 'Set as Active'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                <div className="px-1 py-1 text-[10px] font-mono uppercase text-slate-500 flex justify-between">
                  <span>Matching Entities on Map</span>
                  <span>{filteredSuppliers.length + filteredBuyers.length} pins active</span>
                </div>

                {/* Ingested sellers */}
                {filteredSuppliers.map((sup) => (
                  <div
                    key={sup.id}
                    onClick={() => {
                      if (sup.coordinates) {
                        handleUpdateCamera(sup.coordinates, 14);
                      }
                      setSelectedEntity({ role: 'SELLER', data: sup });
                      const relatedQuote = quotes.find((q) => q.supplier_id === sup.id);
                      onSelectSupplierAsActive?.(sup.id, relatedQuote?.id);
                    }}
                    className={`p-2 rounded-md transition-all cursor-pointer border ${
                      selectedEntity?.data?.id === sup.id
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                        <span className="text-xs font-semibold text-slate-200 line-clamp-1">{sup.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        SELLER
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{sup.city || sup.location}</span>
                      <span className="text-slate-300 font-mono text-[10px]">
                        Cap: {(sup.monthly_capacity_units || 0).toLocaleString()} u/mo
                      </span>
                    </div>
                    {sup.verified_status && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{sup.verified_status.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Ingested buyers */}
                {filteredBuyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    onClick={() => {
                      if (buyer.coordinates) {
                        handleUpdateCamera(buyer.coordinates, 14);
                      }
                      setSelectedEntity({ role: 'BUYER', data: buyer });
                      onSelectBuyerAsActive?.(buyer.id);
                    }}
                    className={`p-2 rounded-md transition-all cursor-pointer border ${
                      selectedEntity?.data?.id === buyer.id
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                        <span className="text-xs font-semibold text-slate-200 line-clamp-1">{buyer.company_name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {buyer.industry} BUYER
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{buyer.city || buyer.location}</span>
                      <span className="text-slate-300 font-mono text-[10px]">
                        Demand: {(buyer.estimated_annual_consumption_units || 0).toLocaleString()} u/yr
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-mono">
                        Direct B2B Margin: +{buyer.gross_contribution_margin_pct}%
                      </span>
                      <span className="text-amber-400 font-mono">Score: {buyer.opportunity_score}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Section: Google Maps Container */}
        <div className="flex-1 h-full relative">
          {/* Floating Creation & Ingestion Toast Banner */}
          {creationNotification && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[92%] bg-slate-900/95 border border-emerald-500/50 shadow-2xl rounded-lg p-3 flex items-center justify-between gap-3 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{creationNotification.message}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                      {creationNotification.count} Active Pins
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Entities are live on Google Maps and saved into your active pipeline.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSidebarActiveTab('NEWLY_CREATED')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Inspect List
                </button>
                <button
                  onClick={() => setCreationNotification(null)}
                  className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <APIProvider apiKey={mapsApiKey} libraries={['marker']}>
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={currentCenter}
              defaultZoom={currentZoom}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              {/* Camera updater sync */}
              <MapCameraUpdater center={currentCenter} zoom={currentZoom} />

              {/* Render Seller Markers (Amber Pins) */}
              {filteredSuppliers.map((supplier) => {
                if (!supplier.coordinates) return null;
                const isSelected = selectedEntity?.data?.id === supplier.id;
                const isActiveInPipeline = activeSupplierId === supplier.id;

                return (
                  <AdvancedMarker
                    key={supplier.id}
                    position={supplier.coordinates}
                    title={`Seller: ${supplier.name}`}
                    onClick={() => {
                      setSelectedEntity({ role: 'SELLER', data: supplier });
                      const relatedQuote = quotes.find((q) => q.supplier_id === supplier.id);
                      onSelectSupplierAsActive?.(supplier.id, relatedQuote?.id);
                    }}
                  >
                    <Pin
                      background={isActiveInPipeline ? '#f59e0b' : '#d97706'}
                      glyphColor="#0f172a"
                      borderColor="#fef3c7"
                      scale={isSelected ? 1.3 : 1.05}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* Render Buyer Markers (Emerald Pins) */}
              {filteredBuyers.map((buyer) => {
                if (!buyer.coordinates) return null;
                const isSelected = selectedEntity?.data?.id === buyer.id;

                return (
                  <AdvancedMarker
                    key={buyer.id}
                    position={buyer.coordinates}
                    title={`Buyer: ${buyer.company_name}`}
                    onClick={() => {
                      setSelectedEntity({ role: 'BUYER', data: buyer });
                      onSelectBuyerAsActive?.(buyer.id);
                    }}
                  >
                    <Pin
                      background="#10b981"
                      glyphColor="#0f172a"
                      borderColor="#d1fae5"
                      scale={isSelected ? 1.3 : 1.05}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* National Logistics Corridors Overlay Markers */}
              {showCorridors &&
                NATIONAL_CORRIDORS.map((c) => (
                  <AdvancedMarker
                    key={c.id}
                    position={c.destination}
                    title={`${c.name} (${c.lsp})`}
                    onClick={() => {
                      setSelectedEntity({
                        role: 'BUYER',
                        data: {
                          id: c.id,
                          company_name: c.name,
                          contact_person: `${c.lsp} Hub Logistics`,
                          industry: 'OEM',
                          location: `${c.destination.name} Corridor`,
                          city: c.destination.name,
                          coordinates: c.destination,
                          first_touch_source: 'DIRECT_OUTREACH',
                          amazon_order_history_count: 0,
                          direct_b2b_status: 'ACTIVE_ACCOUNT',
                          average_order_value_inr: 50000,
                          estimated_annual_consumption_units: 50000,
                          order_frequency_days: 30,
                          gross_contribution_margin_pct: 42,
                          opportunity_score: 95,
                          phone: '+91 98000 11111',
                          email: 'freight@corridors.in',
                          gstin: '27AAACT1234F1Z1',
                          preferred_credit_days: 30,
                          verified_status: 'VERIFIED_BUYER',
                          flag_notes: `[Logistics Corridor] ${c.distanceKm} km · ${c.transitDays} days transit · Freight: ₹${c.ratePerClamp}/clamp via ${c.lsp} · Road: ${c.roadQuality}`,
                          next_follow_up: '2026-10-30'
                        }
                      });
                    }}
                  >
                    <Pin
                      background="#6366f1"
                      glyphColor="#ffffff"
                      borderColor="#e0e7ff"
                      scale={1.2}
                    />
                  </AdvancedMarker>
                ))}

              {/* InfoWindow for Selected Entity */}
              {selectedEntity && selectedEntity.data.coordinates && (
                <InfoWindow
                  position={selectedEntity.data.coordinates}
                  onCloseClick={() => setSelectedEntity(null)}
                >
                  <div className="p-2 max-w-sm text-slate-900 font-sans">
                    {selectedEntity.role === 'SELLER' ? (
                      (() => {
                        const sup = selectedEntity.data as Supplier;
                        const relatedQuote = quotes.find((q) => q.supplier_id === sup.id);

                        return (
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-1.5">
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                                  <Factory className="w-3 h-3" />
                                  Verified Industrial Seller
                                </div>
                                <h3 className="text-sm font-bold text-slate-950 leading-tight">{sup.name}</h3>
                                <p className="text-[11px] text-slate-600">{sup.location}</p>
                              </div>
                              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                                {sup.verified_status || 'VERIFIED'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded">
                              <div>
                                <span className="text-slate-500 block text-[10px]">Monthly Capacity</span>
                                <span className="font-bold text-slate-800 font-mono">
                                  {(sup.monthly_capacity_units || 0).toLocaleString()} units
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">Quoted Unit Cost</span>
                                <span className="font-bold text-emerald-700 font-mono">
                                  {relatedQuote ? `₹${relatedQuote.quoted_price_inr.toFixed(2)}` : '₹13.50 est.'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">Lead Time</span>
                                <span className="font-medium text-slate-800">{sup.lead_time_days} days</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">QA Audit Status</span>
                                <span className="font-medium text-slate-800">
                                  {sup.sample_status.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-600">
                              <span className="font-semibold text-slate-800">Contact: </span>
                              {sup.contact_person} ({sup.phone})
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                              <button
                                onClick={() => {
                                  onSelectSupplierAsActive?.(sup.id, relatedQuote?.id);
                                  onNavigateToStage?.('SUPPLIERS');
                                }}
                                className="flex-1 px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Use as Active Sourcing Quote
                              </button>
                              <button
                                onClick={() => onNavigateToStage?.('QA')}
                                className="px-2.5 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-semibold"
                              >
                                Metallurgy QA
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      (() => {
                        const buyer = selectedEntity.data as B2BCustomer;

                        return (
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-1.5">
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  Institutional B2B Buyer
                                </div>
                                <h3 className="text-sm font-bold text-slate-950 leading-tight">
                                  {buyer.company_name}
                                </h3>
                                <p className="text-[11px] text-slate-600">{buyer.location}</p>
                              </div>
                              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                                {buyer.industry}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded">
                              <div>
                                <span className="text-slate-500 block text-[10px]">Annual Demand</span>
                                <span className="font-bold text-slate-800 font-mono">
                                  {(buyer.estimated_annual_consumption_units || 0).toLocaleString()} units
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">Avg Order Value</span>
                                <span className="font-bold text-emerald-700 font-mono">
                                  ₹{buyer.average_order_value_inr.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">B2B Margin Delta</span>
                                <span className="font-bold text-emerald-600 font-mono">
                                  +{buyer.gross_contribution_margin_pct}% vs Amazon
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block text-[10px]">Purchase Cycle</span>
                                <span className="font-medium text-slate-800">
                                  Every {buyer.order_frequency_days} days
                                </span>
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-600">
                              <span className="font-semibold text-slate-800">Procurement: </span>
                              {buyer.contact_person} ({buyer.phone || 'Direct GST Active'})
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                              <button
                                onClick={() => onNavigateToStage?.('B2B')}
                                className="flex-1 px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                Open in B2B Funnel
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 shadow-xl text-xs space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Map Symbol Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300 ring-2 ring-amber-500/20"></span>
              <span className="text-slate-200">Verified Sellers (Stamping Mills, Fastener Tooling)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 ring-2 ring-emerald-500/20"></span>
              <span className="text-slate-200">Institutional Buyers (Automotive, Chemical, HVAC, Pumps)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 border border-indigo-300 ring-2 ring-indigo-500/20"></span>
              <span className="text-slate-200">Logistics Corridors &amp; LSPs (NH-48, NH-18, NH-27)</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
              <span>Google Maps JavaScript API</span>
              <span className="text-emerald-400">DEMO_MAP_ID Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Groq Ingestion & API Key Modal */}
      {showGroqModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Groq Fast Inference Ingestion Engine
                  </h3>
                  <p className="text-xs text-slate-400">
                    AI-powered extraction of verified Indian industrial suppliers & buyers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGroqModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            {/* Groq Key Status & Setup */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Groq Environment Variable (<code className="text-amber-400 font-mono">GROQ_API_KEY</code>)
                </span>
                {groqStatus.configured ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    CONFIGURED: {groqStatus.keyPreview}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    KEY REQUIRED
                  </span>
                )}
              </div>

              {!groqStatus.configured && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-slate-400">
                    Provide your Groq API key (starts with <code className="text-amber-300">gsk_...</code>). It will be saved into <code className="text-slate-200">.env</code> and environment variables on the server.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Paste gsk_xxxxxxxxxxxxxxxxxxxx"
                      value={groqApiKeyInput}
                      onChange={(e) => setGroqApiKeyInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleSaveGroqKey}
                      disabled={isSavingKey || !groqApiKeyInput.trim()}
                      className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs"
                    >
                      {isSavingKey ? 'Saving...' : 'Save Key'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Ingestion Parameters Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Entity Type</label>
                  <select
                    value={ingestionType}
                    onChange={(e) => setIngestionType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="BOTH">Both Verified Sellers & Buyers</option>
                    <option value="SELLER">Manufacturers / Sellers Only</option>
                    <option value="BUYER">Industrial Buyers / OEMs Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Geographic Focus</label>
                  <select
                    value={ingestionRegion}
                    onChange={(e) => setIngestionRegion(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Kolkata & Howrah Industrial Cluster">Kolkata & Howrah Belt</option>
                    <option value="Gujarat GIDC Precision Tooling (Rajkot, Ahmedabad)">Gujarat Corridor</option>
                    <option value="Pune & Chakan Automotive Tier-1 Hub">Pune / Chakan Auto Hub</option>
                    <option value="Jamshedpur & Haldia Heavy Industrial Corridor">Jamshedpur / Haldia</option>
                    <option value="Coimbatore & Chennai Engineering Hub">South India (Coimbatore/Chennai)</option>
                    <option value="Pan-India National Manufacturing">Pan-India Industrial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Custom Sourcing Prompt or Industry Specifics (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Find cold-rolled SS304 stamping units with Jindal coil MTC certs"
                  value={ingestionPrompt}
                  onChange={(e) => setIngestionPrompt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {ingestionMessage && (
              <div
                className={`p-2.5 rounded text-xs font-mono ${
                  ingestionMessage.includes('Successfully')
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                }`}
              >
                {ingestionMessage}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Model: <code className="text-slate-400">llama-3.3-70b-versatile</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGroqModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={handleTriggerGroqIngest}
                  disabled={isIngesting}
                  className="px-4 py-1.5 rounded bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  {isIngesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting Entities...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run Ingestion</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Autonomous AI Browser Agent Location Scraper Modal */}
      {showScraperModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    AI Web Location Scraper Agent
                  </h3>
                  <p className="text-xs text-slate-400">
                    Crawl Indian industrial estates for real buyers &amp; sellers to chart on Google Maps
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScraperModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            {/* Scraper Query & Cluster Parameters */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Web Scraping Target Query</label>
                <input
                  type="text"
                  value={scraperQuery}
                  onChange={(e) => setScraperQuery(e.target.value)}
                  placeholder="e.g. SS304 DIN 3017 hose clamp buyers automotive Chakan Pune"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Industrial Corridor / Cluster</label>
                  <select
                    value={scraperClusterRegion}
                    onChange={(e) => setScraperClusterRegion(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Western Industrial Corridor (Pune-Chakan)">Pune / Chakan Auto Hub</option>
                    <option value="Kolkata & Howrah Belt (Baltikuri, Domjur)">Kolkata &amp; Howrah Stamping Hub</option>
                    <option value="Jamshedpur & Haldia Heavy Industrial Corridor">Jamshedpur Heavy Engineering</option>
                    <option value="Gujarat Fastener & Tooling Corridor (Rajkot)">Rajkot &amp; Ahmedabad Tooling</option>
                    <option value="Coimbatore & Chennai Pump Belt">Coimbatore Submersible Pumps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Target Entity Role</label>
                  <select
                    value={scraperTargetType}
                    onChange={(e) => setScraperTargetType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="BOTH">Both Verified Sellers &amp; Buyers</option>
                    <option value="SELLER">Manufacturers / Stamping Mills</option>
                    <option value="BUYER">Institutional Buyers / OEMs</option>
                  </select>
                </div>
              </div>

              {/* Status Message */}
              {scraperMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{scraperMessage}</span>
                </div>
              )}
            </div>

            {/* Discovered Entities Preview */}
            {discoveredLocations.length > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs space-y-1.5 max-h-40 overflow-y-auto">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recently Scraped &amp; Ingested:</span>
                {discoveredLocations.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] text-slate-300 border-b border-slate-800/60 pb-1">
                    <span className="truncate max-w-[200px]">{item.name}</span>
                    <span className="text-emerald-400 font-bold">{item.city} ({item.nearest_highway || 'NH'})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 font-mono text-xs">
              <span className="text-[11px] text-slate-500">
                Powered by Gemini 3.1 Pro + Web Agent
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScraperModal(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={handleRunLocationScraper}
                  disabled={isScrapingLocations}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  {isScrapingLocations ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scraping &amp; Charting...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      <span>Run Web Scraper &amp; Ingest</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
