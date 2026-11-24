'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { STANDARD_NEUTRALS, getUsedColors } from '@/utils/colorUtils';
import { Check } from 'lucide-react';

interface ColorPickerSectionProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  allowTransparent?: boolean;
}

export default function ColorPickerSection({
  label,
  value,
  onChange,
  allowTransparent = false,
}: ColorPickerSectionProps) {
  const { layers, background } = useEditorStore();
  const usedColors = getUsedColors(layers, background);

  const currentColor = (value || '#000000').toUpperCase();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange('transparent')}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
              value === 'transparent'
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Transparent
          </button>
        )}
      </div>

      {/* Main Color Input Row */}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shrink-0 shadow-xs">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs font-semibold text-slate-900 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:border-purple-600 outline-none"
          placeholder="#000000"
        />
      </div>

      {/* Standard Neutrals: White, Grays, Black */}
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
                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all shadow-xs hover:scale-110 ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-400 scale-105'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                title={`${n.label} (${n.color})`}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      n.color === '#FFFFFF' || n.color === '#E2E8F0'
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

      {/* Used Colors in Poster (if available) */}
      {usedColors.length > 0 && (
        <div className="pt-1">
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
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all shadow-xs hover:scale-110 ${
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
  );
}
