'use client';

import React from 'react';
import { CanvasLayer, TextLayer, ShapeLayer, ImageLayer, IconLayer, BadgeLayer } from '@/types/editor';
import ColorPickerSection from './ColorPickerSection';
import { RotateCcw } from 'lucide-react';

interface PaintAppearanceSectionProps {
  layer: CanvasLayer;
  onChange: (updates: Partial<CanvasLayer>) => void;
}

export default function PaintAppearanceSection({ layer, onChange }: PaintAppearanceSectionProps) {
  const hasFill =
    layer.type === 'text' ||
    layer.type === 'rect' ||
    layer.type === 'circle' ||
    layer.type === 'star' ||
    layer.type === 'polygon' ||
    layer.type === 'badge' ||
    layer.type === 'icon';

  const fillValue =
    layer.type === 'text'
      ? (layer as TextLayer).color
      : layer.type === 'icon'
      ? (layer as IconLayer).stroke
      : (layer as ShapeLayer | BadgeLayer).fill || '#39216C';

  const handleFillChange = (color: string) => {
    if (layer.type === 'text') {
      onChange({ color } as Partial<TextLayer>);
    } else if (layer.type === 'icon') {
      onChange({ stroke: color } as Partial<IconLayer>);
    } else {
      onChange({ fill: color } as Partial<ShapeLayer>);
    }
  };

  const hasBorder = layer.type !== 'group' && layer.type !== 'icon';
  const strokeColor = (layer as ShapeLayer | TextLayer | ImageLayer).stroke || '#0F172A';
  const strokeWidth = (layer as ShapeLayer | TextLayer | ImageLayer).strokeWidth || 0;

  const hasShadow =
    layer.type === 'text' ||
    layer.type === 'image' ||
    layer.type === 'rect' ||
    layer.type === 'circle' ||
    layer.type === 'star' ||
    layer.type === 'polygon';

  const shadowColor = (layer as any).shadowColor || '#000000';
  const shadowBlur = (layer as any).shadowBlur || 0;
  const shadowOffsetX = (layer as any).shadowOffsetX || 0;
  const shadowOffsetY = (layer as any).shadowOffsetY || 0;
  const shadowOpacity = (layer as any).shadowOpacity ?? 0.35;

  const opacity = Math.round((layer.opacity ?? 1) * 100);

  return (
    <div className="space-y-4">
      {/* 1. Fill Color */}
      {hasFill && (
        <ColorPickerSection
          label={layer.type === 'text' ? 'Text Fill Color' : layer.type === 'icon' ? 'Icon Color' : 'Fill Color'}
          value={fillValue}
          onChange={handleFillChange}
          allowTransparent={layer.type !== 'text' && layer.type !== 'icon'}
          defaultValue={layer.type === 'text' ? '#0F172A' : '#39216C'}
        />
      )}

      {/* 2. Border & Border Color */}
      {hasBorder && (
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Border & Stroke
            </span>
            <button
              type="button"
              onClick={() => onChange({ strokeWidth: 0, stroke: '#0F172A' } as Partial<CanvasLayer>)}
              title="Reset border"
              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-500 w-12">Width</span>
            <input
              type="range"
              min={0}
              max={30}
              value={strokeWidth}
              onChange={(e) => onChange({ strokeWidth: Number(e.target.value) } as Partial<CanvasLayer>)}
              className="flex-1 accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 w-10 text-right">{strokeWidth}px</span>
          </div>

          {strokeWidth > 0 && (
            <ColorPickerSection
              label="Border Color"
              value={strokeColor}
              onChange={(color) => onChange({ stroke: color } as Partial<CanvasLayer>)}
              defaultValue="#0F172A"
            />
          )}
        </div>
      )}

      {/* 3. Drop Shadow */}
      {hasShadow && (
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Drop Shadow
            </span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  shadowBlur: 0,
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  shadowColor: '#000000',
                  shadowOpacity: 0.35,
                } as Partial<CanvasLayer>)
              }
              title="Reset shadow"
              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Blur</span>
              <input
                type="number"
                min={0}
                max={100}
                value={shadowBlur}
                onChange={(e) => onChange({ shadowBlur: Math.max(0, Number(e.target.value) || 0) } as Partial<CanvasLayer>)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Opacity (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(shadowOpacity * 100)}
                onChange={(e) =>
                  onChange({
                    shadowOpacity: Math.max(0, Math.min(100, Number(e.target.value) || 0)) / 100,
                  } as Partial<CanvasLayer>)
                }
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Offset X</span>
              <input
                type="number"
                min={-100}
                max={100}
                value={shadowOffsetX}
                onChange={(e) => onChange({ shadowOffsetX: Number(e.target.value) || 0 } as Partial<CanvasLayer>)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Offset Y</span>
              <input
                type="number"
                min={-100}
                max={100}
                value={shadowOffsetY}
                onChange={(e) => onChange({ shadowOffsetY: Number(e.target.value) || 0 } as Partial<CanvasLayer>)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          <ColorPickerSection
            label="Shadow Color"
            value={shadowColor}
            onChange={(color) => onChange({ shadowColor: color } as Partial<CanvasLayer>)}
            defaultValue="#000000"
          />
        </div>
      )}

      {/* 4. Opacity */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Opacity
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">{opacity}%</span>
            <button
              type="button"
              onClick={() => onChange({ opacity: 1 })}
              title="Reset opacity to 100%"
              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
          className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
}
