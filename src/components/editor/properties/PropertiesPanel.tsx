'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CanvasLayer, TextLayer } from '@/types/editor';
import CanvasProperties from './CanvasProperties';
import TransformLayoutSection from './TransformLayoutSection';
import PaintAppearanceSection from './PaintAppearanceSection';
import TextProperties from './TextProperties';
import TemplateLayerSection from './TemplateLayerSection';
import {
  SlidersHorizontal,
  Paintbrush,
  Type,
  Braces,
  X,
} from 'lucide-react';

type DesktopRailTab = 'transform' | 'paint' | 'text' | 'template';

export default function PropertiesPanel() {
  const { layers, selectedLayerIds, updateLayer, clearSelection } = useEditorStore();
  const [activeRail, setActiveRail] = useState<DesktopRailTab>('transform');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const selectedLayers = layers.filter((l) => selectedLayerIds.includes(l.id));
  const primaryLayer = selectedLayers[0];

  // Ensure activeRail is valid for the newly selected layer type
  useEffect(() => {
    if (!primaryLayer) return;
    if (activeRail === 'text' && primaryLayer.type !== 'text') {
      setActiveRail('transform');
    } else if (
      activeRail === 'template' &&
      primaryLayer.type !== 'text' &&
      primaryLayer.type !== 'image'
    ) {
      setActiveRail('transform');
    }
  }, [primaryLayer?.id, primaryLayer?.type, activeRail]);

  if (selectedLayers.length === 0) {
    return (
      <div className="flex h-full border-l border-slate-200 bg-white select-none">
        {isDrawerOpen && (
          <div className="w-80 h-full overflow-y-auto p-4 relative border-r border-slate-100">
            <button
              onClick={() => setIsDrawerOpen(false)}
              title="Collapse Canvas Properties"
              className="absolute top-3.5 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <CanvasProperties />
          </div>
        )}
        <div className="w-14 bg-white flex flex-col items-center py-3 space-y-2 shrink-0">
          <button
            onClick={() => setIsDrawerOpen((o) => !o)}
            title="Canvas Settings"
            aria-label="Canvas Settings"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              isDrawerOpen
                ? 'bg-purple-50 text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {isDrawerOpen && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-l-md" />
            )}
          </button>
        </div>
      </div>
    );
  }

  const handleLayerChange = (updates: Partial<CanvasLayer>) => {
    if (!primaryLayer) return;
    updateLayer(primaryLayer.id, updates, true);
  };

  const railItems: { id: DesktopRailTab; label: string; icon: React.ElementType }[] = [
    { id: 'transform', label: 'Transform & Layout', icon: SlidersHorizontal },
    { id: 'paint', label: 'Fill, Border & Shadow', icon: Paintbrush },
    ...(primaryLayer.type === 'text'
      ? [{ id: 'text' as const, label: 'Text & Typography', icon: Type }]
      : []),
    ...(primaryLayer.type === 'text' || primaryLayer.type === 'image'
      ? [{ id: 'template' as const, label: 'Template Variable', icon: Braces }]
      : []),
  ];

  const activeTitle =
    railItems.find((r) => r.id === activeRail)?.label || 'Properties';

  return (
    <div className="flex h-full border-l border-slate-200 bg-white select-none">
      {/* Properties Drawer Content */}
      {isDrawerOpen && (
        <div className="w-80 h-full flex flex-col border-r border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-900 truncate">
                {selectedLayers.length > 1
                  ? `${selectedLayers.length} Layers Selected`
                  : primaryLayer.name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">{activeTitle}</div>
            </div>
            <button
              onClick={() => clearSelection()}
              title="Deselect"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeRail === 'transform' && (
              <TransformLayoutSection layer={primaryLayer} onChange={handleLayerChange} />
            )}
            {activeRail === 'paint' && (
              <PaintAppearanceSection layer={primaryLayer} onChange={handleLayerChange} />
            )}
            {activeRail === 'text' && primaryLayer.type === 'text' && (
              <TextProperties
                layer={primaryLayer as TextLayer}
                onChange={(u) => handleLayerChange(u)}
              />
            )}
            {activeRail === 'template' &&
              (primaryLayer.type === 'text' || primaryLayer.type === 'image') && (
                <TemplateLayerSection layer={primaryLayer} />
              )}
          </div>
        </div>
      )}

      {/* Right Icon Rail (4 items max, tooltip-only, no bottom labels) */}
      <div className="w-14 bg-white flex flex-col items-center py-3 space-y-2 shrink-0">
        {railItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRail === item.id && isDrawerOpen;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (activeRail === item.id && isDrawerOpen) {
                  setIsDrawerOpen(false);
                } else {
                  setActiveRail(item.id);
                  setIsDrawerOpen(true);
                }
              }}
              title={item.label}
              aria-label={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                isActive
                  ? 'bg-purple-50 text-purple-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
              {isActive && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-l-md" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
