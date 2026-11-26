'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { SHAPE_PRESETS } from '@/constants/elements';
import { FA_ICON_CATALOG, FaCategory } from '@/utils/fontAwesomeIcons';
import * as Icons from 'lucide-react';
import { Search } from 'lucide-react';

const ICON_PAGE_SIZE = 60;
const FA_CATEGORIES: ('all' | FaCategory)[] = ['all', 'solid', 'regular', 'brands'];

export default function ElementsPanel() {
  const { addLayer, width, height } = useEditorStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [iconCategory, setIconCategory] = useState<'all' | FaCategory>('all');
  const [visibleCount, setVisibleCount] = useState(ICON_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredIcons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return FA_ICON_CATALOG.filter((item) => {
      const matchCat = iconCategory === 'all' || item.category === iconCategory;
      const matchQuery = !q || item.name.includes(q) || item.id.includes(q);
      return matchCat && matchQuery;
    });
  }, [searchTerm, iconCategory]);

  useEffect(() => {
    setVisibleCount(ICON_PAGE_SIZE);
  }, [searchTerm, iconCategory]);

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
          Add geometric shapes, frames, dividers, and {FA_ICON_CATALOG.length}+ FontAwesome icons.
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

        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FontAwesome icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 mb-3">
          {FA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setIconCategory(cat)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize transition-colors ${
                iconCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {displayedIcons.map((item) => {
            const [w, h, , , svgPathData] = item.definition.icon;
            const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];

            return (
              <button
                key={item.id}
                onClick={() => {
                  addLayer({
                    type: 'icon',
                    name: item.name,
                    iconName: item.id,
                    fill: '#39216C',
                    stroke: '#39216C',
                    strokeWidth: 0,
                    x: Math.round(width / 2),
                    y: Math.round(height / 2),
                    width: 100,
                    height: 100,
                  } as any);
                }}
                title={item.id}
                className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl flex items-center justify-center group transition-all"
              >
                <svg
                  viewBox={`0 0 ${w} ${h}`}
                  className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors"
                  fill="currentColor"
                >
                  {paths.map((d, idx) => (
                    <path key={idx} d={d} />
                  ))}
                </svg>
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
