'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { POPULAR_FONTS, FONT_PAIRINGS } from '@/constants/fonts';
import ColorPickerSection from '../properties/ColorPickerSection';
import MovementControls from '../properties/MovementControls';
import { 
  X, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  ArrowUpToLine, 
  ArrowUp, 
  ArrowDown, 
  ArrowDownToLine, 
  Copy, 
  Lock, 
  Unlock, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TextLayer, ImageLayer, ShapeLayer } from '@/types/editor';

export default function MobileThirdLayerSheet() {
  const {
    activeMobileProperty,
    setActiveMobileProperty,
    selectedLayerIds,
    layers,
    updateLayer,
    addLayer,
    reorderLayer,
    duplicateSelected,
    deleteSelectedLayers,
    toggleLock,
    width,
    height,
  } = useEditorStore();

  const [isExpanded, setIsExpanded] = useState(false);

  // If no property is active, don't show third layer
  if (!activeMobileProperty) return null;

  const isLayerSelected = selectedLayerIds.length > 0;
  const layer = isLayerSelected ? layers.find((l) => l.id === selectedLayerIds[0]) : null;

  const handleClose = () => {
    setActiveMobileProperty(null);
    setIsExpanded(false);
  };

  const handleUpdate = (updates: any) => {
    if (layer) {
      updateLayer(layer.id, updates, true);
    }
  };

  // Add Font Pairing Template
  const handleAddFontPairing = (pairing: typeof FONT_PAIRINGS[0]) => {
    // Add Heading
    addLayer({
      name: `${pairing.name} Heading`,
      type: 'text',
      text: pairing.heading.text,
      fontSize: pairing.heading.fontSize || 54,
      fontWeight: pairing.heading.fontWeight || 'bold',
      fontFamily: pairing.heading.family,
      color: '#0F172A',
      width: Math.min(650, Math.round(width * 0.85)),
      x: Math.round(width / 2 - Math.min(650, Math.round(width * 0.85)) / 2),
      y: Math.round(height * 0.35),
      textAlign: 'center',
    });

    // Add Subtitle
    addLayer({
      name: `${pairing.name} Subtitle`,
      type: 'text',
      text: pairing.subheading.text,
      fontSize: pairing.subheading.fontSize || 24,
      fontWeight: pairing.subheading.fontWeight || 'normal',
      fontFamily: pairing.subheading.family,
      color: '#475569',
      width: Math.min(500, Math.round(width * 0.7)),
      x: Math.round(width / 2 - Math.min(500, Math.round(width * 0.7)) / 2),
      y: Math.round(height * 0.35 + 80),
      textAlign: 'center',
    });

    handleClose();
  };

  // Property Title Mapping
  const getTitle = () => {
    switch (activeMobileProperty) {
      case 'text-presets':
        return 'Curated Font Combinations';
      case 'edit':
        return 'Edit Text Content';
      case 'font':
        return 'Font Family';
      case 'size':
        return 'Size & Dimensions';
      case 'color':
        return 'Color';
      case 'format':
        return 'Style & Alignment';
      case 'spacing':
        return 'Spacing & Line Height';
      case 'rotate':
        return 'Rotation';
      case 'effects':
        return 'Shadow & Effects';
      case 'move':
        return 'Move & Nudge Position';
      case 'radius':
        return 'Corner Radius';
      case 'opacity':
        return 'Opacity';
      case 'border':
        return 'Border & Stroke';
      case 'layers':
        return 'Layer Position & Options';
      default:
        return 'Property Controls';
    }
  };

  return (
    // Third Layer: Anchored right above the Second Rail
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end pointer-events-none">
      {/* Non-blur backdrop to dismiss when tapping canvas */}
      <div 
        className="absolute inset-0 bg-black/10 pointer-events-auto"
        onClick={handleClose}
      />

      <div 
        className={`w-full bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden pointer-events-auto transition-all duration-200 z-10 ${
          isExpanded ? 'h-[75vh]' : 'h-[44vh]'
        }`}
        style={{ marginBottom: '56px' }} // Sits cleanly above the Second Rail (56px) + Bottom Nav
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white select-none">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {getTitle()}
            </span>
            <span className="text-[10px] text-slate-400">
              ({isExpanded ? 'Minimize' : 'Expand'})
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Third Layer Content Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* 1. TEXT PRESETS (Font Combinations) */}
          {activeMobileProperty === 'text-presets' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 mb-2">
                Tap any curated font pairing to add matching headline & subtitle to your poster:
              </p>
              <div className="space-y-2.5">
                {FONT_PAIRINGS.map((pairing) => (
                  <button
                    key={pairing.name}
                    onClick={() => handleAddFontPairing(pairing)}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all active:scale-[0.99] flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                        {pairing.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {pairing.heading.family} + {pairing.subheading.family}
                      </span>
                    </div>
                    <div 
                      className="text-base font-extrabold text-slate-900 mt-1 truncate"
                      style={{ fontFamily: pairing.heading.family }}
                    >
                      {pairing.heading.text}
                    </div>
                    <div 
                      className="text-xs text-slate-600 truncate"
                      style={{ fontFamily: pairing.subheading.family }}
                    >
                      {pairing.subheading.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. EDIT TEXT CONTENT */}
          {activeMobileProperty === 'edit' && layer && layer.type === 'text' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Text Content
              </label>
              <textarea
                rows={4}
                value={(layer as TextLayer).text}
                disabled={layer.editable === false}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="w-full text-xs font-semibold text-slate-900 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none resize-none"
                placeholder="Enter text..."
              />
            </div>
          )}

          {/* 3. FONT FAMILY */}
          {activeMobileProperty === 'font' && layer && layer.type === 'text' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Select Font Family
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {POPULAR_FONTS.map((font) => {
                  const isSelected = (layer as TextLayer).fontFamily === font.family;
                  return (
                    <button
                      key={font.name}
                      onClick={() => handleUpdate({ fontFamily: font.family })}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-purple-50 text-purple-800 border-purple-300 font-bold'
                          : 'bg-slate-50/60 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span className="text-xs" style={{ fontFamily: font.family }}>
                        {font.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {font.sample}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. SIZE & DIMENSIONS */}
          {activeMobileProperty === 'size' && layer && (
            <div className="space-y-4">
              {layer.type === 'text' ? (
                <div className="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Font Size (px)</label>
                    <input
                      type="number"
                      min={8}
                      max={300}
                      value={(layer as TextLayer).fontSize}
                      onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) || 12 })}
                      className="w-16 text-xs font-bold text-slate-900 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={1}
                    value={(layer as TextLayer).fontSize}
                    onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) || 12 })}
                    className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  {/* Quick Preset Buttons */}
                  <div className="flex gap-1.5 pt-1">
                    {[16, 24, 32, 48, 64, 80].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleUpdate({ fontSize: s })}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                          (layer as TextLayer).fontSize === s
                            ? 'bg-purple-100 text-purple-700 border-purple-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Size Scale</label>
                    <span className="text-xs font-mono font-bold text-slate-800">{layer.width}px</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={1200}
                    step={5}
                    value={layer.width}
                    onChange={(e) => {
                      const newW = Number(e.target.value);
                      const ratio = (layer.height && layer.width) ? layer.width / layer.height : 1;
                      handleUpdate({ width: newW, height: Math.round(newW / ratio) });
                    }}
                    className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Width</span>
                      <input
                        type="number"
                        value={layer.width}
                        onChange={(e) => handleUpdate({ width: Number(e.target.value) || 20 })}
                        className="w-full text-xs font-semibold text-slate-900 p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Height</span>
                      <input
                        type="number"
                        value={layer.height || 50}
                        onChange={(e) => handleUpdate({ height: Number(e.target.value) || 20 })}
                        className="w-full text-xs font-semibold text-slate-900 p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. COLOR */}
          {activeMobileProperty === 'color' && layer && (
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
              {layer.type === 'text' ? (
                <ColorPickerSection
                  label="Text Color"
                  value={(layer as TextLayer).color || '#000000'}
                  onChange={(color) => handleUpdate({ color })}
                />
              ) : (
                <ColorPickerSection
                  label="Fill Color"
                  value={(layer as any).fill || '#7C3AED'}
                  onChange={(fill) => handleUpdate({ fill })}
                  allowTransparent={true}
                />
              )}
            </div>
          )}

          {/* 6. FORMAT (Style & Alignment) */}
          {activeMobileProperty === 'format' && layer && layer.type === 'text' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">Text Style</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      handleUpdate({
                        fontWeight:
                          (layer as TextLayer).fontWeight === 'bold' ||
                          (layer as TextLayer).fontWeight === '700'
                            ? 'normal'
                            : 'bold',
                      })
                    }
                    className={`flex-1 py-2 rounded-xl flex justify-center border transition-all ${
                      (layer as TextLayer).fontWeight === 'bold' ||
                      (layer as TextLayer).fontWeight === '700'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleUpdate({
                        fontStyle:
                          (layer as TextLayer).fontStyle === 'italic' ? 'normal' : 'italic',
                      })
                    }
                    className={`flex-1 py-2 rounded-xl flex justify-center border transition-all ${
                      (layer as TextLayer).fontStyle === 'italic'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleUpdate({
                        textDecoration:
                          (layer as TextLayer).textDecoration === 'underline'
                            ? 'none'
                            : 'underline',
                      })
                    }
                    className={`flex-1 py-2 rounded-xl flex justify-center border transition-all ${
                      (layer as TextLayer).textDecoration === 'underline'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const t = (layer as TextLayer).text;
                      handleUpdate({
                        text: t === t.toUpperCase() ? t.toLowerCase() : t.toUpperCase(),
                      });
                    }}
                    className="flex-1 py-2 rounded-xl flex justify-center bg-white text-slate-700 border border-slate-200 text-xs font-bold"
                  >
                    aA
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">Alignment</span>
                <div className="flex items-center gap-1.5">
                  {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => handleUpdate({ textAlign: align })}
                      className={`flex-1 py-2 rounded-xl flex justify-center border transition-all ${
                        (layer as TextLayer).textAlign === align
                          ? 'bg-purple-100 text-purple-700 border-purple-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-4 h-4" />}
                      {align === 'center' && <AlignCenter className="w-4 h-4" />}
                      {align === 'right' && <AlignRight className="w-4 h-4" />}
                      {align === 'justify' && <AlignJustify className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. SPACING */}
          {activeMobileProperty === 'spacing' && layer && layer.type === 'text' && (
            <div className="space-y-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-semibold">
                  <span>Letter Spacing</span>
                  <span className="font-mono">{(layer as TextLayer).letterSpacing || 0}px</span>
                </div>
                <input
                  type="range"
                  min={-4}
                  max={20}
                  step={1}
                  value={(layer as TextLayer).letterSpacing || 0}
                  onChange={(e) => handleUpdate({ letterSpacing: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-semibold">
                  <span>Line Height</span>
                  <span className="font-mono">{(layer as TextLayer).lineHeight || 1.2}</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={2.5}
                  step={0.05}
                  value={(layer as TextLayer).lineHeight || 1.2}
                  onChange={(e) => handleUpdate({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 8. ROTATION */}
          {activeMobileProperty === 'rotate' && layer && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Rotation Angle</label>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                  <span className="text-xs font-mono font-bold text-slate-900">{layer.rotation || 0}°</span>
                </div>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={layer.rotation || 0}
                onChange={(e) => handleUpdate({ rotation: Number(e.target.value) || 0 })}
                className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[-90, 0, 90, 180].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => handleUpdate({ rotation: deg })}
                    className={`py-1 text-xs font-semibold rounded-lg border transition-all ${
                      (layer.rotation || 0) === deg
                        ? 'bg-purple-100 text-purple-700 border-purple-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 9. CORNER RADIUS */}
          {activeMobileProperty === 'radius' && layer && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>Corner Radius</span>
                <span className="font-mono">{(layer as any).cornerRadius || 0}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                step={2}
                value={(layer as any).cornerRadius || 0}
                onChange={(e) => handleUpdate({ cornerRadius: Number(e.target.value) })}
                className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* 10. OPACITY */}
          {activeMobileProperty === 'opacity' && layer && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>Opacity</span>
                <span className="font-mono">{Math.round((layer.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={layer.opacity ?? 1}
                onChange={(e) => handleUpdate({ opacity: Number(e.target.value) })}
                className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* 11. BORDER / STROKE */}
          {activeMobileProperty === 'border' && layer && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <ColorPickerSection
                  label="Border / Stroke Color"
                  value={(layer as any).stroke || '#000000'}
                  onChange={(stroke) => handleUpdate({ stroke })}
                  allowTransparent={true}
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                  <span>Stroke Width</span>
                  <span className="font-mono">{(layer as any).strokeWidth || 0}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={(layer as any).strokeWidth || 0}
                  onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 12. EFFECTS / SHADOW */}
          {activeMobileProperty === 'effects' && layer && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <ColorPickerSection
                  label="Drop Shadow Color"
                  value={(layer as any).shadowColor || '#000000'}
                  onChange={(shadowColor) => handleUpdate({ shadowColor })}
                  allowTransparent={true}
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                    <span>Shadow Blur</span>
                    <span className="font-mono">{(layer as any).shadowBlur || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={(layer as any).shadowBlur || 0}
                    onChange={(e) => handleUpdate({ shadowBlur: Number(e.target.value) })}
                    className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                    <span>Shadow Offset</span>
                    <span className="font-mono">{(layer as any).shadowOffsetX || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    value={(layer as any).shadowOffsetX || 0}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleUpdate({ shadowOffsetX: v, shadowOffsetY: v });
                    }}
                    className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 13. LAYERS / POSITION & ORDERING */}
          {activeMobileProperty === 'layers' && layer && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Layer Ordering</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => reorderLayer(layer.id, 'front')}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowUpToLine className="w-4 h-4 text-purple-600" />
                    <span>Bring to Front</span>
                  </button>
                  <button
                    onClick={() => reorderLayer(layer.id, 'forward')}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4 text-purple-600" />
                    <span>Bring Forward</span>
                  </button>
                  <button
                    onClick={() => reorderLayer(layer.id, 'backward')}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4 text-purple-600" />
                    <span>Send Backward</span>
                  </button>
                  <button
                    onClick={() => reorderLayer(layer.id, 'back')}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowDownToLine className="w-4 h-4 text-purple-600" />
                    <span>Send to Back</span>
                  </button>
                </div>
              </div>

              {/* Layer Actions */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Actions</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      duplicateSelected();
                      handleClose();
                    }}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => toggleLock(layer.id)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-colors ${
                      layer.locked
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {layer.locked ? <Lock className="w-4 h-4 text-amber-600" /> : <Unlock className="w-4 h-4 text-slate-600" />}
                    <span>{layer.locked ? 'Unlock' : 'Lock'}</span>
                  </button>
                  <button
                    onClick={() => {
                      deleteSelectedLayers();
                      handleClose();
                    }}
                    disabled={layer.deletable === false}
                    className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-semibold text-rose-600 disabled:opacity-40 flex flex-col items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 14. MOVE / NUDGE POSITION */}
          {activeMobileProperty === 'move' && layer && (
            <div className="space-y-3">
              <MovementControls />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
