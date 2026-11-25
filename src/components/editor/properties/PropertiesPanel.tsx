'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import TextProperties from './TextProperties';
import ImageProperties from './ImageProperties';
import ShapeProperties from './ShapeProperties';
import CanvasProperties from './CanvasProperties';
import ArrangeControls from './ArrangeControls';
import TemplateLayerSection from './TemplateLayerSection';
import MovementControls from './MovementControls';
import AnchorSelector from './AnchorSelector';
import ScaleControls from './ScaleControls';
import ColorPickerSection from './ColorPickerSection';
import FontSelector from './FontSelector';
import { TextLayer, ImageLayer, ShapeLayer } from '@/types/editor';
import { 
  Sliders, 
  Type, 
  Image as ImageIcon, 
  Shapes, 
  Palette,
  Maximize2,
  Crosshair,
  Move,
  Braces,
  Layers,
  Lock,
  ShieldCheck,
  X
} from 'lucide-react';

type RightToolTab = 'all' | 'style' | 'color' | 'scale' | 'anchor' | 'move' | 'template' | 'arrange';

export default function PropertiesPanel() {
  const { layers, selectedLayerIds, renameLayer, updateLayer } = useEditorStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<RightToolTab>('all');

  const selectedLayer = layers.find((l) => selectedLayerIds.includes(l.id));

  const handleRailIconClick = (tool: RightToolTab) => {
    if (isDrawerOpen && activeTool === tool) {
      setIsDrawerOpen(false);
    } else {
      setActiveTool(tool);
      setIsDrawerOpen(true);
    }
  };

  const railItems: Array<{ id: RightToolTab; label: string; icon: React.ComponentType<any>; show: boolean }> = selectedLayer
    ? [
        { id: 'all', label: 'All', icon: Sliders, show: true },
        { id: 'style', label: selectedLayer.type === 'text' ? 'Font' : 'Style', icon: selectedLayer.type === 'text' ? Type : selectedLayer.type === 'image' ? ImageIcon : Shapes, show: true },
        { id: 'color', label: 'Color', icon: Palette, show: selectedLayer.type === 'text' || ['rect', 'circle', 'star', 'line', 'polygon', 'badge', 'icon'].includes(selectedLayer.type) },
        { id: 'scale', label: 'Scale', icon: Maximize2, show: true },
        { id: 'anchor', label: 'Anchor', icon: Crosshair, show: true },
        { id: 'move', label: 'Move', icon: Move, show: true },
        { id: 'template', label: 'Template', icon: Braces, show: ['text', 'image', 'icon'].includes(selectedLayer.type) },
        { id: 'arrange', label: 'Arrange', icon: Layers, show: true },
      ]
    : [
        { id: 'all', label: 'Canvas', icon: Sliders, show: true },
      ];

  return (
    <div className="flex h-full shrink-0 select-none">
      {/* Expandable Right Properties Sidebar */}
      {isDrawerOpen && (
        <aside className="w-80 h-full bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto relative animate-in slide-in-from-right-4 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2 min-w-0">
              {selectedLayer ? (
                <>
                  {selectedLayer.type === 'text' && <Type className="w-4 h-4 text-purple-600 shrink-0" />}
                  {selectedLayer.type === 'image' && <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />}
                  {['rect', 'circle', 'star', 'line', 'icon', 'badge'].includes(selectedLayer.type) && (
                    <Shapes className="w-4 h-4 text-purple-600 shrink-0" />
                  )}
                  <input
                    type="text"
                    value={selectedLayer.name}
                    onChange={(e) => renameLayer(selectedLayer.id, e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-300 rounded px-1 py-0.5 outline-none max-w-[160px] truncate"
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

            <div className="flex items-center gap-1">
              {selectedLayer && selectedLayer.locked && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                  <Lock className="w-3 h-3" />
                </span>
              )}

              {selectedLayer && selectedLayer.deletable === false && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200" title="Protected ERP layer">
                  <ShieldCheck className="w-3 h-3" />
                </span>
              )}

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                title="Collapse Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="p-4 flex-1 space-y-5">
            {!selectedLayer ? (
              <CanvasProperties />
            ) : activeTool === 'all' ? (
              <>
                {selectedLayer.type === 'text' && <TextProperties layer={selectedLayer as TextLayer} />}
                {selectedLayer.type === 'image' && <ImageProperties layer={selectedLayer as ImageLayer} />}
                {['rect', 'circle', 'star', 'line', 'polygon', 'badge', 'icon'].includes(selectedLayer.type) && (
                  <ShapeProperties layer={selectedLayer as ShapeLayer} />
                )}
                <TemplateLayerSection layer={selectedLayer} />
                <ArrangeControls />
              </>
            ) : activeTool === 'style' ? (
              <>
                {selectedLayer.type === 'text' && (
                  <FontSelector
                    value={(selectedLayer as TextLayer).fontFamily}
                    onChange={(fontFamily) => updateLayer(selectedLayer.id, { fontFamily }, true)}
                  />
                )}
                {selectedLayer.type === 'image' && <ImageProperties layer={selectedLayer as ImageLayer} />}
                {['rect', 'circle', 'star', 'line', 'polygon', 'badge', 'icon'].includes(selectedLayer.type) && (
                  <ShapeProperties layer={selectedLayer as ShapeLayer} />
                )}
              </>
            ) : activeTool === 'color' ? (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {selectedLayer.type === 'text' ? (
                  <ColorPickerSection
                    label="Text Color"
                    value={(selectedLayer as TextLayer).color || '#000000'}
                    onChange={(color) => updateLayer(selectedLayer.id, { color }, true)}
                  />
                ) : (
                  <ColorPickerSection
                    label="Fill Color"
                    value={(selectedLayer as any).fill || '#7C3AED'}
                    onChange={(fill) => updateLayer(selectedLayer.id, { fill }, true)}
                    allowTransparent={true}
                  />
                )}
              </div>
            ) : activeTool === 'scale' ? (
              <ScaleControls layerId={selectedLayer.id} />
            ) : activeTool === 'anchor' ? (
              <AnchorSelector layerId={selectedLayer.id} />
            ) : activeTool === 'move' ? (
              <MovementControls />
            ) : activeTool === 'template' ? (
              <TemplateLayerSection layer={selectedLayer} />
            ) : activeTool === 'arrange' ? (
              <ArrangeControls />
            ) : null}
          </div>
        </aside>
      )}

      {/* Right Side Properties Tool Rail (Desktop) */}
      <nav className="w-16 h-full bg-white border-l border-slate-200 flex flex-col items-center py-3 gap-1.5 shrink-0 z-20 overflow-y-auto">
        {railItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            const isActive = isDrawerOpen && activeTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleRailIconClick(item.id)}
                title={item.label}
                className={`w-12 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] leading-none">{item.label}</span>
              </button>
            );
          })}
      </nav>
    </div>
  );
}
