'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import ElementsPanel from '../sidebar-panels/ElementsPanel';
import TextPanel from '../sidebar-panels/TextPanel';
import UploadsPanel from '../sidebar-panels/UploadsPanel';
import BackgroundPanel from '../sidebar-panels/BackgroundPanel';
import LayersPanel from '../sidebar-panels/LayersPanel';
import ErpIntegrationPanel from '../sidebar-panels/ErpIntegrationPanel';
import PropertiesPanel from '../properties/PropertiesPanel';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

export default function MobileDrawerSheet() {
  const {
    activeTab,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    isPropertiesDrawerOpen,
    setIsPropertiesDrawerOpen,
  } = useEditorStore();

  // State to track if sheet is expanded to full area or compact bottom space
  const [isExpanded, setIsExpanded] = useState(false);

  const isOpen = isMobileDrawerOpen || isPropertiesDrawerOpen;

  if (!isOpen) return null;

  const handleClose = () => {
    setIsMobileDrawerOpen(false);
    setIsPropertiesDrawerOpen(false);
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    // No blur on background: transparent container so canvas remains crisp & visible
    <div 
      className="fixed inset-0 z-50 md:hidden flex flex-col justify-end pointer-events-none"
    >
      {/* Subtle non-blur touch backdrop to dismiss on tapping outside the sheet */}
      <div 
        className="absolute inset-0 bg-black/15 pointer-events-auto"
        onClick={handleClose}
      />

      <div 
        className={`w-full bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden pointer-events-auto transition-all duration-300 ease-out z-10 ${
          isExpanded ? 'h-[85vh]' : 'h-[50vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle & Expand/Close Bar */}
        <div 
          className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white cursor-pointer select-none"
          onClick={toggleExpand}
        >
          {/* Draggable/Tappable Handle Indicator */}
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-600" />
              )}
            </div>
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
            <span className="text-[10px] text-slate-400 font-medium">
              ({isExpanded ? 'Tap to minimize' : 'Tap to expand'})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
