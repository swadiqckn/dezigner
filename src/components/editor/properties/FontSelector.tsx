'use client';

import React, { useState, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { POPULAR_FONTS, loadGoogleFont } from '@/constants/fonts';
import { Upload, Search, Sparkles, Check, Plus } from 'lucide-react';

interface FontSelectorProps {
  value: string;
  onChange: (fontFamily: string) => void;
}

export default function FontSelector({ value, onChange }: FontSelectorProps) {
  const { customFonts, addCustomFont } = useEditorStore();
  const [search, setSearch] = useState('');
  const [isLoadingFont, setIsLoadingFont] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanCurrent = value.replace(/['"]/g, '').split(',')[0].trim();

  const filteredGoogleFonts = POPULAR_FONTS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectFont = (fontName: string, fontFamily: string) => {
    loadGoogleFont(fontName);
    onChange(fontFamily);
  };

  const handleLoadAnyGoogleFont = () => {
    if (!search.trim()) return;
    const fontName = search.trim();
    loadGoogleFont(fontName);
    onChange(`'${fontName}', sans-serif`);
  };

  // Handle Custom Font File Upload (.ttf, .otf, .woff, .woff2)
  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFont(true);
    try {
      const fontName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9\s-_]/g, '');
      const reader = new FileReader();

      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        try {
          const fontFace = new FontFace(fontName, `url(${dataUrl})`);
          await fontFace.load();
          document.fonts.add(fontFace);

          const family = `'${fontName}', sans-serif`;
          addCustomFont({
            name: fontName,
            family,
            dataUrl,
          });
          onChange(family);
        } catch (err) {
          console.error('Error loading custom font:', err);
          alert('Failed to load custom font file. Ensure it is a valid .ttf, .otf, .woff, or .woff2 file.');
        } finally {
          setIsLoadingFont(false);
        }
      };

      reader.readAsDataURL(file);
    } catch {
      setIsLoadingFont(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">Font Family</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoadingFont}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
          title="Upload .ttf, .otf, .woff, or .woff2 custom font"
        >
          <Upload className="w-3 h-3" />
          <span>{isLoadingFont ? 'Loading...' : 'Upload Font'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          className="hidden"
          onChange={handleCustomFontUpload}
        />
      </div>

      {/* Search Any Google Font */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search or type any Google Font..."
          className="w-full text-xs font-medium text-slate-900 pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none"
        />
      </div>

      {/* Load Custom Google Font Name if not in preset list */}
      {search.trim().length > 1 && filteredGoogleFonts.length === 0 && (
        <button
          type="button"
          onClick={handleLoadAnyGoogleFont}
          className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Load Google Font: "{search.trim()}"</span>
        </button>
      )}

      {/* Custom Uploaded Fonts */}
      {customFonts.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Custom Uploaded Fonts
          </span>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {customFonts.map((cf) => {
              const isSelected = cleanCurrent === cf.name;
              return (
                <button
                  key={cf.name}
                  type="button"
                  onClick={() => onChange(cf.family)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-purple-100 text-purple-800 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <span style={{ fontFamily: cf.family }}>{cf.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Google Fonts List */}
      <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
        {filteredGoogleFonts.map((font) => {
          const isSelected = cleanCurrent === font.name;
          return (
            <button
              key={font.name}
              type="button"
              onClick={() => handleSelectFont(font.name, font.family)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                isSelected
                  ? 'bg-purple-100 text-purple-800 font-bold'
                  : 'hover:bg-white text-slate-800'
              }`}
            >
              <span style={{ fontFamily: font.family }}>{font.name}</span>
              <span className="text-[10px] text-slate-400">{font.category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
