'use client';

import React, { useState, useEffect } from 'react';
import Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  X, 
  Download, 
  Frame, 
  Smartphone, 
  Maximize, 
  Share2,
  Sparkles
} from 'lucide-react';

interface PreviewModalProps {
  stage: Konva.Stage | null;
}

export default function PreviewModal({ stage }: PreviewModalProps) {
  const { isPreviewModalOpen, setIsPreviewModalOpen, title, width, height, setIsExportModalOpen } = useEditorStore();
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [mockupMode, setMockupMode] = useState<'clean' | 'frame' | 'mobile'>('frame');

  useEffect(() => {
    if (isPreviewModalOpen && stage) {
      // Hide transformer for clean preview
      const trs = stage.find('Transformer');
      trs.forEach((t) => t.visible(false));

      const dataUrl = stage.toDataURL({ pixelRatio: 1.5 });
      setPreviewDataUrl(dataUrl);

      trs.forEach((t) => t.visible(true));
    }
  }, [isPreviewModalOpen, stage]);

  if (!isPreviewModalOpen) return null;

  const aspectRatio = width / height;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-[11px] text-slate-400">
              Mockup & Presentation Preview • {width} × {height} px
            </p>
          </div>
        </div>

        {/* Mockup Mode Selector */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setMockupMode('clean')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mockupMode === 'clean' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Pure Canvas</span>
          </button>
          <button
            onClick={() => setMockupMode('frame')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mockupMode === 'frame' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Frame className="w-3.5 h-3.5" />
            <span>Exhibition Frame</span>
          </button>
          <button
            onClick={() => setMockupMode('mobile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mockupMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Feed</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPreviewModalOpen(false);
              setIsExportModalOpen(true);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          <button
            onClick={() => setIsPreviewModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {previewDataUrl ? (
          <>
            {mockupMode === 'clean' && (
              <div
                className="max-h-[82vh] max-w-[85vw] shadow-2xl rounded-sm overflow-hidden border border-white/10"
                style={{ aspectRatio: `${width}/${height}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewDataUrl}
                  alt={title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {mockupMode === 'frame' && (
              <div className="relative p-6 sm:p-10 bg-gradient-to-b from-stone-800 to-stone-900 rounded-3xl shadow-2xl border border-stone-700/80 max-h-[84vh] flex items-center justify-center">
                {/* Frame border */}
                <div
                  className="p-4 bg-stone-950 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-amber-800/80 max-h-[72vh]"
                  style={{ aspectRatio: `${width}/${height}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewDataUrl}
                    alt={title}
                    className="w-full h-full object-contain rounded-xs"
                  />
                </div>
              </div>
            )}

            {mockupMode === 'mobile' && (
              <div className="w-80 h-[640px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col overflow-hidden">
                {/* iPhone notch / status */}
                <div className="w-full h-6 flex justify-between items-center px-6 text-[10px] text-white">
                  <span>9:41</span>
                  <div className="w-20 h-4 bg-black rounded-full" />
                  <span>5G</span>
                </div>
                {/* Screen content */}
                <div className="flex-1 bg-white rounded-[32px] overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                      E
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Eduzee Community</p>
                      <p className="text-[9px] text-slate-400">Sponsored • Poster Studio</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-100 flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewDataUrl}
                      alt={title}
                      className="w-full max-h-[380px] object-contain shadow-sm rounded-lg"
                    />
                  </div>
                  <div className="p-3 border-t border-slate-100 space-y-1">
                    <p className="text-[11px] font-bold text-slate-900">{title}</p>
                    <p className="text-[10px] text-slate-500">
                      Join the event this season! Register now online.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-slate-400 text-sm">Rendering preview...</div>
        )}
      </div>
    </div>
  );
}
