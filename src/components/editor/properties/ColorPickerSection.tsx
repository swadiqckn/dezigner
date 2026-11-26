'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { STANDARD_NEUTRALS, getUsedColors } from '@/utils/colorUtils';
import { Check, Pipette, RotateCcw } from 'lucide-react';

interface ColorPickerSectionProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  allowTransparent?: boolean;
  defaultValue?: string;
  onReset?: () => void;
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`.toUpperCase();
}

function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max * 100;
  const s = max === 0 ? 0 : (d / max) * 100;

  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }
  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

function isLightHex(hex: string): boolean {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export default function ColorPickerSection({
  label,
  value,
  onChange,
  allowTransparent = false,
  defaultValue,
  onReset,
}: ColorPickerSectionProps) {
  const { layers, background, recentColors, recordRecentColor } = useEditorStore();
  const usedInPoster = useMemo(() => getUsedColors(layers, background), [layers, background]);

  const currentColor = (value || '#000000').toUpperCase();
  const [hexInput, setHexInput] = useState(currentColor);
  const [hue, setHue] = useState(260);
  const [sat, setSat] = useState(80);
  const [val, setVal] = useState(90);

  const panelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingPanelRef = useRef(false);
  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  // Sync external `value` -> HEX input + HSV dot
  useEffect(() => {
    setHexInput(currentColor);
    if (currentColor !== 'TRANSPARENT') {
      const parsed = hexToHsv(currentColor);
      if (parsed) {
        // Preserve hue when saturation or value is 0 so the hue slider doesn't jump to 0
        if (parsed.s > 0 && parsed.v > 0) setHue(parsed.h);
        setSat(parsed.s);
        setVal(parsed.v);
      }
    }
  }, [currentColor]);

  // Build merged swatch row (max 20): 3 latest used, 6 standard neutrals, up to 11 older used
  const mergedSwatches = useMemo(() => {
    const orderedUsed: string[] = [];
    const seen = new Set<string>();

    recentColors.forEach((c) => {
      const up = c.toUpperCase();
      if (!seen.has(up)) {
        seen.add(up);
        orderedUsed.push(up);
      }
    });
    usedInPoster.forEach((c) => {
      const up = c.toUpperCase();
      if (!seen.has(up)) {
        seen.add(up);
        orderedUsed.push(up);
      }
    });

    const latestThree = orderedUsed.slice(0, 3);
    const standardSix = STANDARD_NEUTRALS.map((c) => c.color.toUpperCase())
      .filter((c) => !latestThree.includes(c))
      .slice(0, 6);
    const olderUsed = orderedUsed
      .slice(3)
      .filter((c) => !standardSix.includes(c))
      .slice(0, 11);

    return [...latestThree, ...standardSix, ...olderUsed].slice(0, 20);
  }, [recentColors, usedInPoster]);

  // Draw SV Spectrum Panel
  const drawPanel = useCallback(() => {
    const canvas = panelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, w, h);

    const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, w, h);

    const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, w, h);
  }, [hue]);

  useEffect(() => {
    drawPanel();
  }, [drawPanel]);

  const applyPanelPoint = (clientX: number, clientY: number) => {
    const canvas = panelCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const newS = Math.round((x / rect.width) * 100);
    const newV = Math.round((1 - y / rect.height) * 100);
    setSat(newS);
    setVal(newV);

    const hex = hsvToHex(hue, newS, newV);
    setHexInput(hex);
    onChange(hex);
  };

  const handleEyeDropper = async () => {
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        const hex = result.sRGBHex.toUpperCase();
        onChange(hex);
        recordRecentColor(hex);
      }
    } catch {
      // User cancelled eyedropper
    }
  };

  const handleHexChange = (raw: string) => {
    let valStr = raw.toUpperCase();
    if (!valStr.startsWith('#') && /^[0-9A-F]{1,6}$/.test(valStr)) {
      valStr = `#${valStr}`;
    }
    setHexInput(valStr);
    if (/^#[0-9A-F]{6}$/.test(valStr)) {
      const parsed = hexToHsv(valStr);
      if (parsed) {
        if (parsed.s > 0 && parsed.v > 0) setHue(parsed.h);
        setSat(parsed.s);
        setVal(parsed.v);
      }
      onChange(valStr);
      recordRecentColor(valStr);
    }
  };

  const handleSwatchSelect = (color: string) => {
    if (color === 'transparent') {
      onChange('transparent');
      return;
    }
    const up = color.toUpperCase();
    onChange(up);
    recordRecentColor(up);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else if (defaultValue) {
      onChange(defaultValue);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1">
          {(onReset || defaultValue) && (
            <button
              type="button"
              onClick={handleReset}
              title={`Reset ${label}`}
              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          {hasEyeDropper && (
            <button
              type="button"
              onClick={handleEyeDropper}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
              title="Pick color from screen"
            >
              <Pipette className="w-3 h-3" />
              Pick
            </button>
          )}
        </div>
      </div>

      {/* HEX Input Row (no extra preview square) */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#000000"
          className="w-full text-xs font-mono font-bold text-slate-800 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white uppercase"
        />
      </div>

      {/* Merged Single Swatches Row (no headings, max 20: 3 latest + 6 standard + 11 old) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {allowTransparent && (
          <button
            type="button"
            onClick={() => handleSwatchSelect('transparent')}
            className={`w-6 h-6 rounded-full border relative flex items-center justify-center transition-transform hover:scale-110 ${
              currentColor === 'TRANSPARENT'
                ? 'ring-2 ring-purple-600 ring-offset-1 border-purple-500'
                : 'border-slate-300'
            }`}
            style={{
              backgroundImage:
                'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
              backgroundSize: '8px 8px',
            }}
            title="Transparent"
          >
            {currentColor === 'TRANSPARENT' && <Check className="w-3 h-3 text-slate-900" />}
          </button>
        )}

        {mergedSwatches.map((c) => {
          const isSelected = currentColor === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => handleSwatchSelect(c)}
              className={`w-6 h-6 rounded-full border relative flex items-center justify-center transition-transform hover:scale-110 ${
                isSelected ? 'ring-2 ring-purple-600 ring-offset-1 border-purple-500' : 'border-slate-200'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            >
              {isSelected && (
                <Check className={`w-3 h-3 ${isLightHex(c) ? 'text-slate-900' : 'text-white'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Always-visible SV Spectrum Panel + Hue Slider */}
      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-2">
        <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-200">
          <canvas
            ref={panelCanvasRef}
            width={260}
            height={112}
            onPointerDown={(e) => {
              isDraggingPanelRef.current = true;
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              applyPanelPoint(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (isDraggingPanelRef.current) applyPanelPoint(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
              if (isDraggingPanelRef.current) {
                isDraggingPanelRef.current = false;
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                const hex = hsvToHex(hue, sat, val);
                recordRecentColor(hex);
              }
            }}
            className="w-full h-full cursor-crosshair touch-none block"
          />
          {/* Synced Selection Dot */}
          <div
            className="pointer-events-none absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(15,23,42,0.55)] -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${sat}%`,
              top: `${100 - val}%`,
              backgroundColor: currentColor === 'TRANSPARENT' ? 'transparent' : currentColor,
            }}
          />
        </div>

        {/* Hue Slider */}
        <div>
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => {
              const newHue = Number(e.target.value);
              setHue(newHue);
              const hex = hsvToHex(newHue, sat, val);
              setHexInput(hex);
              onChange(hex);
            }}
            onMouseUp={() => recordRecentColor(hsvToHex(hue, sat, val))}
            onTouchEnd={() => recordRecentColor(hsvToHex(hue, sat, val))}
            className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
            style={{
              background:
                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
