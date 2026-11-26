'use client';

import React, { useRef } from 'react';
import { RotateCcw } from 'lucide-react';

interface CircularRotationSliderProps {
  value: number;
  onChange: (deg: number) => void;
  onReset?: () => void;
}

export default function CircularRotationSlider({
  value,
  onChange,
  onReset,
}: CircularRotationSliderProps) {
  const dialRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const normalized = ((Math.round(value || 0) % 360) + 360) % 360;

  const updateFromPointer = (clientX: number, clientY: number) => {
    const svg = dialRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    let deg = Math.round((rad * 180) / Math.PI + 90);
    deg = ((deg % 360) + 360) % 360;
    onChange(deg);
  };

  // Indicator dot coordinates on radius 22 around center (32, 32)
  const angleRad = ((normalized - 90) * Math.PI) / 180;
  const dotX = 32 + 21 * Math.cos(angleRad);
  const dotY = 32 + 21 * Math.sin(angleRad);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between h-full">
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
          Rotate
        </span>
        <button
          type="button"
          onClick={() => (onReset ? onReset() : onChange(0))}
          title="Reset rotation to 0°"
          className="p-0.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      <svg
        ref={dialRef}
        viewBox="0 0 64 64"
        className="w-16 h-16 cursor-grab active:cursor-grabbing touch-none select-none my-1"
        onPointerDown={(e) => {
          draggingRef.current = true;
          (e.target as Element).setPointerCapture(e.pointerId);
          updateFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) updateFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (draggingRef.current) {
            draggingRef.current = false;
            (e.target as Element).releasePointerCapture(e.pointerId);
          }
        }}
      >
        {/* Outer track */}
        <circle cx="32" cy="32" r="21" fill="white" stroke="#E2E8F0" strokeWidth="4" />
        {/* Center dot */}
        <circle cx="32" cy="32" r="2.5" fill="#94A3B8" />
        {/* Angle line */}
        <line x1="32" y1="32" x2={dotX} y2={dotY} stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        {/* Handle knob */}
        <circle cx={dotX} cy={dotY} r="4.5" fill="#7C3AED" stroke="white" strokeWidth="1.5" />
      </svg>

      <div className="flex items-center gap-1 mt-1 w-full">
        <input
          type="number"
          min={-360}
          max={360}
          value={Math.round(value || 0)}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full text-center text-[11px] font-bold text-slate-800 bg-white border border-slate-200 rounded-lg py-0.5 outline-none focus:border-purple-500"
        />
        <span className="text-[10px] font-bold text-slate-400">°</span>
      </div>
    </div>
  );
}
