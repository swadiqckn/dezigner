'use client';

import React, { useRef, useState } from 'react';
import { ImageLayer } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import AnchorSelector from './AnchorSelector';
import ScaleControls from './ScaleControls';
import ColorPickerSection from './ColorPickerSection';
import { Upload, RotateCw, Image as ImageIcon, Lock, Unlock, Sparkles } from 'lucide-react';

interface ImagePropertiesProps {
  layer: ImageLayer;
}

export default function ImageProperties({ layer }: ImagePropertiesProps) {
  const { updateLayer } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  const aspectRatio = layer.width && layer.height ? layer.width / layer.height : 1;

  const handleUpdate = (updates: Partial<ImageLayer>) => {
    updateLayer(layer.id, updates, true);
  };

  const handleWidthChange = (newWidth: number) => {
    const w = Math.max(20, newWidth);
    if (lockAspectRatio && aspectRatio > 0) {
      handleUpdate({ width: w, height: Math.round(w / aspectRatio) });
    } else {
      handleUpdate({ width: w });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const h = Math.max(20, newHeight);
    if (lockAspectRatio && aspectRatio > 0) {
      handleUpdate({ width: Math.round(h * aspectRatio), height: h });
    } else {
      handleUpdate({ height: h });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleUpdate({ src: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Preview & Quick Replace */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="w-14 h-14 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layer.src}
            alt={layer.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">{layer.name}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={layer.editable === false}
            className="mt-1 text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            <span>Replace Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {layer.isExternal && (
        <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] text-purple-800">
          🌐 <strong>ERP Injected Asset</strong>: Injected via ERP configuration payload.
        </div>
      )}

      {/* Dimensions with Aspect Ratio Lock & Size Slider */}
      <div className="space-y-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Dimensions (px)</label>
          <button
            type="button"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            title={lockAspectRatio ? 'Aspect Ratio Locked (default)' : 'Aspect Ratio Free'}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
              lockAspectRatio
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {lockAspectRatio ? <Lock className="w-3 h-3 text-purple-600" /> : <Unlock className="w-3 h-3 text-slate-500" />}
            <span>{lockAspectRatio ? 'Ratio Locked' : 'Ratio Free'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Width</span>
            <input
              type="number"
              value={layer.width}
              disabled={layer.locked}
              onChange={(e) => handleWidthChange(Number(e.target.value) || 20)}
              className="w-full text-xs font-semibold text-slate-900 p-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-purple-600"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">Height</span>
            <input
              type="number"
              value={layer.height}
              disabled={layer.locked}
              onChange={(e) => handleHeightChange(Number(e.target.value) || 20)}
              className="w-full text-xs font-semibold text-slate-900 p-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-purple-600"
            />
          </div>
        </div>

        {/* Size Slider Control */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
            <span>Size Scale</span>
            <span className="font-mono">{layer.width}px</span>
          </div>
          <input
            type="range"
            min={30}
            max={1500}
            step={5}
            value={layer.width}
            disabled={layer.locked}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Scale X & Y + Ratio Lock */}
      <ScaleControls layerId={layer.id} />

      {/* Anchor Point 9-Point Matrix */}
      <AnchorSelector layerId={layer.id} />

      {/* Rotation with Slider Control */}
      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Rotation</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={-180}
              max={180}
              value={layer.rotation || 0}
              disabled={layer.locked}
              onChange={(e) => handleUpdate({ rotation: Number(e.target.value) || 0 })}
              className="w-16 text-xs font-semibold text-slate-900 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right outline-none focus:border-purple-600"
            />
            <span className="text-xs text-slate-400">°</span>
          </div>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={layer.rotation || 0}
          disabled={layer.locked}
          onChange={(e) => handleUpdate({ rotation: Number(e.target.value) || 0 })}
          className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
      </div>

      {/* Corner Radius & Opacity */}
      <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Corner Radius</span>
            <span className="font-mono">{layer.cornerRadius || 0}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={150}
            value={layer.cornerRadius || 0}
            onChange={(e) => handleUpdate({ cornerRadius: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Opacity</span>
            <span className="font-mono">{Math.round((layer.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={layer.opacity ?? 1}
            onChange={(e) => handleUpdate({ opacity: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Border / Stroke */}
      <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <label className="text-xs font-semibold text-slate-700 block">
          Border & Outline
        </label>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={layer.stroke || '#7C3AED'}
            onChange={(e) => handleUpdate({ stroke: e.target.value })}
            className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0.5"
          />
          <input
            type="text"
            value={layer.stroke || '#7C3AED'}
            onChange={(e) => handleUpdate({ stroke: e.target.value })}
            className="flex-1 text-xs p-1.5 bg-white border border-slate-200 rounded-lg font-mono uppercase"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Border Width</span>
            <span className="font-mono">{layer.strokeWidth || 0}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={layer.strokeWidth || 0}
            onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Alpha-Based Drop Shadow */}
      <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Drop Shadow (Alpha)</span>
          </label>
          <button
            type="button"
            onClick={() =>
              handleUpdate(
                layer.shadowColor && layer.shadowColor !== 'transparent'
                  ? { shadowColor: 'transparent', shadowBlur: 0 }
                  : { shadowColor: '#000000', shadowBlur: 18, shadowOffsetX: 6, shadowOffsetY: 10, shadowOpacity: 0.45 }
              )
            }
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
              layer.shadowColor && layer.shadowColor !== 'transparent'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {layer.shadowColor && layer.shadowColor !== 'transparent' ? 'On' : 'Add Shadow'}
          </button>
        </div>

        {layer.shadowColor && layer.shadowColor !== 'transparent' && (
          <div className="space-y-2.5 pt-1">
            <ColorPickerSection
              label="Shadow Color"
              value={layer.shadowColor}
              onChange={(shadowColor) => handleUpdate({ shadowColor })}
              allowTransparent={true}
            />

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Blur</span>
                <span className="font-mono">{layer.shadowBlur ?? 12}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={layer.shadowBlur ?? 12}
                onChange={(e) => handleUpdate({ shadowBlur: Number(e.target.value) })}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Offset X</span>
                  <span className="font-mono">{layer.shadowOffsetX ?? 4}px</span>
                </div>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  value={layer.shadowOffsetX ?? 4}
                  onChange={(e) => handleUpdate({ shadowOffsetX: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Offset Y</span>
                  <span className="font-mono">{layer.shadowOffsetY ?? 6}px</span>
                </div>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  value={layer.shadowOffsetY ?? 6}
                  onChange={(e) => handleUpdate({ shadowOffsetY: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Shadow Opacity</span>
                <span className="font-mono">{Math.round((layer.shadowOpacity ?? 0.5) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={layer.shadowOpacity ?? 0.5}
                onChange={(e) => handleUpdate({ shadowOpacity: Number(e.target.value) })}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
