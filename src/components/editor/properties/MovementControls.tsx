'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Crosshair, 
  Move,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter
} from 'lucide-react';

interface MovementControlsProps {
  compact?: boolean;
}

export default function MovementControls({ compact = false }: MovementControlsProps) {
  const { selectedLayerIds, layers, updateLayer, width, height } = useEditorStore();
  const [step, setStep] = useState<number>(10);

  if (selectedLayerIds.length === 0) return null;

  const primaryLayerId = selectedLayerIds[0];
  const layer = layers.find((l) => l.id === primaryLayerId);
  if (!layer) return null;

  const isLocked = !!layer.locked;

  const nudge = (dx: number, dy: number) => {
    if (isLocked) return;
    updateLayer(layer.id, {
      x: Math.round(layer.x + dx),
      y: Math.round(layer.y + dy),
    }, true);
  };

  const centerHorizontal = () => {
    if (isLocked) return;
    const w = layer.width || 100;
    updateLayer(layer.id, {
      x: Math.round((width - w) / 2),
    }, true);
  };

  const centerVertical = () => {
    if (isLocked) return;
    const h = layer.height || (layer as any).fontSize ? (layer as any).fontSize * 1.3 : 100;
    updateLayer(layer.id, {
      y: Math.round((height - h) / 2),
    }, true);
  };

  const centerBoth = () => {
    centerHorizontal();
    centerVertical();
  };

  return (
    <div className="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 select-none">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-purple-600" />
          <span>Move / Nudge Position</span>
        </label>
        
        {/* Step Selector Pills */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
          {[1, 10, 50].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                step === s
                  ? 'bg-purple-100 text-purple-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Directional D-Pad Cross & Coordinate Inputs */}
      <div className="flex items-center justify-between gap-4">
        {/* Directional Nudge Pad */}
        <div className="grid grid-cols-3 gap-1.5 w-32 shrink-0">
          <div />
          <button
            type="button"
            disabled={isLocked}
            onClick={() => nudge(0, -step)}
            className="h-9 w-9 bg-white hover:bg-purple-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs flex items-center justify-center text-slate-700 hover:text-purple-700 disabled:opacity-40 transition-all"
            title={`Move Up (${step}px)`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div />

          <button
            type="button"
            disabled={isLocked}
            onClick={() => nudge(-step, 0)}
            className="h-9 w-9 bg-white hover:bg-purple-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs flex items-center justify-center text-slate-700 hover:text-purple-700 disabled:opacity-40 transition-all"
            title={`Move Left (${step}px)`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={isLocked}
            onClick={centerBoth}
            className="h-9 w-9 bg-purple-50 hover:bg-purple-100 active:scale-95 border border-purple-200 rounded-xl shadow-xs flex items-center justify-center text-purple-700 disabled:opacity-40 transition-all"
            title="Center in Canvas"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={isLocked}
            onClick={() => nudge(step, 0)}
            className="h-9 w-9 bg-white hover:bg-purple-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs flex items-center justify-center text-slate-700 hover:text-purple-700 disabled:opacity-40 transition-all"
            title={`Move Right (${step}px)`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div />
          <button
            type="button"
            disabled={isLocked}
            onClick={() => nudge(0, step)}
            className="h-9 w-9 bg-white hover:bg-purple-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs flex items-center justify-center text-slate-700 hover:text-purple-700 disabled:opacity-40 transition-all"
            title={`Move Down (${step}px)`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <div />
        </div>

        {/* Numeric X & Y Coordinate Inputs */}
        <div className="flex-1 space-y-2">
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
              <span>Position X</span>
              <span className="font-mono">{Math.round(layer.x)}px</span>
            </div>
            <input
              type="number"
              disabled={isLocked}
              value={Math.round(layer.x)}
              onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) || 0 }, true)}
              className="w-full text-xs font-semibold text-slate-900 px-2 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-purple-600 disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
              <span>Position Y</span>
              <span className="font-mono">{Math.round(layer.y)}px</span>
            </div>
            <input
              type="number"
              disabled={isLocked}
              value={Math.round(layer.y)}
              onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) || 0 }, true)}
              className="w-full text-xs font-semibold text-slate-900 px-2 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-purple-600 disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      {/* Quick Center Alignment Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
        <button
          type="button"
          disabled={isLocked}
          onClick={centerHorizontal}
          className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <AlignHorizontalJustifyCenter className="w-3.5 h-3.5 text-purple-600" />
          <span>Center Horiz.</span>
        </button>

        <button
          type="button"
          disabled={isLocked}
          onClick={centerVertical}
          className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <AlignVerticalJustifyCenter className="w-3.5 h-3.5 text-purple-600" />
          <span>Center Vert.</span>
        </button>
      </div>
    </div>
  );
}
