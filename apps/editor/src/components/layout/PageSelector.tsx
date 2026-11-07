import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, FileText, Home } from 'lucide-react';
import { pageApi, type PageListItem } from '../../lib/api';

interface PageSelectorProps {
  siteId: string | null;
  currentPageId: string | null;
}

export const PageSelector: React.FC<PageSelectorProps> = ({ siteId, currentPageId }) => {
  const [, setSearchParams] = useSearchParams();
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      if (!siteId) return;

      setIsLoading(true);
      try {
        const fetchedPages = await pageApi.list(siteId);
        setPages(fetchedPages);
      } catch (err) {
        console.error('Failed to fetch pages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, [siteId]);

  const currentPage = pages.find((p) => p.id === currentPageId);

  const handlePageChange = (pageId: string) => {
    if (siteId) {
      setSearchParams({ siteId, pageId });
    }
    setIsOpen(false);
  };

  if (!siteId || isLoading) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800/50 rounded-xl transition-all text-[13px] font-semibold shadow-sm hover:border-zinc-700 active:scale-[0.98]"
      >
        <div className="p-1 rounded-md bg-zinc-900 border border-zinc-800">
          {currentPage?.slug === 'home' ? (
            <Home size={12} className="text-brand-blue" />
          ) : (
            <FileText size={12} className="text-zinc-500" />
          )}
        </div>
        <span className="max-w-30 truncate">{currentPage?.title || 'Select Page'}</span>
        <ChevronDown
          size={14}
          className={`text-zinc-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 py-2 max-h-100 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 shadow-black/50 custom-scrollbar">
            <div className="px-4 py-2 border-b border-zinc-800/50 mb-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Site Pages
              </span>
            </div>
            {pages.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-2">
                  <FileText size={18} className="text-zinc-700" />
                </div>
                <p className="text-[12px] text-zinc-500 font-medium">No pages found</p>
              </div>
            ) : (
              pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handlePageChange(page.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all group ${
                    page.id === currentPageId
                      ? 'bg-brand-blue/10 text-brand-blue'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      page.id === currentPageId
                        ? 'bg-brand-blue/20 text-brand-blue'
                        : 'bg-zinc-950 border border-zinc-800/50 text-zinc-600 group-hover:text-zinc-400'
                    }`}
                  >
                    {page.slug === 'home' ? <Home size={14} /> : <FileText size={14} />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[13px] font-bold truncate leading-tight">{page.title}</div>
                    <div className="text-[11px] text-zinc-500 font-medium truncate">
                      /{page.slug}
                    </div>
                  </div>
                  {page.id === currentPageId && (
                    <div className="p-1 rounded-full bg-brand-blue shadow-lg shadow-brand-blue/20 animate-in zoom-in">
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
