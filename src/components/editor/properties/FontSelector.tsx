'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { POPULAR_FONTS, loadGoogleFont, isGoogleFontReady } from '@/constants/fonts';
import {
  Upload,
  Search,
  Sparkles,
  Check,
  Loader2,
  ChevronDown,
  CaseSensitive,
  Type as TypeIcon,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface FontSelectorProps {
  value: string;
  onChange: (fontFamily: string) => void;
  previewText?: string;
}

interface GoogleFontEntry {
  family: string;
  category: string;
}

const CATEGORIES = ['all', 'sans-serif', 'serif', 'display', 'handwriting', 'monospace'] as const;
const PAGE_SIZE = 40;

let clientFontsCache: GoogleFontEntry[] | null = null;

function FontPreviewRow({
  font,
  isSelected,
  previewMode,
  previewText,
  onSelect,
}: {
  font: GoogleFontEntry;
  isSelected: boolean;
  previewMode: 'name' | 'layerText';
  previewText?: string;
  onSelect: () => void;
}) {
  const rowRef = useRef<HTMLButtonElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(() => isGoogleFontReady(font.family));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const el = rowRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsLoading(true);
          loadGoogleFont(font.family).then((ok) => {
            setIsLoading(false);
            if (ok) setIsLoaded(true);
          });
          observer.disconnect();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [font.family, isLoaded]);

  useEffect(() => {
    if (isSelected) {
      rowRef.current?.scrollIntoView({ block: 'nearest' });
      if (!isLoaded) {
        setIsLoading(true);
        loadGoogleFont(font.family).then((ok) => {
          setIsLoading(false);
          if (ok) setIsLoaded(true);
        });
      }
    }
  }, [isSelected, isLoaded, font.family]);

  const cleanSample = previewText?.trim();
  const mainPreview =
    previewMode === 'layerText' && cleanSample ? cleanSample : font.family;
  const subPreview =
    previewMode === 'layerText' && cleanSample
      ? font.family
      : 'The quick brown fox • 1234';

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 transition-colors ${
        isSelected
          ? 'bg-purple-100 text-purple-900 font-bold'
          : 'hover:bg-slate-50 text-slate-800'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div
          className="text-sm truncate leading-snug"
          style={{ fontFamily: `'${font.family}', ${font.category}` }}
        >
          {mainPreview}
        </div>
        <div className="text-[10px] text-slate-400 truncate font-sans">
          {subPreview}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-500 font-mono">
          {font.category.replace('-serif', '')}
        </span>
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
        ) : isSelected ? (
          <Check className="w-3.5 h-3.5 text-purple-600" />
        ) : null}
      </div>
    </button>
  );
}

export default function FontSelector({ value, onChange, previewText }: FontSelectorProps) {
  const { customFonts, addCustomFont } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const [previewMode, setPreviewMode] = useState<'name' | 'layerText'>('name');
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedRect, setExpandedRect] = useState<{ left: number; width: number } | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [googleFonts, setGoogleFonts] = useState<GoogleFontEntry[]>(
    () =>
      clientFontsCache ||
      POPULAR_FONTS.map((f) => ({ family: f.family, category: f.category }))
  );

  // Fetch full Google Fonts catalog once
  useEffect(() => {
    if (clientFontsCache) return;
    let active = true;
    fetch('/api/google-fonts')
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.fonts) && data.fonts.length > 0) {
          clientFontsCache = data.fonts;
          setGoogleFonts(data.fonts);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredFonts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return googleFonts.filter((f) => {
      const matchCat = category === 'all' || f.category === category;
      const matchQuery = !q || f.family.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [googleFonts, category, search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category]);

  // Auto-load remaining fonts when scrolled to the bottom of loaded fonts
  useEffect(() => {
    if (!isOpen) return;
    const el = bottomSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(filteredFonts.length, prev + PAGE_SIZE));
        }
      },
      { root: listRef.current, rootMargin: '80px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen, isExpanded, filteredFonts.length, visibleCount]);

  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setVisibleCount((prev) => Math.min(filteredFonts.length, prev + PAGE_SIZE));
    }
  };

  const displayedFonts = filteredFonts.slice(0, visibleCount);

  const handleSelectFont = async (family: string) => {
    onChange(family);
    await loadGoogleFont(family);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredFonts.length === 0) return;
      const currentIndex = filteredFonts.findIndex((f) => f.family === value);
      let nextIndex = 0;
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < 0 ? 0 : Math.min(filteredFonts.length - 1, currentIndex + 1);
      } else {
        nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
      }
      if (nextIndex >= visibleCount) {
        setVisibleCount(nextIndex + PAGE_SIZE);
      }
      const nextFont = filteredFonts[nextIndex];
      if (nextFont) {
        handleSelectFont(nextFont.family);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fontName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;
      try {
        const fontFace = new FontFace(fontName, `url(${dataUrl})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        addCustomFont({
          name: fontName,
          family: fontName,
          dataUrl,
          format: file.name.split('.').pop() || 'ttf',
        });
        onChange(fontName);
      } catch (err) {
        console.error('Failed to load custom font:', err);
        alert('Could not load font file. Please upload a valid .ttf, .otf, or .woff file.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div ref={containerRef} className="relative space-y-2" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Font Family
        </span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[10px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md transition-colors"
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Dropdown Trigger Field */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-purple-400 rounded-xl text-left transition-colors"
      >
        <span
          className="text-xs font-bold text-slate-800 truncate"
          style={{ fontFamily: `'${value}', sans-serif` }}
        >
          {value || 'Inter'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-purple-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          style={
            isExpanded && expandedRect
              ? {
                  position: 'fixed',
                  top: '64px',
                  bottom: '12px',
                  left: `${expandedRect.left}px`,
                  width: `${expandedRect.width}px`,
                }
              : undefined
          }
          className={`${
            isExpanded && expandedRect
              ? 'z-50 flex flex-col'
              : 'absolute left-0 right-0 top-full mt-1.5 z-50'
          } bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Search + Preview Mode Toggle + Expand Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${googleFonts.length} fonts...`}
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-purple-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setPreviewMode((m) => (m === 'name' ? 'layerText' : 'name'))}
              title={
                previewMode === 'name'
                  ? 'Preview Mode: Font Name (click to preview Layer Text)'
                  : 'Preview Mode: Layer Text (click to preview Font Name)'
              }
              className={`p-1.5 rounded-xl border transition-colors shrink-0 ${
                previewMode === 'layerText'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {previewMode === 'layerText' ? (
                <CaseSensitive className="w-4 h-4" />
              ) : (
                <TypeIcon className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isExpanded && containerRef.current) {
                  const r = containerRef.current.getBoundingClientRect();
                  setExpandedRect({ left: r.left, width: r.width });
                }
                setIsExpanded((e) => !e);
              }}
              title={isExpanded ? 'Collapse Font Dropdown' : 'Expand Font Dropdown to Top'}
              className={`p-1.5 rounded-xl border transition-colors shrink-0 ${
                isExpanded
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Custom Uploaded Fonts */}
          {customFonts.length > 0 && (
            <div className="space-y-1 border-b border-slate-100 pb-1.5">
              <div className="text-[9px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1 px-1">
                <Sparkles className="w-2.5 h-2.5" />
                Custom Fonts
              </div>
              {customFonts.map((cf) => (
                <button
                  key={cf.family}
                  type="button"
                  onClick={() => {
                    handleSelectFont(cf.family);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                    value === cf.family
                      ? 'bg-purple-100 text-purple-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  style={{ fontFamily: cf.family }}
                >
                  <span className="truncate">{cf.name}</span>
                  {value === cf.family && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* Font List (loads 40 at a time, auto-loads remaining at bottom) */}
          <div
            ref={listRef}
            onScroll={handleListScroll}
            className={`${
              isExpanded ? 'flex-1 min-h-0' : 'max-h-56'
            } overflow-y-auto space-y-0.5 pr-0.5`}
          >
            {displayedFonts.length === 0 ? (
              <div className="py-6 text-center text-[11px] text-slate-400">
                No fonts match &ldquo;{search}&rdquo;
              </div>
            ) : (
              displayedFonts.map((font) => (
                <FontPreviewRow
                  key={font.family}
                  font={font}
                  isSelected={value === font.family}
                  previewMode={previewMode}
                  previewText={previewText}
                  onSelect={() => {
                    handleSelectFont(font.family);
                    setIsOpen(false);
                  }}
                />
              ))
            )}

            {visibleCount < filteredFonts.length && (
              <div ref={bottomSentinelRef} className="py-2 text-center text-[10px] text-slate-400">
                Loading more fonts...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
