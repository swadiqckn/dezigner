'use client';

import React from 'react';
import { CanvasLayer } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { Braces, Layers, Sparkles } from 'lucide-react';

interface TemplateLayerSectionProps {
  layer: CanvasLayer;
}

export default function TemplateLayerSection({ layer }: TemplateLayerSectionProps) {
  const { updateLayer, setIsBulkModalOpen } = useEditorStore();

  // Only text, image, and icon layers can be template variables
  if (!['text', 'image', 'icon'].includes(layer.type)) {
    return null;
  }

  const isTemplate = !!layer.isTemplate;
  const defaultTemplateId =
    layer.templateId ||
    layer.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') ||
    layer.id;

  const currentNativeValue =
    layer.type === 'text'
      ? (layer as any).text
      : layer.type === 'image'
      ? (layer as any).src
      : (layer as any).iconName || 'star';

  const placeholderValue = layer.placeholderValue ?? currentNativeValue;

  const handleToggleTemplate = () => {
    if (isTemplate) {
      updateLayer(layer.id, { isTemplate: false }, true);
    } else {
      updateLayer(
        layer.id,
        {
          isTemplate: true,
          templateId: defaultTemplateId,
          templateType: layer.type as 'text' | 'image' | 'icon',
          placeholderValue: currentNativeValue,
        },
        true
      );
    }
  };

  return (
    <div className="space-y-2.5 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200/80 select-none">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
          <Braces className="w-3.5 h-3.5 text-indigo-600" />
          <span>Template Variable</span>
        </label>

        <button
          type="button"
          onClick={handleToggleTemplate}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
            isTemplate
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100'
          }`}
        >
          {isTemplate ? 'Active Template' : 'Make Template'}
        </button>
      </div>

      {!isTemplate ? (
        <p className="text-[10px] text-indigo-700/80 leading-relaxed">
          Convert this {layer.type} layer into a dynamic template field for bulk generation or recurring ERP usage.
        </p>
      ) : (
        <div className="space-y-2.5 pt-1">
          {/* Template ID & Type */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <span className="text-[10px] font-semibold text-indigo-800 block mb-0.5">
                Template ID
              </span>
              <input
                type="text"
                value={layer.templateId || ''}
                onChange={(e) =>
                  updateLayer(
                    layer.id,
                    {
                      templateId: e.target.value.replace(/\s+/g, '_'),
                    },
                    true
                  )
                }
                placeholder="e.g. student_name"
                className="w-full text-xs font-mono font-semibold text-slate-900 px-2 py-1.5 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <span className="text-[10px] font-semibold text-indigo-800 block mb-0.5">
                Type
              </span>
              <div className="w-full text-xs font-mono font-bold text-indigo-700 px-2 py-1.5 bg-indigo-100/70 border border-indigo-200 rounded-lg uppercase text-center">
                {layer.type}
              </div>
            </div>
          </div>

          {/* Placeholder Value */}
          <div>
            <span className="text-[10px] font-semibold text-indigo-800 block mb-0.5">
              Placeholder Value (Default)
            </span>
            <input
              type="text"
              value={placeholderValue}
              onChange={(e) =>
                updateLayer(layer.id, { placeholderValue: e.target.value }, true)
              }
              placeholder="Dynamic placeholder value..."
              className="w-full text-xs font-medium text-slate-900 px-2 py-1.5 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-600 truncate"
            />
          </div>

          {/* Schema Preview & Bulk Generate Trigger */}
          <div className="p-2 bg-slate-900 rounded-xl text-[10px] font-mono text-emerald-300 overflow-x-auto">
            {JSON.stringify({
              id: layer.templateId || defaultTemplateId,
              type: layer.type,
              value:
                placeholderValue.length > 30
                  ? placeholderValue.slice(0, 30) + '...'
                  : placeholderValue,
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Bulk Generator</span>
          </button>
        </div>
      )}
    </div>
  );
}
