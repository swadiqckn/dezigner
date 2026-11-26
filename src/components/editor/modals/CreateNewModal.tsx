'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CANVAS_PRESETS } from '@/constants/canvasPresets';
import { FilePlus2, X, ArrowRightLeft } from 'lucide-react';

interface CreateNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_BG_COLORS = [
  '#FFFFFF',
  '#F8FAFC',
  '#0F172A',
  '#000000',
  '#FEF3C7',
  '#EDE9FE',
  '#DBEAFE',
  '#FCE7F3',
];

export default function CreateNewModal({ isOpen, onClose }: CreateNewModalProps) {
  const { createNewProject } = useEditorStore();

  const [title, setTitle] = useState('Untitled Poster');
  const [selectedPreset, setSelectedPreset] = useState(CANVAS_PRESETS[0]?.name || 'Instagram Portrait');
  const [width, setWidth] = useState(CANVAS_PRESETS[0]?.width || 1080);
  const [height, setHeight] = useState(CANVAS_PRESETS[0]?.height || 1350);
  const [bgColor, setBgColor] = useState('#FFFFFF');

  if (!isOpen) return null;

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = CANVAS_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setWidth(found.width);
      setHeight(found.height);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNewProject({
      title: title.trim() || 'Untitled Poster',
      width: Math.max(50, width),
      height: Math.max(50, height),
      presetName: selectedPreset,
      background: { type: 'solid', color: bgColor },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FilePlus2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Create New Poster</h3>
              <p className="text-[11px] text-slate-400">Set file name, canvas dimensions & background</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          {/* File Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              File Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Star of the Month"
              autoFocus
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Size Preset */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Canvas Size Preset
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white"
            >
              {CANVAS_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.width} × {p.height})
                </option>
              ))}
              <option value="Custom">Custom Dimensions</option>
            </select>
          </div>

          {/* Width & Height */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Width (px)</label>
              <input
                type="number"
                min={50}
                max={10000}
                value={width}
                onChange={(e) => {
                  setWidth(Number(e.target.value) || 100);
                  setSelectedPreset('Custom');
                }}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setWidth(height);
                setHeight(width);
                setSelectedPreset('Custom');
              }}
              className="p-2 mb-0.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 rounded-xl transition-colors"
              title="Swap Width & Height"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Height (px)</label>
              <input
                type="number"
                min={50}
                max={10000}
                value={height}
                onChange={(e) => {
                  setHeight(Number(e.target.value) || 100);
                  setSelectedPreset('Custom');
                }}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Background Color
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500 uppercase"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_BG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBgColor(c)}
                  className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                    bgColor.toUpperCase() === c ? 'ring-2 ring-purple-600 ring-offset-1 border-purple-400' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
