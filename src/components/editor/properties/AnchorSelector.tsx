'use client';

import React from 'react';
import { AnchorPoint } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { RotateCcw } from 'lucide-react';

interface AnchorSelectorProps {
  layerId?: string;
  value?: AnchorPoint;
  onChange?: (anchor: AnchorPoint) => void;
  compact?: boolean;
}

const ANCHOR_POINTS: { id: AnchorPoint; label: string }[] = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-center', label: 'Top Center' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'middle-left', label: 'Middle Left' },
  { id: 'center', label: 'Center' },
  { id: 'middle-right', label: 'Middle Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-right', label: 'Bottom Right' },
];

export default function AnchorSelector({ layerId, value, onChange, compact = false }: AnchorSelectorProps) {
  const { layers, updateLayer } = useEditorStore();
  const targetLayer = layerId ? layers.find((l) => l.id === layerId) : undefined;
  const activeValue: AnchorPoint = value ?? targetLayer?.anchor ?? 'center';
  const handleSelect = (anchor: AnchorPoint) => {
    if (onChange) onChange(anchor);
    else if (layerId) updateLayer(layerId, { anchor }, true);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between h-full">
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
          Anchor
        </span>
        <button
          type="button"
          onClick={() => handleSelect('center')}
          title="Reset anchor to center"
          className="p-0.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      <div className={`grid grid-cols-3 gap-1.5 p-1.5 bg-white border border-slate-200 rounded-xl ${compact ? '' : 'my-1'}`}>
        {ANCHOR_POINTS.map((pt) => {
          const isActive = activeValue === pt.id;
          return (
            <button
              key={pt.id}
              type="button"
              onClick={() => handleSelect(pt.id)}
              title={pt.label}
              className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-purple-600 ring-2 ring-purple-300 shadow-xs scale-110'
                  : 'bg-slate-100 hover:bg-purple-100'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-white' : 'bg-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded capitalize mt-1 truncate max-w-full">
        {activeValue.replace('-', ' ')}
      </span>
    </div>
  );
}
