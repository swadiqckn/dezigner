'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal() {
  const { isShortcutsModalOpen, setIsShortcutsModalOpen } = useEditorStore();

  if (!isShortcutsModalOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Z / ⌘Z', desc: 'Undo last canvas action' },
    { key: 'Ctrl + Y / ⌘⇧Z', desc: 'Redo previously undone action' },
    { key: 'Ctrl + C / ⌘C', desc: 'Copy selected canvas layer(s)' },
    { key: 'Ctrl + V / ⌘V', desc: 'Paste copied layer(s) with offset' },
    { key: 'Ctrl + A / ⌘A', desc: 'Select all selectable layers' },
    { key: 'Delete / Backspace', desc: 'Delete selected layer (if not locked by ERP)' },
    { key: 'Arrow Keys (↑ ↓ ← →)', desc: 'Nudge selected layer by 1 pixel' },
    { key: 'Shift + Arrow Keys', desc: 'Nudge selected layer by 10 pixels' },
    { key: 'Space + Drag / Middle Mouse', desc: 'Pan canvas workspace smoothly' },
    { key: 'Ctrl + Mouse Wheel', desc: 'Zoom in and out dynamically' },
    { key: 'Double Click on Text', desc: 'Edit text content directly inline' },
    { key: 'Shift + Click', desc: 'Multi-select multiple layers' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-500">Fast workflow shortcuts</p>
            </div>
          </div>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <span className="text-slate-600">{sc.desc}</span>
              <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-800 shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
