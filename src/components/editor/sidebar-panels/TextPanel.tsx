'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Type, Sparkles } from 'lucide-react';

export default function TextPanel() {
  const { addLayer, width, height } = useEditorStore();

  const addTextPreset = (
    text: string,
    fontSize: number,
    fontFamily: string,
    fontWeight: string,
    color: string,
    name: string
  ) => {
    addLayer({
      type: 'text',
      name,
      text,
      fontSize,
      fontFamily,
      fontWeight,
      color,
      x: Math.round((width - 600) / 2),
      y: Math.round(height * 0.35),
      width: 600,
      textAlign: 'center',
    });
  };

  return (
    <div className="flex flex-col h-full space-y-5 overflow-y-auto pr-1">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Add Typography
        </h3>
        <p className="text-[11px] text-slate-500">
          Click to add styled text blocks to your poster.
        </p>
      </div>

      {/* Standard Hierarchy Blocks */}
      <div className="space-y-2.5">
        <button
          onClick={() =>
            addTextPreset('Add a Heading', 64, "'Space Grotesk', sans-serif", '800', '#1E293B', 'Heading')
          }
          className="w-full text-left p-4 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-2xl transition-all group"
        >
          <span className="text-xl font-extrabold text-slate-800 group-hover:text-purple-700 block">
            Add a Heading
          </span>
          <span className="text-[11px] text-slate-400">Hero title, 64px bold</span>
        </button>

        <button
          onClick={() =>
            addTextPreset('Add a Subheading', 32, "'Montserrat', sans-serif", '600', '#475569', 'Subheading')
          }
          className="w-full text-left p-3.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-2xl transition-all group"
        >
          <span className="text-sm font-semibold text-slate-700 group-hover:text-purple-700 block">
            Add a Subheading
          </span>
          <span className="text-[11px] text-slate-400">Section title, 32px medium</span>
        </button>

        <button
          onClick={() =>
            addTextPreset(
              'Add a little bit of body text for dates, descriptions, or event details.',
              20,
              "'Inter', sans-serif",
              'normal',
              '#64748B',
              'Body Text'
            )
          }
          className="w-full text-left p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-2xl transition-all group"
        >
          <span className="text-xs text-slate-600 group-hover:text-purple-700 block">
            Add body text
          </span>
          <span className="text-[11px] text-slate-400">Regular copy, 20px</span>
        </button>
      </div>

      {/* Curated Font Pairings */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Curated Font Combinations</span>
        </h4>

        <div className="space-y-2.5">
          {/* Pair 1: Impact & Clean */}
          <button
            onClick={() => {
              const baseY = Math.round(height * 0.35);
              addLayer({
                type: 'text',
                name: 'Headline (Bebas)',
                text: 'GRAND CHAMPIONSHIP',
                fontSize: 72,
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 'bold',
                color: '#1E1B4B',
                x: Math.round((width - 700) / 2),
                y: baseY,
                width: 700,
                textAlign: 'center',
                letterSpacing: 2,
              });
              addLayer({
                type: 'text',
                name: 'Sub-label (Inter)',
                text: 'OFFICIAL INVITATION & TOURNAMENT GUIDE',
                fontSize: 18,
                fontFamily: "'Inter', sans-serif",
                fontWeight: '600',
                color: '#6366F1',
                x: Math.round((width - 700) / 2),
                y: baseY + 80,
                width: 700,
                textAlign: 'center',
                letterSpacing: 3,
              });
            }}
            className="w-full text-left p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all group"
          >
            <p className="text-base font-bold text-slate-800 tracking-wide font-sans">
              BEBAS NEUE + INTER
            </p>
            <p className="text-[11px] text-purple-600 font-medium">
              High-impact sports, sales, and modern banners
            </p>
          </button>

          {/* Pair 2: Classic Editorial */}
          <button
            onClick={() => {
              const baseY = Math.round(height * 0.35);
              addLayer({
                type: 'text',
                name: 'Elegance Headline',
                text: 'Annual Gala Night',
                fontSize: 64,
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontWeight: '700',
                color: '#39216C',
                x: Math.round((width - 700) / 2),
                y: baseY,
                width: 700,
                textAlign: 'center',
              });
              addLayer({
                type: 'text',
                name: 'Elegance Subtitle',
                text: 'AN EVENING OF PHILANTHROPY & FINE ARTS',
                fontSize: 16,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: '500',
                color: '#B45309',
                x: Math.round((width - 700) / 2),
                y: baseY + 80,
                width: 700,
                textAlign: 'center',
                letterSpacing: 4,
              });
            }}
            className="w-full text-left p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all group"
          >
            <p className="text-base font-serif italic font-bold text-slate-800">
              Playfair Display + Montserrat
            </p>
            <p className="text-[11px] text-purple-600 font-medium">
              Luxury galas, awards, certificates, and cultural events
            </p>
          </button>

          {/* Pair 3: Tech & Futuristic */}
          <button
            onClick={() => {
              const baseY = Math.round(height * 0.35);
              addLayer({
                type: 'text',
                name: 'Tech Title',
                text: 'HACK THE SYSTEM',
                fontSize: 68,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: '800',
                color: '#059669',
                x: Math.round((width - 700) / 2),
                y: baseY,
                width: 700,
                textAlign: 'center',
              });
              addLayer({
                type: 'text',
                name: 'Tech Code Label',
                text: '> NOVEMBER 2026 // GLOBAL DEVELOPER CONCLAVE',
                fontSize: 18,
                fontFamily: "'Courier Prime', monospace",
                fontWeight: '700',
                color: '#334155',
                x: Math.round((width - 700) / 2),
                y: baseY + 80,
                width: 700,
                textAlign: 'center',
              });
            }}
            className="w-full text-left p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all group"
          >
            <p className="text-base font-mono font-bold text-slate-800">
              Space Grotesk + Courier
            </p>
            <p className="text-[11px] text-purple-600 font-medium">
              Coding bootcamps, tech conclaves, and hackathons
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
