'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { GRADIENT_PRESETS, COLOR_PALETTES } from '@/constants/elements';
import { Sparkles, Palette } from 'lucide-react';

const SOLID_PRESETS = [
  '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#0F172A', '#020617',
  '#39216C', '#1E1B4B', '#4338CA', '#064E3B', '#042F2E', '#0B132B',
  '#4C0519', '#881337', '#78350F', '#451A03', '#18181B', '#27272A'
];

export default function BackgroundPanel() {
  const { background, setCanvasBackground } = useEditorStore();

  return (
    <div className="flex flex-col h-full space-y-5 overflow-y-auto pr-1">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Canvas Background
        </h3>
        <p className="text-[11px] text-slate-500">
          Customize poster backdrop with solids and modern multi-stop gradients.
        </p>
      </div>

      {/* Solid Color Picker */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-purple-600" />
          <span>Custom Solid Color</span>
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="color"
            value={background.color || '#FFFFFF'}
            onChange={(e) => setCanvasBackground({ type: 'solid', color: e.target.value })}
            className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 p-0.5"
          />
          <input
            type="text"
            value={background.color || '#FFFFFF'}
            onChange={(e) => setCanvasBackground({ type: 'solid', color: e.target.value })}
            className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white outline-none"
          />
        </div>

        <div className="grid grid-cols-6 gap-2">
          {SOLID_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setCanvasBackground({ type: 'solid', color })}
              style={{ backgroundColor: color }}
              className="h-8 rounded-lg border border-slate-300 shadow-xs hover:scale-110 transition-transform"
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Designer Gradients */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Curated Modern Gradients</span>
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
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
              className="h-20 rounded-xl border border-slate-200 shadow-xs hover:ring-2 hover:ring-purple-600 hover:scale-[1.02] transition-all flex flex-col justify-end p-2 relative overflow-hidden group"
              style={{ background: grad.value }}
            >
              <div className="bg-black/40 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] text-white font-medium w-fit">
                {grad.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
