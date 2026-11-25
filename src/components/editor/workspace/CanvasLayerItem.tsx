'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Text as KonvaText, 
  Image as KonvaImage, 
  Rect as KonvaRect, 
  Circle as KonvaCircle, 
  Line as KonvaLine, 
  Star as KonvaStar, 
  Group as KonvaGroup,
  Path as KonvaPath
} from 'react-konva';
import Konva from 'konva';
import { CanvasLayer, TextLayer, ImageLayer, ShapeLayer, IconLayer, BadgeLayer, GroupLayer } from '@/types/editor';
import { getOffsetForAnchor } from '@/utils/transformUtils';

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
            cornerRadius={(layer as ShapeLayer).cornerRadius || 0}
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
        const icon = layer as IconLayer;
        // Default star icon path if not provided
        const pathData = icon.svgString || "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
        const scale = Math.min(layer.width, layer.height || layer.width) / 24;

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
            <KonvaPath
              data={pathData}
              fill={icon.fill || 'transparent'}
              stroke={icon.stroke || '#7C3AED'}
              strokeWidth={(icon.strokeWidth || 2) / scale}
              scale={{ x: scale, y: scale }}
              lineCap="round"
              lineJoin="round"
            />
          </KonvaGroup>
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
  let fontStyleString = 'normal';
  if (layer.fontWeight && layer.fontStyle === 'italic') {
    fontStyleString = `${layer.fontWeight} italic`;
  } else if (layer.fontWeight) {
    fontStyleString = `${layer.fontWeight}`;
  } else if (layer.fontStyle) {
    fontStyleString = layer.fontStyle;
  }

  const textHeight = layer.height || layer.fontSize * 1.2;
  const offset = getOffsetForAnchor(layer.anchor, layer.width, textHeight);

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
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = layer.src;
    img.onload = () => {
      setImageObj(img);
    };
  }, [layer.src]);

  const imgOffset = getOffsetForAnchor(layer.anchor, layer.width, layer.height || 100);

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
      cornerRadius={layer.cornerRadius || 0}
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
      crop={layer.crop}
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
