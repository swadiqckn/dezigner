'use client';

import React, { useState } from 'react';
import { POSTER_TEMPLATES } from '@/constants/templates';
import { useEditorStore } from '@/store/useEditorStore';
import { PosterTemplate } from '@/types/editor';
import { Sparkles, LayoutTemplate, Layers } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Educational Events',
  'Arts Festivals',
  'Sports Events',
  'Competitions',
  'Islamic Events',
  'Announcements',
  'Birthday Posters',
  'Social Media',
  'Certificates',
];

export default function TemplatesPanel() {
  const [selectedCat, setSelectedCat] = useState('All');
  const { loadTemplate } = useEditorStore();

  const filtered = selectedCat === 'All'
    ? POSTER_TEMPLATES
    : POSTER_TEMPLATES.filter((t) => t.category === selectedCat);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Poster Templates
        </h3>
        <p className="text-[11px] text-slate-500">
          Editable multi-layer designs ready for your events and campaigns.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
              selectedCat === cat
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 flex-1">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => loadTemplate(tmpl)}
            className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer flex flex-col"
          >
            {/* Template Mini Preview Card */}
            <div
              className="w-full h-44 relative flex items-center justify-center p-3 select-none overflow-hidden"
              style={{
                background:
                  tmpl.canvas.background.type === 'gradient' && tmpl.canvas.background.gradient
                    ? `linear-gradient(${tmpl.canvas.background.gradient.angle}deg, ${tmpl.canvas.background.gradient.stops
                        .map((s) => `${s.color} ${s.offset * 100}%`)
                        .join(', ')})`
                    : tmpl.canvas.background.color,
              }}
            >
              <div className="text-center space-y-1.5 p-2 bg-black/25 backdrop-blur-xs rounded-xl border border-white/20 text-white max-w-[85%]">
                <span className="text-[9px] uppercase tracking-widest text-amber-300 font-bold block">
                  {tmpl.category}
                </span>
                <p className="text-xs font-bold leading-tight line-clamp-2">
                  {tmpl.title}
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-white/80">
                  <span className="flex items-center gap-0.5">
                    <Layers className="w-3 h-3" /> {tmpl.layers.length} layers
                  </span>
                  <span>•</span>
                  <span>{tmpl.canvas.width}×{tmpl.canvas.height}</span>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-purple-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-purple-700 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Use Template
                </span>
              </div>
            </div>

            {/* Template Title footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 truncate">
                {tmpl.title}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {tmpl.canvas.width >= tmpl.canvas.height ? 'Landscape' : 'Portrait'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
