import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Layers,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Cpu,
  Globe
} from 'lucide-react';

interface Packaging3DPlayerProps {
  initialLengthCm?: number;
  initialWidthCm?: number;
  initialHeightCm?: number;
  initialPackSize?: number;
  initialUnitWeightGrams?: number;
  onSyncToPipeline?: (data: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    packSize: number;
    grossWeightGrams: number;
    packagingCostPerUnit: number;
  }) => void;
}

export const Packaging3DPlayer: React.FC<Packaging3DPlayerProps> = ({
  initialLengthCm = 14,
  initialWidthCm = 11,
  initialHeightCm = 6.5,
  initialPackSize = 20,
  initialUnitWeightGrams = 24.25,
  onSyncToPipeline
}) => {
  // Dimensional States
  const [lengthCm, setLengthCm] = useState<number>(initialLengthCm);
  const [widthCm, setWidthCm] = useState<number>(initialWidthCm);
  const [heightCm, setHeightCm] = useState<number>(initialHeightCm);
  const [packSize, setPackSize] = useState<number>(initialPackSize);
  const [packagingScheme, setPackagingScheme] = useState<'STANDARD' | 'OPTIMIZED_BLISTER' | 'B2B_BULK'>('OPTIMIZED_BLISTER');
  const [viewMode, setViewMode] = useState<'TRANSLUCENT' | 'SOLID' | 'WIREFRAME' | 'CUTAWAY'>('TRANSLUCENT');

  // 3D Canvas Orbit State
  const [rotX, setRotX] = useState<number>(24);
  const [rotY, setRotY] = useState<number>(-35);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Internet Price Poller State
  const [isPollingPrices, setIsPollingPrices] = useState<boolean>(false);
  const [polledPrices, setPolledPrices] = useState<any>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  // Poll real-time internet prices on mount
  useEffect(() => {
    fetchLivePackagingPrices();
  }, []);

  const fetchLivePackagingPrices = async () => {
    setIsPollingPrices(true);
    try {
      const res = await fetch('/api/ai/packaging-price-poller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialType: 'corrugated carton packaging and thermoformed blister tray SS304 hose clamps India'
        })
      });
      const data = await res.json();
      if (data.success) {
        setPolledPrices(data);
      }
    } catch (e) {
      console.error('Failed to poll packaging prices:', e);
    } finally {
      setIsPollingPrices(false);
    }
  };

  // Calculations
  const metrics = useMemo(() => {
    const rawClampWeightKg = (packSize * initialUnitWeightGrams) / 1000;
    const tareWeightGrams = packagingScheme === 'OPTIMIZED_BLISTER' ? 38 : packagingScheme === 'STANDARD' ? 55 : 20;
    const grossWeightGrams = Math.round(rawClampWeightKg * 1000 + tareWeightGrams);
    const boxVolumeCm3 = Math.round(lengthCm * widthCm * heightCm);
    const volumetricWeightAirKg = boxVolumeCm3 / 5000;
    const volumetricWeightRoadKg = boxVolumeCm3 / 4000;
    const billableWeightAirKg = Math.max(grossWeightGrams / 1000, volumetricWeightAirKg);

    // Steel displacement
    const steelVolumeCm3 = (packSize * initialUnitWeightGrams) / 7.93;
    const deadSpacePct = Math.max(0, Math.min(95, Math.round(((boxVolumeCm3 - steelVolumeCm3) / boxVolumeCm3) * 100)));

    // Packaging cost per unit
    const packagingCostPerUnit =
      packagingScheme === 'OPTIMIZED_BLISTER' ? 5.20 : packagingScheme === 'STANDARD' ? 3.50 : 1.20;

    const isAbove500g = grossWeightGrams > 500;

    return {
      grossWeightGrams,
      boxVolumeCm3,
      volumetricWeightAirKg: Math.round(volumetricWeightAirKg * 1000) / 1000,
      volumetricWeightRoadKg: Math.round(volumetricWeightRoadKg * 1000) / 1000,
      billableWeightAirKg: Math.round(billableWeightAirKg * 1000) / 1000,
      deadSpacePct,
      isAbove500g,
      packagingCostPerUnit
    };
  }, [lengthCm, widthCm, heightCm, packSize, initialUnitWeightGrams, packagingScheme]);

  // Handle Mouse Drag for 3D Orbit Rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setRotY((prev) => prev + dx * 0.7);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - dy * 0.7)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render 3D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Coordinate system & projection
    const cx = width / 2;
    const cy = height / 2 + 10;
    const scale = (Math.min(width, height) / 38) * zoom;

    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // 3D Point projection function
    const project = (x: number, y: number, z: number) => {
      // Rotate around Y
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective divide
      const dist = 55;
      const fov = dist / (dist + z2);
      return {
        px: cx + x1 * scale * fov,
        py: cy - y2 * scale * fov,
        z: z2
      };
    };

    // Half dimensions
    const hl = lengthCm / 2;
    const hw = widthCm / 2;
    const hh = heightCm / 2;

    // 8 Box Vertices
    const vertices = [
      project(-hl, -hh, -hw), // 0: left-bottom-back
      project(hl, -hh, -hw),  // 1: right-bottom-back
      project(hl, hh, -hw),   // 2: right-top-back
      project(-hl, hh, -hw),  // 3: left-top-back
      project(-hl, -hh, hw),  // 4: left-bottom-front
      project(hl, -hh, hw),   // 5: right-bottom-front
      project(hl, hh, hw),    // 6: right-top-front
      project(-hl, hh, hw)    // 7: left-top-front
    ];

    // Draw Ground Grid shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + hh * scale * 0.9, hl * scale * 1.2, hw * scale * 0.9, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Box Faces
    const faces = [
      { idx: [0, 1, 2, 3], name: 'back', color: 'rgba(30, 41, 59, 0.4)' },
      { idx: [4, 5, 6, 7], name: 'front', color: 'rgba(51, 65, 85, 0.35)' },
      { idx: [0, 4, 7, 3], name: 'left', color: 'rgba(30, 41, 59, 0.5)' },
      { idx: [1, 5, 6, 2], name: 'right', color: 'rgba(71, 85, 105, 0.45)' },
      { idx: [3, 2, 6, 7], name: 'top', color: 'rgba(100, 116, 139, 0.3)' },
      { idx: [0, 1, 5, 4], name: 'bottom', color: 'rgba(15, 23, 42, 0.7)' }
    ];

    // Sort faces by average Z depth
    faces.forEach((face) => {
      (face as any).avgZ = face.idx.reduce((acc, i) => acc + vertices[i].z, 0) / 4;
    });
    faces.sort((a: any, b: any) => b.avgZ - a.avgZ);

    // Draw 3D Clamps Inside Box first if translucent or cutaway
    const renderClamps = () => {
      const clampCount = Math.min(30, packSize);
      const cols = packagingScheme === 'OPTIMIZED_BLISTER' ? 5 : 4;
      const rows = Math.ceil(clampCount / cols);

      for (let i = 0; i < clampCount; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);

        let cxPos = -hl + 2.2 + c * ((2 * hl - 4.4) / Math.max(1, cols - 1));
        let czPos = -hw + 2.2 + r * ((2 * hw - 4.4) / Math.max(1, rows - 1));
        let cyPos = -hh + 1.8;

        // If standard loose packaging, jitter positions to simulate chaotic loose bag
        if (packagingScheme === 'STANDARD') {
          cxPos += Math.sin(i * 3.7) * 1.5;
          czPos += Math.cos(i * 2.3) * 1.5;
          cyPos += (i % 3) * 1.2;
        }

        const centerPt = project(cxPos, cyPos, czPos);

        // Draw clamp as metallic ring
        ctx.save();
        ctx.beginPath();
        const clampRadius = scale * 1.15;
        ctx.arc(centerPt.px, centerPt.py, clampRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#94a3b8'; // Stainless steel
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner hollow hole
        ctx.beginPath();
        ctx.arc(centerPt.px, centerPt.py, clampRadius * 0.65, 0, 2 * Math.PI);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Screw housing cylinder
        const screwPt = project(cxPos + 0.8, cyPos + 0.9, czPos);
        ctx.fillStyle = '#f59e0b'; // Brass/SS drive screw
        ctx.fillRect(screwPt.px - 3, screwPt.py - 3, 6, 6);
        ctx.restore();
      }

      // If dead space is high (>40%), render translucent red dead-air indicator
      if (metrics.deadSpacePct > 40 && viewMode !== 'SOLID') {
        const topVoid = project(0, hh * 0.45, 0);
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(topVoid.px, topVoid.py, scale * 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    };

    // Render Faces according to viewMode
    faces.forEach((face) => {
      ctx.beginPath();
      ctx.moveTo(vertices[face.idx[0]].px, vertices[face.idx[0]].py);
      for (let i = 1; i < face.idx.length; i++) {
        ctx.lineTo(vertices[face.idx[i]].px, vertices[face.idx[i]].py);
      }
      ctx.closePath();

      if (viewMode === 'TRANSLUCENT') {
        ctx.fillStyle = face.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (viewMode === 'SOLID') {
        ctx.fillStyle = face.name === 'top' ? '#d97706' : '#b45309'; // Kraft cardboard tone
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (viewMode === 'WIREFRAME') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (viewMode === 'CUTAWAY') {
        if (face.name !== 'front' && face.name !== 'top') {
          ctx.fillStyle = face.color;
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.stroke();
      }
    });

    // Render interior clamps
    if (viewMode !== 'SOLID') {
      renderClamps();
    }

    // Draw Dimension Callout Arrows & Labels
    ctx.save();
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#38bdf8';

    // Length (L) dimension line along bottom front edge (4 -> 5)
    const p4 = vertices[4];
    const p5 = vertices[5];
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p4.px, p4.py + 12);
    ctx.lineTo(p5.px, p5.py + 12);
    ctx.stroke();
    ctx.fillText(`L: ${lengthCm} cm`, (p4.px + p5.px) / 2 - 20, (p4.py + p5.py) / 2 + 25);

    // Height (H) dimension line along front right vertical edge (5 -> 6)
    const p6 = vertices[6];
    ctx.beginPath();
    ctx.moveTo(p5.px + 14, p5.py);
    ctx.lineTo(p6.px + 14, p6.py);
    ctx.stroke();
    ctx.fillText(`H: ${heightCm} cm`, (p5.px + p6.px) / 2 + 20, (p5.py + p6.py) / 2);

    // Width (W) dimension line along right bottom edge (5 -> 1)
    const p1 = vertices[1];
    ctx.beginPath();
    ctx.moveTo(p5.px - 6, p5.py + 10);
    ctx.lineTo(p1.px - 6, p1.py + 10);
    ctx.stroke();
    ctx.fillText(`W: ${widthCm} cm`, (p5.px + p1.px) / 2 - 35, (p5.py + p1.py) / 2 + 18);
    ctx.restore();

  }, [lengthCm, widthCm, heightCm, packSize, rotX, rotY, zoom, viewMode, packagingScheme, metrics]);

  const handleSyncToPipeline = () => {
    onSyncToPipeline?.({
      lengthCm,
      widthCm,
      heightCm,
      packSize,
      grossWeightGrams: metrics.grossWeightGrams,
      packagingCostPerUnit: metrics.packagingCostPerUnit
    });
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl font-sans space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Box className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-white text-base tracking-tight">
              3D Interactive Packaging Extruder &amp; Volumetric Simulator
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              WebGL Canvas 3D
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rotate, zoom, and live-extrude packaging dimensions. Simulates SS304 density displacement, dead-air void penalties, and polls live internet packaging prices.
          </p>
        </div>

        {/* Sync Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncToPipeline}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs rounded shadow-lg transition-all cursor-pointer"
          >
            {syncSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Synced to Pipeline!</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Push Dimensions to Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Section: 3D Viewport + Extrusion Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): 3D Canvas Player Window */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-lg p-3 relative flex flex-col items-center justify-center overflow-hidden min-h-[360px]">
          {/* 3D Canvas */}
          <canvas
            ref={canvasRef}
            width={540}
            height={360}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-grab active:cursor-grabbing max-w-full h-auto"
          />

          {/* Floating Viewport Controls */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded p-1 text-xs font-mono">
            <button
              onClick={() => setViewMode('TRANSLUCENT')}
              className={`px-2 py-0.5 rounded text-[10px] ${
                viewMode === 'TRANSLUCENT' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Translucent
            </button>
            <button
              onClick={() => setViewMode('CUTAWAY')}
              className={`px-2 py-0.5 rounded text-[10px] ${
                viewMode === 'CUTAWAY' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cutaway
            </button>
            <button
              onClick={() => setViewMode('SOLID')}
              className={`px-2 py-0.5 rounded text-[10px] ${
                viewMode === 'SOLID' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cardboard
            </button>
            <button
              onClick={() => setViewMode('WIREFRAME')}
              className={`px-2 py-0.5 rounded text-[10px] ${
                viewMode === 'WIREFRAME' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wireframe
            </button>
          </div>

          {/* Zoom and Reset Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded p-1 text-xs">
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setRotX(24);
                setRotY(-35);
                setZoom(1.0);
              }}
              className="p-1 text-slate-400 hover:text-white"
              title="Reset Viewpoint"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Live Diagnostic HUD */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded px-3 py-1.5 text-[11px] font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Gross: <strong className="text-white">{metrics.grossWeightGrams} g</strong>
              </span>
              <span className="text-slate-600">&middot;</span>
              <span className="text-slate-400">
                Vol Air: <strong className="text-amber-400">{(metrics.volumetricWeightAirKg * 1000).toFixed(0)} g</strong>
              </span>
              <span className="text-slate-600">&middot;</span>
              <span className="text-slate-400">
                Dead Air: <strong className={metrics.deadSpacePct > 40 ? 'text-rose-400' : 'text-emerald-400'}>{metrics.deadSpacePct}%</strong>
              </span>
            </div>

            <span className="text-[10px] text-slate-500">
              Drag to Orbit &middot; Scroll to Scale
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Live Extrusion Sliders & Scheme Toggle */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          {/* Packaging Scheme Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              Packaging Scheme Configuration
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  setPackagingScheme('STANDARD');
                  setLengthCm(16);
                  setWidthCm(13);
                  setHeightCm(9);
                }}
                className={`px-2 py-2 rounded text-left border transition-all ${
                  packagingScheme === 'STANDARD'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="truncate">1. Loose Bag</div>
                <div className="text-[9px] text-slate-500">Unorganized</div>
              </button>

              <button
                onClick={() => {
                  setPackagingScheme('OPTIMIZED_BLISTER');
                  setLengthCm(14);
                  setWidthCm(11);
                  setHeightCm(6.5);
                }}
                className={`px-2 py-2 rounded text-left border transition-all ${
                  packagingScheme === 'OPTIMIZED_BLISTER'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="truncate">2. Blister Tray</div>
                <div className="text-[9px] text-emerald-400">Nested D2C</div>
              </button>

              <button
                onClick={() => {
                  setPackagingScheme('B2B_BULK');
                  setLengthCm(38);
                  setWidthCm(28);
                  setHeightCm(22);
                  setPackSize(400);
                }}
                className={`px-2 py-2 rounded text-left border transition-all ${
                  packagingScheme === 'B2B_BULK'
                    ? 'bg-blue-950/40 border-blue-500/60 text-blue-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="truncate">3. B2B Crate</div>
                <div className="text-[9px] text-blue-400">Pallet Bulk</div>
              </button>
            </div>
          </div>

          {/* Interactive Extruder Sliders */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-3">
            {/* Box Length Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Extrude Length (L):</span>
                <span className="font-bold text-white">{lengthCm} cm</span>
              </div>
              <input
                type="range"
                min={8}
                max={45}
                step={0.5}
                value={lengthCm}
                onChange={(e) => setLengthCm(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Box Width Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Extrude Width (W):</span>
                <span className="font-bold text-white">{widthCm} cm</span>
              </div>
              <input
                type="range"
                min={6}
                max={35}
                step={0.5}
                value={widthCm}
                onChange={(e) => setWidthCm(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Box Height Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Extrude Height (H):</span>
                <span className="font-bold text-white">{heightCm} cm</span>
              </div>
              <input
                type="range"
                min={4}
                max={30}
                step={0.5}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Pack Size */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Clamp Units (Pack Size):</span>
                <span className="font-bold text-white">{packSize} pcs</span>
              </div>
              <input
                type="range"
                min={10}
                max={packagingScheme === 'B2B_BULK' ? 1000 : 100}
                step={10}
                value={packSize}
                onChange={(e) => setPackSize(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          </div>

          {/* Amazon FBA Weight Cliff Indicator */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] leading-relaxed">
            {metrics.isAbove500g ? (
              <div className="text-rose-300 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Amazon FBA Surcharge Active:</strong> At {metrics.grossWeightGrams}g, this pack exceeds 500g. Compressing height by 1.5cm drops weight below 500g, saving ₹24.00 per unit!
                </span>
              </div>
            ) : (
              <div className="text-emerald-300 flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>FBA Tier 1 Optimized:</strong> Total weight is {metrics.grossWeightGrams}g (under 500g threshold). Base shipping rates apply without dimensional penalties.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Internet Packaging Material Price Poller (Search Grounded with Gemini-3.5-flash) */}
      <div className="pt-3 border-t border-slate-800 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <h4 className="font-bold text-white text-xs">
              Live Internet Packaging Material Pricing (Google Search Grounded)
            </h4>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              gemini-3.5-flash
            </span>
          </div>

          <button
            onClick={fetchLivePackagingPrices}
            disabled={isPollingPrices}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            <RefreshCw className={`w-3 h-3 ${isPollingPrices ? 'animate-spin' : ''}`} />
            <span>Refresh Market Poller</span>
          </button>
        </div>

        {polledPrices ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {polledPrices.polledData?.packagingMaterials?.map((mat: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-200 font-bold text-[11px] line-clamp-1">{mat.name}</span>
                    <span className="text-emerald-400 font-bold whitespace-nowrap ml-1">
                      ₹{mat.estimatedPriceInr.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{mat.specs}</div>
                  <div className="text-[9px] text-slate-500 flex justify-between pt-1 border-t border-slate-800/60">
                    <span>MOQ: {mat.moqUnits} u</span>
                    <span className="text-amber-400 truncate max-w-[100px]">{mat.supplierOrPortal}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Verified Google Search Source Citations */}
            {polledPrices.sourceCitations?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                <span className="text-slate-400 font-semibold">Verified Grounded Sources:</span>
                {polledPrices.sourceCitations.slice(0, 4).map((cite: any, idx: number) => (
                  <a
                    key={idx}
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:underline hover:text-blue-300"
                  >
                    <span>{cite.title || 'Market Source'}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-center text-slate-500 text-[11px]">
            Polling live packaging rates from Indian suppliers via Google Search...
          </div>
        )}
      </div>
    </div>
  );
};
