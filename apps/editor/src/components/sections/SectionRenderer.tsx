import React, { useMemo } from 'react';
import { Renderer } from '@canvasly/components';
import type { NormalizedPageState, Page, SiteTheme } from '@canvasly/dsl-schema';
import type { SectionContent } from '../../types/templates';

interface SectionRendererProps {
  content: SectionContent;
  theme?: SiteTheme;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
  className?: string;
}

/**
 * SectionRenderer - Renders a section template using the existing Renderer.
 * No modifications to @canvasly/components needed - uses CSS wrapper for gallery mode.
 */
export const SectionRenderer: React.FC<SectionRendererProps> = ({
  content,
  theme: _theme,
  breakpoint,
  className = '',
}) => {
  // Convert SectionContent to NormalizedPageState (same pattern as TemplateDemoViewer)
  const pageState: NormalizedPageState = useMemo(() => {
    return {
      page: {
        id: 'demo-page',
        title: 'Section Demo',
        slug: 'demo',
        status: 'published',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        siteId: 'demo-site',
        seo: {},
      } as unknown as Page,
      components: content.components,
      componentOrder: [content.rootComponentId],
    };
  }, [content]);

  // Convert desktop breakpoint to undefined (Renderer only accepts mobile/tablet/undefined)
  const effectiveBreakpoint = breakpoint === 'desktop' ? undefined : breakpoint;

  return (
    <div className={`section-renderer-wrapper ${className}`} data-preview-mode="gallery">
      <Renderer
        state={pageState}
        breakpoint={effectiveBreakpoint}
        useStaticStyles={false}
        isEditorMode={false}
      />
    </div>
  );
};
