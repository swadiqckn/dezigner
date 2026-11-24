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
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'serif', sample: 'Classic Editorial' },
  { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'display', sample: 'IMPACT HEADLINE' },
  { name: 'Oswald', family: "'Oswald', sans-serif", category: 'sans-serif', sample: 'Condensed Bold' },
  { name: 'Roboto', family: "'Roboto', sans-serif", category: 'sans-serif', sample: 'Balanced & Crisp' },
  { name: 'Merriweather', family: "'Merriweather', serif", category: 'serif', sample: 'Literary & Formal' },
  { name: 'Cinzel', family: "'Cinzel', serif", category: 'serif', sample: 'ROYAL PRESTIGE' },
  { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", category: 'sans-serif', sample: 'Futuristic Tech' },
  { name: 'Caveat', family: "'Caveat', cursive", category: 'handwriting', sample: 'Playful Handcrafted' },
  { name: 'Courier Prime', family: "'Courier Prime', monospace", category: 'monospace', sample: 'Typewriter Monospace' },
];

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
