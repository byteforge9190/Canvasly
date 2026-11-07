import React, { useEffect, useState } from 'react';
import type { PropertySchema, LinkValue } from '@canvasly/dsl-schema';
import { pageApi } from '../../../lib/api';
import { useEditorStore } from '../../../store/editorStore';

interface LinkFieldProps {
  schema: PropertySchema;
  value: LinkValue | undefined;
  onChange: (value: LinkValue) => void;
}

interface PageOption {
  id: string;
  title: string;
  slug: string;
}

export const LinkField: React.FC<LinkFieldProps> = ({ schema, value, onChange }) => {
  const siteId = useEditorStore((state) => state.siteId);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [showPageDropdown, setShowPageDropdown] = useState(false);

  // Get the current URL value - could be from url or from a page slug
  const currentUrl =
    value?.type === 'url'
      ? value.url || ''
      : value?.type === 'page' && value.pageId
        ? `/${pages.find((p) => p.id === value.pageId)?.slug || ''}`
        : '';

  useEffect(() => {
    if (!siteId) return;

    let cancelled = false;

    const fetchPages = async () => {
      try {
        setLoadingPages(true);
        const pageList = await pageApi.list(siteId);

        if (!cancelled) {
          setPages(
            pageList.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
            })),
          );
        }
      } catch (error) {
        console.error('Failed to load pages:', error);
        if (!cancelled) {
          setPages([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPages(false);
        }
      }
    };

    fetchPages();

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const handleUrlChange = (url: string) => {
    // Always save as URL type for simplicity
    onChange({ type: 'url', url });
  };

  const handlePageSelect = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      // Save as URL with the page slug
      onChange({ type: 'url', url: `/${page.slug}` });
      setShowPageDropdown(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>

      {/* URL Input */}
      <input
        type="text"
        value={currentUrl}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="https://example.com or /about"
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm"
      />

      {/* Page Selector Button */}
      <button
        type="button"
        onClick={() => setShowPageDropdown(!showPageDropdown)}
        disabled={loadingPages || pages.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-2 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {loadingPages
          ? 'Loading...'
          : pages.length === 0
            ? 'No Pages'
            : showPageDropdown
              ? 'Hide Pages'
              : 'Select from Pages'}
      </button>

      {/* Page Dropdown */}
      {showPageDropdown && pages.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-lg max-h-60 overflow-y-auto">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => handlePageSelect(page.id)}
              className="w-full text-left px-3 py-2.5 text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors border-b border-zinc-800/50 last:border-0"
            >
              <div className="font-semibold">{page.title}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">/{page.slug}</div>
            </button>
          ))}
        </div>
      )}

      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};
