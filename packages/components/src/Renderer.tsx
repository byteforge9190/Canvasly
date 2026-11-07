import React from 'react';
import type { NormalizedPageState, Breakpoint } from '@canvasly/dsl-schema';
import { ComponentRenderer } from './ComponentRenderer';
import { runtimeResolveBounds } from './utils/overlay-runtime';

interface RendererProps {
  state: NormalizedPageState;
  breakpoint?: Breakpoint;
  activeLocale?: import('@canvasly/dsl-schema').Locale;
  componentWrapper?: React.ComponentType<{ id: string; children: React.ReactNode }>;
  childrenWrapper?: React.ComponentType<{
    items: string[];
    children: React.ReactNode;
    parentId: string;
  }>;
  useStaticStyles?: boolean;
  resolveBounds?: (componentId: string) => DOMRect | null;
  isEditorMode?: boolean;
}

export const Renderer: React.FC<RendererProps> = ({
  state,
  breakpoint,
  activeLocale,
  componentWrapper,
  childrenWrapper,
  useStaticStyles,
  resolveBounds = runtimeResolveBounds,
  isEditorMode = false,
}) => {
  // Ensure state has required properties with defaults
  const componentOrder = state.componentOrder || [];
  const components = state.components || {};
  const siteId = state.page?.siteId;

  return (
    <div
      className="bn-renderer"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {componentOrder.map((componentId: string) => {
        const component = components[componentId];
        if (!component) return null;

        return (
          <ComponentRenderer
            key={componentId}
            component={component}
            allComponents={components}
            breakpoint={breakpoint}
            activeLocale={activeLocale}
            useStaticStyles={useStaticStyles}
            componentWrapper={componentWrapper}
            childrenWrapper={childrenWrapper}
            resolveBounds={resolveBounds}
            isEditorMode={isEditorMode}
            siteId={siteId}
          />
        );
      })}
    </div>
  );
};
