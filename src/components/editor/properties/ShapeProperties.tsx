'use client';

import React from 'react';
import { ShapeLayer } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { COLOR_PALETTES } from '@/constants/elements';
import { RotateCw } from 'lucide-react';

interface ShapePropertiesProps {
  layer: ShapeLayer;
}

export default function ShapeProperties({ layer }: ShapePropertiesProps) {
  const { updateLayer } = useEditorStore();

  const handleUpdate = (updates: Partial<ShapeLayer>) => {
    updateLayer(layer.id, updates, true);
  };

  const isRect = layer.type === 'rect';

  return (
    <div className="space-y-4">
      {/* Fill Color */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700">Fill Color</label>
          <button
            onClick={() => handleUpdate({ fill: layer.fill === 'transparent' ? '#7C3AED' : 'transparent' })}
            className="text-[11px] text-purple-600 hover:text-purple-700 font-medium"
          >
            {layer.fill === 'transparent' ? 'Add Fill' : 'Make Transparent'}
          </button>
        </div>

        {layer.fill !== 'transparent' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={layer.fill.startsWith('#') ? layer.fill : '#7C3AED'}
                onChange={(e) => handleUpdate({ fill: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
              />
              <input
                type="text"
                value={layer.fill}
                onChange={(e) => handleUpdate({ fill: e.target.value })}
                className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {COLOR_PALETTES[0].colors.concat(COLOR_PALETTES[1].colors.slice(0, 3)).map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => handleUpdate({ fill: c })}
                  style={{ backgroundColor: c }}
                  className="w-6 h-6 rounded-md border border-slate-300 hover:scale-110 transition-transform shadow-xs"
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dimensions & Rotation */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Width (px)
          </label>
          <input
            type="number"
            value={layer.width}
            disabled={layer.locked}
            onChange={(e) => handleUpdate({ width: Math.max(10, Number(e.target.value) || 10) })}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Height (px)
          </label>
          <input
            type="number"
            value={layer.height}
            disabled={layer.locked}
            onChange={(e) => handleUpdate({ height: Math.max(10, Number(e.target.value) || 10) })}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Rotation (°)
        </label>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
          <RotateCw className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="number"
            min={-360}
            max={360}
            value={layer.rotation || 0}
            onChange={(e) => handleUpdate({ rotation: Number(e.target.value) || 0 })}
            className="w-full text-xs bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Stroke / Border */}
      <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <label className="text-xs font-semibold text-slate-700 block">
          Border / Stroke
        </label>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={layer.stroke || '#000000'}
            onChange={(e) => handleUpdate({ stroke: e.target.value })}
            className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0.5"
          />
          <input
            type="text"
            value={layer.stroke || 'none'}
            onChange={(e) => handleUpdate({ stroke: e.target.value })}
            className="flex-1 text-xs p-1.5 bg-white border border-slate-200 rounded-lg font-mono uppercase"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Stroke Width</span>
            <span className="font-mono">{layer.strokeWidth || 0}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            value={layer.strokeWidth || 0}
            onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Corner Radius (for rect) & Opacity */}
      <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        {isRect && (
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Corner Radius</span>
              <span className="font-mono">{layer.cornerRadius || 0}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              value={layer.cornerRadius || 0}
              onChange={(e) => handleUpdate({ cornerRadius: Number(e.target.value) })}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Opacity</span>
            <span className="font-mono">{Math.round((layer.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={layer.opacity ?? 1}
            onChange={(e) => handleUpdate({ opacity: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
