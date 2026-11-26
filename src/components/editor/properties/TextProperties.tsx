'use client';

import React, { useState, useMemo } from 'react';
import { TextLayer, TextWordStyle } from '@/types/editor';
import FontSelector from './FontSelector';
import ColorPickerSection from './ColorPickerSection';
import {
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RotateCcw,
  CaseSensitive,
  Sparkles,
} from 'lucide-react';

interface TextPropertiesProps {
  layer: TextLayer;
  onChange: (updates: Partial<TextLayer>) => void;
}

const FONT_WEIGHTS = [
  { label: 'Light (300)', value: '300' },
  { label: 'Regular (400)', value: 'normal' },
  { label: 'Medium (500)', value: '500' },
  { label: 'SemiBold (600)', value: '600' },
  { label: 'Bold (700)', value: 'bold' },
  { label: 'ExtraBold (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
];

type CaseMode = 'uppercase' | 'lowercase' | 'capitalize' | 'camelcase';

function toCamelCase(input: string): string {
  const words = input.trim().split(/[\s_-]+/).filter(Boolean);
  if (words.length === 0) return input;
  return words
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join('');
}

function applyCaseTransform(text: string, mode: CaseMode): string {
  switch (mode) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    case 'camelcase':
      return toCamelCase(text);
  }
}

export default function TextProperties({ layer, onChange }: TextPropertiesProps) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

  const words = useMemo(() => {
    return (layer.text || '').trim().split(/\s+/).filter(Boolean);
  }, [layer.text]);

  const activeWordStyle: TextWordStyle | undefined =
    selectedWordIndex !== null ? layer.wordStyles?.[selectedWordIndex] : undefined;

  const updateWordOrLayer = (updates: Partial<TextLayer>) => {
    if (selectedWordIndex === null) {
      onChange(updates);
      return;
    }
    const existing = layer.wordStyles || {};
    const prevWord = existing[selectedWordIndex] || {};
    const nextWord: TextWordStyle = { ...prevWord };
    if (updates.fontFamily !== undefined) nextWord.fontFamily = updates.fontFamily;
    if (updates.fontSize !== undefined) nextWord.fontSize = updates.fontSize;
    if (updates.fontWeight !== undefined) nextWord.fontWeight = updates.fontWeight;
    if (updates.fontStyle !== undefined) nextWord.fontStyle = updates.fontStyle;
    if (updates.textDecoration !== undefined) nextWord.textDecoration = updates.textDecoration;
    if (updates.color !== undefined) nextWord.color = updates.color;

    onChange({
      wordStyles: {
        ...existing,
        [selectedWordIndex]: nextWord,
      },
    });
  };

  const handleCycleCase = () => {
    const modes: CaseMode[] = ['uppercase', 'lowercase', 'capitalize', 'camelcase'];
    const mode = modes[caseIndex % modes.length];
    setCaseIndex((i) => (i + 1) % modes.length);
    onChange({
      text: applyCaseTransform(layer.text || '', mode),
      textTransform: mode,
    });
  };

  const curFont = activeWordStyle?.fontFamily ?? layer.fontFamily;
  const curSize = activeWordStyle?.fontSize ?? layer.fontSize;
  const curWeight = activeWordStyle?.fontWeight ?? layer.fontWeight ?? 'normal';
  const curStyle = activeWordStyle?.fontStyle ?? layer.fontStyle ?? 'normal';
  const curDecor = activeWordStyle?.textDecoration ?? layer.textDecoration ?? 'none';
  const curColor = activeWordStyle?.color ?? layer.color;

  return (
    <div className="space-y-4">
      {/* 1. Content Textarea with Case Toggle */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Text Content
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCycleCase}
              title="Cycle Text Case (UPPER / lower / Capitalize / camelCase)"
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
            >
              <CaseSensitive className="w-3.5 h-3.5" />
              <span>Case</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ autoWidth: !(layer.autoWidth ?? true) })}
              title="Toggle Auto Single-Line vs Wrap"
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                layer.autoWidth !== false
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              {layer.autoWidth !== false ? 'Single-Line' : 'Wrap'}
            </button>
          </div>
        </div>
        <textarea
          rows={3}
          value={layer.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Enter poster text..."
          className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white resize-y"
        />
      </div>

      {/* Granular Per-Word Selector (for multi-word text) */}
      {words.length > 1 && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Word Styling
            </span>
            {layer.wordStyles && Object.keys(layer.wordStyles).length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onChange({ wordStyles: undefined });
                  setSelectedWordIndex(null);
                }}
                title="Reset all per-word styles"
                className="text-[10px] font-semibold text-slate-400 hover:text-red-600 flex items-center gap-0.5"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedWordIndex(null)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                selectedWordIndex === null
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Words
            </button>
            {words.map((word, idx) => {
              const hasOverride = !!layer.wordStyles?.[idx];
              const isActive = selectedWordIndex === idx;
              return (
                <button
                  key={`${idx}-${word}`}
                  type="button"
                  onClick={() => setSelectedWordIndex(isActive ? null : idx)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-600'
                      : hasOverride
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Font Field (Dropdown) */}
      <div className="pt-2 border-t border-slate-100">
        <FontSelector
          value={curFont}
          onChange={(fontFamily) => updateWordOrLayer({ fontFamily })}
          previewText={selectedWordIndex !== null ? words[selectedWordIndex] : layer.text}
        />
      </div>

      {/* 3. Font Size & Font Weight */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Size & Weight
          </span>
          <button
            type="button"
            onClick={() => updateWordOrLayer({ fontSize: 32, fontWeight: 'normal' })}
            title="Reset size & weight"
            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Size (px)</span>
            <input
              type="number"
              min={8}
              max={400}
              value={curSize}
              onChange={(e) => updateWordOrLayer({ fontSize: Math.max(8, Number(e.target.value) || 8) })}
              className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
            />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Weight</span>
            <select
              value={curWeight}
              onChange={(e) => updateWordOrLayer({ fontWeight: e.target.value })}
              className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
            >
              {FONT_WEIGHTS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Style & Alignment */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Style & Alignment
          </span>
          <button
            type="button"
            onClick={() =>
              updateWordOrLayer({
                fontStyle: 'normal',
                textDecoration: 'none',
                textAlign: 'left',
              })
            }
            title="Reset style & alignment"
            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Italic */}
          <button
            type="button"
            onClick={() =>
              updateWordOrLayer({ fontStyle: curStyle === 'italic' ? 'normal' : 'italic' })
            }
            title="Italic"
            className={`flex-1 p-2 rounded-lg border flex items-center justify-center transition-colors ${
              curStyle === 'italic'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() =>
              updateWordOrLayer({ textDecoration: curDecor === 'underline' ? 'none' : 'underline' })
            }
            title="Underline"
            className={`flex-1 p-2 rounded-lg border flex items-center justify-center transition-colors ${
              curDecor === 'underline'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() =>
              updateWordOrLayer({
                textDecoration: curDecor === 'line-through' ? 'none' : 'line-through',
              })
            }
            title="Strikethrough"
            className={`flex-1 p-2 rounded-lg border flex items-center justify-center transition-colors ${
              curDecor === 'line-through'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

          {/* Alignments */}
          {[
            { id: 'left' as const, icon: AlignLeft, label: 'Align Left' },
            { id: 'center' as const, icon: AlignCenter, label: 'Align Center' },
            { id: 'right' as const, icon: AlignRight, label: 'Align Right' },
            { id: 'justify' as const, icon: AlignJustify, label: 'Justify' },
          ].map((al) => {
            const Icon = al.icon;
            const active = (layer.textAlign || 'left') === al.id;
            return (
              <button
                key={al.id}
                type="button"
                onClick={() => onChange({ textAlign: al.id })}
                title={al.label}
                className={`flex-1 p-2 rounded-lg border flex items-center justify-center transition-colors ${
                  active
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Letter Spacing & Line Height */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Spacing
          </span>
          <button
            type="button"
            onClick={() => onChange({ letterSpacing: 0, lineHeight: 1.2 })}
            title="Reset letter spacing & line height"
            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Letter Space</span>
            <input
              type="number"
              min={-10}
              max={60}
              value={layer.letterSpacing || 0}
              onChange={(e) => onChange({ letterSpacing: Number(e.target.value) || 0 })}
              className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
            />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Line Height</span>
            <input
              type="number"
              min={0.5}
              max={4}
              step={0.1}
              value={layer.lineHeight ?? 1.2}
              onChange={(e) => onChange({ lineHeight: Math.max(0.5, Number(e.target.value) || 1.2) })}
              className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Per-Word Fill Color shortcut when a word is selected */}
      {selectedWordIndex !== null && (
        <div className="pt-2 border-t border-slate-100">
          <ColorPickerSection
            label={`Word "${words[selectedWordIndex]}" Color`}
            value={curColor}
            onChange={(color) => updateWordOrLayer({ color })}
            defaultValue={layer.color}
          />
        </div>
      )}
    </div>
  );
}
