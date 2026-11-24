'use client';

import React from 'react';
import { useEditorStore, SidebarTab } from '@/store/useEditorStore';
import TemplatesPanel from './sidebar-panels/TemplatesPanel';
import ElementsPanel from './sidebar-panels/ElementsPanel';
import TextPanel from './sidebar-panels/TextPanel';
import UploadsPanel from './sidebar-panels/UploadsPanel';
import BackgroundPanel from './sidebar-panels/BackgroundPanel';
import LayersPanel from './sidebar-panels/LayersPanel';
import ErpIntegrationPanel from './sidebar-panels/ErpIntegrationPanel';
import {
  LayoutTemplate,
  Shapes,
  Type,
  UploadCloud,
  Palette,
  Layers,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TabItem {
  id: SidebarTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const TABS: TabItem[] = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'elements', label: 'Elements', icon: Shapes },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'uploads', label: 'Uploads', icon: UploadCloud },
  { id: 'background', label: 'Background', icon: Palette },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'erp', label: 'ERP Connect', icon: Building2, badge: 'API' },
];

export default function EditorSidebar() {
  const { activeTab, setActiveTab } = useEditorStore();

  return (
    <div className="flex h-full border-r border-slate-200 select-none z-10">
      {/* Mini Icon Strip (Canva-inspired) */}
      <div className="w-18 bg-white border-r border-slate-200 flex flex-col items-center py-3 space-y-1.5 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-14 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {tab.label}
              </span>

              {tab.badge && (
                <span className="absolute top-1 right-1 text-[8px] bg-purple-600 text-white font-extrabold px-1 rounded-full">
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-r-md" />
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Sidebar Panel Drawer */}
      <div className="w-80 h-full bg-white p-4 flex flex-col shrink-0">
        {activeTab === 'templates' && <TemplatesPanel />}
        {activeTab === 'elements' && <ElementsPanel />}
        {activeTab === 'text' && <TextPanel />}
        {activeTab === 'uploads' && <UploadsPanel />}
        {activeTab === 'background' && <BackgroundPanel />}
        {activeTab === 'layers' && <LayersPanel />}
        {activeTab === 'erp' && <ErpIntegrationPanel />}
      </div>
    </div>
  );
}
