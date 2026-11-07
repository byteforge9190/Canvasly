import React from 'react';
import type { TemplateWithContent } from '../../types/templates';
import { SectionRenderer } from './SectionRenderer';
import { SectionPreviewErrorBoundary } from './SectionPreviewErrorBoundary';
import { useIntersectionObserver, useSectionPreviewSizing } from '../../hooks/usePreviewHooks';

interface SectionPreviewItemProps {
  template: TemplateWithContent;
  onSelect: (template: TemplateWithContent) => void;
}

/**
 * SectionPreviewItem - Live preview of a section template.
 * Uses Intersection Observer for lazy rendering.
 */
export const SectionPreviewItem: React.FC<SectionPreviewItemProps> = ({ template, onSelect }) => {
  // Lazy rendering - only render when visible
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
  });

  // Get preview metadata from template content (with type assertion for preview property)
  const preview = (
    template.content as unknown as {
      preview?: {
        estimatedHeight?: number;
        preferredScale?: number;
        defaultBreakpoint?: 'mobile' | 'tablet' | 'desktop';
      };
    }
  )?.preview;

  // Calculate optimal sizing
  const { height, scale, breakpoint, needsScaling } = useSectionPreviewSizing(template.id, {
    estimatedHeight: preview?.estimatedHeight,
    preferredScale: preview?.preferredScale,
    defaultBreakpoint: preview?.defaultBreakpoint || 'desktop',
  });

  return (
    <div
      ref={ref}
      className="group relative flex flex-col bg-zinc-950 border border-zinc-800 rounded-[28px] overflow-hidden hover:border-brand-blue/30 transition-all hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] cursor-pointer"
      onClick={() => onSelect(template)}
    >
      {/* Section Info Header */}
      <div className="section-info-header px-8 py-5 flex items-center justify-between border-b border-zinc-900 bg-zinc-900/30 transition-colors group-hover:bg-zinc-900/50">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-brand-blue/10 group-hover:border-brand-blue/20 transition-all">
            <div className="w-2 h-6 bg-zinc-700 rounded-full group-hover:bg-brand-blue transition-colors" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-zinc-100 tracking-tight group-hover:text-brand-blue transition-colors">
              {template.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-zinc-600">
                {template.category}
              </span>
              <div className="flex items-center gap-1.5">
                {template.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-lg border border-zinc-800 uppercase tracking-tighter"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white text-[13px] font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand-blue/10 active:scale-95">
          Insert Section
        </button>
      </div>

      {/* Preview Area */}
      <div
        className="section-preview-container relative w-full bg-zinc-950 overflow-hidden"
        style={{ height }}
      >
        {isVisible && template.content ? (
          <SectionPreviewErrorBoundary thumbnailUrl={template.thumbnail_url} name={template.name}>
            <div
              className="section-preview-wrapper h-full"
              style={{
                width: needsScaling ? `${100 / scale}%` : '100%',
                transform: needsScaling ? `scale(${scale})` : 'none',
                transformOrigin: 'top left',
              }}
            >
              <SectionRenderer content={template.content} breakpoint={breakpoint} />
            </div>

            {/* Overflow indicator for scaled sections */}
            {needsScaling && (
              <div className="section-preview-overflow-indicator absolute bottom-0 inset-x-0 h-20" />
            )}

            {/* Scaled preview badge */}
            {needsScaling && (
              <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-zinc-500 bg-zinc-950/80 px-2 py-1 rounded">
                Scaled preview
              </div>
            )}
          </SectionPreviewErrorBoundary>
        ) : (
          /* Skeleton loading state */
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="w-full h-full section-preview-skeleton rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
};
