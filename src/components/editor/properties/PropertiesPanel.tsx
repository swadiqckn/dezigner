'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import TextProperties from './TextProperties';
import ImageProperties from './ImageProperties';
import ShapeProperties from './ShapeProperties';
import CanvasProperties from './CanvasProperties';
import ArrangeControls from './ArrangeControls';
import { TextLayer, ImageLayer, ShapeLayer } from '@/types/editor';
import { 
  Sliders, 
  Type, 
  Image as ImageIcon, 
  Shapes, 
  Layers, 
  Info,
  Lock,
  ShieldCheck
} from 'lucide-react';

export default function PropertiesPanel() {
  const { layers, selectedLayerIds, renameLayer } = useEditorStore();

  const selectedLayer = layers.find((l) => selectedLayerIds.includes(l.id));

  return (
    <aside className="w-80 h-full bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedLayer ? (
            <>
              {selectedLayer.type === 'text' && <Type className="w-4 h-4 text-purple-600" />}
              {selectedLayer.type === 'image' && <ImageIcon className="w-4 h-4 text-purple-600" />}
              {['rect', 'circle', 'star', 'line'].includes(selectedLayer.type) && (
                <Shapes className="w-4 h-4 text-purple-600" />
              )}
              <input
                type="text"
                value={selectedLayer.name}
                onChange={(e) => renameLayer(selectedLayer.id, e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-300 rounded px-1 py-0.5 outline-none max-w-[170px] truncate"
                title="Click to rename layer"
              />
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-800">Canvas Settings</span>
            </>
          )}
        </div>

        {selectedLayer && selectedLayer.locked && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )}

        {selectedLayer && selectedLayer.deletable === false && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200" title="Non-deletable ERP layer">
            <ShieldCheck className="w-3 h-3" /> Protected
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 space-y-5">
        {selectedLayer ? (
          <>
            {selectedLayer.type === 'text' && <TextProperties layer={selectedLayer as TextLayer} />}
            {selectedLayer.type === 'image' && <ImageProperties layer={selectedLayer as ImageLayer} />}
            {['rect', 'circle', 'star', 'line', 'polygon', 'badge', 'icon'].includes(selectedLayer.type) && (
              <ShapeProperties layer={selectedLayer as ShapeLayer} />
            )}
            <ArrangeControls />
          </>
        ) : (
          <CanvasProperties />
        )}
      </div>
    </aside>
  );
}
