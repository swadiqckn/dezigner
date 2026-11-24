'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Grid, 
  Sliders, 
  Eye, 
  Sparkles,
  Move
} from 'lucide-react';

// Dynamic import with SSR disabled for Konva canvas engine
const KonvaStageDynamic = dynamic(() => import('./KonvaStage'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium">Initializing High-Resolution Canvas Engine...</p>
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
    showGrid,
    setShowGrid,
    showRulers,
    setShowRulers,
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
    if (isSpacePressed || e.button === 1) {
      // Space + Left Click or Middle Click
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
      className={`relative flex-1 h-full bg-slate-100/90 overflow-hidden select-none flex flex-col ${
        isSpacePressed || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Top Ruler Bar (Optional) */}
      {showRulers && (
        <div className="h-6 w-full bg-slate-200 border-b border-slate-300 text-[10px] text-slate-500 flex items-center px-6 font-mono select-none">
          <div className="flex justify-between w-full">
            <span>0 px</span>
            <span>{Math.round(width / 4)} px</span>
            <span>{Math.round(width / 2)} px</span>
            <span>{Math.round((width * 3) / 4)} px</span>
            <span>{width} px</span>
          </div>
        </div>
      )}

      {/* Main Canvas Scroll Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-8 overflow-hidden">
        <KonvaStageDynamic onStageReady={onStageReady} />
      </div>

      {/* Bottom Floating Status Bar */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 text-xs text-slate-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-900 font-semibold">{presetName}</span>
        <span className="text-slate-400">•</span>
        <span>
          {width} × {height} px
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

      {/* Bottom Right Floating Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-md border border-slate-200">
        <button
          onClick={zoomOut}
          title="Zoom Out (Ctrl -)"
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-semibold text-slate-700 w-12 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={zoomIn}
          title="Zoom In (Ctrl +)"
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

        <button
          onClick={resetZoomPan}
          title="Fit Canvas to Screen"
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fit</span>
        </button>
      </div>
    </div>
  );
}
