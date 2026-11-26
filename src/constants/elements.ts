export interface ShapePreset {
  id: string;
  name: string;
  type: 'rect' | 'circle' | 'line' | 'star' | 'polygon' | 'badge';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  sides?: number;
  shapeVariant?: string;
  width: number;
  height: number;
  badgeStyle?: 'ribbon' | 'circle-star' | 'tag' | 'pill' | 'banner';
}

export const SHAPE_PRESETS: ShapePreset[] = [
  { id: 'rect-flat', name: 'Rectangle', type: 'rect', fill: '#39216C', width: 300, height: 200, cornerRadius: 0 },
  { id: 'rect-rounded', name: 'Rounded Card', type: 'rect', fill: '#7C3AED', width: 300, height: 200, cornerRadius: 24 },
  { id: 'circle-flat', name: 'Circle', type: 'circle', fill: '#EC4899', width: 250, height: 250 },
  { id: 'triangle', name: 'Triangle', type: 'polygon', sides: 3, shapeVariant: 'triangle', fill: '#F59E0B', width: 220, height: 220 },
  { id: 'diamond', name: 'Diamond', type: 'polygon', sides: 4, shapeVariant: 'diamond', fill: '#06B6D4', width: 220, height: 220 },
  { id: 'pentagon', name: 'Pentagon', type: 'polygon', sides: 5, shapeVariant: 'pentagon', fill: '#10B981', width: 220, height: 220 },
  { id: 'hexagon', name: 'Hexagon', type: 'polygon', sides: 6, shapeVariant: 'hexagon', fill: '#3B82F6', width: 220, height: 220 },
  { id: 'octagon', name: 'Octagon', type: 'polygon', sides: 8, shapeVariant: 'octagon', fill: '#8B5CF6', width: 220, height: 220 },
  { id: 'arrow-right', name: 'Arrow', type: 'polygon', shapeVariant: 'arrow', fill: '#0F172A', width: 240, height: 180 },
  { id: 'heart-shape', name: 'Heart', type: 'polygon', shapeVariant: 'heart', fill: '#E11D48', width: 220, height: 200 },
  { id: 'cross-plus', name: 'Cross', type: 'polygon', shapeVariant: 'cross', fill: '#14B8A6', width: 200, height: 200 },
  { id: 'pill-button', name: 'Pill Frame', type: 'rect', fill: '#6366F1', width: 320, height: 80, cornerRadius: 40 },
  { id: 'border-frame', name: 'Outline Frame', type: 'rect', fill: 'transparent', stroke: '#1E293B', strokeWidth: 8, width: 400, height: 500, cornerRadius: 16 },
  { id: 'star-5', name: '5-Point Star', type: 'star', fill: '#F59E0B', width: 200, height: 200 },
  { id: 'star-burst', name: '12-Point Starburst', type: 'star', fill: '#EF4444', width: 220, height: 220 },
  { id: 'divider-line', name: 'Divider Line', type: 'line', fill: '#94A3B8', stroke: '#94A3B8', strokeWidth: 4, width: 400, height: 4 },
  { id: 'gold-badge', name: 'Award Badge', type: 'badge', fill: '#D97706', badgeStyle: 'ribbon', width: 240, height: 240 },
];

export const COLOR_PALETTES = [
  {
    name: 'Royal Purple & Gold',
    colors: ['#39216C', '#7C3AED', '#A78BFA', '#F59E0B', '#FEF3C7', '#1E1B4B', '#FFFFFF'],
  },
  {
    name: 'Modern Cyber',
    colors: ['#0F172A', '#3B82F6', '#06B6D4', '#10B981', '#F43F5E', '#F8FAFC', '#64748B'],
  },
  {
    name: 'Sunset Warmth',
    colors: ['#881337', '#E11D48', '#FB7185', '#F97316', '#FBBF24', '#FFFBEB', '#4C0519'],
  },
  {
    name: 'Emerald Academic',
    colors: ['#064E3B', '#059669', '#34D399', '#A7F3D0', '#D97706', '#F0FDF4', '#022C22'],
  },
  {
    name: 'Midnight Luxury',
    colors: ['#09090B', '#27272A', '#E4E4E7', '#D4AF37', '#B45309', '#F4F4F5', '#18181B'],
  },
];

export const GRADIENT_PRESETS = [
  {
    name: 'Purple Velvet',
    value: 'linear-gradient(135deg, #39216C 0%, #7C3AED 50%, #4F46E5 100%)',
    config: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#39216C' },
        { offset: 0.5, color: '#7C3AED' },
        { offset: 1, color: '#4F46E5' },
      ],
    },
  },
  {
    name: 'Ocean Glow',
    value: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 50%, #38BDF8 100%)',
    config: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#0C4A6E' },
        { offset: 0.5, color: '#0284C7' },
        { offset: 1, color: '#38BDF8' },
      ],
    },
  },
  {
    name: 'Sunset Radiance',
    value: 'linear-gradient(135deg, #881337 0%, #E11D48 50%, #FB923C 100%)',
    config: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#881337' },
        { offset: 0.5, color: '#E11D48' },
        { offset: 1, color: '#FB923C' },
      ],
    },
  },
  {
    name: 'Dark Nebula',
    value: 'linear-gradient(135deg, #09090B 0%, #18181B 50%, #312E81 100%)',
    config: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#09090B' },
        { offset: 0.5, color: '#18181B' },
        { offset: 1, color: '#312E81' },
      ],
    },
  },
  {
    name: 'Golden Sunrise',
    value: 'linear-gradient(135deg, #78350F 0%, #D97706 50%, #FDE047 100%)',
    config: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#78350F' },
        { offset: 0.5, color: '#D97706' },
        { offset: 1, color: '#FDE047' },
      ],
    },
  },
  {
    name: 'Emerald Forest',
    value: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)',
    config: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#064E3B' },
        { offset: 0.5, color: '#059669' },
        { offset: 1, color: '#10B981' },
      ],
    },
  },
  {
    name: 'Soft Pearl',
    value: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)',
    config: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#F8FAFC' },
        { offset: 0.5, color: '#E2E8F0' },
        { offset: 1, color: '#CBD5E1' },
      ],
    },
  },
  {
    name: 'Lavender Mist',
    value: 'linear-gradient(135deg, #FAF5FF 0%, #E9D5FF 50%, #C084FC 100%)',
    config: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#FAF5FF' },
        { offset: 0.5, color: '#E9D5FF' },
        { offset: 1, color: '#C084FC' },
      ],
    },
  },
];

export const CURATED_ICONS = [
  'GraduationCap', 'Award', 'Calendar', 'Clock', 'MapPin', 'Phone', 'Mail', 'Globe',
  'Music', 'Palette', 'Trophy', 'Sparkles', 'Star', 'Flame', 'Heart', 'Shield',
  'BookOpen', 'Code', 'Cpu', 'Users', 'Megaphone', 'CheckCircle2', 'Compass',
  'Camera', 'Mic', 'Film', 'Smile', 'Sun', 'Moon', 'Send'
];
