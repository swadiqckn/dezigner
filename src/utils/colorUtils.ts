import { CanvasLayer, CanvasBackground } from '@/types/editor';

export const STANDARD_NEUTRALS = [
  { label: 'White', color: '#FFFFFF' },
  { label: 'Light Gray', color: '#E2E8F0' },
  { label: 'Medium Gray', color: '#94A3B8' },
  { label: 'Slate Gray', color: '#475569' },
  { label: 'Dark Slate', color: '#1E293B' },
  { label: 'Black', color: '#000000' },
];

/**
 * Dynamically extract all distinct colors currently used across the poster canvas
 */
export function getUsedColors(layers: CanvasLayer[], background?: CanvasBackground): string[] {
  const colorSet = new Set<string>();

  // Background
  if (background?.color && isValidHex(background.color)) {
    colorSet.add(background.color.toUpperCase());
  }
  if (background?.gradient?.stops) {
    background.gradient.stops.forEach((s) => {
      if (isValidHex(s.color)) colorSet.add(s.color.toUpperCase());
    });
  }

  // Layers
  layers.forEach((layer) => {
    // Text color & stroke
    if ('color' in layer && typeof (layer as any).color === 'string') {
      const c = (layer as any).color;
      if (isValidHex(c)) colorSet.add(c.toUpperCase());
    }
    // Shape/Icon/Badge fill & stroke
    if ('fill' in layer && typeof (layer as any).fill === 'string') {
      const f = (layer as any).fill;
      if (isValidHex(f)) colorSet.add(f.toUpperCase());
    }
    if ('stroke' in layer && typeof (layer as any).stroke === 'string') {
      const s = (layer as any).stroke;
      if (isValidHex(s)) colorSet.add(s.toUpperCase());
    }
  });

  return Array.from(colorSet);
}

function isValidHex(color?: string): boolean {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim());
}
