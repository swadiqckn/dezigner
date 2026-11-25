import { AnchorPoint } from '@/types/editor';

export const ANCHOR_POINTS: Array<{ id: AnchorPoint; label: string; xPercent: number; yPercent: number }> = [
  { id: 'top-left', label: 'Top-Left', xPercent: 0, yPercent: 0 },
  { id: 'top-center', label: 'Top-Center', xPercent: 0.5, yPercent: 0 },
  { id: 'top-right', label: 'Top-Right', xPercent: 1, yPercent: 0 },
  { id: 'middle-left', label: 'Middle-Left', xPercent: 0, yPercent: 0.5 },
  { id: 'center', label: 'Center', xPercent: 0.5, yPercent: 0.5 },
  { id: 'middle-right', label: 'Middle-Right', xPercent: 1, yPercent: 0.5 },
  { id: 'bottom-left', label: 'Bottom-Left', xPercent: 0, yPercent: 1 },
  { id: 'bottom-center', label: 'Bottom-Center', xPercent: 0.5, yPercent: 1 },
  { id: 'bottom-right', label: 'Bottom-Right', xPercent: 1, yPercent: 1 },
];

export function getOffsetForAnchor(anchor: AnchorPoint | undefined, width: number, height: number): { x: number; y: number } {
  const w = width || 0;
  const h = height || 0;
  switch (anchor) {
    case 'top-center':
      return { x: w * 0.5, y: 0 };
    case 'top-right':
      return { x: w, y: 0 };
    case 'middle-left':
      return { x: 0, y: h * 0.5 };
    case 'center':
      return { x: w * 0.5, y: h * 0.5 };
    case 'middle-right':
      return { x: w, y: h * 0.5 };
    case 'bottom-left':
      return { x: 0, y: h };
    case 'bottom-center':
      return { x: w * 0.5, y: h };
    case 'bottom-right':
      return { x: w, y: h };
    case 'top-left':
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Calculates new X, Y coordinates when switching anchor point so the object
 * stays visually in the exact same place on canvas.
 */
export function recalculatePositionForNewAnchor(
  currentAnchor: AnchorPoint | undefined,
  newAnchor: AnchorPoint,
  x: number,
  y: number,
  width: number,
  height: number,
  rotationDegrees: number = 0
): { x: number; y: number } {
  const oldOffset = getOffsetForAnchor(currentAnchor, width, height);
  const newOffset = getOffsetForAnchor(newAnchor, width, height);

  const dx = newOffset.x - oldOffset.x;
  const dy = newOffset.y - oldOffset.y;

  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Rotate offset delta by layer rotation
  const rotatedDx = dx * cos - dy * sin;
  const rotatedDy = dx * sin + dy * cos;

  return {
    x: Math.round(x + rotatedDx),
    y: Math.round(y + rotatedDy),
  };
}
