'use client';

import React, { useState } from 'react';
import { Lock, Unlock, RotateCcw } from 'lucide-react';

interface CornerRadiusControlsProps {
  cornerRadius?: number;
  cornerRadii?: [number, number, number, number];
  onChange: (updates: { cornerRadius?: number; cornerRadii?: [number, number, number, number] }) => void;
}

export default function CornerRadiusControls({
  cornerRadius = 0,
  cornerRadii,
  onChange,
}: CornerRadiusControlsProps) {
  const isUniformInitial =
    !cornerRadii ||
    (cornerRadii[0] === cornerRadii[1] &&
      cornerRadii[1] === cornerRadii[2] &&
      cornerRadii[2] === cornerRadii[3]);

  const [locked, setLocked] = useState(isUniformInitial);

  const tl = cornerRadii ? cornerRadii[0] : cornerRadius;
  const tr = cornerRadii ? cornerRadii[1] : cornerRadius;
  const br = cornerRadii ? cornerRadii[2] : cornerRadius;
  const bl = cornerRadii ? cornerRadii[3] : cornerRadius;

  const handleUniformChange = (val: number) => {
    const v = Math.max(0, Math.round(val));
    onChange({ cornerRadius: v, cornerRadii: [v, v, v, v] });
  };

  const handleCornerChange = (index: 0 | 1 | 2 | 3, val: number) => {
    const v = Math.max(0, Math.round(val));
    const next: [number, number, number, number] = [tl, tr, br, bl];
    next[index] = v;
    onChange({ cornerRadius: next[0], cornerRadii: next });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Corner Radius
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const nextLocked = !locked;
              setLocked(nextLocked);
              if (nextLocked) {
                onChange({ cornerRadius: tl, cornerRadii: [tl, tl, tl, tl] });
              }
            }}
            title={locked ? 'Unlock independent corners' : 'Lock all corners'}
            className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors ${
              locked
                ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => onChange({ cornerRadius: 0, cornerRadii: [0, 0, 0, 0] })}
            title="Reset corner radius"
            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {locked ? (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={200}
            value={tl}
            onChange={(e) => handleUniformChange(Number(e.target.value))}
            className="flex-1 accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min={0}
            max={500}
            value={tl}
            onChange={(e) => handleUniformChange(Number(e.target.value) || 0)}
            className="w-14 text-center text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1 outline-none focus:border-purple-500"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'TL', val: tl, idx: 0 as const },
            { label: 'TR', val: tr, idx: 1 as const },
            { label: 'BL', val: bl, idx: 3 as const },
            { label: 'BR', val: br, idx: 2 as const },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
            >
              <span className="text-[10px] font-bold text-slate-400 w-5">{c.label}</span>
              <input
                type="number"
                min={0}
                max={500}
                value={c.val}
                onChange={(e) => handleCornerChange(c.idx, Number(e.target.value) || 0)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
