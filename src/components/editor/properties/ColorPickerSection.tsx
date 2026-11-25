'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { STANDARD_NEUTRALS, getUsedColors } from '@/utils/colorUtils';
import { Check, Pipette, Disc, Sliders, Grid } from 'lucide-react';

interface ColorPickerSectionProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  allowTransparent?: boolean;
}

// Convert HSV to Hex
function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`.toUpperCase();
}

export default function ColorPickerSection({
  label,
  value,
  onChange,
  allowTransparent = false,
}: ColorPickerSectionProps) {
  const { layers, background } = useEditorStore();
  const usedColors = getUsedColors(layers, background);

  const [pickerTab, setPickerTab] = useState<'swatches' | 'wheel' | 'panel'>('swatches');
  const [hue, setHue] = useState(260);
  const [sat, setSat] = useState(80);
  const [val, setVal] = useState(90);

  const wheelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentColor = (value || '#000000').toUpperCase();
  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  // Eyedropper API (Pick from Canvas)
  const handleEyeDropper = async () => {
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        onChange(result.sRGBHex.toUpperCase());
      }
    } catch {
      // User cancelled eyedropper
    }
  };

  // Draw Radial Color Wheel Circle
  const drawColorWheel = useCallback(() => {
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const radius = size / 2;
    const cx = radius;
    const cy = radius;

    ctx.clearRect(0, 0, size, size);

    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 1) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `hsl(${angle}, 0%, ${val / 2}%)`);
      grad.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }, [val]);

  // Draw SV Spectrum Panel
  const drawSVPanel = useCallback(() => {
    const canvas = panelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

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
    if (pickerTab === 'wheel') drawColorWheel();
    if (pickerTab === 'panel') drawSVPanel();
  }, [pickerTab, drawColorWheel, drawSVPanel]);

  const handleWheelClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    const radius = rect.width / 2;
    const dist = Math.min(Math.hypot(x, y), radius);

    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    const newSat = Math.round((dist / radius) * 100);
    setHue(Math.round(angle));
    setSat(newSat);
    onChange(hsvToHex(Math.round(angle), newSat, val));
  };

  const handlePanelClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = panelCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const newSat = Math.round((x / rect.width) * 100);
    const newVal = Math.round(100 - (y / rect.height) * 100);
    setSat(newSat);
    setVal(newVal);
    onChange(hsvToHex(hue, newSat, newVal));
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-1">
          {hasEyeDropper && (
            <button
              type="button"
              onClick={handleEyeDropper}
              title="Pick Color from Canvas (Eyedropper)"
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <Pipette className="w-3 h-3" />
              <span>Pick</span>
            </button>
          )}
          {allowTransparent && (
            <button
              type="button"
              onClick={() => onChange('transparent')}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
                value === 'transparent'
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              None
            </button>
          )}
        </div>
      </div>

      {/* Main Color Preview + Hex Input */}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shrink-0 shadow-xs">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#000000'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="flex-1 text-xs font-semibold text-slate-900 p-2 bg-white border border-slate-200 rounded-xl font-mono uppercase focus:border-purple-600 outline-none"
          placeholder="#000000"
        />
      </div>

      {/* Picker Mode Switcher: Swatches | Wheel Circle | Spectrum Panel */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setPickerTab('swatches')}
          className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
            pickerTab === 'swatches' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid className="w-3 h-3" />
          <span>Swatches</span>
        </button>
        <button
          type="button"
          onClick={() => setPickerTab('wheel')}
          className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
            pickerTab === 'wheel' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Disc className="w-3 h-3" />
          <span>Wheel</span>
        </button>
        <button
          type="button"
          onClick={() => setPickerTab('panel')}
          className={`py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
            pickerTab === 'panel' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>Panel</span>
        </button>
      </div>

      {/* TAB 1: SWATCHES (Neutrals & Used Colors) */}
      {pickerTab === 'swatches' && (
        <div className="space-y-2.5 pt-0.5">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Standard Neutrals
            </span>
            <div className="flex items-center gap-1.5">
              {STANDARD_NEUTRALS.map((n) => {
                const isSelected = currentColor === n.color;
                return (
                  <button
                    key={n.color}
                    type="button"
                    onClick={() => onChange(n.color)}
                    style={{ backgroundColor: n.color }}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shadow-xs hover:scale-110 ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-400 scale-105'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    title={`${n.label} (${n.color})`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          n.color === '#FFFFFF' || n.color === '#E2E8F0' ? 'text-slate-900' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {usedColors.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Used in Poster ({usedColors.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {usedColors.map((color) => {
                  const isSelected = currentColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onChange(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shadow-xs hover:scale-110 ${
                        isSelected
                          ? 'border-purple-600 ring-2 ring-purple-400 scale-105'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                      title={`Used color: ${color}`}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3 h-3 ${
                            color === '#FFFFFF' || color === '#F1F5F9' || color === '#E2E8F0'
                              ? 'text-slate-900'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COLOR WHEEL CIRCLE */}
      {pickerTab === 'wheel' && (
        <div className="flex flex-col items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
          <canvas
            ref={wheelCanvasRef}
            width={160}
            height={160}
            onClick={handleWheelClick}
            onTouchMove={handleWheelClick}
            className="rounded-full cursor-crosshair shadow-inner border border-slate-200 touch-none"
          />
          <div className="w-full space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>Brightness</span>
              <span className="font-mono">{val}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={val}
              onChange={(e) => {
                const newV = Number(e.target.value);
                setVal(newV);
                onChange(hsvToHex(hue, sat, newV));
              }}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 3: SPECTRUM PANEL */}
      {pickerTab === 'panel' && (
        <div className="space-y-2.5 p-2 bg-white rounded-xl border border-slate-200">
          <canvas
            ref={panelCanvasRef}
            width={220}
            height={120}
            onClick={handlePanelClick}
            onTouchMove={handlePanelClick}
            className="w-full h-28 rounded-lg cursor-crosshair border border-slate-200 touch-none"
          />
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>Hue Spectrum</span>
              <span className="font-mono">{hue}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={hue}
              onChange={(e) => {
                const newH = Number(e.target.value);
                setHue(newH);
                onChange(hsvToHex(newH, sat, val));
              }}
              style={{
                background:
                  'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
