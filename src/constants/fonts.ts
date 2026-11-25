export interface FontOption {
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  sample: string;
}

export const POPULAR_FONTS: FontOption[] = [
  { name: 'Inter', family: "'Inter', sans-serif", category: 'sans-serif', sample: 'Modern & Clean' },
  { name: 'Poppins', family: "'Poppins', sans-serif", category: 'sans-serif', sample: 'Geometric & Bold' },
  { name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'sans-serif', sample: 'Urban & Elegant' },
  { name: 'Roboto', family: "'Roboto', sans-serif", category: 'sans-serif', sample: 'Balanced & Crisp' },
  { name: 'Open Sans', family: "'Open Sans', sans-serif", category: 'sans-serif', sample: 'Friendly & Clear' },
  { name: 'Lato', family: "'Lato', sans-serif", category: 'sans-serif', sample: 'Warm & Corporate' },
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'sans-serif', sample: 'Contemporary UI' },
  { name: 'DM Sans', family: "'DM Sans', sans-serif", category: 'sans-serif', sample: 'Clean Geometric' },
  { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", category: 'sans-serif', sample: 'Futuristic Tech' },
  { name: 'Outfit', family: "'Outfit', sans-serif", category: 'sans-serif', sample: 'Sleek & Rounded' },
  { name: 'Raleway', family: "'Raleway', sans-serif", category: 'sans-serif', sample: 'Elegant Display' },
  { name: 'Nunito', family: "'Nunito', sans-serif", category: 'sans-serif', sample: 'Soft Rounded' },
  { name: 'Work Sans', family: "'Work Sans', sans-serif", category: 'sans-serif', sample: 'Modern Editorial' },
  { name: 'Rubik', family: "'Rubik', sans-serif", category: 'sans-serif', sample: 'Slightly Rounded' },
  { name: 'Manrope', family: "'Manrope', sans-serif", category: 'sans-serif', sample: 'Modern Sharp' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'serif', sample: 'Classic Editorial' },
  { name: 'Merriweather', family: "'Merriweather', serif", category: 'serif', sample: 'Literary & Formal' },
  { name: 'Cinzel', family: "'Cinzel', serif", category: 'serif', sample: 'ROYAL PRESTIGE' },
  { name: 'Lora', family: "'Lora', serif", category: 'serif', sample: 'Contemporary Serif' },
  { name: 'PT Serif', family: "'PT Serif', serif", category: 'serif', sample: 'Classic Print' },
  { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'serif', sample: 'Luxury Display' },
  { name: 'Libre Baskerville', family: "'Libre Baskerville', serif", category: 'serif', sample: 'Book Typography' },
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'display', sample: 'IMPACT HEADLINE' },
  { name: 'Oswald', family: "'Oswald', sans-serif", category: 'display', sample: 'Condensed Bold' },
  { name: 'Anton', family: "'Anton', sans-serif", category: 'display', sample: 'ULTRA BOLD POSTER' },
  { name: 'Syne', family: "'Syne', sans-serif", category: 'display', sample: 'Artistic Avant-Garde' },
  { name: 'Righteous', family: "'Righteous', sans-serif", category: 'display', sample: 'Retro Geometric' },
  { name: 'Orbitron', family: "'Orbitron', sans-serif", category: 'display', sample: 'SCI-FI TECH' },
  { name: 'Bangers', family: "'Bangers', cursive", category: 'display', sample: 'COMIC BOOK!' },
  { name: 'Abril Fatface', family: "'Abril Fatface', serif", category: 'display', sample: 'Editorial Poster' },
  { name: 'Archivo Black', family: "'Archivo Black', sans-serif", category: 'display', sample: 'HEAVY IMPACT' },
  { name: 'Caveat', family: "'Caveat', cursive", category: 'handwriting', sample: 'Playful Handcrafted' },
  { name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'handwriting', sample: 'Elegant Calligraphy' },
  { name: 'Pacifico', family: "'Pacifico', cursive", category: 'handwriting', sample: 'Retro Brush Script' },
  { name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'handwriting', sample: 'Formal Invitation' },
  { name: 'Permanent Marker', family: "'Permanent Marker', cursive", category: 'handwriting', sample: 'BOLD MARKER' },
  { name: 'Satisfy', family: "'Satisfy', cursive", category: 'handwriting', sample: 'Smooth Brush' },
  { name: 'Courier Prime', family: "'Courier Prime', monospace", category: 'monospace', sample: 'Typewriter Mono' },
  { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", category: 'monospace', sample: 'Code & Tech Mono' },
  { name: 'Fira Code', family: "'Fira Code', monospace", category: 'monospace', sample: 'Developer Mono' },
];

const fontLoadPromises = new Map<string, Promise<boolean>>();
const readyGoogleFonts = new Set<string>();

export function isGoogleFontReady(fontName: string): boolean {
  if (!fontName) return false;
  const cleanName = fontName.replace(/['"]/g, '').split(',')[0].trim();
  if (readyGoogleFonts.has(cleanName)) return true;
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      return document.fonts.check(`16px "${cleanName}"`);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Dynamically load any Google Font by name into the browser document.
 * Returns a Promise<boolean> that resolves when the font face is downloaded and ready.
 */
export function loadGoogleFont(fontName: string): Promise<boolean> {
  if (typeof document === 'undefined' || !fontName) return Promise.resolve(false);
  const cleanName = fontName.replace(/['"]/g, '').split(',')[0].trim();
  if (!cleanName) return Promise.resolve(false);

  if (readyGoogleFonts.has(cleanName)) return Promise.resolve(true);
  const existingPromise = fontLoadPromises.get(cleanName);
  if (existingPromise) return existingPromise;

  const formatted = encodeURIComponent(cleanName).replace(/%20/g, '+');
  const linkId = `gf-${formatted}`;

  const promise = new Promise<boolean>((resolve) => {
    const finishLoad = () => {
      if ('fonts' in document) {
        Promise.allSettled([
          document.fonts.load(`400 16px "${cleanName}"`),
          document.fonts.load(`700 16px "${cleanName}"`),
        ]).then(() => {
          readyGoogleFonts.add(cleanName);
          resolve(true);
        });
      } else {
        readyGoogleFonts.add(cleanName);
        resolve(true);
      }
    };

    const existingLink = document.getElementById(linkId) as HTMLLinkElement | null;
    if (existingLink) {
      finishLoad();
      return;
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    // Try weights 400;700 first; if font is single-weight or variable-only and 400s, fallback to plain family
    link.href = `https://fonts.googleapis.com/css2?family=${formatted}:wght@400;700&display=swap`;
    link.onload = finishLoad;
    link.onerror = () => {
      if (!link.dataset.fallback) {
        link.dataset.fallback = '1';
        link.href = `https://fonts.googleapis.com/css2?family=${formatted}&display=swap`;
      } else {
        resolve(false);
      }
    };
    document.head.appendChild(link);
  });

  fontLoadPromises.set(cleanName, promise);
  return promise;
}

export const GOOGLE_FONTS_URL = 
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@400..700&family=Cinzel:wght@400..900&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Inter:wght@300..900&family=Merriweather:ital,wght@0,300..900;1,300..900&family=Montserrat:ital,wght@0,300..900;1,300..900&family=Oswald:wght@300..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,300..900;1,300..900&family=Roboto:ital,wght@0,300..900;1,300..900&family=Space+Grotesk:wght@300..700&display=swap";

export interface FontPairing {
  name: string;
  category: string;
  heading: {
    text: string;
    family: string;
    fontSize?: number;
    fontWeight?: string;
  };
  subheading: {
    text: string;
    family: string;
    fontSize?: number;
    fontWeight?: string;
  };
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    name: 'Bebas Neue + Inter',
    category: 'Sports & Sales',
    heading: { text: 'GRAND CHAMPIONSHIP', family: "'Bebas Neue', sans-serif", fontSize: 68, fontWeight: 'bold' },
    subheading: { text: 'OFFICIAL TOURNAMENT GUIDE & INVITATION', family: "'Inter', sans-serif", fontSize: 20, fontWeight: '600' },
  },
  {
    name: 'Playfair Display + Montserrat',
    category: 'Luxury & Gala',
    heading: { text: 'Annual Gala Night', family: "'Playfair Display', serif", fontSize: 56, fontWeight: 'bold' },
    subheading: { text: 'AN EVENING OF ELEGANCE AND EXCELLENCE', family: "'Montserrat', sans-serif", fontSize: 18, fontWeight: '500' },
  },
  {
    name: 'Cinzel + Roboto',
    category: 'Royal & Prestige',
    heading: { text: 'CERTIFICATE OF HONOR', family: "'Cinzel', serif", fontSize: 52, fontWeight: 'bold' },
    subheading: { text: 'PRESENTED FOR OUTSTANDING MERIT & LEADERSHIP', family: "'Roboto', sans-serif", fontSize: 18, fontWeight: '400' },
  },
  {
    name: 'Space Grotesk + Inter',
    category: 'Tech & Future',
    heading: { text: 'TECH INNOVATION 2026', family: "'Space Grotesk', sans-serif", fontSize: 54, fontWeight: '800' },
    subheading: { text: 'Global Developer Conference & AI Summit', family: "'Inter', sans-serif", fontSize: 22, fontWeight: 'normal' },
  },
  {
    name: 'Caveat + Poppins',
    category: 'Creative & Warm',
    heading: { text: 'Handmade with Love', family: "'Caveat', cursive", fontSize: 62, fontWeight: 'bold' },
    subheading: { text: 'ORGANIC ARTISAN WORKSHOP & MARKETPLACE', family: "'Poppins', sans-serif", fontSize: 18, fontWeight: '600' },
  },
];
