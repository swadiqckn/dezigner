'use client';

import React, { useRef } from 'react';
import { ImageLayer } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { Upload, RotateCw, Image as ImageIcon } from 'lucide-react';

interface ImagePropertiesProps {
  layer: ImageLayer;
}

export default function ImageProperties({ layer }: ImagePropertiesProps) {
  const { updateLayer } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpdate = (updates: Partial<ImageLayer>) => {
    updateLayer(layer.id, updates, true);
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

      {/* Dimensions & Rotation */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Width (px)
          </label>
          <input
            type="number"
            value={layer.width}
            disabled={layer.locked}
            onChange={(e) => handleUpdate({ width: Math.max(20, Number(e.target.value) || 20) })}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Height (px)
          </label>
          <input
            type="number"
            value={layer.height}
            disabled={layer.locked}
            onChange={(e) => handleUpdate({ height: Math.max(20, Number(e.target.value) || 20) })}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Rotation (°)
        </label>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
          <RotateCw className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="number"
            min={-360}
            max={360}
            value={layer.rotation || 0}
            onChange={(e) => handleUpdate({ rotation: Number(e.target.value) || 0 })}
            className="w-full text-xs bg-transparent outline-none"
          />
        </div>
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
    </div>
  );
}
