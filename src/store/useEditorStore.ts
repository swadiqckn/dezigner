import { create } from 'zustand';
import { 
  CanvasLayer, 
  CanvasBackground, 
  CanvasDimensions, 
  PosterTemplate, 
  ERPExternalConfig,
  NewLayerInput,
  GroupLayer,
  CustomFontItem,
  ProjectWorkFile,
  TemplateLayerVariable,
} from '@/types/editor';
import { POSTER_TEMPLATES } from '@/constants/templates';
import { getAlignedPosition } from '@/utils/transformUtils';
import { loadGoogleFont } from '@/constants/fonts';

interface HistorySnapshot {
  layers: CanvasLayer[];
  canvas: {
    width: number;
    height: number;
    background: CanvasBackground;
  };
  title: string;
}

export type SidebarTab = 
  | 'text' 
  | 'elements' 
  | 'uploads' 
  | 'background' 
  | 'layers' 
  | 'erp';

interface EditorState {
  // Canvas configuration
  title: string;
  width: number;
  height: number;
  background: CanvasBackground;
  presetName: string;

  // Layers & Selection
  layers: CanvasLayer[];
  selectedLayerIds: string[];
  clipboard: CanvasLayer[];

  // Viewport
  zoom: number;
  pan: { x: number; y: number };

  // Guides & Grid
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showGuides: boolean;

  // Active UI tab & modals
  activeTab: SidebarTab;
  isMobileDrawerOpen: boolean;
  isPropertiesDrawerOpen: boolean;
  isExportModalOpen: boolean;
  isPreviewModalOpen: boolean;
  isErpModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  isBulkModalOpen: boolean;
  activeMobileProperty: string | null;
  isMobileTextTemplatesOpen: boolean;

  // Bulk Preview & Per-Entry Override Cache
  bulkRows: Array<Record<string, string>>;
  bulkActiveIndex: number | null;
  bulkBaseLayers: CanvasLayer[] | null;
  bulkOverrides: Record<number, CanvasLayer[]>;

  // ERP integration metadata
  erpMeta?: {
    tenantId?: string;
    tenantName?: string;
    callbackUrl?: string;
    isExternalInjection?: boolean;
  };

  // Undo / Redo
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];

  // Actions
  setTitle: (title: string) => void;
  setCanvasSize: (width: number, height: number, presetName?: string) => void;
  setCanvasBackground: (bg: CanvasBackground) => void;
  
  // Layer CRUD
  addLayer: (layer: NewLayerInput) => string;
  updateLayer: (id: string, updates: Partial<CanvasLayer>, pushToHistory?: boolean) => void;
  updateMultipleLayers: (items: { id: string; updates: Partial<CanvasLayer> }[]) => void;
  deleteLayer: (id: string) => void;
  deleteSelectedLayers: () => void;
  duplicateLayer: (id: string) => void;
  duplicateSelected: () => void;
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  renameLayer: (id: string, name: string) => void;

  // Selection
  setSelectedLayerIds: (ids: string[]) => void;
  toggleSelection: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Grouping
  groupSelectedLayers: (name?: string) => string | null;
  ungroupLayer: (groupId: string) => void;

  // Layer ordering
  reorderLayer: (id: string, action: 'front' | 'back' | 'forward' | 'backward') => void;
  moveLayerToIndex: (id: string, newIndex: number) => void;

  // Viewport navigation
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  resetZoomPan: () => void;
  zoomIn: () => void;
  zoomOut: () => void;

  // Alignment helpers
  alignSelected: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;

  // Clipboard
  copySelected: () => void;
  paste: () => void;

  // History
  undo: () => void;
  redo: () => void;
  commitSnapshot: () => void;

  // Templates & External Loaders
  loadTemplate: (template: PosterTemplate) => void;
  loadFromConfig: (config: ERPExternalConfig) => void;
  resetCanvas: () => void;
  loadWorkFile: (file: ProjectWorkFile) => void;
  getWorkFile: () => ProjectWorkFile;

  // Custom Fonts
  customFonts: CustomFontItem[];
  addCustomFont: (font: CustomFontItem) => void;

  // UI state toggles
  setActiveTab: (tab: SidebarTab) => void;
  setIsMobileDrawerOpen: (open: boolean) => void;
  setIsPropertiesDrawerOpen: (open: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowRulers: (show: boolean) => void;
  setShowGuides: (show: boolean) => void;
  isCanvasLocked: boolean;
  toggleCanvasLock: () => void;
  setIsCanvasLocked: (locked: boolean) => void;
  setIsExportModalOpen: (open: boolean) => void;
  setIsPreviewModalOpen: (open: boolean) => void;
  setIsErpModalOpen: (open: boolean) => void;
  setIsShortcutsModalOpen: (open: boolean) => void;
  setIsBulkModalOpen: (open: boolean) => void;
  applyTemplateValues: (values: Record<string, string>) => void;
  getTemplateVariables: () => TemplateLayerVariable[];
  setBulkRows: (rows: Array<Record<string, string>>) => void;
  enterBulkPreview: (index?: number) => void;
  exitBulkPreview: () => void;
  goToBulkIndex: (index: number) => void;
  saveBulkOverride: (index?: number) => void;
  clearBulkOverride: (index: number) => void;
  setActiveMobileProperty: (property: string | null) => void;
  setIsMobileTextTemplatesOpen: (open: boolean) => void;
}

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1350;
const MAX_HISTORY = 35;

export const useEditorStore = create<EditorState>((set, get) => {
  const getSnapshot = (): HistorySnapshot => {
    const state = get();
    return {
      layers: JSON.parse(JSON.stringify(state.layers)),
      canvas: {
        width: state.width,
        height: state.height,
        background: JSON.parse(JSON.stringify(state.background)),
      },
      title: state.title,
    };
  };

  const pushSnapshot = () => {
    const snapshot = getSnapshot();
    set((state) => ({
      undoStack: [...state.undoStack.slice(-MAX_HISTORY), snapshot],
      redoStack: [],
    }));
  };

  return {
    title: "Untitled Poster",
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    background: { type: 'solid', color: '#FFFFFF' },
    presetName: "Instagram Portrait",

    layers: [],
    selectedLayerIds: [],
    clipboard: [],

    zoom: 0.5,
    pan: { x: 0, y: 0 },

    showGrid: false,
    snapToGrid: false,
    gridSize: 20,
    showRulers: true,
    showGuides: true,
    isCanvasLocked: true,

    activeTab: 'text',
    isMobileDrawerOpen: false,
    isPropertiesDrawerOpen: false,
    isExportModalOpen: false,
    isPreviewModalOpen: false,
    isErpModalOpen: false,
    isShortcutsModalOpen: false,
    isBulkModalOpen: false,
    activeMobileProperty: null,
    isMobileTextTemplatesOpen: false,
    bulkRows: [],
    bulkActiveIndex: null,
    bulkBaseLayers: null,
    bulkOverrides: {},
    customFonts: [],

    erpMeta: undefined,

    undoStack: [],
    redoStack: [],

    setTitle: (title) => set({ title }),

    setCanvasSize: (width, height, presetName = "Custom") => {
      pushSnapshot();
      set({ width, height, presetName });
      get().resetZoomPan();
    },

    setCanvasBackground: (background) => {
      pushSnapshot();
      set({ background });
    },

    addLayer: (newLayerData) => {
      pushSnapshot();
      const id = newLayerData.id || `layer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const layer = {
        ...newLayerData,
        id,
        visible: newLayerData.visible !== false,
        locked: !!newLayerData.locked,
        deletable: newLayerData.deletable !== false,
        editable: newLayerData.editable !== false,
        selectable: newLayerData.selectable !== false,
        opacity: typeof newLayerData.opacity === 'number' ? newLayerData.opacity : 1,
        rotation: newLayerData.rotation || 0,
        anchor: newLayerData.anchor || 'center',
      } as CanvasLayer;

      set((state) => ({
        layers: [...state.layers, layer],
        selectedLayerIds: [id],
      }));
      return id;
    },

    updateLayer: (id, updates, pushToHistory = false) => {
      if (pushToHistory) pushSnapshot();
      set((state) => ({
        layers: state.layers.map((l) => (l.id === id ? ({ ...l, ...updates } as CanvasLayer) : l)),
      }));
    },

    updateMultipleLayers: (items) => {
      pushSnapshot();
      set((state) => {
        const updateMap = new Map(items.map((i) => [i.id, i.updates]));
        return {
          layers: state.layers.map((l) => {
            const updates = updateMap.get(l.id);
            return updates ? ({ ...l, ...updates } as CanvasLayer) : l;
          }),
        };
      });
    },

    deleteLayer: (id) => {
      const layer = get().layers.find((l) => l.id === id);
      if (layer && layer.deletable === false) {
        console.warn(`Layer ${id} is marked as non-deletable (ERP protected).`);
        return;
      }
      pushSnapshot();
      set((state) => ({
        layers: state.layers.filter((l) => l.id !== id),
        selectedLayerIds: state.selectedLayerIds.filter((selId) => selId !== id),
      }));
    },

    deleteSelectedLayers: () => {
      const { layers, selectedLayerIds } = get();
      const deletableSelectedIds = selectedLayerIds.filter((id) => {
        const layer = layers.find((l) => l.id === id);
        return layer && layer.deletable !== false;
      });

      if (deletableSelectedIds.length === 0) return;

      pushSnapshot();
      set((state) => ({
        layers: state.layers.filter((l) => !deletableSelectedIds.includes(l.id)),
        selectedLayerIds: state.selectedLayerIds.filter((id) => !deletableSelectedIds.includes(id)),
      }));
    },

    duplicateLayer: (id) => {
      const layer = get().layers.find((l) => l.id === id);
      if (!layer) return;
      pushSnapshot();

      const newId = `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const duplicated: CanvasLayer = {
        ...JSON.parse(JSON.stringify(layer)),
        id: newId,
        name: `${layer.name} (Copy)`,
        x: layer.x + 30,
        y: layer.y + 30,
        deletable: true,
      };

      set((state) => ({
        layers: [...state.layers, duplicated],
        selectedLayerIds: [newId],
      }));
    },

    duplicateSelected: () => {
      const { layers, selectedLayerIds } = get();
      if (selectedLayerIds.length === 0) return;
      pushSnapshot();

      const newSelection: string[] = [];
      const newLayersToAdd: CanvasLayer[] = [];

      selectedLayerIds.forEach((id) => {
        const layer = layers.find((l) => l.id === id);
        if (layer) {
          const newId = `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const duplicated: CanvasLayer = {
            ...JSON.parse(JSON.stringify(layer)),
            id: newId,
            name: `${layer.name} (Copy)`,
            x: layer.x + 30,
            y: layer.y + 30,
            deletable: true,
          };
          newLayersToAdd.push(duplicated);
          newSelection.push(newId);
        }
      });

      set((state) => ({
        layers: [...state.layers, ...newLayersToAdd],
        selectedLayerIds: newSelection,
      }));
    },

    toggleLock: (id) => {
      set((state) => ({
        layers: state.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
      }));
    },

    toggleVisibility: (id) => {
      set((state) => ({
        layers: state.layers.map((l) => (l.id === id ? { ...l, visible: l.visible === false ? true : false } : l)),
      }));
    },

    renameLayer: (id, name) => {
      set((state) => ({
        layers: state.layers.map((l) => (l.id === id ? { ...l, name } : l)),
      }));
    },

    setSelectedLayerIds: (ids) => {
      set({ 
        selectedLayerIds: ids,
        ...(ids.length > 0 ? { isMobileTextTemplatesOpen: false } : { activeMobileProperty: null })
      });
    },

    toggleSelection: (id, multiSelect = false) => {
      set((state) => {
        if (!multiSelect) {
          return { selectedLayerIds: [id], isMobileTextTemplatesOpen: false };
        }
        if (state.selectedLayerIds.includes(id)) {
          return { selectedLayerIds: state.selectedLayerIds.filter((selId) => selId !== id) };
        }
        return { selectedLayerIds: [...state.selectedLayerIds, id], isMobileTextTemplatesOpen: false };
      });
    },

    clearSelection: () => {
      set({ selectedLayerIds: [], activeMobileProperty: null });
    },

    selectAll: () => {
      set((state) => ({
        selectedLayerIds: state.layers.filter((l) => l.visible !== false && l.selectable !== false).map((l) => l.id),
      }));
    },

    groupSelectedLayers: (name) => {
      const { layers, selectedLayerIds } = get();
      if (selectedLayerIds.length < 2) return null;
      pushSnapshot();
      const selectedLayers = layers.filter((l) => selectedLayerIds.includes(l.id));
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      selectedLayers.forEach((l) => {
        minX = Math.min(minX, l.x);
        minY = Math.min(minY, l.y);
        maxX = Math.max(maxX, l.x + (l.width || 0));
        maxY = Math.max(maxY, l.y + (l.height || (l as any).fontSize || 50));
      });
      const groupId = `group-${Date.now()}`;
      const groupLayer: GroupLayer = {
        id: groupId,
        name: name || `Group ${layers.filter((l) => l.type === 'group').length + 1}`,
        type: 'group',
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.max(20, Math.round(maxX - minX)),
        height: Math.max(20, Math.round(maxY - minY)),
        layerIds: [...selectedLayerIds],
        visible: true,
        locked: false,
        selectable: true,
        deletable: true,
        editable: true,
      };
      const updatedLayers = layers.map((l) =>
        selectedLayerIds.includes(l.id) ? { ...l, groupId } : l
      );
      set({
        layers: [...updatedLayers, groupLayer],
        selectedLayerIds: [groupId],
      });
      return groupId;
    },

    ungroupLayer: (groupId) => {
      const { layers } = get();
      const group = layers.find((l) => l.id === groupId);
      if (!group || group.type !== 'group') return;
      pushSnapshot();
      const childIds = (group as GroupLayer).layerIds || [];
      const updatedLayers = layers
        .filter((l) => l.id !== groupId)
        .map((l) => (l.groupId === groupId ? { ...l, groupId: undefined } : l));
      set({
        layers: updatedLayers,
        selectedLayerIds: childIds,
      });
    },

    reorderLayer: (id, action) => {
      pushSnapshot();
      set((state) => {
        const index = state.layers.findIndex((l) => l.id === id);
        if (index === -1) return state;

        const newLayers = [...state.layers];
        const [moved] = newLayers.splice(index, 1);

        switch (action) {
          case 'front':
            newLayers.push(moved);
            break;
          case 'back':
            newLayers.unshift(moved);
            break;
          case 'forward':
            newLayers.splice(Math.min(newLayers.length, index + 1), 0, moved);
            break;
          case 'backward':
            newLayers.splice(Math.max(0, index - 1), 0, moved);
            break;
        }

        return { layers: newLayers };
      });
    },

    moveLayerToIndex: (id, newIndex) => {
      pushSnapshot();
      set((state) => {
        const index = state.layers.findIndex((l) => l.id === id);
        if (index === -1 || newIndex < 0 || newIndex >= state.layers.length) return state;

        const newLayers = [...state.layers];
        const [moved] = newLayers.splice(index, 1);
        newLayers.splice(newIndex, 0, moved);

        return { layers: newLayers };
      });
    },

    setZoom: (zoomOrFn) => {
      set((state) => {
        const nextZoom = typeof zoomOrFn === 'function' ? zoomOrFn(state.zoom) : zoomOrFn;
        return { zoom: Math.min(3, Math.max(0.1, nextZoom)) };
      });
    },

    setPan: (panOrFn) => {
      set((state) => {
        const nextPan = typeof panOrFn === 'function' ? panOrFn(state.pan) : panOrFn;
        return { pan: nextPan };
      });
    },

    resetZoomPan: () => {
      const { width, height } = get();
      let availW = 800;
      let availH = 650;
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        availW = isMobile ? window.innerWidth - 24 : Math.max(300, window.innerWidth - 500);
        availH = isMobile ? Math.max(220, window.innerHeight * 0.44) : Math.max(300, window.innerHeight - 150);
      }
      const fitZoom = Math.min(availW / width, availH / height, 0.75);
      set({ zoom: Math.max(0.1, Number(fitZoom.toFixed(2))), pan: { x: 0, y: 0 } });
    },

    zoomIn: () => {
      set((state) => ({ zoom: Math.min(3, Number((state.zoom + 0.1).toFixed(2))) }));
    },

    zoomOut: () => {
      set((state) => ({ zoom: Math.max(0.1, Number((state.zoom - 0.1).toFixed(2))) }));
    },

    alignSelected: (type) => {
      const { layers, selectedLayerIds, width, height } = get();
      if (selectedLayerIds.length === 0) return;
      pushSnapshot();

      const selectedLayers = layers.filter((l) => selectedLayerIds.includes(l.id));

      if (selectedLayers.length === 1) {
        // Align relative to canvas respecting anchor point and scale
        const item = selectedLayers[0];
        const { x: newX, y: newY } = getAlignedPosition(item, width, height, type);

        set((state) => ({
          layers: state.layers.map((l) => (l.id === item.id ? { ...l, x: newX, y: newY } : l)),
        }));
      } else {
        // Align relative to bounding box of selection
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        selectedLayers.forEach((l) => {
          const lHeight = l.height || ((l as any).fontSize ? (l as any).fontSize * 1.3 : 50);
          minX = Math.min(minX, l.x);
          maxX = Math.max(maxX, l.x + l.width);
          minY = Math.min(minY, l.y);
          maxY = Math.max(maxY, l.y + lHeight);
        });

        const updates = selectedLayers.map((l) => {
          const lHeight = l.height || ((l as any).fontSize ? (l as any).fontSize * 1.3 : 50);
          let nx = l.x;
          let ny = l.y;
          if (type === 'left') nx = minX;
          if (type === 'center') nx = minX + (maxX - minX - l.width) / 2;
          if (type === 'right') nx = maxX - l.width;
          if (type === 'top') ny = minY;
          if (type === 'middle') ny = minY + (maxY - minY - lHeight) / 2;
          if (type === 'bottom') ny = maxY - lHeight;
          return { id: l.id, updates: { x: nx, y: ny } };
        });

        const updateMap = new Map(updates.map((u) => [u.id, u.updates]));
        set((state) => ({
          layers: state.layers.map((l) => {
            const up = updateMap.get(l.id);
            return up ? ({ ...l, ...up } as CanvasLayer) : l;
          }),
        }));
      }
    },

    copySelected: () => {
      const { layers, selectedLayerIds } = get();
      const selected = layers.filter((l) => selectedLayerIds.includes(l.id));
      if (selected.length > 0) {
        set({ clipboard: JSON.parse(JSON.stringify(selected)) });
      }
    },

    paste: () => {
      const { clipboard } = get();
      if (clipboard.length === 0) return;
      pushSnapshot();

      const newIds: string[] = [];
      const newLayers: CanvasLayer[] = clipboard.map((orig) => {
        const id = `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        newIds.push(id);
        return {
          ...orig,
          id,
          name: `${orig.name} (Pasted)`,
          x: orig.x + 40,
          y: orig.y + 40,
          deletable: true,
        };
      });

      set((state) => ({
        layers: [...state.layers, ...newLayers],
        selectedLayerIds: newIds,
      }));
    },

    undo: () => {
      const { undoStack, redoStack } = get();
      if (undoStack.length === 0) return;

      const current = getSnapshot();
      const prev = undoStack[undoStack.length - 1];

      set({
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, current],
        layers: prev.layers,
        width: prev.canvas.width,
        height: prev.canvas.height,
        background: prev.canvas.background,
        title: prev.title,
        selectedLayerIds: [],
      });
    },

    redo: () => {
      const { undoStack, redoStack } = get();
      if (redoStack.length === 0) return;

      const current = getSnapshot();
      const next = redoStack[redoStack.length - 1];

      set({
        undoStack: [...undoStack, current],
        redoStack: redoStack.slice(0, -1),
        layers: next.layers,
        width: next.canvas.width,
        height: next.canvas.height,
        background: next.canvas.background,
        title: next.title,
        selectedLayerIds: [],
      });
    },

    commitSnapshot: () => {
      pushSnapshot();
    },

    loadTemplate: (template) => {
      pushSnapshot();
      set({
        title: template.title,
        width: template.canvas.width,
        height: template.canvas.height,
        background: JSON.parse(JSON.stringify(template.canvas.background)),
        layers: JSON.parse(JSON.stringify(template.layers)),
        selectedLayerIds: [template.layers[0]?.id || ""],
      });
      get().resetZoomPan();
    },

    loadFromConfig: (config) => {
      pushSnapshot();
      let bg: CanvasBackground = { type: 'solid', color: '#FFFFFF' };
      if (typeof config.canvas?.background === 'string') {
        bg = { type: 'solid', color: config.canvas.background };
      } else if (config.canvas?.background) {
        bg = config.canvas.background;
      }

      set({
        title: config.canvas?.name || config.meta?.tenantName ? `${config.meta?.tenantName} Poster` : "External ERP Design",
        width: config.canvas?.width || 1080,
        height: config.canvas?.height || 1350,
        background: bg,
        layers: JSON.parse(JSON.stringify(config.layers)),
        selectedLayerIds: config.layers[0]?.id ? [config.layers[0].id] : [],
        erpMeta: {
          tenantId: config.meta?.tenantId,
          tenantName: config.meta?.tenantName,
          callbackUrl: config.meta?.callbackUrl,
          isExternalInjection: true,
        },
      });
      get().resetZoomPan();
    },

    resetCanvas: () => {
      pushSnapshot();
      set({
        title: "Untitled Poster",
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        background: { type: 'solid', color: '#FFFFFF' },
        layers: [],
        selectedLayerIds: [],
      });
    },

    addCustomFont: (font) => {
      set((state) => ({ customFonts: [...state.customFonts, font] }));
    },

    getWorkFile: () => {
      const state = get();
      return {
        version: 1,
        title: state.title,
        width: state.width,
        height: state.height,
        presetName: state.presetName,
        background: JSON.parse(JSON.stringify(state.background)),
        layers: JSON.parse(JSON.stringify(state.layers)),
        customFonts: JSON.parse(JSON.stringify(state.customFonts)),
        savedAt: new Date().toISOString(),
      };
    },

    loadWorkFile: (file) => {
      pushSnapshot();
      // Load Google Fonts used by text layers in the work file
      if (Array.isArray(file.layers)) {
        file.layers.forEach((l) => {
          if (l.type === 'text' && (l as any).fontFamily) {
            loadGoogleFont((l as any).fontFamily);
          }
        });
      }
      if (file.customFonts && typeof document !== 'undefined') {
        file.customFonts.forEach(async (f) => {
          if (f.dataUrl) {
            try {
              const fontFace = new FontFace(f.family, `url(${f.dataUrl})`);
              await fontFace.load();
              document.fonts.add(fontFace);
            } catch (e) {
              console.error('Failed to load font from work file', e);
            }
          }
        });
      }
      set({
        title: file.title || 'Loaded Design',
        width: file.width || DEFAULT_WIDTH,
        height: file.height || DEFAULT_HEIGHT,
        presetName: file.presetName || 'Custom',
        background: file.background || { type: 'solid', color: '#FFFFFF' },
        layers: file.layers || [],
        customFonts: file.customFonts || [],
        selectedLayerIds: file.layers?.[0]?.id ? [file.layers[0].id] : [],
      });
      get().resetZoomPan();
    },

    setActiveTab: (activeTab) => set({ activeTab }),
    setIsMobileDrawerOpen: (isMobileDrawerOpen) => set({ isMobileDrawerOpen }),
    setIsPropertiesDrawerOpen: (isPropertiesDrawerOpen) => set({ isPropertiesDrawerOpen }),
    setShowGrid: (showGrid) => set({ showGrid }),
    setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
    setShowRulers: (showRulers) => set({ showRulers }),
    setShowGuides: (showGuides) => set({ showGuides }),
    toggleCanvasLock: () => set((state) => ({ isCanvasLocked: !state.isCanvasLocked })),
    setIsCanvasLocked: (isCanvasLocked) => set({ isCanvasLocked }),
    setIsExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
    setIsPreviewModalOpen: (isPreviewModalOpen) => set({ isPreviewModalOpen }),
    setIsErpModalOpen: (isErpModalOpen) => set({ isErpModalOpen }),
    setIsShortcutsModalOpen: (isShortcutsModalOpen) => set({ isShortcutsModalOpen }),
    setIsBulkModalOpen: (isBulkModalOpen) => set({ isBulkModalOpen }),
    applyTemplateValues: (values) => {
      pushSnapshot();
      set((state) => ({
        layers: state.layers.map((l) => {
          if (!l.isTemplate) return l;
          const key = l.templateId || l.id;
          if (!(key in values)) return l;
          const val = values[key];
          if (l.type === 'text') {
            return { ...l, text: val };
          } else if (l.type === 'image') {
            return { ...l, src: val };
          } else if (l.type === 'icon') {
            return { ...l, iconName: val, svgString: val.startsWith('M') ? val : (l as any).svgString };
          }
          return l;
        }),
      }));
    },
    getTemplateVariables: () => {
      const { layers } = get();
      return layers
        .filter((l) => l.isTemplate && ['text', 'image', 'icon'].includes(l.type))
        .map((l) => ({
          id: l.templateId || l.id,
          type: (l.templateType || l.type) as 'text' | 'image' | 'icon',
          value:
            l.placeholderValue ??
            (l.type === 'text'
              ? (l as any).text
              : l.type === 'image'
              ? (l as any).src
              : (l as any).iconName || ''),
        }));
    },
    setBulkRows: (rows) => {
      set({ bulkRows: rows });
    },
    enterBulkPreview: (index = 0) => {
      const { bulkRows, bulkBaseLayers, layers } = get();
      if (bulkRows.length === 0) return;
      const base = bulkBaseLayers || JSON.parse(JSON.stringify(layers));
      if (!bulkBaseLayers) {
        set({ bulkBaseLayers: base });
      }
      get().goToBulkIndex(Math.max(0, Math.min(index, bulkRows.length - 1)));
    },
    exitBulkPreview: () => {
      const { bulkBaseLayers } = get();
      if (bulkBaseLayers) {
        set({
          layers: JSON.parse(JSON.stringify(bulkBaseLayers)),
          bulkActiveIndex: null,
          bulkBaseLayers: null,
          selectedLayerIds: [],
        });
      } else {
        set({ bulkActiveIndex: null });
      }
    },
    goToBulkIndex: (index) => {
      const { bulkRows, bulkBaseLayers, bulkOverrides, layers } = get();
      if (index < 0 || index >= bulkRows.length) return;
      const base = bulkBaseLayers || JSON.parse(JSON.stringify(layers));
      const rowData = bulkRows[index];
      const overrideLayers = bulkOverrides[index];

      let nextLayers: CanvasLayer[];
      if (overrideLayers) {
        nextLayers = JSON.parse(JSON.stringify(overrideLayers));
      } else {
        nextLayers = (JSON.parse(JSON.stringify(base)) as CanvasLayer[]).map((l) => {
          if (!l.isTemplate) return l;
          const key = l.templateId || l.id;
          if (!(key in rowData)) return l;
          const val = rowData[key];
          if (l.type === 'text') return { ...l, text: val };
          if (l.type === 'image') return { ...l, src: val };
          if (l.type === 'icon') {
            return { ...l, iconName: val, svgString: val.startsWith('M') ? val : (l as any).svgString };
          }
          return l;
        });
      }

      set({
        bulkBaseLayers: base,
        bulkActiveIndex: index,
        layers: nextLayers,
        selectedLayerIds: [],
      });
    },
    saveBulkOverride: (index) => {
      const { bulkActiveIndex, layers, bulkOverrides } = get();
      const targetIdx = index ?? bulkActiveIndex;
      if (targetIdx === null || targetIdx === undefined) return;
      const nextOverrides = {
        ...bulkOverrides,
        [targetIdx]: JSON.parse(JSON.stringify(layers)),
      };
      set({ bulkOverrides: nextOverrides });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('dezigner_bulk_overrides_v1', JSON.stringify(nextOverrides));
        } catch {
          // ignore storage quota errors for large base64 overrides
        }
      }
    },
    clearBulkOverride: (index) => {
      const { bulkOverrides, bulkActiveIndex } = get();
      const nextOverrides = { ...bulkOverrides };
      delete nextOverrides[index];
      set({ bulkOverrides: nextOverrides });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('dezigner_bulk_overrides_v1', JSON.stringify(nextOverrides));
        } catch {
          // ignore
        }
      }
      if (bulkActiveIndex === index) {
        get().goToBulkIndex(index);
      }
    },
    setActiveMobileProperty: (activeMobileProperty) => set({ activeMobileProperty }),
    setIsMobileTextTemplatesOpen: (isMobileTextTemplatesOpen) => set({ isMobileTextTemplatesOpen }),
  };
});
