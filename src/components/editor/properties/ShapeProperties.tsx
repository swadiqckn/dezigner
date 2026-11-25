'use client';

import React, { useState } from 'react';
import { ShapeLayer } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import ColorPickerSection from './ColorPickerSection';
import AnchorSelector from './AnchorSelector';
import ScaleControls from './ScaleControls';
import { RotateCw, Lock, Unlock } from 'lucide-react';

interface ShapePropertiesProps {
  layer: ShapeLayer;
}

export default function ShapeProperties({ layer }: ShapePropertiesProps) {
  const { updateLayer } = useEditorStore();
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  const aspectRatio = layer.width && layer.height ? layer.width / layer.height : 1;

  const handleUpdate = (updates: Partial<ShapeLayer>) => {
    updateLayer(layer.id, updates, true);
  };

  const handleWidthChange = (newWidth: number) => {
    const w = Math.max(10, newWidth);
    if (lockAspectRatio && aspectRatio > 0) {
      handleUpdate({ width: w, height: Math.round(w / aspectRatio) });
    } else {
      handleUpdate({ width: w });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const h = Math.max(10, newHeight);
    if (lockAspectRatio && aspectRatio > 0) {
      handleUpdate({ width: Math.round(h * aspectRatio), height: h });
    } else {
      handleUpdate({ height: h });
    }
  };

  const isRect = layer.type === 'rect';

  return (
    <div className="space-y-4">
      {/* Fill Color Picker & Used Colors */}
      <ColorPickerSection
        label="Fill Color"
        value={layer.fill}
        onChange={(fill) => handleUpdate({ fill })}
        allowTransparent={true}
      />

      {/* Dimensions with Aspect Ratio Lock & Size Slider */}
      <div className="space-y-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Dimensions (px)</label>
          <button
            type="button"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            title={lockAspectRatio ? 'Aspect Ratio Locked (default)' : 'Aspect Ratio Free'}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
              lockAspectRatio
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {lockAspectRatio ? <Lock className="w-3 h-3 text-purple-600" /> : <Unlock className="w-3 h-3 text-slate-500" />}
            <span>{lockAspectRatio ? 'Ratio Locked' : 'Ratio Free'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Width</span>
            <input
              type="number"
              value={layer.width}
              disabled={layer.locked}
              onChange={(e) => handleWidthChange(Number(e.target.value) || 10)}
              className="w-full text-xs font-semibold text-slate-900 p-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-purple-600"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Height</span>
            <input
              type="number"
              value={layer.height}
              disabled={layer.locked}
              onChange={(e) => handleHeightChange(Number(e.target.value) || 10)}
              className="w-full text-xs font-semibold text-slate-900 p-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-purple-600"
            />
          </div>
        </div>

        {/* Size Slider Control */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
            <span>Size Scale</span>
            <span className="font-mono">{layer.width}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={1200}
            step={5}
            value={layer.width}
            disabled={layer.locked}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Rotation with Slider Control */}
      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Rotation</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={-180}
              max={180}
              value={layer.rotation || 0}
              disabled={layer.locked}
              onChange={(e) => handleUpdate({ rotation: Number(e.target.value) || 0 })}
              className="w-16 text-xs font-semibold text-slate-900 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right outline-none focus:border-purple-600"
            />
            <span className="text-xs text-slate-400">°</span>
          </div>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={layer.rotation || 0}
          disabled={layer.locked}
          onChange={(e) => handleUpdate({ rotation: Number(e.target.value) || 0 })}
          className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
      </div>

      {/* Scale X & Y + Ratio Lock */}
      <ScaleControls layerId={layer.id} />

      {/* Anchor Point 9-Point Matrix */}
      <AnchorSelector layerId={layer.id} />

      {/* Stroke / Border */}
      <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <ColorPickerSection
          label="Border / Stroke Color"
          value={layer.stroke || '#000000'}
          onChange={(stroke) => handleUpdate({ stroke })}
          allowTransparent={true}
        />

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
