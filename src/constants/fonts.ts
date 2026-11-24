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
