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
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  X,
  Check,
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
  const [isZoomCollapsed, setIsZoomCollapsed] = useState(false);
  const [savedOverrideIdx, setSavedOverrideIdx] = useState<number | null>(null);

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
    selectedLayerIds,
    isMobileTextTemplatesOpen,
    bulkRows,
    bulkActiveIndex,
    bulkOverrides,
    goToBulkIndex,
    saveBulkOverride,
    clearBulkOverride,
    exitBulkPreview,
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
          const img = new window.Image();
          img.onload = () => {
            const natW = img.naturalWidth || 450;
            const natH = img.naturalHeight || 350;
            const maxDim = Math.max(250, Math.min(width, height) * 0.45);
            const scale = Math.min(maxDim / natW, maxDim / natH, 1);
            const targetW = Math.max(40, Math.round(natW * scale));
            const targetH = Math.max(40, Math.round(natH * scale));
            addLayer({
              type: 'image',
              name: file.name.replace(/\.[^/.]+$/, ''),
              src,
              naturalWidth: natW,
              naturalHeight: natH,
              x: Math.round((width - targetW) / 2),
              y: Math.round((height - targetH) / 2),
              width: targetW,
              height: targetH,
              cornerRadius: 0,
            });
          };
          img.src = src;
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

      {/* Bottom-Center Bulk Preview & Override Navigator (when CSV / bulk data is loaded) */}
      {bulkRows.length > 0 && bulkActiveIndex !== null && (
        <div
          className={`absolute ${
            selectedLayerIds.length > 0 || isMobileTextTemplatesOpen
              ? 'bottom-16 md:bottom-4'
              : 'bottom-3 md:bottom-4'
          } left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-2xl shadow-lg border border-indigo-200 select-none`}
        >
          <button
            onClick={() => goToBulkIndex(bulkActiveIndex - 1)}
            disabled={bulkActiveIndex <= 0}
            title="Previous Entry"
            className="p-1.5 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-30 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-1.5 flex items-center gap-1.5">
            <span className="text-[11px] font-bold font-mono text-slate-800">
              {bulkActiveIndex + 1} / {bulkRows.length}
            </span>
            {bulkOverrides[bulkActiveIndex] && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Edited
              </span>
            )}
          </div>

          <button
            onClick={() => goToBulkIndex(bulkActiveIndex + 1)}
            disabled={bulkActiveIndex >= bulkRows.length - 1}
            title="Next Entry"
            className="p-1.5 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-30 rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

          <button
            onClick={() => {
              saveBulkOverride(bulkActiveIndex);
              setSavedOverrideIdx(bulkActiveIndex);
              setTimeout(() => setSavedOverrideIdx(null), 1800);
            }}
            title="Save corrections for this entry only in cache (does not change original template)"
            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${
              savedOverrideIdx === bulkActiveIndex
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            {savedOverrideIdx === bulkActiveIndex ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>

          {bulkOverrides[bulkActiveIndex] && (
            <button
              onClick={() => clearBulkOverride(bulkActiveIndex)}
              title="Reset this entry back to original template"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={exitBulkPreview}
            title="Exit Bulk Preview & return to original template"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Canvas Lock & Zoom Controls (Positioned at bottom with Collapsible Arrow Toggle) */}
      <div 
        className={`absolute ${
          selectedLayerIds.length > 0 || isMobileTextTemplatesOpen
            ? 'bottom-16 md:bottom-4'
            : 'bottom-3 md:bottom-4'
        } right-2 md:right-4 z-30 transition-all duration-200`}
      >
        {isZoomCollapsed ? (
          /* Collapsed Mini-Pill (Up Arrow Toggle) */
          <button
            onClick={() => setIsZoomCollapsed(false)}
            title="Expand Zoom & Canvas Controls"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 text-xs font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50/50 transition-all active:scale-95"
          >
            <ChevronUp className="w-3.5 h-3.5 text-purple-600 animate-bounce" />
            {isCanvasLocked ? (
              <Lock className="w-3 h-3 text-amber-600" />
            ) : (
              <Unlock className="w-3 h-3 text-emerald-600" />
            )}
            <span className="font-mono text-[11px] font-bold text-slate-800">
              {Math.round(zoom * 100)}%
            </span>
          </button>
        ) : (
          /* Expanded Full Controls (with Down Arrow Collapse Toggle) */
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-2xl shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
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

            <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

            {/* Collapse Arrow Toggle Button (Down Arrow) */}
            <button
              onClick={() => setIsZoomCollapsed(true)}
              title="Collapse Toolbar"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
