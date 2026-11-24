'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import ColorPickerSection from '../properties/ColorPickerSection';
import { Palette, Sparkles, ArrowRightLeft, Compass } from 'lucide-react';

export default function BackgroundPanel() {
  const { background, setCanvasBackground } = useEditorStore();

  // Mode: 'solid' or 'gradient'
  const isCurrentlyGradient = background.type === 'gradient';
  const [mode, setMode] = useState<'solid' | 'gradient'>(isCurrentlyGradient ? 'gradient' : 'solid');

  // Gradient Controller State
  const initialAngle = background.gradient?.angle ?? 135;
  const initialColor1 = background.gradient?.stops?.[0]?.color ?? '#7C3AED';
  const initialColor2 = background.gradient?.stops?.[1]?.color ?? '#3B82F6';

  const [angle, setAngle] = useState<number>(initialAngle);
  const [color1, setColor1] = useState<string>(initialColor1);
  const [color2, setColor2] = useState<string>(initialColor2);

  const applyGradient = (newAngle: number, c1: string, c2: string) => {
    setAngle(newAngle);
    setColor1(c1);
    setColor2(c2);
    setCanvasBackground({
      type: 'gradient',
      color: c1,
      gradient: {
        type: 'linear',
        angle: newAngle,
        stops: [
          { offset: 0, color: c1 },
          { offset: 1, color: c2 },
        ],
      },
    });
  };

  const swapColors = () => {
    applyGradient(angle, color2, color1);
  };

  const handleAngleChange = (newAngle: number) => {
    applyGradient(newAngle, color1, color2);
  };

  const handleColor1Change = (c: string) => {
    applyGradient(angle, c, color2);
  };

  const handleColor2Change = (c: string) => {
    applyGradient(angle, color1, c);
  };

  const switchToSolid = () => {
    setMode('solid');
    setCanvasBackground({
      type: 'solid',
      color: background.color || '#FFFFFF',
    });
  };

  const switchToGradient = () => {
    setMode('gradient');
    applyGradient(angle, color1, color2);
  };

  const quickAngles = [
    { label: '0° →', value: 90 },
    { label: '90° ↓', value: 180 },
    { label: '135° ↘', value: 135 },
    { label: '45° ↗', value: 45 },
  ];

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-1">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Canvas Background
        </h3>
        <p className="text-[11px] text-slate-500">
          Set custom solid color or design custom multi-angle gradients.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={switchToSolid}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'solid'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Solid Color</span>
        </button>
        <button
          type="button"
          onClick={switchToGradient}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'gradient'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Custom Gradient</span>
        </button>
      </div>

      {/* SOLID COLOR MODE */}
      {mode === 'solid' && (
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
          <ColorPickerSection
            label="Background Color"
            value={background.color || '#FFFFFF'}
            onChange={(color) => setCanvasBackground({ type: 'solid', color })}
          />
        </div>
      )}

      {/* GRADIENT CONTROLLER MODE */}
      {mode === 'gradient' && (
        <div className="space-y-4">
          {/* Live Gradient Preview Bar */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Live Gradient Preview
            </span>
            <div
              className="w-full h-14 rounded-xl border border-slate-300/80 shadow-inner transition-all flex items-center justify-center"
              style={{
                background: `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`,
              }}
            >
              <span className="bg-black/40 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-md shadow-xs">
                {angle}° Linear Gradient
              </span>
            </div>
          </div>

          {/* Angle Controller */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Gradient Angle</span>
              </label>
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                <span className="text-xs font-bold text-slate-900 font-mono">{angle}°</span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={angle}
              onChange={(e) => handleAngleChange(Number(e.target.value))}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Quick Angle Direction Buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {quickAngles.map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => handleAngleChange(qa.value)}
                  className={`py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    angle === qa.value
                      ? 'bg-purple-100 text-purple-700 border-purple-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Stops Controls */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Color Stops
              </span>
              <button
                type="button"
                onClick={swapColors}
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-200 transition-colors"
                title="Swap Start and End Colors"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Swap Colors</span>
              </button>
            </div>

            {/* Start Color Stop */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <ColorPickerSection
                label="Stop 1 (Start Color)"
                value={color1}
                onChange={handleColor1Change}
              />
            </div>

            {/* End Color Stop */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <ColorPickerSection
                label="Stop 2 (End Color)"
                value={color2}
                onChange={handleColor2Change}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
