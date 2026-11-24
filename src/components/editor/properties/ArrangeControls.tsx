'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function ArrangeControls() {
  const {
    selectedLayerIds,
    layers,
    alignSelected,
    reorderLayer,
    duplicateSelected,
    deleteSelectedLayers,
    toggleLock,
    toggleVisibility,
  } = useEditorStore();

  if (selectedLayerIds.length === 0) return null;

  const primaryLayerId = selectedLayerIds[0];
  const primaryLayer = layers.find((l) => l.id === primaryLayerId);
  const isLocked = primaryLayer?.locked ?? false;
  const isDeletable = primaryLayer?.deletable !== false;
  const isVisible = primaryLayer?.visible !== false;

  return (
    <div className="space-y-4 pt-2 border-t border-slate-200">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Align To Canvas
        </label>
        <div className="grid grid-cols-6 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => alignSelected('left')}
            title="Align Left"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-purple-600 rounded-lg transition-colors flex justify-center"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignSelected('center')}
            title="Align Horizontal Center"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-purple-600 rounded-lg transition-colors flex justify-center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignSelected('right')}
            title="Align Right"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-purple-600 rounded-lg transition-colors flex justify-center"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignSelected('top')}
            title="Align Top"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-purple-600 rounded-lg transition-colors flex justify-center"
          >
            <AlignVerticalJustifyStart className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignSelected('middle')}
            title="Align Vertical Middle"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-purple-600 rounded-lg transition-colors flex justify-center"
          >
            <AlignVerticalJustifyCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignSelected('bottom')}
            title="Align Bottom"
            className="p-1.5 hover:bg-white text-slate-600 hover:text-purple-600 rounded-lg transition-colors flex justify-center"
          >
            <AlignVerticalJustifyEnd className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Layer Order
        </label>
        <div className="grid grid-cols-4 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs text-slate-600">
          <button
            onClick={() => reorderLayer(primaryLayerId, 'forward')}
            title="Bring Forward"
            className="p-1.5 hover:bg-white hover:text-purple-600 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="text-[11px]">Up</span>
          </button>
          <button
            onClick={() => reorderLayer(primaryLayerId, 'backward')}
            title="Send Backward"
            className="p-1.5 hover:bg-white hover:text-purple-600 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="text-[11px]">Down</span>
          </button>
          <button
            onClick={() => reorderLayer(primaryLayerId, 'front')}
            title="Bring To Front"
            className="p-1.5 hover:bg-white hover:text-purple-600 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
            <span className="text-[11px]">Front</span>
          </button>
          <button
            onClick={() => reorderLayer(primaryLayerId, 'back')}
            title="Send To Back"
            className="p-1.5 hover:bg-white hover:text-purple-600 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            <span className="text-[11px]">Back</span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Quick Actions
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleLock(primaryLayerId)}
            className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              isLocked
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isLocked ? 'Locked' : 'Lock'}</span>
          </button>

          <button
            onClick={() => toggleVisibility(primaryLayerId)}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors"
            title={isVisible ? 'Hide Layer' : 'Show Layer'}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={duplicateSelected}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors"
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={deleteSelectedLayers}
            disabled={!isDeletable}
            className={`p-2 rounded-xl border transition-colors ${
              isDeletable
                ? 'bg-white hover:bg-rose-50 text-rose-600 border-slate-200 hover:border-rose-200'
                : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
            }`}
            title={isDeletable ? 'Delete Layer' : 'Protected by ERP (Non-deletable)'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
