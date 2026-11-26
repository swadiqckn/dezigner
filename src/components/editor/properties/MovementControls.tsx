'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CanvasLayer } from '@/types/editor';
import AnchorSelector from './AnchorSelector';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  RotateCcw,
  Crosshair,
  X,
} from 'lucide-react';

interface MovementControlsProps {
  layer?: CanvasLayer;
  onChange?: (updates: Partial<CanvasLayer>) => void;
}

export default function MovementControls({ layer: propLayer, onChange: propOnChange }: MovementControlsProps) {
  const { layers, selectedLayerIds, alignSelected, moveLayersDelta, updateLayer, width, height } = useEditorStore();
  const [alignTarget, setAlignTarget] = useState<'canvas' | 'selection'>('selection');
  const [anchorPopupOpen, setAnchorPopupOpen] = useState(false);
  const anchorPopupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!anchorPopupOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (anchorPopupRef.current && !anchorPopupRef.current.contains(e.target as Node)) {
        setAnchorPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [anchorPopupOpen]);

  const layer = propLayer || layers.find((l) => l.id === selectedLayerIds[0]);
  if (!layer) return null;
  const onChange = propOnChange || ((updates: Partial<CanvasLayer>) => updateLayer(layer.id, updates, true));
  const isMulti = selectedLayerIds.length > 1;

  const nudge = (dx: number, dy: number) => {
    if (isMulti || layer.type === 'group') {
      moveLayersDelta(selectedLayerIds.length > 0 ? selectedLayerIds : [layer.id], dx, dy, true);
    } else {
      onChange({
        x: Math.round(layer.x + dx),
        y: Math.round(layer.y + dy),
      });
    }
  };

  const activeAlignMode = isMulti ? alignTarget : 'canvas';

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Move & Align
        </span>
        <button
          type="button"
          onClick={() => alignSelected('center', 'canvas')}
          title="Center on canvas"
          className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Align Target Switcher when multiple layers are selected */}
      {isMulti && (
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setAlignTarget('selection')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-colors ${
              alignTarget === 'selection'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Align to Selection
          </button>
          <button
            type="button"
            onClick={() => setAlignTarget('canvas')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-colors ${
              alignTarget === 'canvas'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Align to Canvas
          </button>
        </div>
      )}

      {/* Side-by-side 3x3 Move Pad (with Anchor icon in center) & Align Matrix + X/Y */}
      <div className="grid grid-cols-[auto_1fr] gap-2.5 items-center">
        {/* 3x3 Move D-Pad with Anchor Point Popup Trigger in Center */}
        <div className="relative" ref={anchorPopupRef}>
          <div className="grid grid-cols-3 gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => nudge(-10, -10)}
              title="Move Top-Left 10px"
              className="w-6 h-6 rounded-md bg-white hover:bg-purple-50 text-slate-500 hover:text-purple-700 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowUpLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => nudge(0, -10)}
              title="Move Up 10px"
              className="w-6 h-6 rounded-md bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => nudge(10, -10)}
              title="Move Top-Right 10px"
              className="w-6 h-6 rounded-md bg-white hover:bg-purple-50 text-slate-500 hover:text-purple-700 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowUpRight className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => nudge(-10, 0)}
              title="Move Left 10px"
              className="w-6 h-6 rounded-md bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {/* Center: Anchor Point Popup Trigger */}
            <button
              type="button"
              onClick={() => setAnchorPopupOpen((o) => !o)}
              title={`Anchor Point: ${(layer.anchor || 'center').replace('-', ' ')} (click to change)`}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                anchorPopupOpen
                  ? 'bg-purple-600 text-white ring-2 ring-purple-300 shadow-xs'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => nudge(10, 0)}
              title="Move Right 10px"
              className="w-6 h-6 rounded-md bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => nudge(-10, 10)}
              title="Move Bottom-Left 10px"
              className="w-6 h-6 rounded-md bg-white hover:bg-purple-50 text-slate-500 hover:text-purple-700 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowDownLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => nudge(0, 10)}
              title="Move Down 10px"
              className="w-6 h-6 rounded-md bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => nudge(10, 10)}
              title="Move Bottom-Right 10px"
              className="w-6 h-6 rounded-md bg-white hover:bg-purple-50 text-slate-500 hover:text-purple-700 border border-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowDownRight className="w-3 h-3" />
            </button>
          </div>

          {/* Anchor Point Popup */}
          {anchorPopupOpen && (
            <div className="absolute left-0 bottom-full mb-2 z-50 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Anchor Point</span>
                <button
                  type="button"
                  onClick={() => setAnchorPopupOpen(false)}
                  className="p-0.5 text-slate-400 hover:text-slate-700 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <AnchorSelector
                value={layer.anchor || 'center'}
                onChange={(anchor) => {
                  onChange({ anchor });
                }}
                compact
              />
            </div>
          )}
        </div>

        {/* Right: Align Grid (3x2) + X/Y Coordinates */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'top' as const, icon: AlignStartVertical, label: 'Align Top', rotate: true },
              { id: 'middle' as const, icon: AlignCenterVertical, label: 'Align Middle Vertically', rotate: true },
              { id: 'bottom' as const, icon: AlignEndVertical, label: 'Align Bottom', rotate: true },
              { id: 'left' as const, icon: AlignStartVertical, label: 'Align Left', rotate: false },
              { id: 'center' as const, icon: AlignCenterVertical, label: 'Align Center Horizontally', rotate: false },
              { id: 'right' as const, icon: AlignEndVertical, label: 'Align Right', rotate: false },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => alignSelected(btn.id, activeAlignMode)}
                  title={`${btn.label} (${activeAlignMode})`}
                  className="p-1.5 bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className={`w-3.5 h-3.5 ${btn.rotate ? 'rotate-90' : ''}`} />
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400">X</span>
              <input
                type="number"
                value={Math.round(layer.x)}
                onChange={(e) => {
                  const nx = Number(e.target.value) || 0;
                  if (layer.type === 'group') {
                    moveLayersDelta([layer.id], nx - layer.x, 0, true);
                  } else {
                    onChange({ x: nx });
                  }
                }}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400">Y</span>
              <input
                type="number"
                value={Math.round(layer.y)}
                onChange={(e) => {
                  const ny = Number(e.target.value) || 0;
                  if (layer.type === 'group') {
                    moveLayersDelta([layer.id], 0, ny - layer.y, true);
                  } else {
                    onChange({ y: ny });
                  }
                }}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
        <span>Canvas: {width}×{height}px</span>
        <span className="capitalize text-purple-600 font-semibold">
          Anchor: {(layer.anchor || 'center').replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}
