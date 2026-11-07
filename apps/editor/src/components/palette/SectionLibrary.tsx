import React, { useState } from 'react';
import { Layout, Sparkles } from 'lucide-react';
import { SectionGallery } from './SectionGallery';

export const SectionLibrary: React.FC = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsGalleryOpen(true)}
        className="group relative w-full p-4 mb-8 bg-zinc-950/50 hover:bg-zinc-900/50 rounded-2xl border border-zinc-800/80 overflow-hidden transition-all hover:border-brand-blue/30 shadow-sm active:scale-[0.98] text-left"
      >
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-2.5 bg-brand-blue/10 border border-brand-blue/20 rounded-xl text-brand-blue shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Layout size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-black text-zinc-100 tracking-tight">
                Section Library
              </span>
              <Sparkles size={12} className="text-brand-blue animate-pulse" />
            </div>
            <p className="text-[11px] font-medium text-zinc-500 mt-0.5 group-hover:text-zinc-400 transition-colors">
              Add pre-built blocks to your page
            </p>
          </div>
        </div>

        {/* Glossy gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-tr from-brand-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Animated accent dot */}
        <div className="absolute top-4 right-4 w-1 h-1 bg-brand-blue rounded-full shadow-[0_0_10px_2px_rgba(59,130,246,0.5)] transform scale-0 group-hover:scale-100 transition-transform duration-500" />
      </button>

      <SectionGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
    </>
  );
};
