'use client';

import React, { useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  Type, 
  ArrowUpDown, 
  Palette, 
  Bold, 
  MoveHorizontal, 
  RotateCw, 
  Sparkles, 
  Layers, 
  Lock, 
  Unlock, 
  Trash2, 
  Upload, 
  Maximize, 
  Square, 
  Eye, 
  PenLine,
  X,
  Sparkle,
  Move,
  Crosshair,
  Maximize2,
} from 'lucide-react';

export default function MobileSecondRail() {
  const {
    selectedLayerIds,
    layers,
    addLayer,
    toggleLock,
    deleteSelectedLayers,
    isMobileTextTemplatesOpen,
    setIsMobileTextTemplatesOpen,
    activeMobileProperty,
    setActiveMobileProperty,
    width,
    height,
    updateLayer,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLayerSelected = selectedLayerIds.length > 0;
  const primaryLayer = isLayerSelected ? layers.find((l) => l.id === selectedLayerIds[0]) : null;

  // 1. If NO layer is selected and text templates NOT open -> HIDDEN
  if (!isLayerSelected && !isMobileTextTemplatesOpen) {
    return null;
  }

  // Quick Action to Add Text Templates
  const handleAddHeading = () => {
    addLayer({
      name: 'Heading',
      type: 'text',
      text: 'Add a Heading',
      fontSize: 64,
      fontWeight: 'bold',
      fontFamily: 'Inter',
      color: '#0F172A',
      width: Math.min(600, Math.round(width * 0.8)),
      x: Math.round(width / 2 - Math.min(600, Math.round(width * 0.8)) / 2),
      y: Math.round(height * 0.3),
      textAlign: 'center',
    });
    setIsMobileTextTemplatesOpen(false);
  };

  const handleAddSubheading = () => {
    addLayer({
      name: 'Subheading',
      type: 'text',
      text: 'Add a Subheading',
      fontSize: 32,
      fontWeight: '600',
      fontFamily: 'Inter',
      color: '#334155',
      width: Math.min(500, Math.round(width * 0.7)),
      x: Math.round(width / 2 - Math.min(500, Math.round(width * 0.7)) / 2),
      y: Math.round(height * 0.4),
      textAlign: 'center',
    });
    setIsMobileTextTemplatesOpen(false);
  };

  const handleAddBody = () => {
    addLayer({
      name: 'Body Text',
      type: 'text',
      text: 'Add body text with detailed description for your poster design.',
      fontSize: 20,
      fontWeight: 'normal',
      fontFamily: 'Inter',
      color: '#64748B',
      width: Math.min(450, Math.round(width * 0.65)),
      x: Math.round(width / 2 - Math.min(450, Math.round(width * 0.65)) / 2),
      y: Math.round(height * 0.5),
      textAlign: 'center',
    });
    setIsMobileTextTemplatesOpen(false);
  };

  const toggleProperty = (prop: string) => {
    if (activeMobileProperty === prop) {
      setActiveMobileProperty(null);
    } else {
      setActiveMobileProperty(prop);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && primaryLayer && primaryLayer.type === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateLayer(primaryLayer.id, { src: event.target?.result as string }, true);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Case: NO LAYER SELECTED, BUT CLICKED ON TEXT TOOL -> SHOW TEXT TEMPLATES HORIZONTAL SCROLLABLE
  if (!isLayerSelected && isMobileTextTemplatesOpen) {
    return (
      <div className="md:hidden fixed bottom-14 left-0 right-0 h-13 bg-white border-t border-slate-200 z-40 shadow-sm flex items-center px-2.5 gap-2 select-none overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-2 duration-150">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md shrink-0">
          Text
        </span>

        {/* H1 Heading Chip */}
        <button
          onClick={handleAddHeading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all active:scale-95"
        >
          <span className="text-xs font-bold text-purple-600 font-mono">H1</span>
          <span className="text-xs font-extrabold text-slate-800 tracking-tight font-sans">
            Heading
          </span>
        </button>

        {/* H2 Subheading Chip */}
        <button
          onClick={handleAddSubheading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all active:scale-95"
        >
          <span className="text-xs font-semibold text-purple-600 font-mono">H2</span>
          <span className="text-xs font-semibold text-slate-700 font-sans">
            Subheading
          </span>
        </button>

        {/* P Body Chip */}
        <button
          onClick={handleAddBody}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all active:scale-95"
        >
          <span className="text-xs font-medium text-slate-500 font-mono">P</span>
          <span className="text-xs font-normal text-slate-600 font-sans">
            Body text
          </span>
        </button>

        <div className="h-5 w-[1px] bg-slate-200 shrink-0 mx-0.5" />

        {/* PRESETS BUTTON -> Toggles 3rd layer with curated font combinations */}
        <button
          onClick={() => toggleProperty('text-presets')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            activeMobileProperty === 'text-presets'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200 hover:bg-purple-100'
          }`}
        >
          <Sparkle className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
          <span>PRESETS</span>
        </button>

        <div className="flex-1" />

        {/* Close Text Rail Button */}
        <button
          onClick={() => setIsMobileTextTemplatesOpen(false)}
          className="shrink-0 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 3. Case: A LAYER IS SELECTED -> SHOW PROPERTIES IN RAIL (ICONS ONLY on click each icon show 3rd layer)
  if (!primaryLayer) return null;

  const isLocked = !!primaryLayer.locked;
  const isDeletable = primaryLayer.deletable !== false;

  return (
    <div className="md:hidden fixed bottom-14 left-0 right-0 h-13 bg-white border-t border-slate-200 z-40 shadow-sm flex items-center px-2 select-none overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-2 duration-150">
      {/* Hidden File Input for Replace Image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-1 shrink-0 pr-2">
        {/* TEXT LAYER PROPERTY ICONS */}
        {primaryLayer.type === 'text' && (
          <>
            {/* Edit Content */}
            <button
              onClick={() => toggleProperty('edit')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'edit'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Edit Content"
            >
              <PenLine className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Edit</span>
            </button>

            {/* Font Family */}
            <button
              onClick={() => toggleProperty('font')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'font'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Font Family"
            >
              <Type className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Font</span>
            </button>

            {/* Font Size */}
            <button
              onClick={() => toggleProperty('size')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'size'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Font Size"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Size</span>
            </button>

            {/* Color */}
            <button
              onClick={() => toggleProperty('color')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'color'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Color"
            >
              <div className="relative">
                <Palette className="w-4 h-4" />
                <span 
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                  style={{ backgroundColor: (primaryLayer as any).color || '#000000' }}
                />
              </div>
              <span className="text-[9px] mt-0.5 leading-none">Color</span>
            </button>

            {/* Format (Bold, Italic, Align) */}
            <button
              onClick={() => toggleProperty('format')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'format'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Format"
            >
              <Bold className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Format</span>
            </button>

            {/* Spacing */}
            <button
              onClick={() => toggleProperty('spacing')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'spacing'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Spacing"
            >
              <MoveHorizontal className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Spacing</span>
            </button>

            {/* Rotation */}
            <button
              onClick={() => toggleProperty('rotate')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'rotate'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Rotate</span>
            </button>

            {/* Effects / Shadow */}
            <button
              onClick={() => toggleProperty('effects')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'effects'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Effects"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Effects</span>
            </button>

            {/* Move & Nudge Position */}
            <button
              onClick={() => toggleProperty('move')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'move'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Move & Nudge"
            >
              <Move className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Move</span>
            </button>
          </>
        )}

        {/* IMAGE LAYER PROPERTY ICONS */}
        {primaryLayer.type === 'image' && (
          <>
            {/* Replace Image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl flex flex-col items-center justify-center text-slate-600 hover:bg-slate-100 transition-all"
              title="Replace Image"
            >
              <Upload className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Replace</span>
            </button>

            {/* Size & Dimensions */}
            <button
              onClick={() => toggleProperty('size')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'size'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Dimensions & Size"
            >
              <Maximize className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Size</span>
            </button>

            {/* Rotation */}
            <button
              onClick={() => toggleProperty('rotate')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'rotate'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Rotate</span>
            </button>

            {/* Corner Radius */}
            <button
              onClick={() => toggleProperty('radius')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'radius'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Corner Radius"
            >
              <Square className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Radius</span>
            </button>

            {/* Opacity */}
            <button
              onClick={() => toggleProperty('opacity')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'opacity'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Opacity"
            >
              <Eye className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Opacity</span>
            </button>

            {/* Move & Nudge Position */}
            <button
              onClick={() => toggleProperty('move')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'move'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Move & Nudge"
            >
              <Move className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Move</span>
            </button>
          </>
        )}

        {/* SHAPE LAYER PROPERTY ICONS */}
        {['rect', 'circle', 'star', 'line', 'polygon', 'badge', 'icon'].includes(primaryLayer.type) && (
          <>
            {/* Fill Color */}
            <button
              onClick={() => toggleProperty('color')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'color'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Fill Color"
            >
              <div className="relative">
                <Palette className="w-4 h-4" />
                <span 
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                  style={{ backgroundColor: (primaryLayer as any).fill || '#7C3AED' }}
                />
              </div>
              <span className="text-[9px] mt-0.5 leading-none">Fill</span>
            </button>

            {/* Border / Stroke */}
            <button
              onClick={() => toggleProperty('border')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'border'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Border & Stroke"
            >
              <Square className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Border</span>
            </button>

            {/* Size */}
            <button
              onClick={() => toggleProperty('size')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'size'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Dimensions & Size"
            >
              <Maximize className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Size</span>
            </button>

            {/* Rotation */}
            <button
              onClick={() => toggleProperty('rotate')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'rotate'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Rotate</span>
            </button>

            {/* Radius (for rect) */}
            {primaryLayer.type === 'rect' && (
              <button
                onClick={() => toggleProperty('radius')}
                className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                  activeMobileProperty === 'radius'
                    ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Corner Radius"
              >
                <Square className="w-4 h-4" />
                <span className="text-[9px] mt-0.5 leading-none">Radius</span>
              </button>
            )}

            {/* Opacity */}
            <button
              onClick={() => toggleProperty('opacity')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'opacity'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Opacity"
            >
              <Eye className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Opacity</span>
            </button>

            {/* Move & Nudge Position */}
            <button
              onClick={() => toggleProperty('move')}
              className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                activeMobileProperty === 'move'
                  ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Move & Nudge"
            >
              <Move className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Move</span>
            </button>
          </>
        )}

        <div className="h-6 w-[1px] bg-slate-200 shrink-0 mx-1" />

        {/* SCALE X & Y */}
        <button
          onClick={() => toggleProperty('scale')}
          className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeMobileProperty === 'scale'
              ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Scale X & Y"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 leading-none">Scale</span>
        </button>

        {/* ANCHOR POINT */}
        <button
          onClick={() => toggleProperty('anchor')}
          className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeMobileProperty === 'anchor'
              ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Anchor Point"
        >
          <Crosshair className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 leading-none">Anchor</span>
        </button>

        {/* LAYERS & POSITION (Shows layer order, duplicate, lock options in 3rd layer) */}
        <button
          onClick={() => toggleProperty('layers')}
          className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
            activeMobileProperty === 'layers'
              ? 'bg-purple-100 text-purple-700 shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Layer Position & Options"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 leading-none">Layers</span>
        </button>

        {/* DIRECT LOCK TOGGLE */}
        <button
          onClick={() => toggleLock(primaryLayer.id)}
          className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
            isLocked ? 'text-amber-600 bg-amber-50' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title={isLocked ? 'Unlock Layer' : 'Lock Layer'}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span className="text-[9px] mt-0.5 leading-none">{isLocked ? 'Locked' : 'Lock'}</span>
        </button>

        {/* DIRECT DELETE */}
        <button
          onClick={deleteSelectedLayers}
          disabled={!isDeletable}
          className="p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30 rounded-xl flex flex-col items-center justify-center transition-all"
          title="Delete Layer"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 leading-none">Delete</span>
        </button>
      </div>
    </div>
  );
}
