'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { SAMPLE_ERP_PAYLOADS, encodeERPConfig } from '@/utils/urlConfigParser';
import { 
  X, 
  Building2, 
  Code2, 
  Smartphone, 
  Globe, 
  Copy, 
  Check, 
  Play, 
  ShieldAlert, 
  ExternalLink,
  Layers,
  FileJson
} from 'lucide-react';

export default function ErpDocsModal() {
  const { isErpModalOpen, setIsErpModalOpen, loadFromConfig } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'nextjs' | 'flutter' | 'postmessage'>('simulator');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedPayloadIndex, setSelectedPayloadIndex] = useState(0);
  const [customJson, setCustomJson] = useState(
    JSON.stringify(SAMPLE_ERP_PAYLOADS[0].config, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isErpModalOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInjectCustomJson = () => {
    try {
      const parsed = JSON.parse(customJson);
      if (!parsed.layers || !Array.isArray(parsed.layers)) {
        throw new Error('Payload must contain a "layers" array.');
      }
      loadFromConfig(parsed);
      setJsonError(null);
      setIsErpModalOpen(false);
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const currentPayload = SAMPLE_ERP_PAYLOADS[selectedPayloadIndex].config;
  const sampleUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?config=${encodeERPConfig(currentPayload)}`
    : `https://designer.example.com/?config=${encodeERPConfig(currentPayload)}`;

  const nextJsSnippet = `// Next.js (App Router) Integration Example
// app/admin/posters/create/page.tsx
'use client';

import React from 'react';

export default function PosterIntegrationPage() {
  // Construct tenant branding & event configuration
  const erpConfig = {
    version: 1,
    canvas: {
      width: 1080,
      height: 1350,
      background: '#F8FAFC',
      name: 'Eduzee Arts Fest 2026',
    },
    layers: [
      {
        id: 'tenant-logo',
        type: 'image',
        src: 'https://erp.eduzee.example/storage/tenant-logo.png',
        x: 70,
        y: 60,
        width: 140,
        height: 140,
        locked: true,     // UX restriction: cannot be dragged or resized
        deletable: false, // Cannot be deleted
        editable: false,  // Cannot be modified
        name: 'Institution Logo',
      },
      {
        id: 'institution-name',
        type: 'text',
        text: 'EDUZEE INSTITUTION',
        x: 240,
        y: 90,
        width: 760,
        fontSize: 38,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 'bold',
        color: '#39216C',
        locked: true,
        deletable: false,
      },
      {
        id: 'event-title',
        type: 'text',
        text: 'ANNUAL ARTS & CULTURAL FEST',
        x: 80,
        y: 450,
        width: 920,
        fontSize: 76,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 'bold',
        color: '#39216C',
        textAlign: 'center',
      },
    ],
    meta: {
      tenantId: 'TENANT_EDUZEE_9921',
      tenantName: 'Eduzee Global Academy',
      callbackUrl: 'https://erp.eduzee.example/api/posters/callback',
    },
  };

  // Base64 encode the configuration payload
  const encodedConfig = Buffer.from(JSON.stringify(erpConfig)).toString('base64');
  const designerUrl = \`https://poster-studio.example.com/?config=\${encodedConfig}\`;

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
        <h1 className="text-base font-bold">Eduzee ERP - Poster Designer Studio</h1>
        <a 
          href={designerUrl} 
          target="_blank" 
          rel="noreferrer"
          className="px-4 py-1.5 bg-purple-600 rounded-lg text-xs font-semibold"
        >
          Open in New Window
        </a>
      </div>
      <iframe
        src={designerUrl}
        className="w-full flex-1 border-0"
        title="Poster Designer Studio"
        allow="clipboard-write"
      />
    </div>
  );
}`;

  const flutterSnippet = `// Flutter WebView Integration Example
// lib/screens/poster_designer_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PosterDesignerScreen extends StatefulWidget {
  final String tenantLogoUrl;
  final String institutionName;
  final String eventTitle;

  const PosterDesignerScreen({
    Key? key,
    required this.tenantLogoUrl,
    required this.institutionName,
    required this.eventTitle,
  }) : super(key: key);

  @override
  State<PosterDesignerScreen> createState() => _PosterDesignerScreenState();
}

class _PosterDesignerScreenState extends State<PosterDesignerScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();

    // 1. Prepare ERP configuration payload
    final Map<String, dynamic> erpConfig = {
      'version': 1,
      'canvas': {
        'width': 1080,
        'height': 1350,
        'background': '#FFFFFF',
      },
      'layers': [
        {
          'id': 'tenant-logo',
          'type': 'image',
          'src': widget.tenantLogoUrl,
          'x': 70,
          'y': 60,
          'width': 140,
          'height': 140,
          'locked': true,
          'deletable': false,
          'editable': false,
        },
        {
          'id': 'institution-name',
          'type': 'text',
          'text': widget.institutionName,
          'x': 240,
          'y': 90,
          'width': 760,
          'fontSize': 36,
          'color': '#39216C',
          'locked': true,
          'deletable': false,
        },
        {
          'id': 'event-title',
          'type': 'text',
          'text': widget.eventTitle,
          'x': 80,
          'y': 480,
          'width': 920,
          'fontSize': 72,
          'color': '#39216C',
          'textAlign': 'center',
        },
      ],
      'meta': {
        'tenantName': widget.institutionName,
      }
    };

    // 2. Base64 encode JSON payload
    final String jsonString = jsonEncode(erpConfig);
    final String base64Config = base64Encode(utf8.encode(jsonString));
    final Uri launchUri = Uri.parse('https://poster-studio.example.com/?config=\$base64Config');

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(launchUri);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Poster Designer Studio'),
        backgroundColor: const Color(0xFF39216C),
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}`;

  const postMessageSnippet = `// Bidirectional window.postMessage Communication
// For seamless ERP parent iframe embedding

// 1. Listening to export events in the Parent ERP:
window.addEventListener('message', (event) => {
  // Validate origin for security
  // if (event.origin !== 'https://poster-studio.example.com') return;

  const data = event.data;
  if (data?.type === 'POSTER_EXPORT_COMPLETE') {
    const { format, dataUrl, filename } = data.payload;
    console.log('Finished poster received from designer:', filename);

    // Save directly to ERP cloud storage or student portal
    uploadToErpStorage(dataUrl);
  }
});

// 2. Requesting export programmatically from ERP:
const iframe = document.getElementById('poster-designer-iframe');
iframe.contentWindow.postMessage(
  {
    type: 'TRIGGER_EXPORT',
    payload: { format: 'png', scale: 2 }
  },
  '*'
);`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ERP Layer Injection Architecture & Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Zero-authentication integration via URL parameters, Base64 JSON, and iframe PostMessage
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsErpModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-slate-50 shrink-0">
          {[
            { id: 'simulator', label: 'Live ERP Simulator', icon: Play },
            { id: 'overview', label: 'Architecture & Rules', icon: Layers },
            { id: 'nextjs', label: 'Next.js App Router', icon: Code2 },
            { id: 'flutter', label: 'Flutter WebView', icon: Smartphone },
            { id: 'postmessage', label: 'postMessage Bridge', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
                  isActive
                    ? 'border-purple-600 text-purple-700 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: LIVE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Test ERP Payloads Live
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select a sample or paste custom JSON to inject layers directly into the canvas.
                  </p>
                </div>

                <div className="flex gap-2">
                  {SAMPLE_ERP_PAYLOADS.map((sample, i) => (
                    <button
                      key={sample.title}
                      onClick={() => {
                        setSelectedPayloadIndex(i);
                        setCustomJson(JSON.stringify(sample.config, null, 2));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedPayloadIndex === i
                          ? 'bg-purple-50 text-purple-700 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {sample.title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated URL Box */}
              <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Generated URL (?config=BASE64_JSON)
                  </span>
                  <button
                    onClick={() => handleCopy(sampleUrl, 'url')}
                    className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white"
                  >
                    {copiedCode === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'url' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] text-purple-300 truncate select-all">
                  {sampleUrl}
                </p>
              </div>

              {/* JSON Editor & Error Alert */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Configuration JSON Payload
                </label>
                <textarea
                  rows={10}
                  value={customJson}
                  onChange={(e) => setCustomJson(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl border border-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
                />
                {jsonError && (
                  <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    ⚠️ {jsonError}
                  </p>
                )}
              </div>

              {/* Inject Action */}
              <button
                onClick={handleInjectCustomJson}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Inject Configuration into Canvas</span>
              </button>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & RULES */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 space-y-2">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>Layer Protection UX Model</span>
                </h4>
                <p className="leading-relaxed">
                  External ERP systems can designate sensitive institutional assets (such as school badges, accreditation stamps, legal seals, and university names) with granular UX protection properties:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-200">
                    <span className="font-mono font-bold text-purple-700 block mb-0.5">locked: true</span>
                    <span className="text-[11px] text-slate-600">Disables dragging and resizing bounding box handles.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-200">
                    <span className="font-mono font-bold text-purple-700 block mb-0.5">deletable: false</span>
                    <span className="text-[11px] text-slate-600">Prevents deletion via keyboard or delete button.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-200">
                    <span className="font-mono font-bold text-purple-700 block mb-0.5">editable: false</span>
                    <span className="text-[11px] text-slate-600">Locks text strings and image replacement.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-200">
                    <span className="font-mono font-bold text-purple-700 block mb-0.5">selectable: false</span>
                    <span className="text-[11px] text-slate-600">Click-through to background; prevents selection.</span>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-700 font-medium pt-1">
                  *Note: Client-side layer locking is designed for optimal user experience and template preservation, not as a security sandbox.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Supported URL Parameter Formats
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-semibold text-slate-900 block mb-1">
                      1. Full Base64 Payload (?config=...)
                    </span>
                    <code className="text-[11px] text-purple-700 font-mono">
                      https://designer.example.com/?config=eyJ2ZXJzaW9uIjoxLCJjYW52YXMiOnsid2lkdGgiOjEwODAs...
                    </code>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-semibold text-slate-900 block mb-1">
                      2. Direct Query Parameters (?logo=...&institution=...&event=...)
                    </span>
                    <code className="text-[11px] text-purple-700 font-mono">
                      https://designer.example.com/?width=1080&height=1350&logo=https%3A%2F%2F...&institution=Eduzee
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NEXT.JS */}
          {activeTab === 'nextjs' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Next.js App Router / React Implementation
                </span>
                <button
                  onClick={() => handleCopy(nextJsSnippet, 'nextjs')}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  {copiedCode === 'nextjs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'nextjs' ? 'Copied Snippet' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto max-h-[400px]">
                <code>{nextJsSnippet}</code>
              </pre>
            </div>
          )}

          {/* TAB 4: FLUTTER WEBVIEW */}
          {activeTab === 'flutter' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Flutter InAppWebView / webview_flutter Implementation
                </span>
                <button
                  onClick={() => handleCopy(flutterSnippet, 'flutter')}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  {copiedCode === 'flutter' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'flutter' ? 'Copied Snippet' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto max-h-[400px]">
                <code>{flutterSnippet}</code>
              </pre>
            </div>
          )}

          {/* TAB 5: POSTMESSAGE */}
          {activeTab === 'postmessage' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Bidirectional PostMessage Bridge for iframe Embedding
                </span>
                <button
                  onClick={() => handleCopy(postMessageSnippet, 'postmessage')}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  {copiedCode === 'postmessage' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'postmessage' ? 'Copied Snippet' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto max-h-[400px]">
                <code>{postMessageSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
