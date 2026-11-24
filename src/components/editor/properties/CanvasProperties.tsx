'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CANVAS_PRESETS } from '@/constants/canvasPresets';
import { GRADIENT_PRESETS, COLOR_PALETTES } from '@/constants/elements';
import { Layout, Palette, Sparkles } from 'lucide-react';

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
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none cursor-pointer"
        >
          {CANVAS_PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} ({p.width} × {p.height})
            </option>
          ))}
          <option value="Custom">Custom Size...</option>
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
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
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
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Background Color / Gradient */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <label className="text-xs font-semibold text-slate-700 block">
          Canvas Background
        </label>

        {/* Solid Color Picker */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={background.color || '#FFFFFF'}
            onChange={(e) => setCanvasBackground({ type: 'solid', color: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
          />
          <input
            type="text"
            value={background.color || '#FFFFFF'}
            onChange={(e) => setCanvasBackground({ type: 'solid', color: e.target.value })}
            className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white outline-none"
          />
        </div>

        {/* Solid Color Presets */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-1.5">Classic Solids</span>
          <div className="flex flex-wrap gap-1.5">
            {['#FFFFFF', '#F8FAFC', '#F1F5F9', '#0F172A', '#09090B', '#39216C', '#064E3B', '#881337', '#78350F'].map(
              (c) => (
                <button
                  key={c}
                  onClick={() => setCanvasBackground({ type: 'solid', color: c })}
                  style={{ backgroundColor: c }}
                  className="w-6 h-6 rounded-md border border-slate-300 hover:scale-110 transition-transform shadow-xs"
                  title={c}
                />
              )
            )}
          </div>
        </div>

        {/* Designer Gradients */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-1.5">Designer Gradients</span>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((grad) => (
              <button
                key={grad.name}
                onClick={() =>
                  setCanvasBackground({
                    type: 'gradient',
                    color: grad.config.stops[0].color,
                    gradient: grad.config,
                  })
                }
                style={{ background: grad.value }}
                className="h-10 rounded-lg border border-slate-200 shadow-xs hover:ring-2 hover:ring-purple-500 transition-all"
                title={grad.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
