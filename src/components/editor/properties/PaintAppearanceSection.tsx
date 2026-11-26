'use client';

import React from 'react';
import { CanvasLayer, TextLayer, ShapeLayer, ImageLayer, IconLayer, BadgeLayer } from '@/types/editor';
import ColorPickerSection from './ColorPickerSection';
import { RotateCcw } from 'lucide-react';

interface PaintAppearanceSectionProps {
  layer: CanvasLayer;
  onChange: (updates: Partial<CanvasLayer>) => void;
}

const BLEND_MODES: { label: string; value: GlobalCompositeOperation }[] = [
  { label: 'Normal', value: 'source-over' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
  { label: 'Hard Light', value: 'hard-light' },
  { label: 'Soft Light', value: 'soft-light' },
  { label: 'Difference', value: 'difference' },
  { label: 'Exclusion', value: 'exclusion' },
  { label: 'Hue', value: 'hue' },
  { label: 'Saturation', value: 'saturation' },
  { label: 'Color', value: 'color' },
  { label: 'Luminosity', value: 'luminosity' },
];

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center ${
        checked ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
      }`}
    >
      <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
    </button>
  );
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
  const isBorderEnabled = strokeWidth > 0;

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
  const isShadowEnabled =
    Boolean(shadowColor && shadowColor !== 'transparent') &&
    (shadowBlur > 0 || shadowOffsetX !== 0 || shadowOffsetY !== 0);

  const opacity = Math.round((layer.opacity ?? 1) * 100);
  const blendMode = layer.blendMode || 'source-over';

  return (
    <div className="space-y-4">
      {/* 1. Opacity & Blending Mode (Top) */}
      <div className="space-y-3 pb-3 border-b border-slate-100">
        <div className="space-y-1.5">
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

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider shrink-0">
            Blend Mode
          </span>
          <div className="flex items-center gap-1 flex-1 justify-end">
            <select
              value={blendMode}
              onChange={(e) => onChange({ blendMode: e.target.value as GlobalCompositeOperation })}
              className="w-full max-w-[140px] px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
            >
              {BLEND_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange({ blendMode: 'source-over' })}
              title="Reset blend mode to Normal"
              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Fill Color */}
      {hasFill && (
        <ColorPickerSection
          label={layer.type === 'text' ? 'Text Fill Color' : layer.type === 'icon' ? 'Icon Color' : 'Fill Color'}
          value={fillValue}
          onChange={handleFillChange}
          allowTransparent={layer.type !== 'text' && layer.type !== 'icon'}
          defaultValue={layer.type === 'text' ? '#0F172A' : '#39216C'}
        />
      )}

      {/* 3. Border & Stroke (Master Toggle) */}
      {hasBorder && (
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Border & Stroke
            </span>
            <div className="flex items-center gap-1.5">
              {isBorderEnabled && (
                <button
                  type="button"
                  onClick={() => onChange({ strokeWidth: 2, stroke: '#0F172A' } as Partial<CanvasLayer>)}
                  title="Reset border"
                  className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <ToggleSwitch
                label="Toggle Border"
                checked={isBorderEnabled}
                onChange={(enabled) => {
                  if (enabled) {
                    onChange({
                      strokeWidth: strokeWidth > 0 ? strokeWidth : 3,
                      stroke: strokeColor || '#0F172A',
                    } as Partial<CanvasLayer>);
                  } else {
                    onChange({ strokeWidth: 0 } as Partial<CanvasLayer>);
                  }
                }}
              />
            </div>
          </div>

          {isBorderEnabled && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-500 w-12">Width</span>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={strokeWidth}
                  onChange={(e) => onChange({ strokeWidth: Number(e.target.value) } as Partial<CanvasLayer>)}
                  className="flex-1 accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 w-10 text-right">{strokeWidth}px</span>
              </div>

              <ColorPickerSection
                label="Border Color"
                value={strokeColor}
                onChange={(color) => onChange({ stroke: color } as Partial<CanvasLayer>)}
                defaultValue="#0F172A"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. Drop Shadow (Master Toggle) */}
      {hasShadow && (
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Drop Shadow
            </span>
            <div className="flex items-center gap-1.5">
              {isShadowEnabled && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      shadowBlur: 12,
                      shadowOffsetX: 4,
                      shadowOffsetY: 6,
                      shadowColor: '#000000',
                      shadowOpacity: 0.35,
                    } as Partial<CanvasLayer>)
                  }
                  title="Reset shadow"
                  className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <ToggleSwitch
                label="Toggle Drop Shadow"
                checked={isShadowEnabled}
                onChange={(enabled) => {
                  if (enabled) {
                    onChange({
                      shadowColor: shadowColor && shadowColor !== 'transparent' ? shadowColor : '#000000',
                      shadowBlur: shadowBlur > 0 ? shadowBlur : 12,
                      shadowOffsetX: shadowOffsetX || 4,
                      shadowOffsetY: shadowOffsetY || 6,
                      shadowOpacity: shadowOpacity || 0.35,
                    } as Partial<CanvasLayer>);
                  } else {
                    onChange({
                      shadowBlur: 0,
                      shadowOffsetX: 0,
                      shadowOffsetY: 0,
                      shadowColor: 'transparent',
                    } as Partial<CanvasLayer>);
                  }
                }}
              />
            </div>
          </div>

          {isShadowEnabled && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Blur</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={shadowBlur}
                    onChange={(e) =>
                      onChange({ shadowBlur: Math.max(0, Number(e.target.value) || 0) } as Partial<CanvasLayer>)
                    }
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
                    onChange={(e) =>
                      onChange({ shadowOffsetX: Number(e.target.value) || 0 } as Partial<CanvasLayer>)
                    }
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
                    onChange={(e) =>
                      onChange({ shadowOffsetY: Number(e.target.value) || 0 } as Partial<CanvasLayer>)
                    }
                    className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
                  />
                </div>
              </div>

              <ColorPickerSection
                label="Shadow Color"
                value={shadowColor === 'transparent' ? '#000000' : shadowColor}
                onChange={(color) => onChange({ shadowColor: color } as Partial<CanvasLayer>)}
                defaultValue="#000000"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
