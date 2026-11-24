'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { SAMPLE_ERP_PAYLOADS, encodeERPConfig } from '@/utils/urlConfigParser';
import { ERPExternalConfig } from '@/types/editor';
import { 
  Building2, 
  ExternalLink, 
  Copy, 
  Check, 
  Code2, 
  Smartphone, 
  Globe, 
  ShieldCheck,
  Play
} from 'lucide-react';

export default function ErpIntegrationPanel() {
  const { loadFromConfig, setIsErpModalOpen, erpMeta } = useEditorStore();
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const currentPayload = SAMPLE_ERP_PAYLOADS[selectedSampleIndex].config;

  const getGeneratedUrl = (config: ERPExternalConfig) => {
    const encoded = encodeERPConfig(config);
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/?config=${encoded}`;
    }
    return `https://designer.example.com/?config=${encoded}`;
  };

  const handleCopyUrl = () => {
    const url = getGeneratedUrl(currentPayload);
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-1">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>ERP Layer Injection</span>
          </h3>
          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            API v1
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Seamlessly inject institution branding, logos, and event metadata directly from external ERP systems without authentication.
        </p>
      </div>

      {erpMeta?.isExternalInjection && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Active External Session</span>
          </div>
          <p className="text-[11px] text-purple-700">
            Loaded for tenant: <strong>{erpMeta.tenantName || 'Unknown'}</strong> (ID: {erpMeta.tenantId || 'N/A'})
          </p>
        </div>
      )}

      {/* Preset Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          Sample ERP Payloads
        </label>
        <div className="space-y-2">
          {SAMPLE_ERP_PAYLOADS.map((sample, idx) => (
            <div
              key={sample.title}
              onClick={() => setSelectedSampleIndex(idx)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                selectedSampleIndex === idx
                  ? 'bg-purple-50/70 border-purple-500 ring-1 ring-purple-500'
                  : 'bg-slate-50 hover:bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{sample.title}</span>
                <span className="text-[10px] text-purple-600 font-semibold">
                  {sample.config.layers.length} layers
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {sample.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch Button */}
      <div className="space-y-2">
        <button
          onClick={() => loadFromConfig(currentPayload)}
          className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Inject Selected ERP Payload Now</span>
        </button>

        <button
          onClick={handleCopyUrl}
          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedUrl ? 'Copied URL to Clipboard!' : 'Copy Launch URL with Config'}</span>
        </button>
      </div>

      {/* Interactive Docs & Code Trigger */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Integration Docs</span>
          <div className="flex gap-1 text-[10px] text-slate-500 font-mono">
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Next.js</span>
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Flutter</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Embed the poster maker directly in an iframe, open as a modal, or embed in Flutter apps using InAppWebView.
        </p>
        <button
          onClick={() => setIsErpModalOpen(true)}
          className="w-full py-1.5 px-3 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Open Full ERP Architecture Hub</span>
        </button>
      </div>
    </div>
  );
}
