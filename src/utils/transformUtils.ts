import { AnchorPoint, CanvasLayer, TextLayer } from '@/types/editor';

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

export function getOffsetForAnchor(
  anchor: AnchorPoint | undefined,
  width: number,
  height: number
): { x: number; y: number } {
  const w = width || 0;
  const h = height || 0;
  const effectiveAnchor: AnchorPoint = anchor || 'center';

  switch (effectiveAnchor) {
    case 'top-left':
      return { x: 0, y: 0 };
    case 'top-center':
      return { x: w * 0.5, y: 0 };
    case 'top-right':
      return { x: w, y: 0 };
    case 'middle-left':
      return { x: 0, y: h * 0.5 };
    case 'middle-right':
      return { x: w, y: h * 0.5 };
    case 'bottom-left':
      return { x: 0, y: h };
    case 'bottom-center':
      return { x: w * 0.5, y: h };
    case 'bottom-right':
      return { x: w, y: h };
    case 'center':
    default:
      return { x: w * 0.5, y: h * 0.5 };
  }
}

let measureCtx: CanvasRenderingContext2D | null = null;

export function getLayerDimensions(layer: CanvasLayer): { width: number; height: number } {
  if (layer.type === 'text') {
    const t = layer as TextLayer;
    const lines = (t.text || '').split('\n');
    const lineHeight = t.lineHeight || 1.2;
    const height = Math.max(t.fontSize * lineHeight, lines.length * t.fontSize * lineHeight);

    if (t.autoWidth === false) {
      return { width: t.width || 200, height: t.height || height };
    }

    if (typeof document !== 'undefined') {
      if (!measureCtx) {
        const c = document.createElement('canvas');
        measureCtx = c.getContext('2d');
      }
      if (measureCtx) {
        const weight = t.fontWeight || 'normal';
        const style = t.fontStyle === 'italic' ? 'italic' : 'normal';
        measureCtx.font = `${style} ${weight} ${t.fontSize}px ${t.fontFamily || 'Inter, sans-serif'}`;
        const letterSpacing = t.letterSpacing || 0;
        let maxLineW = 0;
        lines.forEach((line) => {
          const metrics = measureCtx!.measureText(line);
          const extraSpacing = Math.max(0, line.length - 1) * letterSpacing;
          maxLineW = Math.max(maxLineW, metrics.width + extraSpacing);
        });
        return { width: Math.max(20, maxLineW), height };
      }
    }
    return { width: t.width || 200, height };
  }

  return {
    width: layer.width || 100,
    height: layer.height || 100,
  };
}

export function getAlignedPosition(
  layer: CanvasLayer,
  canvasWidth: number,
  canvasHeight: number,
  alignType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): { x: number; y: number } {
  const { width: w, height: h } = getLayerDimensions(layer);
  const sx = layer.scaleX ?? 1;
  const sy = layer.scaleY ?? 1;
  const offset = getOffsetForAnchor(layer.anchor, w, h);

  let newX = layer.x;
  let newY = layer.y;

  const visualW = w * sx;
  const visualH = h * sy;
  const scaledOffsetX = offset.x * sx;
  const scaledOffsetY = offset.y * sy;

  if (alignType === 'left') newX = scaledOffsetX;
  if (alignType === 'center') newX = (canvasWidth - visualW) / 2 + scaledOffsetX;
  if (alignType === 'right') newX = canvasWidth - visualW + scaledOffsetX;

  if (alignType === 'top') newY = scaledOffsetY;
  if (alignType === 'middle') newY = (canvasHeight - visualH) / 2 + scaledOffsetY;
  if (alignType === 'bottom') newY = canvasHeight - visualH + scaledOffsetY;

  return { x: Math.round(newX), y: Math.round(newY) };
}

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

  const rotatedDx = dx * cos - dy * sin;
  const rotatedDy = dx * sin + dy * cos;

  return {
    x: Math.round(x + rotatedDx),
    y: Math.round(y + rotatedDy),
  };
}
