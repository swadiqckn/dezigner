'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CANVAS_PRESETS } from '@/constants/canvasPresets';
import {
  Undo2,
  Redo2,
  Download,
  Eye,
  Building2,
  Keyboard,
  Sparkles,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';

export default function EditorHeader() {
  const {
    title,
    setTitle,
    presetName,
    width,
    height,
    setCanvasSize,
    undo,
    redo,
    undoStack,
    redoStack,
    setIsExportModalOpen,
    setIsPreviewModalOpen,
    setIsErpModalOpen,
    setIsShortcutsModalOpen,
    erpMeta,
  } = useEditorStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-14 md:h-16 w-full bg-white border-b border-slate-200 px-3 md:px-4 flex items-center justify-between select-none shrink-0 z-30">
      {/* Left: Brand + Project Title + Undo/Redo */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs md:text-sm tracking-tight text-slate-900">
                POSTER<span className="text-purple-600">STUDIO</span>
              </span>
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-1 py-0.5 rounded">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Project Title (Desktop editable, truncated on mobile) */}
        <div className="hidden lg:flex items-center">
          <div className="h-6 w-[1px] bg-slate-200 mx-2" />
          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              className="text-xs font-semibold text-slate-800 bg-slate-100 border border-purple-500 rounded-lg px-2.5 py-1 outline-none w-56"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-semibold text-slate-700 hover:text-purple-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg px-2 py-1 transition-all max-w-[180px] truncate"
              title="Click to rename project"
            >
              {title || 'Untitled Poster'}
            </button>
          )}

          {erpMeta?.tenantName && (
            <span className="ml-2 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {erpMeta.tenantName}
            </span>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle: Canvas Dimensions Switcher */}
      <div className="relative">
        <button
          onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <span className="truncate max-w-[100px] sm:max-w-none">{presetName}</span>
          <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
            ({width} × {height})
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {sizeDropdownOpen && (
          <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-64 md:w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Select Poster Dimensions
            </div>
            <div className="space-y-1">
              {CANVAS_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setCanvasSize(p.width, p.height, p.name);
                    setSizeDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex flex-col transition-colors ${
                    presetName === p.name ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.width}×{p.height}
                    </span>
                  </div>
                  {p.description && (
                    <span className="text-[9px] text-slate-400 mt-0.5">
                      {p.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 md:gap-2.5">
        {/* Desktop ERP Hub Button */}
        <button
          onClick={() => setIsErpModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
          title="ERP Layer Injection Architecture & Simulator"
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>ERP Integration</span>
        </button>

        {/* Desktop Shortcuts */}
        <button
          onClick={() => setIsShortcutsModalOpen(true)}
          className="hidden md:block p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Desktop Preview */}
        <button
          onClick={() => setIsPreviewModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>

        {/* Mobile More Menu Toggle */}
        <div className="relative md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {mobileMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPreviewModalOpen(true);
                }}
                className="w-full text-left p-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Preview Mockup</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsErpModalOpen(true);
                }}
                className="w-full text-left p-2 rounded-xl text-xs font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>ERP Connect Hub</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsShortcutsModalOpen(true);
                }}
                className="w-full text-left p-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Keyboard className="w-4 h-4 text-slate-500" />
                <span>Shortcuts</span>
              </button>
            </div>
          )}
        </div>

        {/* High-Res Export Download Button */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
}
