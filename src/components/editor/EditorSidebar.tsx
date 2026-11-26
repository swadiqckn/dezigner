'use client';

import React, { useState } from 'react';
import { useEditorStore, SidebarTab } from '@/store/useEditorStore';
import ElementsPanel from './sidebar-panels/ElementsPanel';
import TextPanel from './sidebar-panels/TextPanel';
import UploadsPanel from './sidebar-panels/UploadsPanel';
import BackgroundPanel from './sidebar-panels/BackgroundPanel';
import LayersPanel from './sidebar-panels/LayersPanel';
import ErpIntegrationPanel from './sidebar-panels/ErpIntegrationPanel';
import {
  Shapes,
  Type,
  UploadCloud,
  Palette,
  Layers,
  Building2,
  ChevronLeft,
} from 'lucide-react';

interface TabItem {
  id: SidebarTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const SIDEBAR_TABS: TabItem[] = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'elements', label: 'Elements', icon: Shapes },
  { id: 'uploads', label: 'Uploads', icon: UploadCloud },
  { id: 'background', label: 'Background', icon: Palette },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'erp', label: 'ERP Connect', icon: Building2, badge: 'API' },
];

export default function EditorSidebar() {
  const { activeTab, setActiveTab } = useEditorStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const handleTabClick = (tabId: SidebarTab) => {
    if (activeTab === tabId && isDrawerOpen) {
      setIsDrawerOpen(false);
    } else {
      setActiveTab(tabId);
      setIsDrawerOpen(true);
    }
  };

  return (
    <aside className="hidden md:flex h-full border-r border-slate-200 select-none z-10 shrink-0">
      {/* Mini Icon Strip (Desktop) */}
      <div className="w-14 bg-white border-r border-slate-200 flex flex-col items-center py-3 space-y-2 shrink-0">
        {SIDEBAR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && isDrawerOpen;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
              aria-label={tab.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                isActive
                  ? 'bg-purple-50 text-purple-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />

              {tab.badge && (
                <span className="absolute -top-0.5 -right-0.5 text-[7px] bg-purple-600 text-white font-extrabold px-1 rounded-full leading-tight">
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-r-md" />
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Sidebar Panel Drawer */}
      {isDrawerOpen && (
        <div className="w-80 h-full bg-white p-4 flex flex-col shrink-0 relative border-r border-slate-100">
          <button
            onClick={() => setIsDrawerOpen(false)}
            title="Collapse Sidebar Drawer"
            className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {activeTab === 'text' && <TextPanel />}
          {activeTab === 'elements' && <ElementsPanel />}
          {activeTab === 'uploads' && <UploadsPanel />}
          {activeTab === 'background' && <BackgroundPanel />}
          {activeTab === 'layers' && <LayersPanel />}
          {activeTab === 'erp' && <ErpIntegrationPanel />}
        </div>
      )}
    </aside>
  );
}
