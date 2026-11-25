'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { POPULAR_FONTS, loadGoogleFont, isGoogleFontReady } from '@/constants/fonts';
import { Upload, Search, Sparkles, Check, Loader2 } from 'lucide-react';

interface FontSelectorProps {
  value: string;
  onChange: (fontFamily: string) => void;
}

interface GoogleFontEntry {
  family: string;
  category: string;
}

const CATEGORIES = ['all', 'sans-serif', 'serif', 'display', 'handwriting', 'monospace'] as const;
const PAGE_SIZE = 40;

// Module-level cache so re-opening FontSelector doesn't re-fetch
let clientFontsCache: GoogleFontEntry[] | null = null;

function FontPreviewRow({
  font,
  isSelected,
  onSelect,
}: {
  font: GoogleFontEntry;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const rowRef = useRef<HTMLButtonElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(() => isGoogleFontReady(font.family));
  const [isLoading, setIsLoading] = useState(false);

  // Lazy-load Google Font stylesheet when this row scrolls into view
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

  // Also ensure font loads immediately if selected
  useEffect(() => {
    if (isSelected && !isLoaded) {
      setIsLoading(true);
      loadGoogleFont(font.family).then((ok) => {
        setIsLoading(false);
        if (ok) setIsLoaded(true);
      });
    }
  }, [isSelected, isLoaded, font.family]);

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 transition-colors ${
        isSelected
          ? 'bg-purple-100 text-purple-900 font-bold'
          : 'hover:bg-white text-slate-800'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div
          className="text-sm truncate leading-snug"
          style={{ fontFamily: `'${font.family}', ${font.category}` }}
        >
          {font.family}
        </div>
        <div
          className="text-[10px] text-slate-400 truncate"
          style={{ fontFamily: `'${font.family}', ${font.category}` }}
        >
          The quick brown fox • 1234
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-500 font-mono">
          {font.category.replace('-serif', '')}
        </span>
        {isSelected &&
          (isLoading || !isLoaded ? (
            <Loader2
              className="w-3.5 h-3.5 text-purple-600 animate-spin"
              aria-label="Loading font..."
            />
          ) : (
            <Check className="w-3.5 h-3.5 text-purple-600" />
          ))}
      </div>
    </button>
  );
}

export default function FontSelector({ value, onChange }: FontSelectorProps) {
  const { customFonts, addCustomFont } = useEditorStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const [allFonts, setAllFonts] = useState<GoogleFontEntry[]>(
    () =>
      clientFontsCache ||
      POPULAR_FONTS.map((f) => ({ family: f.name, category: f.category }))
  );
  const [isFetchingFonts, setIsFetchingFonts] = useState(!clientFontsCache);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanCurrent = value.replace(/['"]/g, '').split(',')[0].trim();

  // Fetch full Google Fonts catalog from API route
  useEffect(() => {
    if (clientFontsCache) return;
    let cancelled = false;

    fetch('/api/google-fonts')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.fonts) && data.fonts.length > 0) {
          clientFontsCache = data.fonts;
          setAllFonts(data.fonts);
        }
      })
      .catch((err) => {
        console.error('Could not load full Google Fonts catalog:', err);
      })
      .finally(() => {
        if (!cancelled) setIsFetchingFonts(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Reset pagination when search or category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category]);

  const filteredFonts = allFonts.filter((f) => {
    const matchesCat = category === 'all' || f.category === category;
    const matchesSearch =
      !search.trim() || f.family.toLowerCase().includes(search.toLowerCase().trim());
    return matchesCat && matchesSearch;
  });

  const visibleFonts = filteredFonts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredFonts.length;

  const handleSelectFont = (font: GoogleFontEntry) => {
    loadGoogleFont(font.family);
    onChange(`'${font.family}', ${font.category}`);
  };

  // Handle Custom Font File Upload (.ttf, .otf, .woff, .woff2)
  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingCustom(true);
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
          setIsLoadingCustom(false);
        }
      };

      reader.readAsDataURL(file);
    } catch {
      setIsLoadingCustom(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Google Fonts</label>
          <span className="text-[10px] font-mono text-slate-400">
            ({filteredFonts.length})
          </span>
          {isFetchingFonts && <Loader2 className="w-3 h-3 text-purple-600 animate-spin" />}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoadingCustom}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
          title="Upload .ttf, .otf, .woff, or .woff2 custom font"
        >
          <Upload className="w-3 h-3" />
          <span>{isLoadingCustom ? 'Loading...' : 'Upload Font'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          className="hidden"
          onChange={handleCustomFontUpload}
        />
      </div>

      {/* Search Google Fonts */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${allFonts.length} Google Fonts...`}
          className="w-full text-xs font-medium text-slate-900 pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold capitalize shrink-0 border transition-colors ${
              category === cat
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

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

      {/* Live Preview Google Fonts List */}
      <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5 border border-slate-200 rounded-xl p-1 bg-slate-50/60">
        {visibleFonts.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No matching fonts found.
          </div>
        ) : (
          <>
            {visibleFonts.map((font) => (
              <FontPreviewRow
                key={font.family}
                font={font}
                isSelected={cleanCurrent === font.family}
                onSelect={() => handleSelectFont(font)}
              />
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                Load More Fonts ({filteredFonts.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
