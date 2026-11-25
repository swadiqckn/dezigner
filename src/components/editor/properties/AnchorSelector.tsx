'use client';

import React from 'react';
import { AnchorPoint } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { ANCHOR_POINTS, recalculatePositionForNewAnchor } from '@/utils/transformUtils';
import { Crosshair } from 'lucide-react';

interface AnchorSelectorProps {
  layerId: string;
}

export default function AnchorSelector({ layerId }: AnchorSelectorProps) {
  const { layers, updateLayer } = useEditorStore();
  const layer = layers.find((l) => l.id === layerId);
  if (!layer) return null;

  const currentAnchor: AnchorPoint = layer.anchor || 'top-left';
  const itemHeight = layer.height || ((layer as any).fontSize ? (layer as any).fontSize * 1.2 : 50);

  const handleSelectAnchor = (newAnchor: AnchorPoint) => {
    if (layer.locked) return;
    const newPos = recalculatePositionForNewAnchor(
      currentAnchor,
      newAnchor,
      layer.x,
      layer.y,
      layer.width,
      itemHeight,
      layer.rotation || 0
    );
    updateLayer(layer.id, {
      anchor: newAnchor,
      x: newPos.x,
      y: newPos.y,
    }, true);
  };

  return (
    <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 select-none">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-purple-600" />
          <span>Anchor Point</span>
        </label>
        <span className="text-[10px] font-mono text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded capitalize">
          {currentAnchor.replace('-', ' ')}
        </span>
      </div>

      {/* 3x3 Visual Anchor Matrix */}
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-white border border-slate-200 rounded-xl shadow-xs">
          {ANCHOR_POINTS.map((pt) => {
            const isSelected = currentAnchor === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                disabled={layer.locked}
                onClick={() => handleSelectAnchor(pt.id)}
                title={pt.label}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs scale-110'
                    : 'bg-slate-100 hover:bg-purple-100 text-slate-400 hover:text-purple-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-current'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed flex-1">
          Select 4 corners, 4 side midpoints, or center as the pivot origin for rotation and scaling.
        </p>
      </div>
    </div>
  );
}
