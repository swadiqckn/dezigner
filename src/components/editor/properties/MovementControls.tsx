'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CanvasLayer } from '@/types/editor';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  RotateCcw,
} from 'lucide-react';

interface MovementControlsProps {
  layer?: CanvasLayer;
  onChange?: (updates: Partial<CanvasLayer>) => void;
}

export default function MovementControls({ layer: propLayer, onChange: propOnChange }: MovementControlsProps) {
  const { layers, selectedLayerIds, alignSelected, moveLayersDelta, updateLayer, width, height } = useEditorStore();
  const [alignTarget, setAlignTarget] = useState<'canvas' | 'selection'>('selection');
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
    <div className="space-y-3">
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

      {/* Align Grid (6 buttons: Left, Center, Right, Top, Middle, Bottom) */}
      <div className="grid grid-cols-6 gap-1">
        {[
          { id: 'left' as const, icon: AlignLeft, label: 'Align Left' },
          { id: 'center' as const, icon: AlignCenterHorizontal, label: 'Align Center Horizontally' },
          { id: 'right' as const, icon: AlignRight, label: 'Align Right' },
          { id: 'top' as const, icon: AlignStartVertical, label: 'Align Top' },
          { id: 'middle' as const, icon: AlignCenterVertical, label: 'Align Middle Vertically' },
          { id: 'bottom' as const, icon: AlignEndVertical, label: 'Align Bottom' },
        ].map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => alignSelected(btn.id, activeAlignMode)}
              title={`${btn.label} (${activeAlignMode})`}
              className="p-2 bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg flex items-center justify-center transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      {/* X / Y Coordinates + Nudge Pad */}
      <div className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-2 gap-1.5">
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

        {/* Compact Nudge Buttons */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => nudge(-10, 0)}
            title="Nudge Left 10px"
            className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => nudge(0, -10)}
            title="Nudge Up 10px"
            className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-purple-700"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => nudge(0, 10)}
            title="Nudge Down 10px"
            className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-purple-700"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => nudge(10, 0)}
            title="Nudge Right 10px"
            className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-purple-700"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Quick Center */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
        <span>Canvas: {width}×{height}px</span>
      </div>
    </div>
  );
}
