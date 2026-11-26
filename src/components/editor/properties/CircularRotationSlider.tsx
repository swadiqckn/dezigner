'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Crosshair, X } from 'lucide-react';
import { AnchorPoint } from '@/types/editor';
import AnchorSelector from './AnchorSelector';

interface CircularRotationSliderProps {
  value: number;
  onChange: (deg: number) => void;
  onReset?: () => void;
  anchor?: AnchorPoint;
  onAnchorChange?: (anchor: AnchorPoint) => void;
}

export default function CircularRotationSlider({
  value,
  onChange,
  onReset,
  anchor = 'center',
  onAnchorChange,
}: CircularRotationSliderProps) {
  const dialRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);
  const [anchorPopupOpen, setAnchorPopupOpen] = useState(false);
  const anchorPopupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!anchorPopupOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (anchorPopupRef.current && !anchorPopupRef.current.contains(e.target as Node)) {
        setAnchorPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [anchorPopupOpen]);

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
    <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between h-full" ref={anchorPopupRef}>
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
          Rotate
        </span>
        <div className="flex items-center gap-0.5">
          {onAnchorChange && (
            <button
              type="button"
              onClick={() => setAnchorPopupOpen((o) => !o)}
              title={`Anchor Point: ${anchor.replace('-', ' ')} (click to change)`}
              className={`p-0.5 rounded transition-colors ${
                anchorPopupOpen
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Crosshair className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => (onReset ? onReset() : onChange(0))}
            title="Reset rotation to 0°"
            className="p-0.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Anchor Point Popup */}
      {anchorPopupOpen && onAnchorChange && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase">Anchor Point</span>
            <button
              type="button"
              onClick={() => setAnchorPopupOpen(false)}
              className="p-0.5 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <AnchorSelector
            value={anchor}
            onChange={(nextAnchor) => {
              onAnchorChange(nextAnchor);
            }}
            compact
          />
        </div>
      )}

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
