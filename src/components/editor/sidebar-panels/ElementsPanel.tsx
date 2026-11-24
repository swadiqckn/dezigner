'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { SHAPE_PRESETS, CURATED_ICONS } from '@/constants/elements';
import * as Icons from 'lucide-react';
import { Search } from 'lucide-react';

export default function ElementsPanel() {
  const { addLayer, width, height } = useEditorStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = CURATED_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-5 overflow-y-auto pr-1">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Design Elements
        </h3>
        <p className="text-[11px] text-slate-500">
          Add geometric shapes, frames, dividers, and vector icons.
        </p>
      </div>

      {/* Shapes Section */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 mb-2.5">Basic Shapes</h4>
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
                  x: Math.round((width - shape.width) / 2),
                  y: Math.round((height - shape.height) / 2),
                  width: shape.width,
                  height: shape.height,
                } as any);
              }}
              className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl flex flex-col items-center justify-center gap-2 group transition-all"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                {shape.type === 'rect' && (
                  <div
                    className="w-8 h-8 border"
                    style={{
                      backgroundColor: shape.fill !== 'transparent' ? shape.fill : undefined,
                      borderColor: shape.stroke || '#7C3AED',
                      borderRadius: shape.cornerRadius ? `${shape.cornerRadius / 3}px` : '0px',
                    }}
                  />
                )}
                {shape.type === 'circle' && (
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: shape.fill }}
                  />
                )}
                {shape.type === 'star' && (
                  <Icons.Star className="w-8 h-8 fill-amber-500 text-amber-500" />
                )}
                {shape.type === 'line' && (
                  <div className="w-8 h-1 bg-slate-400 rounded-full" />
                )}
                {shape.type === 'badge' && (
                  <Icons.Award className="w-8 h-8 text-amber-600" />
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-600 group-hover:text-purple-700 text-center truncate w-full">
                {shape.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Curated Icons Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-slate-700">Vector Icons</h4>
          <span className="text-[10px] text-slate-400">{filteredIcons.length} icons</span>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {filteredIcons.map((iconName) => {
            // @ts-expect-error Lucide dynamic index
            const IconComponent = Icons[iconName] || Icons.Circle;

            return (
              <button
                key={iconName}
                onClick={() => {
                  addLayer({
                    type: 'icon',
                    name: `Icon ${iconName}`,
                    iconName,
                    stroke: '#39216C',
                    strokeWidth: 2,
                    fill: 'transparent',
                    x: Math.round((width - 120) / 2),
                    y: Math.round((height - 120) / 2),
                    width: 120,
                    height: 120,
                  });
                }}
                className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl flex flex-col items-center justify-center gap-1.5 group transition-colors"
                title={`Add ${iconName}`}
              >
                <IconComponent className="w-5 h-5 text-slate-700 group-hover:text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] text-slate-500 truncate w-full text-center">
                  {iconName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
