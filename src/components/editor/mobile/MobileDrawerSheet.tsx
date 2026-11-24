'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import ElementsPanel from '../sidebar-panels/ElementsPanel';
import TextPanel from '../sidebar-panels/TextPanel';
import UploadsPanel from '../sidebar-panels/UploadsPanel';
import BackgroundPanel from '../sidebar-panels/BackgroundPanel';
import LayersPanel from '../sidebar-panels/LayersPanel';
import ErpIntegrationPanel from '../sidebar-panels/ErpIntegrationPanel';
import PropertiesPanel from '../properties/PropertiesPanel';
import { X } from 'lucide-react';

export default function MobileDrawerSheet() {
  const {
    activeTab,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    isPropertiesDrawerOpen,
    setIsPropertiesDrawerOpen,
  } = useEditorStore();

  const isOpen = isMobileDrawerOpen || isPropertiesDrawerOpen;

  if (!isOpen) return null;

  const handleClose = () => {
    setIsMobileDrawerOpen(false);
    setIsPropertiesDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
      <div 
        className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle & Close Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {isPropertiesDrawerOpen
                ? 'Properties & Styling'
                : activeTab === 'text'
                ? 'Add Text'
                : activeTab === 'elements'
                ? 'Design Elements'
                : activeTab === 'uploads'
                ? 'Uploads & Media'
                : activeTab === 'background'
                ? 'Canvas Background'
                : activeTab === 'layers'
                ? 'Layers'
                : 'ERP Integration'}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {isPropertiesDrawerOpen ? (
            <div className="w-full">
              <PropertiesPanel />
            </div>
          ) : (
            <>
              {activeTab === 'text' && <TextPanel />}
              {activeTab === 'elements' && <ElementsPanel />}
              {activeTab === 'uploads' && <UploadsPanel />}
              {activeTab === 'background' && <BackgroundPanel />}
              {activeTab === 'layers' && <LayersPanel />}
              {activeTab === 'erp' && <ErpIntegrationPanel />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
