import { NextResponse } from 'next/server';

const GOOGLE_FONTS_API_KEY =
  process.env.GOOGLE_FONTS_API_KEY || 'AIzaSyBfOEU_76sMmBa6IIbbtq6M1DHMWSwQDzs';

export interface GoogleFontApiItem {
  family: string;
  category: string;
  variants: string[];
}

let cachedFonts: GoogleFontApiItem[] | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export async function GET() {
  const now = Date.now();
  if (cachedFonts && now - lastFetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ fonts: cachedFonts, total: cachedFonts.length });
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`,
      { next: { revalidate: 43200 } }
    );

    if (!res.ok) {
      throw new Error(`Google Fonts API responded with ${res.status}`);
    }

    const data = await res.json();
    const items: GoogleFontApiItem[] = (data.items || []).map((item: any) => ({
      family: item.family,
      category: item.category || 'sans-serif',
      variants: item.variants || ['regular'],
    }));

    cachedFonts = items;
    lastFetchedAt = now;

    return NextResponse.json({ fonts: items, total: items.length });
  } catch (error) {
    console.error('Failed to fetch Google Fonts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Fonts', fonts: cachedFonts || [] },
      { status: cachedFonts ? 200 : 500 }
    );
  }
}
