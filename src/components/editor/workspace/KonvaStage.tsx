'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Transformer, Line, Circle } from 'react-konva';
import Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { CanvasLayerItem } from './CanvasLayerItem';
import { CanvasLayer, TextLayer, GroupLayer } from '@/types/editor';
import { getVisualBounds } from '@/utils/transformUtils';

interface KonvaStageProps {
  onStageReady?: (stage: Konva.Stage | null) => void;
}

interface AlignmentLine {
  orientation: 'vertical' | 'horizontal';
  position: number;
}

export default function KonvaStage({ onStageReady }: KonvaStageProps) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const groupDragOriginRef = useRef<{
    groupId: string;
    groupX: number;
    groupY: number;
    children: Record<string, { x: number; y: number }>;
  } | null>(null);

  const {
    width,
    height,
    background,
    layers,
    selectedLayerIds,
    zoom,
    pan,
    showGrid,
    gridSize,
    showGuides,
    setSelectedLayerIds,
    toggleSelection,
    clearSelection,
    updateLayer,
    commitSnapshot,
    deleteSelectedLayers,
    copySelected,
    paste,
    pasteStyle,
    undo,
    redo,
    selectAll,
  } = useEditorStore();

  const [guidelines, setGuidelines] = useState<AlignmentLine[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextPos, setEditingTextPos] = useState<{ x: number; y: number; width: number; height: number; fontSize: number; text: string } | null>(null);

  // Notify parent of stage instance for exports
  useEffect(() => {
    if (onStageReady) {
      onStageReady(stageRef.current);
    }
  }, [onStageReady]);

  // Sync selection to Konva Transformer
  useEffect(() => {
    if (!trRef.current || !layerRef.current) return;

    if (selectedLayerIds.length === 0) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
      return;
    }

    const selectedNodes: Konva.Node[] = [];
    selectedLayerIds.forEach((id) => {
      const node = layerRef.current?.findOne(`.${id}`);
      if (node) {
        selectedNodes.push(node);
      }
    });

    const targetLayer = layers.find((l) => selectedLayerIds.includes(l.id));
    if (targetLayer?.locked) {
      // If locked, disable resize & rotate handles
      trRef.current.resizeEnabled(false);
      trRef.current.rotateEnabled(false);
    } else {
      trRef.current.resizeEnabled(true);
      trRef.current.rotateEnabled(true);
    }

    trRef.current.nodes(selectedNodes);
    trRef.current.forceUpdate();
    trRef.current.getLayer()?.batchDraw();
  }, [selectedLayerIds, layers]);

  // Smart Alignment Guides computation
  const getLineGuideStops = useCallback(
    (skipId?: string) => {
      const vertical: number[] = [0, width / 2, width];
      const horizontal: number[] = [0, height / 2, height];

      layers.forEach((l) => {
        if (l.id === skipId || l.visible === false) return;
        const lh = l.height || 50;
        vertical.push(l.x, l.x + l.width / 2, l.x + l.width);
        horizontal.push(l.y, l.y + lh / 2, l.y + lh);
      });

      return { vertical, horizontal };
    },
    [layers, width, height]
  );

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const target = e.target;

      if (!showGuides) return;
      const guideStops = getLineGuideStops(target.id());
      const targetBox = target.getClientRect({ relativeTo: layerRef.current || undefined });

      const SNAP_TOLERANCE = 8;
      const activeLines: AlignmentLine[] = [];

      // Check vertical snap points: left, center, right
      const snapPointsX = [
        { objVal: targetBox.x, guideOffset: 0 },
        { objVal: targetBox.x + targetBox.width / 2, guideOffset: -targetBox.width / 2 },
        { objVal: targetBox.x + targetBox.width, guideOffset: -targetBox.width },
      ];

      for (const pt of snapPointsX) {
        for (const stop of guideStops.vertical) {
          if (Math.abs(pt.objVal - stop) < SNAP_TOLERANCE) {
            const snapDx = stop + pt.guideOffset - targetBox.x;
            target.x(target.x() + snapDx);
            activeLines.push({ orientation: 'vertical', position: stop });
            break;
          }
        }
      }

      // Check horizontal snap points: top, middle, bottom
      const snapPointsY = [
        { objVal: targetBox.y, guideOffset: 0 },
        { objVal: targetBox.y + targetBox.height / 2, guideOffset: -targetBox.height / 2 },
        { objVal: targetBox.y + targetBox.height, guideOffset: -targetBox.height },
      ];

      for (const pt of snapPointsY) {
        for (const stop of guideStops.horizontal) {
          if (Math.abs(pt.objVal - stop) < SNAP_TOLERANCE) {
            const snapDy = stop + pt.guideOffset - targetBox.y;
            target.y(target.y() + snapDy);
            activeLines.push({ orientation: 'horizontal', position: stop });
            break;
          }
        }
      }

      setGuidelines(activeLines);
    },
    [showGuides, getLineGuideStops]
  );

  const handleDragEnd = useCallback(() => {
    groupDragOriginRef.current = null;
    setGuidelines([]);
    commitSnapshot();
  }, [commitSnapshot]);

  // Handle stage click (deselect or multi-select)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // If clicked on empty background, clear selection
    if (e.target === stageRef.current || e.target.hasName('canvas-background-node')) {
      clearSelection();
      setEditingTextId(null);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when editing text in input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        editingTextId !== null
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if ((e.key === 'Delete' || e.key === 'Backspace') && !cmdOrCtrl) {
        e.preventDefault();
        deleteSelectedLayers();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelected();
      } else if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteStyle();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        paste();
      } else if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if ((cmdOrCtrl && e.key.toLowerCase() === 'y') || (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        redo();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -delta;
        if (e.key === 'ArrowDown') dy = delta;
        if (e.key === 'ArrowLeft') dx = -delta;
        if (e.key === 'ArrowRight') dx = delta;
        const unlockedIds = selectedLayerIds.filter((id) => {
          const l = layers.find((layer) => layer.id === id);
          return l && !l.locked;
        });
        if (unlockedIds.length > 0) {
          useEditorStore.getState().moveLayersDelta(unlockedIds, dx, dy, false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    editingTextId,
    deleteSelectedLayers,
    copySelected,
    paste,
    pasteStyle,
    undo,
    redo,
    selectAll,
    selectedLayerIds,
    layers,
    updateLayer,
  ]);

  // Double click on text layer to edit inline
  const handleTextDoubleClick = (layer: TextLayer) => {
    if (layer.locked || layer.editable === false) return;
    setEditingTextId(layer.id);
    setEditingTextPos({
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height || layer.fontSize * 1.3,
      fontSize: layer.fontSize,
      text: layer.text,
    });
  };

  // Render Grid Lines if enabled
  const renderGridLines = () => {
    if (!showGrid) return null;
    const lines = [];
    for (let x = gridSize; x < width; x += gridSize) {
      lines.push(
        <Line
          key={`grid-v-${x}`}
          points={[x, 0, x, height]}
          stroke="#E2E8F0"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      );
    }
    for (let y = gridSize; y < height; y += gridSize) {
      lines.push(
        <Line
          key={`grid-h-${y}`}
          points={[0, y, width, y]}
          stroke="#E2E8F0"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      );
    }
    return lines;
  };

  return (
    <div
      className="relative select-none shadow-2xl rounded-sm transition-all duration-75 shrink-0"
      style={{
        width: `${Math.round(width * zoom)}px`,
        height: `${Math.round(height * zoom)}px`,
        transform: `translate(${pan.x}px, ${pan.y}px)`,
      }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer ref={layerRef}>
          {/* Background Canvas Node */}
          {background.type === 'gradient' && background.gradient ? (
            <Rect
              name="canvas-background-node"
              x={0}
              y={0}
              width={width}
              height={height}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{
                x: width * Math.cos(((background.gradient.angle || 135) * Math.PI) / 180),
                y: height * Math.sin(((background.gradient.angle || 135) * Math.PI) / 180),
              }}
              fillLinearGradientColorStops={background.gradient.stops.flatMap((s) => [s.offset, s.color])}
            />
          ) : (
            <Rect
              name="canvas-background-node"
              x={0}
              y={0}
              width={width}
              height={height}
              fill={background.color || '#FFFFFF'}
            />
          )}

          {/* Grid lines */}
          {renderGridLines()}

          {/* Canvas Layers (grouped children render inside their parent KonvaGroup like a Smart Object) */}
          {(() => {
            const groupedChildIds = new Set<string>();
            layers.forEach((l) => {
              if (l.type === 'group' && Array.isArray((l as GroupLayer).layerIds)) {
                (l as GroupLayer).layerIds.forEach((cid) => groupedChildIds.add(cid));
              }
            });

            return layers.map((layer) => {
              if (groupedChildIds.has(layer.id)) return null;
              const isSelected = selectedLayerIds.includes(layer.id);
              const childLayers =
                layer.type === 'group'
                  ? layers.filter((c) => ((layer as GroupLayer).layerIds || []).includes(c.id))
                  : undefined;

              return (
                <CanvasLayerItem
                  key={layer.id}
                  layer={layer}
                  isSelected={isSelected}
                  childLayers={childLayers}
                  selectedLayerIds={selectedLayerIds}
                  onChildSelect={(cid, e) => {
                    toggleSelection(cid, e.evt.shiftKey);
                  }}
                  onChildChange={(cid, u) => updateLayer(cid, u, true)}
                  onSelect={(e) => {
                    e.cancelBubble = true;
                    if (layer.selectable === false) return;
                    const isMulti = e.evt.shiftKey;
                    toggleSelection(layer.id, isMulti);
                  }}
                  onChange={(updates) => {
                    updateLayer(layer.id, updates, true);
                  }}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onDoubleClick={() => {
                    if (layer.type === 'text') {
                      handleTextDoubleClick(layer as TextLayer);
                    }
                  }}
                />
              );
            });
          })()}

          {/* Dynamic Smart Alignment Guidelines */}
          {guidelines.map((guide, idx) => (
            <Line
              key={`guide-${idx}`}
              points={
                guide.orientation === 'vertical'
                  ? [guide.position, 0, guide.position, height]
                  : [0, guide.position, width, guide.position]
              }
              stroke="#A855F7"
              strokeWidth={Math.max(1.5, 1.5 / Math.max(0.1, zoom))}
              dash={[6 / Math.max(0.1, zoom), 3 / Math.max(0.1, zoom)]}
              listening={false}
            />
          ))}

          {/* Modern Designer Bounding Box / Transformer */}
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                return oldBox;
              }
              return newBox;
            }}
            borderStroke="#7C3AED"
            borderStrokeWidth={Math.max(2, 2.5 / Math.max(0.1, zoom))}
            anchorStroke="#7C3AED"
            anchorStrokeWidth={Math.max(2, 2 / Math.max(0.1, zoom))}
            anchorFill="#FFFFFF"
            anchorSize={Math.max(10, Math.round(12 / Math.max(0.1, zoom)))}
            anchorCornerRadius={Math.max(2, Math.round(3 / Math.max(0.1, zoom)))}
            anchorStyleFunc={(anchor) => {
              const primaryLayer = layers.find((l) => l.id === selectedLayerIds[0]);
              const activeAnchor = primaryLayer?.anchor || 'center';
              const anchorName = anchor.name() || '';
              const isCurrentAnchor =
                activeAnchor !== 'center' && anchorName.includes(activeAnchor);

              if (isCurrentAnchor) {
                anchor.fill('#2563EB');
                anchor.stroke('#1D4ED8');
              } else {
                anchor.fill('#FFFFFF');
                anchor.stroke('#7C3AED');
              }
            }}
            rotateAnchorOffset={Math.max(20, Math.round(28 / Math.max(0.1, zoom)))}
            keepRatio={true}
          />

          {/* Blue center anchor indicator when current anchor is 'center' */}
          {selectedLayerIds.length === 1 && (() => {
            const primaryLayer = layers.find((l) => l.id === selectedLayerIds[0]);
            if (!primaryLayer || (primaryLayer.anchor || 'center') !== 'center') return null;
            const vb = getVisualBounds(primaryLayer);
            const r = Math.max(4, 5 / Math.max(0.1, zoom));
            return (
              <Circle
                x={vb.left + vb.width / 2}
                y={vb.top + vb.height / 2}
                radius={r}
                fill="#2563EB"
                stroke="#FFFFFF"
                strokeWidth={Math.max(1.5, 1.5 / Math.max(0.1, zoom))}
                listening={false}
              />
            );
          })()}
        </Layer>
      </Stage>
    </div>

      {/* Inline Text Quick Editor Overlay */}
      {editingTextId && editingTextPos && (
        <div
          style={{
            position: 'absolute',
            left: `${editingTextPos.x * zoom}px`,
            top: `${editingTextPos.y * zoom}px`,
            width: `${editingTextPos.width * zoom}px`,
            zIndex: 100,
          }}
        >
          <textarea
            autoFocus
            wrap="off"
            className="min-w-[200px] w-max bg-white text-slate-900 border-2 border-purple-600 rounded p-1.5 shadow-xl outline-none resize-none font-sans whitespace-pre overflow-x-auto"
            style={{
              fontSize: `${Math.max(12, editingTextPos.fontSize * zoom)}px`,
              lineHeight: 1.2,
            }}
            value={editingTextPos.text}
            onChange={(e) => {
              const val = e.target.value;
              setEditingTextPos((prev) => (prev ? { ...prev, text: val } : null));
              updateLayer(editingTextId, { text: val });
            }}
            onBlur={() => {
              setEditingTextId(null);
              commitSnapshot();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditingTextId(null);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
