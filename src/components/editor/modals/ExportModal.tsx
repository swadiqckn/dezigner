'use client';

import React, { useState } from 'react';
import Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { exportCanvas } from '@/utils/exportUtils';
import confetti from 'canvas-confetti';
import { 
  X, 
  Download, 
  FileImage, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  SlidersHorizontal,
  FolderArchive
} from 'lucide-react';

interface ExportModalProps {
  stage: Konva.Stage | null;
}

export default function ExportModal({ stage }: ExportModalProps) {
  const { isExportModalOpen, setIsExportModalOpen, title, width, height, getWorkFile } = useEditorStore();

  const [format, setFormat] = useState<'png' | 'jpg' | 'pdf' | 'project'>('png');
  const [scale, setScale] = useState<number>(2); // 2x high-res default
  const [quality, setQuality] = useState<number>(0.95);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isExportModalOpen) return null;

  const targetWidth = width * scale;
  const targetHeight = height * scale;

  const handleExport = async () => {
    if (format === 'project') {
      setIsExporting(true);
      try {
        const data = getWorkFile();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = (title || 'poster-design').replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
        link.download = `${safeTitle}.dezign`;
        link.click();
        URL.revokeObjectURL(url);

        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 },
        });
        setTimeout(() => setIsExportModalOpen(false), 800);
      } finally {
        setIsExporting(false);
      }
      return;
    }

    if (!stage) {
      alert('Canvas engine is not ready. Please try again.');
      return;
    }

    setIsExporting(true);
    try {
      await exportCanvas(stage, {
        format,
        scale,
        quality,
        transparentBg: format === 'png' ? transparentBg : false,
        filename: title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'poster-design',
      });

      // Celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setIsExportModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate export file. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Your Poster</h3>
              <p className="text-xs text-slate-500">High-resolution print and digital render</p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Format Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              File Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'png', name: 'PNG Image', desc: 'Lossless & Sharp', icon: FileImage },
                { id: 'jpg', name: 'JPG Image', desc: 'Compact & Web', icon: FileImage },
                { id: 'pdf', name: 'PDF Print', desc: 'Vector & Print Ready', icon: FileText },
                { id: 'project', name: 'Project', desc: '.dezign Work File', icon: FolderArchive },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as 'png' | 'jpg' | 'pdf' | 'project')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-1">{fmt.name}</span>
                    <span className="text-[10px] text-slate-400">{fmt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {format === 'project' ? (
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-1.5">
              <h4 className="text-xs font-bold text-purple-900">Export Editable Project File (.dezign)</h4>
              <p className="text-[11px] text-purple-700/80 leading-relaxed">
                Downloads a complete project file containing all editable layers, groups, template variables, canvas dimensions, background, and custom fonts. You can reopen it anytime using <strong>Open</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* Resolution Multiplier */}
              <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">Resolution Multiplier</label>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {targetWidth} × {targetHeight} px
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { s: 1, label: '1x (Draft)' },
                { s: 2, label: '2x (High Res)' },
                { s: 3, label: '3x (Ultra Print)' },
                { s: 4, label: '4x (Max DPI)' },
              ].map((mult) => (
                <button
                  key={mult.s}
                  onClick={() => setScale(mult.s)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                    scale === mult.s
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {mult.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options depending on format */}
          {format === 'png' && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Transparent Background
                </span>
                <span className="text-[11px] text-slate-500">
                  Exclude the canvas background color for transparent assets
                </span>
              </div>
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          )}

          {format === 'jpg' && (
            <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700">
                <span className="font-semibold">JPEG Quality</span>
                <span className="font-mono font-bold">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating High-Res File...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
