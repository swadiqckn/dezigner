'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid, 
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';

// Dynamic import with SSR disabled for Konva canvas engine
const KonvaStageDynamic = dynamic(() => import('./KonvaStage'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 text-slate-400">
      <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium">Loading Canvas Studio...</p>
    </div>
  ),
});

interface CanvasWorkspaceProps {
  onStageReady?: (stage: Konva.Stage | null) => void;
}

export default function CanvasWorkspace({ onStageReady }: CanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Touch tracking for mobile pinch & pan
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  const {
    width,
    height,
    presetName,
    zoom,
    setZoom,
    pan,
    setPan,
    zoomIn,
    zoomOut,
    resetZoomPan,
    isCanvasLocked,
    toggleCanvasLock,
    showGrid,
    setShowGrid,
    showRulers,
    showGuides,
    setShowGuides,
    addLayer,
  } = useEditorStore();

  // Spacebar panning detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.min(3, Math.max(0.1, Number((z + delta).toFixed(2)))));
    } else {
      // Pan with scroll
      setPan((p) => ({
        x: p.x - e.deltaX * 0.5,
        y: p.y - e.deltaY * 0.5,
      }));
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCanvasLocked && (isSpacePressed || e.button === 1 || e.target === containerRef.current)) {
      // Space + Left Click or Middle Click or background drag when canvas is unlocked
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Mobile Touch Pan & Pinch-to-zoom handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    } else if (
      !isCanvasLocked &&
      e.touches.length === 1 &&
      (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'CANVAS')
    ) {
      // One finger pan on background ONLY when canvas is unlocked
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance !== null) {
      // Pinch move
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistance;
      if (Math.abs(factor - 1) > 0.02) {
        setZoom((z) => Math.min(3, Math.max(0.1, Number((z * factor).toFixed(2)))));
        setTouchDistance(dist);
      }
    } else if (e.touches.length === 1 && isPanning) {
      setPan({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
    setIsPanning(false);
  };

  // Handle Drag-and-Drop Image onto Canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          addLayer({
            type: 'image',
            name: file.name.replace(/\.[^/.]+$/, ''),
            src,
            x: Math.round(width / 4),
            y: Math.round(height / 4),
            width: Math.min(500, Math.round(width / 2)),
            height: Math.min(500, Math.round(height / 2)),
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 min-w-0 h-full bg-slate-100/90 overflow-hidden select-none flex flex-col ${
        !isCanvasLocked && (isSpacePressed || isPanning) ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Top Ruler Bar (Desktop only) */}
      {showRulers && (
        <div className="hidden md:flex h-6 w-full bg-slate-200 border-b border-slate-300 text-[10px] text-slate-500 items-center px-6 font-mono select-none shrink-0">
          <div className="flex justify-between w-full">
            <span>0 px</span>
            <span>{Math.round(width / 4)} px</span>
            <span>{Math.round(width / 2)} px</span>
            <span>{Math.round((width * 3) / 4)} px</span>
            <span>{width} px</span>
          </div>
        </div>
      )}

      {/* Main Canvas Scroll Area (Top-aligned on mobile so bottom space remains open for sheets) */}
      <div className="relative flex-1 w-full h-full flex items-start justify-center pt-3 pb-2 px-2 sm:items-center sm:p-4 md:p-8 overflow-hidden">
        <KonvaStageDynamic onStageReady={onStageReady} />
      </div>

      {/* Bottom Floating Status Bar (Desktop & Tablet) */}
      <div className="hidden sm:flex absolute bottom-3 md:bottom-4 left-3 md:left-4 z-20 items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs text-slate-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-900 font-semibold truncate max-w-[120px]">{presetName}</span>
        <span className="text-slate-400">•</span>
        <span className="font-mono">
          {width} × {height}
        </span>
        <span className="text-slate-400">•</span>
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid Lines"
          className={`p-1 rounded transition-colors ${
            showGrid ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowGuides(!showGuides)}
          title="Toggle Smart Alignment Guides"
          className={`p-1 rounded transition-colors ${
            showGuides ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Canvas Lock & Zoom Controls (Top-right on Mobile, Bottom-right on Desktop) */}
      <div className="absolute top-2.5 right-2.5 md:top-auto md:bottom-4 md:right-4 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-2xl shadow-lg border border-slate-200">
        {/* Canvas Lock / Unlock Toggle Button */}
        <button
          onClick={toggleCanvasLock}
          title={isCanvasLocked ? "Canvas is Locked. Tap to unlock canvas to pan." : "Canvas is Unlocked (Pan enabled). Tap to lock."}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all ${
            isCanvasLocked
              ? 'bg-amber-50 text-amber-800 border border-amber-300/80 hover:bg-amber-100 shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300/80 hover:bg-emerald-100 shadow-xs'
          }`}
        >
          {isCanvasLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px]">Locked</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
              <span className="text-[11px]">Unlocked</span>
            </>
          )}
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

        {/* Zoom Out Button */}
        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        {/* Zoom Percentage */}
        <span className="text-[11px] md:text-xs font-bold text-slate-800 w-10 text-center select-none font-mono">
          {Math.round(zoom * 100)}%
        </span>

        {/* Zoom In Button */}
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

        {/* Fit to Screen Button */}
        <button
          onClick={resetZoomPan}
          title="Fit Canvas to Screen"
          className="flex items-center gap-1 px-2 py-1 text-[11px] md:text-xs font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <Maximize2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span>Fit</span>
        </button>
      </div>
    </div>
  );
}
