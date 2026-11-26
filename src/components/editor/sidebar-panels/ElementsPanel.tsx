'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { SHAPE_PRESETS } from '@/constants/elements';
import * as Icons from 'lucide-react';
import { Search } from 'lucide-react';

const ALL_LUCIDE_ICON_NAMES: string[] = Object.keys(Icons).filter((key) => {
  if (
    key === 'default' ||
    key === 'icons' ||
    key === 'createLucideIcon' ||
    key.endsWith('Icon') ||
    key.startsWith('Lucide')
  ) {
    return false;
  }
  const val = (Icons as Record<string, any>)[key];
  return (typeof val === 'object' || typeof val === 'function') && /^[A-Z]/.test(key);
});

const ICON_PAGE_SIZE = 60;

export default function ElementsPanel() {
  const { addLayer, width, height } = useEditorStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(ICON_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredIcons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return ALL_LUCIDE_ICON_NAMES;
    return ALL_LUCIDE_ICON_NAMES.filter((iconName) => iconName.toLowerCase().includes(q));
  }, [searchTerm]);

  useEffect(() => {
    setVisibleCount(ICON_PAGE_SIZE);
  }, [searchTerm]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(filteredIcons.length, prev + ICON_PAGE_SIZE));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredIcons.length]);

  const displayedIcons = filteredIcons.slice(0, visibleCount);

  return (
    <div className="flex flex-col h-full space-y-5 overflow-y-auto pr-1">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Design Elements
        </h3>
        <p className="text-[11px] text-slate-500">
          Add geometric shapes, frames, dividers, and {ALL_LUCIDE_ICON_NAMES.length}+ Lucide icons.
        </p>
      </div>

      {/* Shapes Section */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 mb-2.5">Geometric Shapes</h4>
        <div className="grid grid-cols-3 gap-2">
          {SHAPE_PRESETS.map((shape) => (
            <button
              key={shape.id}
              onClick={() => {
                addLayer({
                  type: shape.type,
                  name: shape.name,
                  fill: shape.fill,
                  stroke: shape.stroke,
                  strokeWidth: shape.strokeWidth,
                  cornerRadius: shape.cornerRadius,
                  sides: shape.sides,
                  shapeVariant: shape.shapeVariant,
                  numPoints: shape.id === 'star-burst' ? 12 : undefined,
                  x: Math.round((width - shape.width) / 2),
                  y: Math.round((height - shape.height) / 2),
                  width: shape.width,
                  height: shape.height,
                } as any);
              }}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl flex flex-col items-center justify-center gap-1.5 group transition-all"
            >
              <div className="w-9 h-9 flex items-center justify-center">
                {shape.type === 'rect' && (
                  <div
                    className="w-7 h-7 border"
                    style={{
                      backgroundColor: shape.fill !== 'transparent' ? shape.fill : undefined,
                      borderColor: shape.stroke || '#7C3AED',
                      borderRadius: shape.cornerRadius ? `${Math.min(14, shape.cornerRadius / 3)}px` : '0px',
                    }}
                  />
                )}
                {shape.type === 'circle' && (
                  <div className="w-7 h-7 rounded-full" style={{ backgroundColor: shape.fill }} />
                )}
                {shape.type === 'star' && (
                  <Icons.Star className="w-7 h-7 fill-amber-500 text-amber-500" />
                )}
                {shape.type === 'line' && (
                  <div className="w-7 h-1 bg-slate-400 rounded-full" />
                )}
                {shape.type === 'badge' && (
                  <Icons.Award className="w-7 h-7 text-amber-600" />
                )}
                {shape.type === 'polygon' && shape.shapeVariant === 'triangle' && (
                  <Icons.Triangle className="w-7 h-7 fill-amber-500 text-amber-500" />
                )}
                {shape.type === 'polygon' && shape.shapeVariant === 'diamond' && (
                  <Icons.Diamond className="w-7 h-7 fill-cyan-500 text-cyan-500" />
                )}
                {shape.type === 'polygon' && shape.shapeVariant === 'pentagon' && (
                  <Icons.Pentagon className="w-7 h-7 fill-emerald-500 text-emerald-500" />
                )}
                {shape.type === 'polygon' && shape.shapeVariant === 'hexagon' && (
                  <Icons.Hexagon className="w-7 h-7 fill-blue-500 text-blue-500" />
                )}
                {shape.type === 'polygon' && shape.shapeVariant === 'octagon' && (
                  <Icons.Octagon className="w-7 h-7 fill-violet-500 text-violet-500" />
                )}
                {shape.type === 'polygon' && shape.shapeVariant === 'arrow' && (
                  <Icons.ArrowRight className="w-7 h-7 text-slate-900" />
                )}
                {shape.type === 'polygon' && shape.shapeVariant === 'heart' && (
                  <Icons.Heart className="w-7 h-7 fill-rose-600 text-rose-600" />
                )}
                {shape.type === 'polygon' && shape.shapeVariant === 'cross' && (
                  <Icons.Plus className="w-7 h-7 text-teal-500 stroke-[3]" />
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-600 group-hover:text-purple-700 text-center truncate w-full">
                {shape.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Full Lucide Icon Library Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-slate-700">Lucide Icon Library</h4>
          <span className="text-[10px] text-slate-400">{filteredIcons.length} icons</span>
        </div>

        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all Lucide icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {displayedIcons.map((iconName) => {
            const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[iconName];
            if (!IconComponent) return null;

            return (
              <button
                key={iconName}
                onClick={() => {
                  addLayer({
                    type: 'icon',
                    name: `${iconName} Icon`,
                    iconName,
                    stroke: '#39216C',
                    strokeWidth: 2,
                    x: Math.round(width / 2 - 50),
                    y: Math.round(height / 2 - 50),
                    width: 100,
                    height: 100,
                  } as any);
                }}
                title={iconName}
                className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl flex items-center justify-center group transition-all"
              >
                <IconComponent className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors" />
              </button>
            );
          })}
        </div>

        {visibleCount < filteredIcons.length && (
          <div ref={sentinelRef} className="pt-3 pb-2 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(filteredIcons.length, prev + ICON_PAGE_SIZE))}
              className="text-[11px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Load more icons ({filteredIcons.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
