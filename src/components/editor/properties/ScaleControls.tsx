'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Lock, Unlock, RotateCcw, Maximize2 } from 'lucide-react';

interface ScaleControlsProps {
  layerId: string;
}

export default function ScaleControls({ layerId }: ScaleControlsProps) {
  const { layers, updateLayer } = useEditorStore();
  const [lockRatio, setLockRatio] = useState(true);

  const layer = layers.find((l) => l.id === layerId);
  if (!layer) return null;

  const scaleX = layer.scaleX ?? 1;
  const scaleY = layer.scaleY ?? 1;

  const handleScaleXChange = (newX: number) => {
    const val = Math.max(0.1, Math.min(5, newX));
    if (lockRatio) {
      const ratio = scaleX !== 0 ? scaleY / scaleX : 1;
      const newY = Math.max(0.1, Math.min(5, Number((val * ratio).toFixed(2))));
      updateLayer(layer.id, { scaleX: val, scaleY: newY }, true);
    } else {
      updateLayer(layer.id, { scaleX: val }, true);
    }
  };

  const handleScaleYChange = (newY: number) => {
    const val = Math.max(0.1, Math.min(5, newY));
    if (lockRatio) {
      const ratio = scaleY !== 0 ? scaleX / scaleY : 1;
      const newX = Math.max(0.1, Math.min(5, Number((val * ratio).toFixed(2))));
      updateLayer(layer.id, { scaleX: newX, scaleY: val }, true);
    } else {
      updateLayer(layer.id, { scaleY: val }, true);
    }
  };

  const handleReset = () => {
    updateLayer(layer.id, { scaleX: 1, scaleY: 1 }, true);
  };

  return (
    <div className="space-y-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 select-none">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-purple-600" />
          <span>{lockRatio ? 'Scale' : 'Scale X & Y'}</span>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLockRatio(!lockRatio)}
            title={lockRatio ? 'Ratio Locked (uniform scale)' : 'Ratio Unlocked (free stretch)'}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
              lockRatio
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {lockRatio ? <Lock className="w-3 h-3 text-purple-600" /> : <Unlock className="w-3 h-3" />}
            <span>{lockRatio ? 'Locked' : 'Free'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset Scale to 100%"
            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {lockRatio ? (
        /* Single Uniform Scale Slider when Ratio Locked */
        <div>
          <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
            <span>Scale (Uniform)</span>
            <span className="font-mono font-semibold text-slate-800">{Math.round(scaleX * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            disabled={layer.locked}
            value={scaleX}
            onChange={(e) => handleScaleXChange(Number(e.target.value))}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      ) : (
        /* Separate X and Y Sliders ONLY when Ratio Unlocked */
        <>
          <div>
            <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
              <span>Scale X</span>
              <span className="font-mono font-semibold text-slate-800">{Math.round(scaleX * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.05}
              disabled={layer.locked}
              value={scaleX}
              onChange={(e) => handleScaleXChange(Number(e.target.value))}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
              <span>Scale Y</span>
              <span className="font-mono font-semibold text-slate-800">{Math.round(scaleY * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.05}
              disabled={layer.locked}
              value={scaleY}
              onChange={(e) => handleScaleYChange(Number(e.target.value))}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </>
      )}
    </div>
  );
}
