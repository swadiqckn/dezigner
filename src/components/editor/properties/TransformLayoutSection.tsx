'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CanvasLayer, ImageLayer, ShapeLayer } from '@/types/editor';
import CircularRotationSlider from './CircularRotationSlider';
import CornerRadiusControls from './CornerRadiusControls';
import MovementControls from './MovementControls';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  FolderMinus,
  RotateCcw,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Link2,
  Unlink2,
} from 'lucide-react';

interface TransformLayoutSectionProps {
  layer: CanvasLayer;
  onChange: (updates: Partial<CanvasLayer>) => void;
}

export default function TransformLayoutSection({ layer, onChange }: TransformLayoutSectionProps) {
  const {
    toggleLock,
    toggleVisibility,
    duplicateLayer,
    deleteLayer,
    reorderLayer,
    ungroupLayer,
    renameLayer,
  } = useEditorStore();

  const [lockRatio, setLockRatio] = useState(true);

  const curWidth = Math.round(layer.width || 100);
  const curHeight = Math.round(layer.height || ((layer as any).fontSize ? (layer as any).fontSize * 1.3 : 100));
  const curScaleX = Number((layer.scaleX ?? 1).toFixed(2));
  const curScaleY = Number((layer.scaleY ?? 1).toFixed(2));

  const handleWidthChange = (newW: number) => {
    const w = Math.max(10, Math.round(newW));
    if (lockRatio && curWidth > 0) {
      const ratio = curHeight / curWidth;
      onChange({ width: w, height: Math.max(10, Math.round(w * ratio)) });
    } else {
      onChange({ width: w });
    }
  };

  const handleHeightChange = (newH: number) => {
    const h = Math.max(10, Math.round(newH));
    if (lockRatio && curHeight > 0) {
      const ratio = curWidth / curHeight;
      onChange({ height: h, width: Math.max(10, Math.round(h * ratio)) });
    } else {
      onChange({ height: h });
    }
  };

  const handleScaleChange = (axis: 'x' | 'y', val: number) => {
    const s = Math.max(0.1, Math.min(10, Number(val) || 1));
    if (lockRatio) {
      onChange({ scaleX: s, scaleY: s });
    } else if (axis === 'x') {
      onChange({ scaleX: s });
    } else {
      onChange({ scaleY: s });
    }
  };

  const showCornerRadius = layer.type === 'rect' || layer.type === 'image';

  return (
    <div className="space-y-4">
      {/* 1. Scale & Dimensions + Circular Rotation Slider Sideways (2 columns) */}
      <div className="grid grid-cols-[1.45fr_1fr] gap-2 items-stretch">
        {/* Left: Scale & Dimensions with Lock icon in center */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Scale & Size
            </span>
            <button
              type="button"
              onClick={() => onChange({ scaleX: 1, scaleY: 1 })}
              title="Reset scale to 100%"
              className="p-0.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="relative grid grid-cols-2 gap-1.5">
            <div className="bg-white border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">W (px)</span>
              <input
                type="number"
                min={10}
                value={curWidth}
                onChange={(e) => handleWidthChange(Number(e.target.value) || 10)}
                className="w-full text-[11px] font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">H (px)</span>
              <input
                type="number"
                min={10}
                value={curHeight}
                onChange={(e) => handleHeightChange(Number(e.target.value) || 10)}
                className="w-full text-[11px] font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">SX (%)</span>
              <input
                type="number"
                min={10}
                max={1000}
                value={Math.round(curScaleX * 100)}
                onChange={(e) => handleScaleChange('x', (Number(e.target.value) || 100) / 100)}
                className="w-full text-[11px] font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">SY (%)</span>
              <input
                type="number"
                min={10}
                max={1000}
                value={Math.round(curScaleY * 100)}
                onChange={(e) => handleScaleChange('y', (Number(e.target.value) || 100) / 100)}
                className="w-full text-[11px] font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>

            {/* Lock Ratio Icon centered in the 2x2 Scale & Dimensions grid */}
            <button
              type="button"
              onClick={() => setLockRatio((r) => !r)}
              title={lockRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border shadow-sm flex items-center justify-center transition-colors z-10 ${
                lockRatio
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {lockRatio ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Right: Circular Rotation Slider */}
        <CircularRotationSlider
          value={layer.rotation || 0}
          onChange={(deg) => onChange({ rotation: deg })}
          onReset={() => onChange({ rotation: 0 })}
        />
      </div>

      {/* 2. Corner Radius (4 independent or locked) */}
      {showCornerRadius && (
        <div className="pt-3 border-t border-slate-100">
          <CornerRadiusControls
            cornerRadius={(layer as ShapeLayer | ImageLayer).cornerRadius}
            cornerRadii={(layer as ShapeLayer | ImageLayer).cornerRadii}
            onChange={(updates) => onChange(updates as Partial<CanvasLayer>)}
          />
        </div>
      )}

      {/* 3. Move & Align (with hidden Anchor Point popup triggered from center icon) */}
      <div className="pt-3 border-t border-slate-100">
        <MovementControls layer={layer} onChange={onChange} />
      </div>

      {/* 4. Layer Properties */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
          Layer Properties
        </span>

        <input
          type="text"
          value={layer.name}
          onChange={(e) => renameLayer(layer.id, e.target.value)}
          placeholder="Layer name"
          className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white"
        />

        {/* Layer Order */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { action: 'front' as const, icon: ArrowUpToLine, label: 'Bring to Front' },
            { action: 'forward' as const, icon: ArrowUp, label: 'Bring Forward' },
            { action: 'backward' as const, icon: ArrowDown, label: 'Send Backward' },
            { action: 'back' as const, icon: ArrowDownToLine, label: 'Send to Back' },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.action}
                type="button"
                onClick={() => reorderLayer(layer.id, btn.action)}
                title={btn.label}
                className="p-2 bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Actions: Lock, Visibility, Duplicate, Ungroup, Delete */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => toggleLock(layer.id)}
            title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 transition-colors ${
              layer.locked
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{layer.locked ? 'Locked' : 'Lock'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleVisibility(layer.id)}
            title={layer.visible === false ? 'Show Layer' : 'Hide Layer'}
            className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 flex items-center justify-center gap-1 transition-colors"
          >
            {layer.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{layer.visible === false ? 'Hidden' : 'Visible'}</span>
          </button>

          <button
            type="button"
            onClick={() => duplicateLayer(layer.id)}
            title="Duplicate Layer"
            className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {layer.type === 'group' && (
            <button
              type="button"
              onClick={() => ungroupLayer(layer.id)}
              title="Ungroup Layers"
              className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <FolderMinus className="w-3.5 h-3.5" />
            </button>
          )}

          {layer.deletable !== false && (
            <button
              type="button"
              onClick={() => deleteLayer(layer.id)}
              title="Delete Layer"
              className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
