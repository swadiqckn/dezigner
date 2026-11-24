'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Star, 
  Minus, 
  Layers as LayersIcon,
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { CanvasLayer } from '@/types/editor';

export default function LayersPanel() {
  const {
    layers,
    selectedLayerIds,
    toggleSelection,
    toggleLock,
    toggleVisibility,
    reorderLayer,
    duplicateLayer,
    deleteLayer,
    renameLayer,
    moveLayerToIndex,
  } = useEditorStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Layers are ordered bottom to top in state, display top to bottom in UI
  const displayLayers = [...layers].reverse();

  const getLayerIcon = (layer: CanvasLayer) => {
    switch (layer.type) {
      case 'text':
        return <Type className="w-4 h-4 text-purple-600 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'rect':
        return <Square className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'circle':
        return <Circle className="w-4 h-4 text-pink-600 shrink-0" />;
      case 'star':
        return <Star className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'line':
        return <Minus className="w-4 h-4 text-slate-500 shrink-0" />;
      default:
        return <LayersIcon className="w-4 h-4 text-purple-500 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Layer Hierarchy
          </h3>
          <p className="text-[11px] text-slate-500">
            {layers.length} layers • Top layers render above bottom layers
          </p>
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
        {displayLayers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No layers on canvas. Add text, shapes, or images to get started.
          </div>
        ) : (
          displayLayers.map((layer, index) => {
            const isSelected = selectedLayerIds.includes(layer.id);
            const isEditing = editingId === layer.id;
            const isLocked = layer.locked ?? false;
            const isVisible = layer.visible !== false;
            const isProtected = layer.deletable === false;

            return (
              <div
                key={layer.id}
                onClick={() => {
                  if (layer.selectable !== false) {
                    toggleSelection(layer.id, false);
                  }
                }}
                className={`group px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50/90 border-purple-500 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                {/* Left: Type Icon & Editable Layer Name */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getLayerIcon(layer)}

                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => {
                        if (editingName.trim()) {
                          renameLayer(layer.id, editingName.trim());
                        }
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingName.trim()) {
                            renameLayer(layer.id, editingName.trim());
                          }
                          setEditingId(null);
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs p-1 bg-white border border-purple-500 rounded outline-none w-full"
                    />
                  ) : (
                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                      <span
                        className={`text-xs font-medium truncate ${
                          isSelected ? 'text-purple-950 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {layer.name}
                      </span>
                      {isProtected && (
                        <span
                          title="Protected ERP Layer (Non-deletable)"
                          className="shrink-0 text-indigo-600 bg-indigo-50 p-0.5 rounded"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Quick Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Reorder Buttons */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderLayer(layer.id, 'forward');
                      }}
                      title="Move Up"
                      className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderLayer(layer.id, 'backward');
                      }}
                      title="Move Down"
                      className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(layer.id);
                        setEditingName(layer.name);
                      }}
                      title="Rename Layer"
                      className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateLayer(layer.id);
                      }}
                      title="Duplicate"
                      className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Lock / Unlock */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(layer.id);
                    }}
                    title={isLocked ? 'Unlock Layer' : 'Lock Layer'}
                    className={`p-1 rounded transition-colors ${
                      isLocked ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Visibility */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(layer.id);
                    }}
                    title={isVisible ? 'Hide Layer' : 'Show Layer'}
                    className={`p-1 rounded transition-colors ${
                      !isVisible ? 'text-slate-300' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete */}
                  {layer.deletable !== false && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                      title="Delete Layer"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
