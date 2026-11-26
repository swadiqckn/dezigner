'use client';

import React, { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';
import { 
  Text as KonvaText, 
  Image as KonvaImage, 
  Rect as KonvaRect, 
  Circle as KonvaCircle, 
  Line as KonvaLine, 
  Star as KonvaStar, 
  RegularPolygon as KonvaRegularPolygon,
  Group as KonvaGroup,
  Path as KonvaPath
} from 'react-konva';
import Konva from 'konva';
import { CanvasLayer, TextLayer, ImageLayer, ShapeLayer, IconLayer, BadgeLayer, GroupLayer } from '@/types/editor';
import { getOffsetForAnchor, getLayerDimensions } from '@/utils/transformUtils';
import { loadGoogleFont } from '@/constants/fonts';

interface CanvasLayerItemProps {
  layer: CanvasLayer;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (updates: Partial<CanvasLayer>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDoubleClick?: () => void;
}

export const CanvasLayerItem = React.forwardRef<Konva.Node, CanvasLayerItemProps>(
  ({ layer, onSelect, onChange, onDragMove, onDragEnd, onDoubleClick }, ref) => {
    // If hidden, do not render
    if (layer.visible === false) return null;

    const isDraggable = !layer.locked;
    const itemHeight = layer.height || ((layer as any).fontSize ? (layer as any).fontSize * 1.2 : 50);
    const offset = getOffsetForAnchor(layer.anchor, layer.width, itemHeight);

    // Handle Transform End
    const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and update actual width/height or scaleX/scaleY
      node.scaleX(1);
      node.scaleY(1);

      const updates: Partial<CanvasLayer> = {
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        rotation: Math.round(node.rotation()),
        width: Math.max(10, Math.round(node.width() * scaleX)),
        height: Math.max(10, Math.round(node.height() * scaleY)),
        scaleX: 1,
        scaleY: 1,
      };

      onChange(updates);
    };

    // Handle Drag End
    const handleDragEndInternal = (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      onChange({
        x: Math.round(node.x()),
        y: Math.round(node.y()),
      });
      if (onDragEnd) onDragEnd(e);
    };

    switch (layer.type) {
      case 'text':
        return (
          <RenderTextLayer
            ref={ref as React.Ref<Konva.Text>}
            layer={layer as TextLayer}
            isDraggable={isDraggable}
            onSelect={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
            onDblClick={onDoubleClick}
          />
        );

      case 'image':
        return (
          <RenderImageLayer
            ref={ref as React.Ref<Konva.Image>}
            layer={layer as ImageLayer}
            isDraggable={isDraggable}
            onSelect={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          />
        );

      case 'rect':
        return (
          <KonvaRect
            ref={ref as React.Ref<Konva.Rect>}
            id={layer.id}
            name={layer.id}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            offsetX={offset.x}
            offsetY={offset.y}
            scaleX={layer.scaleX ?? 1}
            scaleY={layer.scaleY ?? 1}
            fill={(layer as ShapeLayer).fill}
            stroke={(layer as ShapeLayer).stroke}
            strokeWidth={(layer as ShapeLayer).strokeWidth || 0}
            cornerRadius={(layer as ShapeLayer).cornerRadii || (layer as ShapeLayer).cornerRadius || 0}
            dash={(layer as ShapeLayer).dash}
            rotation={layer.rotation || 0}
            opacity={layer.opacity ?? 1}
            shadowColor={(layer as ShapeLayer).shadowColor}
            shadowBlur={(layer as ShapeLayer).shadowBlur}
            shadowOffset={{
              x: (layer as ShapeLayer).shadowOffsetX || 0,
              y: (layer as ShapeLayer).shadowOffsetY || 0,
            }}
            shadowOpacity={(layer as ShapeLayer).shadowOpacity}
            draggable={isDraggable}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          />
        );

      case 'circle': {
        const radius = Math.min(layer.width, layer.height || layer.width) / 2;
        return (
          <KonvaCircle
            ref={ref as React.Ref<Konva.Circle>}
            id={layer.id}
            name={layer.id}
            x={layer.x + radius}
            y={layer.y + radius}
            radius={radius}
            fill={(layer as ShapeLayer).fill}
            stroke={(layer as ShapeLayer).stroke}
            strokeWidth={(layer as ShapeLayer).strokeWidth || 0}
            rotation={layer.rotation || 0}
            opacity={layer.opacity ?? 1}
            shadowColor={(layer as ShapeLayer).shadowColor}
            shadowBlur={(layer as ShapeLayer).shadowBlur}
            draggable={isDraggable}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          />
        );
      }

      case 'star': {
        const shape = layer as ShapeLayer;
        const outerRad = Math.min(layer.width, layer.height || layer.width) / 2;
        const innerRad = shape.innerRadius || outerRad * 0.45;
        return (
          <KonvaStar
            ref={ref as React.Ref<Konva.Star>}
            id={layer.id}
            name={layer.id}
            x={layer.x + outerRad}
            y={layer.y + outerRad}
            numPoints={shape.numPoints || 5}
            innerRadius={innerRad}
            outerRadius={outerRad}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth || 0}
            rotation={layer.rotation || 0}
            opacity={layer.opacity ?? 1}
            draggable={isDraggable}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          />
        );
      }

      case 'polygon': {
        const shape = layer as ShapeLayer;
        const variant = shape.shapeVariant;
        if (variant === 'arrow' || variant === 'heart' || variant === 'cross') {
          const pathMap: Record<string, string> = {
            arrow: 'M 0 35 L 60 35 L 60 15 L 100 50 L 60 85 L 60 65 L 0 65 Z',
            heart: 'M 50 90 C 20 70 0 50 0 28 C 0 12 13 0 28 0 C 38 0 46 6 50 14 C 54 6 62 0 72 0 C 87 0 100 12 100 28 C 100 50 80 70 50 90 Z',
            cross: 'M 35 0 L 65 0 L 65 35 L 100 35 L 100 65 L 65 65 L 65 100 L 35 100 L 35 65 L 0 65 L 0 35 L 35 35 Z',
          };
          const h = layer.height || layer.width;
          return (
            <KonvaPath
              ref={ref as React.Ref<Konva.Path>}
              id={layer.id}
              name={layer.id}
              x={layer.x}
              y={layer.y}
              data={pathMap[variant]}
              scaleX={(layer.width / 100) * (layer.scaleX ?? 1)}
              scaleY={(h / 100) * (layer.scaleY ?? 1)}
              fill={shape.fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth || 0}
              rotation={layer.rotation || 0}
              opacity={layer.opacity ?? 1}
              draggable={isDraggable}
              onClick={onSelect}
              onTap={onSelect}
              onTransformEnd={handleTransformEnd}
              onDragMove={onDragMove}
              onDragEnd={handleDragEndInternal}
            />
          );
        }

        const radius = Math.min(layer.width, layer.height || layer.width) / 2;
        return (
          <KonvaRegularPolygon
            ref={ref as React.Ref<Konva.RegularPolygon>}
            id={layer.id}
            name={layer.id}
            x={layer.x + radius}
            y={layer.y + radius}
            sides={shape.sides || 3}
            radius={radius}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth || 0}
            rotation={layer.rotation || 0}
            opacity={layer.opacity ?? 1}
            shadowColor={shape.shadowColor}
            shadowBlur={shape.shadowBlur}
            draggable={isDraggable}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          />
        );
      }

      case 'line': {
        const shape = layer as ShapeLayer;
        return (
          <KonvaLine
            ref={ref as React.Ref<Konva.Line>}
            id={layer.id}
            name={layer.id}
            x={layer.x}
            y={layer.y}
            points={shape.points || [0, 0, layer.width, layer.height || 4]}
            stroke={shape.stroke || shape.fill || '#333333'}
            strokeWidth={shape.strokeWidth || 4}
            dash={shape.dash}
            lineCap="round"
            lineJoin="round"
            rotation={layer.rotation || 0}
            opacity={layer.opacity ?? 1}
            draggable={isDraggable}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          />
        );
      }

      case 'icon': {
        return (
          <RenderIconLayer
            ref={ref as React.Ref<Konva.Image>}
            layer={layer as IconLayer}
            isDraggable={isDraggable}
            onSelect={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          />
        );
      }

      case 'badge': {
        const badge = layer as BadgeLayer;
        return (
          <KonvaGroup
            ref={ref as React.Ref<Konva.Group>}
            id={layer.id}
            name={layer.id}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            rotation={layer.rotation || 0}
            opacity={layer.opacity ?? 1}
            draggable={isDraggable}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          >
            <KonvaRect
              width={layer.width}
              height={layer.height}
              fill={badge.fill}
              stroke={badge.stroke}
              strokeWidth={badge.strokeWidth || 0}
              cornerRadius={16}
            />
            {badge.text && (
              <KonvaText
                text={badge.text}
                width={layer.width}
                height={layer.height}
                align="center"
                verticalAlign="middle"
                fontSize={badge.fontSize || 18}
                fontFamily="'Inter', sans-serif"
                fontStyle="bold"
                fill={badge.textColor || '#FFFFFF'}
              />
            )}
          </KonvaGroup>
        );
      }

      case 'group': {
        return (
          <KonvaGroup
            ref={ref as React.Ref<Konva.Group>}
            id={layer.id}
            name={layer.id}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            offsetX={offset.x}
            offsetY={offset.y}
            scaleX={layer.scaleX ?? 1}
            scaleY={layer.scaleY ?? 1}
            rotation={layer.rotation || 0}
            opacity={layer.opacity ?? 1}
            draggable={isDraggable}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
            onDragMove={onDragMove}
            onDragEnd={handleDragEndInternal}
          >
            <KonvaRect
              width={layer.width}
              height={layer.height || 50}
              fill="transparent"
              stroke="#A855F7"
              strokeWidth={1}
              dash={[5, 5]}
            />
          </KonvaGroup>
        );
      }

      default:
        return null;
    }
  }
);

CanvasLayerItem.displayName = 'CanvasLayerItem';

// Subcomponent: Text Layer with Google Fonts & Typography
const RenderTextLayer = React.forwardRef<
  Konva.Text,
  {
    layer: TextLayer;
    isDraggable: boolean;
    onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
    onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
    onDblClick?: () => void;
  }
>(({ layer, isDraggable, onSelect, onTransformEnd, onDragMove, onDragEnd, onDblClick }, ref) => {
  const [, setFontTick] = useState(0);

  // Ensure Google Font is loaded and re-measure/redraw once font faces finish loading
  useEffect(() => {
    let cancelled = false;
    const handleFontsReady = () => {
      if (!cancelled) {
        setFontTick((t) => t + 1);
      }
    };

    if (layer.fontFamily) {
      loadGoogleFont(layer.fontFamily).then(handleFontsReady);
    }
    if (typeof document === 'undefined' || !('fonts' in document)) return;

    document.fonts.ready.then(handleFontsReady);
    document.fonts.addEventListener?.('loadingdone', handleFontsReady);
    return () => {
      cancelled = true;
      document.fonts.removeEventListener?.('loadingdone', handleFontsReady);
    };
  }, [layer.fontFamily, layer.text, layer.fontSize]);

  let fontStyleString = 'normal';
  if (layer.fontWeight && layer.fontStyle === 'italic') {
    fontStyleString = `${layer.fontWeight} italic`;
  } else if (layer.fontWeight) {
    fontStyleString = `${layer.fontWeight}`;
  } else if (layer.fontStyle) {
    fontStyleString = layer.fontStyle;
  }

  const { width: textWidth, height: textHeight } = getLayerDimensions(layer);
  const offset = getOffsetForAnchor(layer.anchor, textWidth, textHeight);

  // Check if any per-word styles are active
  const hasWordStyles = Boolean(layer.wordStyles && Object.keys(layer.wordStyles).length > 0);

  if (hasWordStyles) {
    // Render multi-styled words inside a KonvaGroup
    const lines = (layer.text || '').split('\n');
    const lineHeightPx = layer.fontSize * (layer.lineHeight || 1.2);
    const letterSpacing = layer.letterSpacing || 0;
    const measureCtx =
      typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

    let globalWordIndex = 0;
    const renderedWords: Array<{
      key: string;
      text: string;
      x: number;
      y: number;
      fontFamily: string;
      fontSize: number;
      fontStyle: string;
      textDecoration: string;
      fill: string;
    }> = [];

    lines.forEach((lineStr, lineIdx) => {
      const tokens = lineStr.split(/(\s+)/).filter((t) => t.length > 0);
      const lineItems: Array<{
        wordIdx: number | null;
        token: string;
        width: number;
        fontFamily: string;
        fontSize: number;
        fontStyle: string;
        textDecoration: string;
        fill: string;
      }> = [];

      let totalLineW = 0;
      tokens.forEach((token) => {
        const isSpace = /^\s+$/.test(token);
        const wIdx = isSpace ? null : globalWordIndex++;
        const ws = wIdx !== null ? layer.wordStyles?.[wIdx] : undefined;

        const wFamily = ws?.fontFamily || layer.fontFamily;
        const wSize = ws?.fontSize || layer.fontSize;
        const wWeight = ws?.fontWeight || layer.fontWeight || 'normal';
        const wItalic = ws?.fontStyle || layer.fontStyle || 'normal';
        const wFontStyle = wItalic === 'italic' ? `${wWeight} italic` : `${wWeight}`;
        const wDecor = ws?.textDecoration || layer.textDecoration || 'none';
        const wColor = ws?.color || layer.color;

        let measuredW = token.length * wSize * 0.55;
        if (measureCtx) {
          measureCtx.font = `${wItalic === 'italic' ? 'italic ' : ''}${wWeight} ${wSize}px '${wFamily}', sans-serif`;
          measuredW = measureCtx.measureText(token).width + Math.max(0, token.length - 1) * letterSpacing;
        }

        lineItems.push({
          wordIdx: wIdx,
          token,
          width: measuredW,
          fontFamily: wFamily,
          fontSize: wSize,
          fontStyle: wFontStyle,
          textDecoration: wDecor,
          fill: wColor,
        });
        totalLineW += measuredW;
      });

      let startX = 0;
      if (layer.textAlign === 'center') {
        startX = Math.max(0, (textWidth - totalLineW) / 2);
      } else if (layer.textAlign === 'right') {
        startX = Math.max(0, textWidth - totalLineW);
      }

      let curX = startX;
      lineItems.forEach((item, tIdx) => {
        if (item.wordIdx !== null) {
          renderedWords.push({
            key: `${lineIdx}-${tIdx}-${item.wordIdx}`,
            text: item.token,
            x: curX,
            y: lineIdx * lineHeightPx,
            fontFamily: item.fontFamily,
            fontSize: item.fontSize,
            fontStyle: item.fontStyle,
            textDecoration: item.textDecoration,
            fill: item.fill,
          });
        }
        curX += item.width;
      });
    });

    return (
      <KonvaGroup
        ref={ref as unknown as React.Ref<Konva.Group>}
        id={layer.id}
        name={layer.id}
        x={layer.x}
        y={layer.y}
        width={textWidth}
        height={textHeight}
        offsetX={offset.x}
        offsetY={offset.y}
        scaleX={layer.scaleX ?? 1}
        scaleY={layer.scaleY ?? 1}
        rotation={layer.rotation || 0}
        opacity={layer.opacity ?? 1}
        draggable={isDraggable}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDblClick}
        onTransformEnd={onTransformEnd}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      >
        {renderedWords.map((w) => (
          <KonvaText
            key={w.key}
            text={w.text}
            x={w.x}
            y={w.y}
            fontSize={w.fontSize}
            fontFamily={w.fontFamily}
            fontStyle={w.fontStyle}
            textDecoration={w.textDecoration}
            letterSpacing={letterSpacing}
            fill={w.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth || 0}
            shadowColor={layer.shadowColor}
            shadowBlur={layer.shadowBlur}
            shadowOffset={{
              x: layer.shadowOffsetX || 0,
              y: layer.shadowOffsetY || 0,
            }}
            shadowOpacity={layer.shadowOpacity}
          />
        ))}
      </KonvaGroup>
    );
  }

  return (
    <KonvaText
      ref={ref}
      id={layer.id}
      name={layer.id}
      text={layer.text}
      x={layer.x}
      y={layer.y}
      width={layer.autoWidth === false ? layer.width : undefined}
      offsetX={offset.x}
      offsetY={offset.y}
      scaleX={layer.scaleX ?? 1}
      scaleY={layer.scaleY ?? 1}
      fontSize={layer.fontSize}
      fontFamily={layer.fontFamily}
      fontStyle={fontStyleString}
      textDecoration={layer.textDecoration || 'none'}
      align={layer.textAlign || 'left'}
      letterSpacing={layer.letterSpacing || 0}
      lineHeight={layer.lineHeight || 1.2}
      fill={layer.color}
      stroke={layer.stroke}
      strokeWidth={layer.strokeWidth || 0}
      rotation={layer.rotation || 0}
      opacity={layer.opacity ?? 1}
      shadowColor={layer.shadowColor}
      shadowBlur={layer.shadowBlur}
      shadowOffset={{
        x: layer.shadowOffsetX || 0,
        y: layer.shadowOffsetY || 0,
      }}
      shadowOpacity={layer.shadowOpacity}
      wrap={layer.autoWidth === false ? "word" : "none"}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDblClick}
      onTransformEnd={onTransformEnd}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
});
RenderTextLayer.displayName = 'RenderTextLayer';

// Subcomponent: Image Layer with async load and crop/fit
const RenderImageLayer = React.forwardRef<
  Konva.Image,
  {
    layer: ImageLayer;
    isDraggable: boolean;
    onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
    onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  }
>(({ layer, isDraggable, onSelect, onTransformEnd, onDragMove, onDragEnd }, ref) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!layer.src) return;
    let cancelled = false;
    const isExternalUrl = /^https?:\/\//i.test(layer.src);

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      if (!cancelled) setImageObj(img);
    };

    img.onerror = () => {
      // If direct CORS load fails on an external URL, fall back to our image-proxy
      if (isExternalUrl && !cancelled) {
        const proxied = new window.Image();
        proxied.crossOrigin = 'Anonymous';
        proxied.onload = () => {
          if (!cancelled) setImageObj(proxied);
        };
        proxied.src = `/api/image-proxy?url=${encodeURIComponent(layer.src)}`;
      }
    };

    img.src = layer.src;
    return () => {
      cancelled = true;
    };
  }, [layer.src]);

  const imgOffset = getOffsetForAnchor(layer.anchor, layer.width, layer.height || 100);

  // Compute automatic object-fit: cover crop when dimensions differ from original image ratio
  let computedCrop = layer.crop;
  if (!computedCrop && imageObj && imageObj.naturalWidth > 0 && imageObj.naturalHeight > 0 && layer.fit !== 'fill') {
    const boxW = layer.width || imageObj.naturalWidth;
    const boxH = layer.height || imageObj.naturalHeight;
    const imgW = imageObj.naturalWidth;
    const imgH = imageObj.naturalHeight;
    const boxRatio = boxW / boxH;
    const imgRatio = imgW / imgH;

    if (Math.abs(imgRatio - boxRatio) > 0.01) {
      if (imgRatio > boxRatio) {
        const cropW = imgH * boxRatio;
        computedCrop = {
          x: (imgW - cropW) / 2,
          y: 0,
          width: cropW,
          height: imgH,
        };
      } else {
        const cropH = imgW / boxRatio;
        computedCrop = {
          x: 0,
          y: (imgH - cropH) / 2,
          width: imgW,
          height: cropH,
        };
      }
    }
  }

  return (
    <KonvaImage
      ref={ref}
      id={layer.id}
      name={layer.id}
      image={imageObj || undefined}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      offsetX={imgOffset.x}
      offsetY={imgOffset.y}
      scaleX={layer.scaleX ?? 1}
      scaleY={layer.scaleY ?? 1}
      rotation={layer.rotation || 0}
      opacity={layer.opacity ?? 1}
      cornerRadius={layer.cornerRadii || layer.cornerRadius || 0}
      stroke={layer.stroke}
      strokeWidth={layer.strokeWidth || 0}
      shadowEnabled={Boolean(layer.shadowColor && layer.shadowColor !== 'transparent')}
      shadowForStrokeEnabled={false}
      shadowColor={layer.shadowColor === 'transparent' ? undefined : layer.shadowColor}
      shadowBlur={layer.shadowBlur ?? 12}
      shadowOffset={{
        x: layer.shadowOffsetX ?? 4,
        y: layer.shadowOffsetY ?? 6,
      }}
      shadowOpacity={layer.shadowOpacity ?? 0.5}
      crop={computedCrop}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onTransformEnd={onTransformEnd}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
});
RenderImageLayer.displayName = 'RenderImageLayer';

// Subcomponent: Vector Icon Layer rendering exact Lucide SVG
const RenderIconLayer = React.forwardRef<
  Konva.Image,
  {
    layer: IconLayer;
    isDraggable: boolean;
    onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
    onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  }
>(({ layer, isDraggable, onSelect, onTransformEnd, onDragMove, onDragEnd }, ref) => {
  const [svgImg, setSvgImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const IconComp = (LucideIcons as any)[layer.iconName] || LucideIcons.Star;
    const strokeColor = layer.stroke && layer.stroke !== 'transparent' ? layer.stroke : '#39216C';
    const fillColor = layer.fill && layer.fill !== 'transparent' ? layer.fill : 'none';
    const strokeW = layer.strokeWidth ?? 2;

    let markup = '';
    if (layer.svgString && !layer.iconName) {
      markup = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"><path d="${layer.svgString}"/></svg>`;
    } else {
      const raw = renderToStaticMarkup(
        <IconComp
          width={256}
          height={256}
          color={strokeColor}
          strokeWidth={strokeW}
          fill={fillColor}
        />
      );
      markup = raw.includes('xmlns=')
        ? raw
        : raw.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const img = new window.Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    img.onload = () => setSvgImg(img);
  }, [layer.iconName, layer.svgString, layer.stroke, layer.strokeWidth, layer.fill]);

  const iconOffset = getOffsetForAnchor(layer.anchor, layer.width, layer.height || layer.width);

  return (
    <KonvaImage
      ref={ref}
      id={layer.id}
      name={layer.id}
      image={svgImg || undefined}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height || layer.width}
      offsetX={iconOffset.x}
      offsetY={iconOffset.y}
      scaleX={layer.scaleX ?? 1}
      scaleY={layer.scaleY ?? 1}
      rotation={layer.rotation || 0}
      opacity={layer.opacity ?? 1}
      draggable={isDraggable}
      onClick={onSelect}
      onTap={onSelect}
      onTransformEnd={onTransformEnd}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
});
RenderIconLayer.displayName = 'RenderIconLayer';
