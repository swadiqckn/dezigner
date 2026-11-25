'use client';

import React, { useEffect, useState } from 'react';
import Konva from 'konva';
import EditorHeader from './EditorHeader';
import EditorSidebar from './EditorSidebar';
import CanvasWorkspace from './workspace/CanvasWorkspace';
import PropertiesPanel from './properties/PropertiesPanel';
import ExportModal from './modals/ExportModal';
import PreviewModal from './modals/PreviewModal';
import ErpDocsModal from './modals/ErpDocsModal';
import KeyboardShortcutsModal from './modals/KeyboardShortcutsModal';
import BulkGenerateModal from './modals/BulkGenerateModal';
import MobileBottomNav from './mobile/MobileBottomNav';
import MobileSecondRail from './mobile/MobileSecondRail';
import MobileThirdLayerSheet from './mobile/MobileThirdLayerSheet';
import MobileDrawerSheet from './mobile/MobileDrawerSheet';
import { useEditorStore } from '@/store/useEditorStore';
import { parseERPConfig } from '@/utils/urlConfigParser';
import { exportCanvas } from '@/utils/exportUtils';
import { loadProjectFromCache } from '@/utils/projectCache';
import { parseCSVText, resolveTextParam } from '@/utils/csvUtils';
import { ShieldCheck, X } from 'lucide-react';

export default function PosterEditor() {
  const [stageInstance, setStageInstance] = useState<Konva.Stage | null>(null);
  const [showInjectedBanner, setShowInjectedBanner] = useState(false);
  const {
    loadFromConfig,
    resetZoomPan,
    erpMeta,
    applyTemplateValues,
    loadWorkFile,
    setBulkRows,
    enterBulkPreview,
  } = useEditorStore();

  // 1. Initial responsive zoom calculation
  useEffect(() => {
    resetZoomPan();
    const timer = setTimeout(() => {
      resetZoomPan();
    }, 100);

    const handleResize = () => {
      resetZoomPan();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [resetZoomPan]);

  // 2. Check for URL parameters (?config=..., ?project=..., ?csv=...) or restore cached project
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const search = window.location.search;
    const params = new URLSearchParams(search);

    const projectParam =
      params.get('project') ||
      params.get('projectUrl') ||
      params.get('workfile') ||
      params.get('projectData');
    const csvParam =
      params.get('csv') ||
      params.get('csvUrl') ||
      params.get('csvData');

    const init = async () => {
      let loadedExternal = false;

      // A. Load Project Work File from URL parameter
      if (projectParam) {
        const text = await resolveTextParam(projectParam);
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed && Array.isArray(parsed.layers)) {
              loadWorkFile(parsed);
              loadedExternal = true;
            }
          } catch (e) {
            console.error('Invalid project JSON in URL parameter:', e);
          }
        }
      }

      // B. Load ERP ?config= or ?institution=
      if (!loadedExternal && search) {
        const parsedConfig = parseERPConfig(search);
        if (parsedConfig) {
          loadFromConfig(parsedConfig);
          setShowInjectedBanner(true);
          loadedExternal = true;
        }
      }

      // C. Restore from browser cache if nothing external loaded
      if (!loadedExternal) {
        const cached = await loadProjectFromCache();
        if (cached && Array.isArray(cached.layers)) {
          loadWorkFile(cached);
        }
      }

      // D. Load CSV bulk data from URL parameter (if provided)
      if (csvParam) {
        const csvText = await resolveTextParam(csvParam);
        if (csvText) {
          const parsedRows = parseCSVText(csvText);
          if (parsedRows.length > 0) {
            setBulkRows(parsedRows);
            enterBulkPreview(0);
          }
        }
      }
    };

    init();
  }, [loadFromConfig, loadWorkFile, setBulkRows, enterBulkPreview]);

  // 3. Setup PostMessage listener & Flutter WebView JS Bridge (window.DezignerBridge)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).DezignerBridge = {
        loadProject: (jsonOrObj: string | object) => {
          const parsed = typeof jsonOrObj === 'string' ? JSON.parse(jsonOrObj) : jsonOrObj;
          if (parsed && Array.isArray(parsed.layers)) {
            loadWorkFile(parsed);
          }
        },
        loadCsv: (csvText: string) => {
          const parsedRows = parseCSVText(csvText);
          if (parsedRows.length > 0) {
            setBulkRows(parsedRows);
            enterBulkPreview(0);
          }
        },
        loadProjectAndCsv: (projectJsonOrObj: string | object, csvText?: string) => {
          const parsed = typeof projectJsonOrObj === 'string' ? JSON.parse(projectJsonOrObj) : projectJsonOrObj;
          if (parsed && Array.isArray(parsed.layers)) {
            loadWorkFile(parsed);
          }
          if (csvText) {
            const parsedRows = parseCSVText(csvText);
            if (parsedRows.length > 0) {
              setBulkRows(parsedRows);
              enterBulkPreview(0);
            }
          }
        },
      };
    }

    const handleMessage = async (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'INJECT_CONFIG' && data.payload) {
        loadFromConfig(data.payload);
        setShowInjectedBanner(true);
      } else if (data.type === 'INJECT_TEMPLATE_VALUES' && data.payload) {
        applyTemplateValues(data.payload);
      } else if (data.type === 'LOAD_WORK_FILE' && data.payload) {
        const parsed = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
        if (parsed && Array.isArray(parsed.layers)) loadWorkFile(parsed);
      } else if (data.type === 'LOAD_CSV_DATA' && typeof data.payload === 'string') {
        const parsedRows = parseCSVText(data.payload);
        if (parsedRows.length > 0) {
          setBulkRows(parsedRows);
          enterBulkPreview(0);
        }
      } else if (data.type === 'LOAD_PROJECT_AND_CSV' && data.payload) {
        const { project, csv } = data.payload;
        if (project) {
          const parsed = typeof project === 'string' ? JSON.parse(project) : project;
          if (parsed && Array.isArray(parsed.layers)) loadWorkFile(parsed);
        }
        if (csv) {
          const parsedRows = parseCSVText(csv);
          if (parsedRows.length > 0) {
            setBulkRows(parsedRows);
            enterBulkPreview(0);
          }
        }
      } else if (data.type === 'TRIGGER_EXPORT' && stageInstance) {
        const format = data.payload?.format || 'png';
        const scale = data.payload?.scale || 2;
        try {
          const dataUrl = await exportCanvas(stageInstance, {
            format,
            scale,
            filename: 'erp-poster-export',
          });

          // Post back to parent ERP window
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(
              {
                type: 'POSTER_EXPORT_COMPLETE',
                payload: {
                  dataUrl,
                  format,
                  timestamp: Date.now(),
                },
              },
              '*'
            );
          }
        } catch (err) {
          console.error('Failed to export via postMessage:', err);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [stageInstance, loadFromConfig, loadWorkFile, applyTemplateValues, setBulkRows, enterBulkPreview]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* External ERP Injected Alert Banner */}
      {showInjectedBanner && erpMeta?.tenantName && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white px-3 md:px-4 py-1.5 flex items-center justify-between text-[11px] md:text-xs font-semibold shadow-md shrink-0 z-40 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate">
              ERP Active: <strong>{erpMeta.tenantName}</strong> branding loaded.
            </span>
          </div>
          <button
            onClick={() => setShowInjectedBanner(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white shrink-0 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <EditorHeader />

      {/* Main Studio Workspace Area */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] pb-16 md:pb-0 overflow-hidden relative">
        {/* Left Sidebar (Desktop only) */}
        <EditorSidebar />

        {/* Central Canvas Viewport */}
        <CanvasWorkspace onStageReady={setStageInstance} />

        {/* Right Properties Panel (Desktop only) */}
        <div className="hidden md:flex h-full">
          <PropertiesPanel />
        </div>
      </div>

      {/* Mobile Second Rail (Properties & Text Templates) */}
      <MobileSecondRail />

      {/* Mobile Third Layer Contextual Sheet (Triggered by Second Rail Icons) */}
      <MobileThirdLayerSheet />

      {/* Mobile Bottom Navigation Bar (1st Layer) */}
      <MobileBottomNav />

      {/* Mobile Slide-up Drawer Sheet (for Elements, Uploads, Background, etc.) */}
      <MobileDrawerSheet />

      {/* Modals */}
      <ExportModal stage={stageInstance} />
      <PreviewModal stage={stageInstance} />
      <ErpDocsModal />
      <KeyboardShortcutsModal />
      <BulkGenerateModal stage={stageInstance} />
    </div>
  );
}
