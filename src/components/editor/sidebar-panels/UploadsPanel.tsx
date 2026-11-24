'use client';

import React, { useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Sparkles } from 'lucide-react';

const SAMPLE_STOCK_IMAGES = [
  {
    name: 'College Campus Building',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Graduation Ceremony Cap',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Futuristic Tech Mesh',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Golden Trophy & Laurel',
    url: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Vibrant Art Paint Splatter',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sports Stadium Arena',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
  },
];

export default function UploadsPanel() {
  const { addLayer, width, height } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; url: string }>>(SAMPLE_STOCK_IMAGES);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const newImg = { name: file.name, url: dataUrl };
          setUploadedImages((prev) => [newImg, ...prev]);
          insertImage(dataUrl, file.name);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const insertImage = (src: string, name: string) => {
    addLayer({
      type: 'image',
      name: name.replace(/\.[^/.]+$/, ''),
      src,
      x: Math.round((width - 450) / 2),
      y: Math.round((height - 350) / 2),
      width: 450,
      height: 350,
      cornerRadius: 12,
    });
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const name = `Web Image ${uploadedImages.length + 1}`;
    setUploadedImages((prev) => [{ name, url: urlInput.trim() }, ...prev]);
    insertImage(urlInput.trim(), name);
    setUrlInput('');
  };

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-1">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Uploads & Media
        </h3>
        <p className="text-[11px] text-slate-500">
          Upload institution logos, badges, photography, or external HTTPS URLs.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/70 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-purple-600 mb-2 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-800">
          Click or drop image here
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          PNG, JPG, SVG, WebP up to 25MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* External URL Loader */}
      <form onSubmit={handleUrlSubmit} className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 block">
          Load Image from URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full text-xs pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
          >
            Add
          </button>
        </div>
      </form>

      {/* Image Gallery */}
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Curated Stock & Uploads</span>
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {uploadedImages.map((img, i) => (
            <div
              key={`${img.name}-${i}`}
              onClick={() => insertImage(img.url, img.name)}
              className="group relative h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:border-purple-500 hover:shadow-md cursor-pointer transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <span className="text-[10px] text-white font-semibold text-center line-clamp-2">
                  + Add to Canvas
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
