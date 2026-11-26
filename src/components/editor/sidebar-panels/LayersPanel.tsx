'use client';

import React, { useState, useRef } from 'react';
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
  GripVertical,
  ShieldCheck,
  Edit2,
  Folder,
  FolderPlus,
  FolderMinus,
  PackagePlus,
  PackageCheck,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { CanvasLayer, GroupLayer } from '@/types/editor';

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
    groupSelectedLayers,
    ungroupLayer,
    exportComponentFile,
    importComponentFile,
  } = useEditorStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const componentInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportComponent = (targetIds?: string[], customName?: string) => {
    const comp = exportComponentFile(targetIds, customName);
    if (!comp) return;
    const json = JSON.stringify(comp, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = comp.name.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
    link.download = `${safeName}.dzc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportComponent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed && Array.isArray(parsed.layers)) {
          importComponentFile(parsed);
        } else {
          alert('Invalid component file. Please select a valid .dzc file.');
        }
      } catch {
        alert('Could not read .dzc component file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Collect all layer IDs that belong to a group so they stay nested inside their group
  const groupedChildIds = new Set<string>();
  layers.forEach((l) => {
    if (l.type === 'group' && Array.isArray((l as GroupLayer).layerIds)) {
      (l as GroupLayer).layerIds.forEach((cid) => groupedChildIds.add(cid));
    }
  });

  // Layers are ordered bottom to top in state, display top to bottom in UI (excluding grouped children at top level)
  const displayLayers = [...layers].reverse().filter((l) => !groupedChildIds.has(l.id));

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
      case 'group':
        return <Folder className="w-4 h-4 text-indigo-600 shrink-0" />;
      default:
        return <LayersIcon className="w-4 h-4 text-purple-500 shrink-0" />;
    }
  };

  const selectedLayer = layers.find((l) => selectedLayerIds.includes(l.id));
  const isGroupSelected = selectedLayerIds.length === 1 && selectedLayer?.type === 'group';

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between gap-2 pr-6">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Layers
        </h3>

        <div className="flex items-center gap-1 flex-wrap justify-end">
          <input
            ref={componentInputRef}
            type="file"
            accept=".dzc,.json"
            className="hidden"
            onChange={handleImportComponent}
          />
          <button
            onClick={() => componentInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-lg text-[10px] font-bold transition-colors"
            title="Import reusable .dzc component"
          >
            <PackagePlus className="w-3.5 h-3.5 text-purple-600" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setMultiSelectMode((m) => !m)}
            className={`flex items-center gap-1 px-2 py-1 border rounded-lg text-[10px] font-bold transition-colors ${
              multiSelectMode
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border-slate-200'
            }`}
            title="Toggle Multi-Select Mode (or long-press a layer on mobile)"
          >
            <span>{multiSelectMode ? 'Multi: ON' : 'Multi-Select'}</span>
          </button>

          {selectedLayerIds.length >= 2 && (
            <button
              onClick={() => groupSelectedLayers()}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors"
              title="Group Selected Layers"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Group</span>
            </button>
          )}
          {isGroupSelected && (
            <button
              onClick={() => ungroupLayer(selectedLayer.id)}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors"
              title="Ungroup Layers"
            >
              <FolderMinus className="w-3.5 h-3.5" />
              <span>Ungroup</span>
            </button>
          )}
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
        {displayLayers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No layers on canvas. Add text, shapes, or images to get started.
          </div>
        ) : (
          displayLayers.map((layer) => {
            const renderRow = (item: CanvasLayer, isChild = false) => {
              const isSelected = selectedLayerIds.includes(item.id);
              const isEditing = editingId === item.id;
              const isProtected = item.deletable === false;
              const isGroup = item.type === 'group';
              const isExpanded = isGroup && Boolean(expandedGroups[item.id]);
              const childIds = isGroup ? (item as GroupLayer).layerIds || [] : [];

              return (
                <div
                  key={item.id}
                  draggable={!isEditing && !isChild}
                  onDragStart={(e) => {
                    if (isChild) return;
                    setDraggedLayerId(item.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', item.id);
                  }}
                  onDragOver={(e) => {
                    if (isChild) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (draggedLayerId && draggedLayerId !== item.id) {
                      setDragOverId(item.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverId === item.id) setDragOverId(null);
                  }}
                  onDrop={(e) => {
                    if (isChild) return;
                    e.preventDefault();
                    const sourceId = draggedLayerId || e.dataTransfer.getData('text/plain');
                    if (sourceId && sourceId !== item.id) {
                      const targetStoreIndex = layers.findIndex((l) => l.id === item.id);
                      if (targetStoreIndex !== -1) {
                        moveLayerToIndex(sourceId, targetStoreIndex);
                      }
                    }
                    setDraggedLayerId(null);
                    setDragOverId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedLayerId(null);
                    setDragOverId(null);
                  }}
                  onPointerDown={() => {
                    if (item.selectable === false) return;
                    longPressTimerRef.current = setTimeout(() => {
                      setMultiSelectMode(true);
                      toggleSelection(item.id, true);
                      longPressTimerRef.current = null;
                    }, 450);
                  }}
                  onPointerUp={() => {
                    if (longPressTimerRef.current) {
                      clearTimeout(longPressTimerRef.current);
                      longPressTimerRef.current = null;
                    }
                  }}
                  onPointerLeave={() => {
                    if (longPressTimerRef.current) {
                      clearTimeout(longPressTimerRef.current);
                      longPressTimerRef.current = null;
                    }
                  }}
                  onClick={(e) => {
                    if (item.selectable !== false) {
                      toggleSelection(item.id, multiSelectMode || e.shiftKey || e.ctrlKey || e.metaKey);
                    }
                  }}
                  className={`group px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    isChild ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                  } ${
                    dragOverId === item.id
                      ? 'border-purple-600 bg-purple-100/70 ring-2 ring-purple-300'
                      : isSelected
                      ? 'bg-purple-50/90 border-purple-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  } ${draggedLayerId === item.id ? 'opacity-50' : ''} ${
                    item.visible === false ? 'opacity-55' : ''
                  }`}
                >
                  {/* Left: Expand Chevron (for groups), Drag Handle, Type Icon & Editable Layer Name */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {isGroup ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedGroups((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }));
                        }}
                        title={isExpanded ? 'Collapse Group' : 'Expand Group'}
                        className="p-0.5 rounded text-slate-400 hover:text-purple-700 hover:bg-purple-100 shrink-0 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : !isChild ? (
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                    ) : null}

                    {getLayerIcon(item)}

                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (editingName.trim()) {
                            renameLayer(item.id, editingName.trim());
                          }
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingName.trim()) {
                              renameLayer(item.id, editingName.trim());
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
                          {item.name}
                        </span>
                        {isGroup && (
                          <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full shrink-0">
                            {childIds.length}
                          </span>
                        )}
                        {item.isTemplate && (
                          <span
                            className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded shrink-0"
                            title={`Template Variable: ${item.templateId || item.id}`}
                          >
                            {'{'}T{'}'}
                          </span>
                        )}
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
                </div>
              );
            };

            const isGroup = layer.type === 'group';
            const isExpanded = isGroup && Boolean(expandedGroups[layer.id]);
            const childLayers = isGroup
              ? [...layers]
                  .reverse()
                  .filter((c) => ((layer as GroupLayer).layerIds || []).includes(c.id))
              : [];

            return (
              <div key={layer.id} className="space-y-1">
                {renderRow(layer, false)}
                {isGroup && isExpanded && childLayers.length > 0 && (
                  <div className="ml-4 pl-2 border-l-2 border-purple-200 space-y-1">
                    {childLayers.map((child) => renderRow(child, true))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Action Rail */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-around gap-1 shrink-0">
        <button
          type="button"
          disabled={!selectedLayer}
          onClick={() => selectedLayer && toggleLock(selectedLayer.id)}
          title={selectedLayer?.locked ? 'Unlock Layer' : 'Lock Layer'}
          className={`p-2 rounded-xl border transition-colors disabled:opacity-35 ${
            selectedLayer?.locked
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700'
          }`}
        >
          {selectedLayer?.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        <button
          type="button"
          disabled={!selectedLayer}
          onClick={() => selectedLayer && duplicateLayer(selectedLayer.id)}
          title="Duplicate Layer"
          className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 transition-colors disabled:opacity-35"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={!selectedLayer}
          onClick={() => selectedLayer && toggleVisibility(selectedLayer.id)}
          title={selectedLayer?.visible === false ? 'Show Layer' : 'Hide Layer'}
          className={`p-2 rounded-xl border transition-colors disabled:opacity-35 ${
            selectedLayer?.visible === false
              ? 'bg-slate-200 text-slate-500 border-slate-300'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700'
          }`}
        >
          {selectedLayer?.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        <button
          type="button"
          disabled={!selectedLayer}
          onClick={() => {
            if (selectedLayer) {
              setEditingId(selectedLayer.id);
              setEditingName(selectedLayer.name);
            }
          }}
          title="Rename Layer"
          className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 transition-colors disabled:opacity-35"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={selectedLayerIds.length === 0}
          onClick={() => handleExportComponent()}
          title="Export as .dzc Component"
          className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 transition-colors disabled:opacity-35"
        >
          <PackageCheck className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={!selectedLayer || selectedLayer.deletable === false}
          onClick={() => selectedLayer && deleteLayer(selectedLayer.id)}
          title="Delete Layer"
          className="p-2 rounded-xl bg-slate-50 text-rose-600 border border-slate-200 hover:bg-rose-50 transition-colors disabled:opacity-35"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
