'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  Sliders, 
  Trash2, 
  Copy, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Palette,
  Type,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function MobileContextToolbar() {
  const {
    selectedLayerIds,
    layers,
    deleteSelectedLayers,
    duplicateSelected,
    toggleLock,
    setIsPropertiesDrawerOpen,
    reorderLayer,
  } = useEditorStore();

  if (selectedLayerIds.length === 0) return null;

  const primaryLayerId = selectedLayerIds[0];
  const primaryLayer = layers.find((l) => l.id === primaryLayerId);
  const isLocked = primaryLayer?.locked ?? false;
  const isDeletable = primaryLayer?.deletable !== false;

  return (
    <div className="md:hidden fixed bottom-16 left-3 right-3 z-30 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-slate-200 flex items-center justify-between gap-1 select-none animate-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <span className="text-[11px] font-bold text-slate-800 truncate max-w-[100px]">
          {primaryLayer?.name}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setIsPropertiesDrawerOpen(true)}
          className="p-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
          title="Open Full Properties"
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[10px]">Edit</span>
        </button>

        <button
          onClick={() => reorderLayer(primaryLayerId, 'forward')}
          title="Bring Forward"
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        <button
          onClick={duplicateSelected}
          title="Duplicate"
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          onClick={() => toggleLock(primaryLayerId)}
          title={isLocked ? 'Unlock' : 'Lock'}
          className={`p-2 rounded-xl transition-colors ${
            isLocked ? 'text-amber-600 bg-amber-50' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        <button
          onClick={deleteSelectedLayers}
          disabled={!isDeletable}
          title="Delete"
          className="p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
