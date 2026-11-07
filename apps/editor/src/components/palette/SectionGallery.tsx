import React, { useState, useEffect } from 'react';
import { templateApi } from '../../lib/api';
import type { TemplateWithContent, Template } from '../../types/templates';
import { useEditorStore } from '../../store/editorStore';
import { X, Search, Loader2 } from 'lucide-react';
import { SectionPreviewItem } from '../sections';
import '../../styles/gallery-preview.css';

interface SectionGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SectionGallery: React.FC<SectionGalleryProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<TemplateWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const addSectionTemplate = useEditorStore((state) => state.addSectionTemplate);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { templates: basicTemplates } = await templateApi.list({
        type: 'section',
        limit: 50,
      });

      // Fetch full content for each template
      const fullTemplates = await Promise.all(
        basicTemplates.map((t: Template) => templateApi.get(t.id)),
      );

      setTemplates(fullTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (template: TemplateWithContent) => {
    const state = useEditorStore.getState();
    const pageState = state.pageState;

    if (!pageState) return;

    addSectionTemplate(template, {
      type: 'inside',
      targetId: 'root',
      index: pageState.componentOrder.length,
    });
    onClose();
  };

  if (!isOpen) return null;

  const filteredTemplates = templates.filter(
    (t: TemplateWithContent) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-[85vh] bg-zinc-900 rounded-4xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
              <Loader2 className="text-brand-blue" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight leading-tight">
                Section Library
              </h2>
              <p className="text-[14px] font-medium text-zinc-500 mt-1">
                Browse and insert high-quality pre-built sections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-zinc-400 hover:text-zinc-100 transition-all border border-zinc-700/30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-8 py-5 flex flex-col gap-4 bg-zinc-950/30 border-b border-zinc-800/30">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                size={18}
              />
              <input
                type="text"
                placeholder="Search sections by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-6 text-[14px] font-medium text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/50 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-zinc-900/20">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-brand-blue animate-spin" />
                <Loader2 className="absolute inset-0 m-auto text-brand-blue opacity-50" size={24} />
              </div>
              <p className="text-[14px] font-bold text-zinc-500 uppercase tracking-widest">
                Accessing records...
              </p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="flex flex-col gap-10 pb-12">
              {filteredTemplates.map((template: TemplateWithContent) => (
                <SectionPreviewItem key={template.id} template={template} onSelect={handleSelect} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-4xl bg-zinc-800/50 flex items-center justify-center mb-6">
                <Search size={40} className="text-zinc-700" />
              </div>
              <p className="text-xl font-bold text-zinc-400">No results found</p>
              <p className="text-[14px] text-zinc-600 mt-2 max-w-xs mx-auto">
                Try searching for keywords like "Hero", "Features" or "Pricing".
              </p>
              <button
                onClick={() => setSearch('')}
                className="mt-6 text-brand-blue font-bold text-[14px] hover:underline"
              >
                Clear search filter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
