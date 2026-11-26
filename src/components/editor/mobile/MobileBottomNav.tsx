'use client';

import React from 'react';
import { useEditorStore, SidebarTab } from '@/store/useEditorStore';
import { SIDEBAR_TABS } from '../EditorSidebar';
import { Plus } from 'lucide-react';

export default function MobileBottomNav() {
  const {
    activeTab,
    setActiveTab,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    setIsPropertiesDrawerOpen,
    selectedLayerIds,
    clearSelection,
    isMobileTextTemplatesOpen,
    setIsMobileTextTemplatesOpen,
    setActiveMobileProperty,
  } = useEditorStore();

  const handleTabClick = (tabId: SidebarTab) => {
    if (tabId === 'text') {
      if (selectedLayerIds.length === 0) {
        // Toggle text templates in the Second Rail
        setIsMobileTextTemplatesOpen(!isMobileTextTemplatesOpen);
        setIsMobileDrawerOpen(false);
        setIsPropertiesDrawerOpen(false);
        setActiveMobileProperty(null);
      } else {
        // Deselect layer and open Text templates rail
        clearSelection();
        setIsMobileTextTemplatesOpen(true);
        setIsMobileDrawerOpen(false);
        setIsPropertiesDrawerOpen(false);
        setActiveMobileProperty(null);
      }
    } else {
      setIsMobileTextTemplatesOpen(false);
      setActiveTab(tabId);
      setIsPropertiesDrawerOpen(false);
      setIsMobileDrawerOpen(true);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 px-1 flex items-center justify-around z-40 select-none shadow-lg">
      {SIDEBAR_TABS.map((tab) => {
        const Icon = tab.icon;
        const isTextActive = tab.id === 'text' && isMobileTextTemplatesOpen && selectedLayerIds.length === 0;
        const isActive = (isMobileDrawerOpen && activeTab === tab.id) || isTextActive;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            title={tab.label}
            aria-label={tab.label}
            className={`flex-1 flex items-center justify-center py-2 transition-colors ${
              isActive ? 'text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-purple-100' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
          </button>
        );
      })}
    </nav>
  );
}
