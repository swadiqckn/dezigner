'use client';

import React from 'react';
import { TextLayer } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import ColorPickerSection from './ColorPickerSection';
import FontSelector from './FontSelector';
import AnchorSelector from './AnchorSelector';
import ScaleControls from './ScaleControls';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  RotateCw
} from 'lucide-react';

interface TextPropertiesProps {
  layer: TextLayer;
}

export default function TextProperties({ layer }: TextPropertiesProps) {
  const { updateLayer } = useEditorStore();

  const handleUpdate = (updates: Partial<TextLayer>) => {
    updateLayer(layer.id, updates, true);
  };

  const isBold = layer.fontWeight === 'bold' || layer.fontWeight === '700' || layer.fontWeight === '800';
  const isItalic = layer.fontStyle === 'italic';
  const isUnderline = layer.textDecoration === 'underline';

  return (
    <div className="space-y-4">
      {/* Text Content Area (Single line until manual Enter) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Text Content
          </label>
          <button
            type="button"
            onClick={() => handleUpdate({ autoWidth: layer.autoWidth === false ? true : false })}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
              layer.autoWidth !== false
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
            title="Keep text on a single line until Enter is pressed"
          >
            {layer.autoWidth !== false ? 'Auto Single-Line' : 'Fixed Box Wrap'}
          </button>
        </div>
        <textarea
          rows={3}
          wrap={layer.autoWidth === false ? "soft" : "off"}
          value={layer.text}
          disabled={layer.editable === false}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          className={`w-full text-xs font-semibold text-slate-900 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none resize-none disabled:bg-slate-100 disabled:text-slate-400 ${
            layer.autoWidth !== false ? 'whitespace-pre overflow-x-auto' : ''
          }`}
          placeholder="Type text... Press Enter for new line"
        />
        {layer.editable === false && (
          <p className="text-[11px] text-amber-600 mt-1 font-medium">
            🔒 Content is locked by external ERP configuration.
          </p>
        )}
      </div>

      {/* Google Fonts & Custom Fonts */}
      <FontSelector
        value={layer.fontFamily}
        onChange={(fontFamily) => handleUpdate({ fontFamily })}
      />

      {/* Font Size with Slider Control */}
      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Size (px)</label>
          <input
            type="number"
            min={8}
            max={300}
            value={layer.fontSize}
            onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) || 12 })}
            className="w-16 text-xs font-semibold text-slate-900 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right outline-none focus:border-purple-600"
          />
        </div>
        <input
          type="range"
          min={10}
          max={200}
          step={1}
          value={layer.fontSize}
          onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) || 12 })}
          className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
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
          onChange={(e) => handleUpdate({ rotation: Number(e.target.value) || 0 })}
          className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
      </div>

      {/* Style Buttons (Bold, Italic, Underline, Uppercase) */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          Style & Alignment
        </label>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => handleUpdate({ fontWeight: isBold ? 'normal' : 'bold' })}
            className={`p-1.5 rounded-lg flex-1 flex justify-center transition-colors ${
              isBold ? 'bg-purple-600 text-white' : 'hover:bg-white text-slate-600'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUpdate({ fontStyle: isItalic ? 'normal' : 'italic' })}
            className={`p-1.5 rounded-lg flex-1 flex justify-center transition-colors ${
              isItalic ? 'bg-purple-600 text-white' : 'hover:bg-white text-slate-600'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUpdate({ textDecoration: isUnderline ? 'none' : 'underline' })}
            className={`p-1.5 rounded-lg flex-1 flex justify-center transition-colors ${
              isUnderline ? 'bg-purple-600 text-white' : 'hover:bg-white text-slate-600'
            }`}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              handleUpdate({
                text:
                  layer.text === layer.text.toUpperCase()
                    ? layer.text.toLowerCase()
                    : layer.text.toUpperCase(),
              })
            }
            className="p-1.5 rounded-lg flex-1 flex justify-center hover:bg-white text-slate-600 text-xs font-bold"
            title="Toggle Uppercase"
          >
            <span className="text-[12px] font-bold">aA</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

          <button
            onClick={() => handleUpdate({ textAlign: 'left' })}
            className={`p-1.5 rounded-lg flex-1 flex justify-center transition-colors ${
              layer.textAlign === 'left' || !layer.textAlign
                ? 'bg-purple-100 text-purple-700'
                : 'hover:bg-white text-slate-600'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUpdate({ textAlign: 'center' })}
            className={`p-1.5 rounded-lg flex-1 flex justify-center transition-colors ${
              layer.textAlign === 'center' ? 'bg-purple-100 text-purple-700' : 'hover:bg-white text-slate-600'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUpdate({ textAlign: 'right' })}
            className={`p-1.5 rounded-lg flex-1 flex justify-center transition-colors ${
              layer.textAlign === 'right' ? 'bg-purple-100 text-purple-700' : 'hover:bg-white text-slate-600'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spacing & Line Height */}
      <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Letter Spacing</span>
            <span className="font-mono">{layer.letterSpacing || 0}px</span>
          </div>
          <input
            type="range"
            min={-4}
            max={20}
            step={1}
            value={layer.letterSpacing || 0}
            onChange={(e) => handleUpdate({ letterSpacing: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Line Height</span>
            <span className="font-mono">{layer.lineHeight || 1.2}</span>
          </div>
          <input
            type="range"
            min={0.8}
            max={2.5}
            step={0.05}
            value={layer.lineHeight || 1.2}
            onChange={(e) => handleUpdate({ lineHeight: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Text Color Picker & Used Colors */}
      <ColorPickerSection
        label="Text Color"
        value={layer.color || '#000000'}
        onChange={(color) => handleUpdate({ color })}
      />

      {/* Shadow & Effects */}
      <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        <label className="text-xs font-semibold text-slate-700 block">
          Drop Shadow
        </label>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={layer.shadowColor || '#000000'}
            onChange={(e) => handleUpdate({ shadowColor: e.target.value })}
            className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0.5"
          />
          <span className="text-xs text-slate-500">Shadow Color</span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Shadow Blur</span>
            <span className="font-mono">{layer.shadowBlur || 0}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            value={layer.shadowBlur || 0}
            onChange={(e) => handleUpdate({ shadowBlur: Number(e.target.value) })}
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
    </div>
  );
}
