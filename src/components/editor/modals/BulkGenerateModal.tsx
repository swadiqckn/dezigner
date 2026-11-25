'use client';

import React, { useState, useEffect } from 'react';
import Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { exportCanvas } from '@/utils/exportUtils';
import { 
  X, 
  Braces, 
  Download, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  FileSpreadsheet,
  Sparkles,
  Loader2
} from 'lucide-react';

interface BulkGenerateModalProps {
  stage: Konva.Stage | null;
}

export default function BulkGenerateModal({ stage }: BulkGenerateModalProps) {
  const {
    isBulkModalOpen,
    setIsBulkModalOpen,
    getTemplateVariables,
    applyTemplateValues,
    title,
    layers,
  } = useEditorStore();

  const templateVars = getTemplateVariables();

  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [mode, setMode] = useState<'table' | 'json'>('table');
  const [format, setFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Initialize default row from placeholder values when modal opens
  useEffect(() => {
    if (isBulkModalOpen && templateVars.length > 0 && rows.length === 0) {
      const initialRow: Record<string, string> = {};
      templateVars.forEach((v) => {
        initialRow[v.id] = v.value;
      });
      setRows([initialRow]);
      setJsonInput(JSON.stringify([initialRow], null, 2));
    }
  }, [isBulkModalOpen, templateVars, rows.length]);

  if (!isBulkModalOpen) return null;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(templateVars, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleAddRow = () => {
    const newRow: Record<string, string> = {};
    templateVars.forEach((v) => {
      newRow[v.id] = v.value;
    });
    const nextRows = [...rows, newRow];
    setRows(nextRows);
    setJsonInput(JSON.stringify(nextRows, null, 2));
  };

  const handleUpdateCell = (rowIndex: number, key: string, val: string) => {
    const nextRows = rows.map((r, i) => (i === rowIndex ? { ...r, [key]: val } : r));
    setRows(nextRows);
    setJsonInput(JSON.stringify(nextRows, null, 2));
  };

  const handleRemoveRow = (rowIndex: number) => {
    const nextRows = rows.filter((_, i) => i !== rowIndex);
    setRows(nextRows);
    setJsonInput(JSON.stringify(nextRows, null, 2));
  };

  const handleJsonApply = (val: string) => {
    setJsonInput(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        setRows(parsed);
      }
    } catch {
      // ignore invalid JSON while typing
    }
  };

  const handleBulkGenerate = async () => {
    if (!stage || rows.length === 0) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: rows.length });

    // Save original values to restore after batch export
    const originalValues: Record<string, string> = {};
    templateVars.forEach((v) => {
      const layer = layers.find((l) => (l.templateId || l.id) === v.id);
      if (layer) {
        originalValues[v.id] =
          layer.type === 'text'
            ? (layer as any).text
            : layer.type === 'image'
            ? (layer as any).src
            : (layer as any).iconName || '';
      }
    });

    try {
      for (let i = 0; i < rows.length; i++) {
        setProgress({ current: i + 1, total: rows.length });
        const rowData = rows[i];

        // 1. Inject values into canvas layers
        applyTemplateValues(rowData);

        // 2. Wait for React-Konva re-render and image loading
        await new Promise((resolve) => setTimeout(resolve, 450));

        // 3. Export canvas file
        const firstVal = Object.values(rowData)[0] || `${i + 1}`;
        const safeSuffix = String(firstVal)
          .replace(/[^a-z0-9-_]/gi, '_')
          .slice(0, 20)
          .toLowerCase();
        const safeTitle = (title || 'poster').replace(/[^a-z0-9-_]/gi, '_').toLowerCase();

        await exportCanvas(stage, {
          format,
          scale: 2,
          filename: `${safeTitle}_${i + 1}_${safeSuffix}`,
        });
      }
    } finally {
      // Restore original values
      applyTemplateValues(originalValues);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Braces className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Template Variables & Bulk Generator
              </h2>
              <p className="text-[11px] text-slate-500">
                Generate multiple posters automatically from Text, Image, and Icon template layers.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBulkModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {templateVars.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <Braces className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Template Layers Marked Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select any <strong>Text</strong>, <strong>Image</strong>, or <strong>Icon</strong> layer on the canvas and click{' '}
                <span className="font-semibold text-indigo-600">&ldquo;Make Template&rdquo;</span> in its properties to use it here.
              </p>
            </div>
          ) : (
            <>
              {/* Template Schema Overview */}
              <div className="p-3.5 bg-slate-900 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Template Schema ({templateVars.length} variables)
                  </span>
                  <button
                    onClick={handleCopySchema}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? 'Copied Schema' : 'Copy JSON Schema'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-28">
                  {JSON.stringify(templateVars, null, 2)}
                </pre>
              </div>

              {/* Mode Switcher: Table vs Raw JSON */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      mode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Table Editor ({rows.length} rows)</span>
                  </button>
                  <button
                    onClick={() => setMode('json')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      mode === 'json' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Braces className="w-3.5 h-3.5" />
                    <span>JSON Array Input</span>
                  </button>
                </div>

                {mode === 'table' && (
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                )}
              </div>

              {/* TABLE EDITOR */}
              {mode === 'table' ? (
                <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-2.5 text-[10px] font-bold uppercase text-slate-400 w-10">#</th>
                        {templateVars.map((v) => (
                          <th key={v.id} className="p-2.5 text-[11px] font-bold text-slate-700">
                            <span className="font-mono text-indigo-700">{v.id}</span>
                            <span className="ml-1.5 text-[9px] uppercase px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                              {v.type}
                            </span>
                          </th>
                        ))}
                        <th className="p-2.5 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 text-xs font-mono text-slate-400">{rIdx + 1}</td>
                          {templateVars.map((v) => (
                            <td key={v.id} className="p-2">
                              <input
                                type="text"
                                value={row[v.id] ?? ''}
                                onChange={(e) => handleUpdateCell(rIdx, v.id, e.target.value)}
                                placeholder={v.value}
                                className="w-full min-w-[140px] text-xs font-medium text-slate-900 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-600 outline-none"
                              />
                            </td>
                          ))}
                          <td className="p-2 text-right">
                            <button
                              onClick={() => handleRemoveRow(rIdx)}
                              disabled={rows.length <= 1}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 disabled:opacity-30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* RAW JSON INPUT */
                <div>
                  <textarea
                    rows={8}
                    value={jsonInput}
                    onChange={(e) => handleJsonApply(e.target.value)}
                    className="w-full text-xs font-mono text-slate-900 p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none"
                    placeholder='[{"student_name": "Alice"}, {"student_name": "Bob"}]'
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Export Format:</span>
            {(['png', 'jpg', 'pdf'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border transition-all ${
                  format === fmt
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <button
            onClick={handleBulkGenerate}
            disabled={isGenerating || templateVars.length === 0 || rows.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  Generating {progress.current} / {progress.total}...
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate {rows.length} {rows.length === 1 ? 'File' : 'Files'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
