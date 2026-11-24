'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CANVAS_PRESETS } from '@/constants/canvasPresets';
import ColorPickerSection from './ColorPickerSection';
import { Layout } from 'lucide-react';

export default function CanvasProperties() {
  const {
    width,
    height,
    presetName,
    background,
    setCanvasSize,
    setCanvasBackground,
    title,
    setTitle,
  } = useEditorStore();

  return (
    <div className="space-y-5">
      {/* Canvas Preset Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          Canvas Dimensions
        </label>
        <select
          value={presetName}
          onChange={(e) => {
            const found = CANVAS_PRESETS.find((p) => p.name === e.target.value);
            if (found) {
              setCanvasSize(found.width, found.height, found.name);
            }
          }}
          className="w-full text-xs font-semibold text-slate-900 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none cursor-pointer"
        >
          {CANVAS_PRESETS.map((p) => (
            <option key={p.name} value={p.name} className="text-slate-900 bg-white">
              {p.name} ({p.width} × {p.height})
            </option>
          ))}
          <option value="Custom" className="text-slate-900 bg-white">Custom Size...</option>
        </select>
      </div>

      {/* Width & Height Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-slate-500 block mb-1">
            Width (px)
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) => setCanvasSize(Number(e.target.value) || 1080, height, "Custom")}
            className="w-full text-xs font-semibold text-slate-900 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-500 block mb-1">
            Height (px)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setCanvasSize(width, Number(e.target.value) || 1350, "Custom")}
            className="w-full text-xs font-semibold text-slate-900 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Background Color & Used Colors */}
      <div className="pt-3 border-t border-slate-200">
        <ColorPickerSection
          label="Background Color"
          value={background.color || '#FFFFFF'}
          onChange={(color) => setCanvasBackground({ type: 'solid', color })}
        />
      </div>
    </div>
  );
}
