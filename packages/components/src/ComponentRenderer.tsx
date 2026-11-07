import React from 'react';
import type { Component, Breakpoint, FrameProps } from '@canvasly/dsl-schema';
import { getComponentDefinition } from '@canvasly/dsl-schema';
import { getRenderer, hasRenderer, type RendererContext } from './renderers';

import { Locale } from '@canvasly/dsl-schema';

interface ComponentRendererProps {
  component: Component;
  allComponents: Record<string, Component>;
  breakpoint?: Breakpoint;
  useStaticStyles?: boolean;
  activeLocale?: Locale;
  componentWrapper?: React.ComponentType<{ id: string; children: React.ReactNode }>;
  childrenWrapper?: React.ComponentType<{
    items: string[];
    children: React.ReactNode;
    parentId: string;
  }>;
  resolveBounds?: (componentId: string) => DOMRect | null;
  isEditorMode?: boolean;
  siteId?: string;
}

const DefaultChildrenWrapper: React.FC<{
  items: string[];
  children: React.ReactNode;
  parentId: string;
}> = ({ children }) => <>{children}</>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
  if (
    typeof target !== 'object' ||
    target === null ||
    typeof source !== 'object' ||
    source === null
  ) {
    return source;
  }
  const result = { ...target };
  Object.keys(source).forEach((key) => {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  });
  return result;
}

export function resolveComponentLocale(component: Component, activeLocale?: Locale): Component {
  if (!activeLocale || !component.localized || !component.localized[activeLocale]) {
    return component;
  }

  const localeLayer = component.localized[activeLocale];
  return {
    ...component,
    frame:
      localeLayer.frame && component.frame
        ? deepMerge(component.frame, localeLayer.frame)
        : component.frame || (localeLayer.frame as FrameProps),
  };
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component: rawComponent,
  allComponents,
  breakpoint,
  useStaticStyles,
  activeLocale,
  componentWrapper,
  childrenWrapper: ChildrenWrapper = DefaultChildrenWrapper,
  resolveBounds,
  isEditorMode,
  siteId,
}) => {
  // Early return for null components
  if (!rawComponent) return null;

  const component = resolveComponentLocale(rawComponent, activeLocale);

  // Check if component definition exists
  const definition = getComponentDefinition(component.type);
  if (!definition) {
    return (
      <div className="bn-unknown-component">
        <div className="error-title">
          Unknown component type: <code>{component.type}</code>
        </div>
        <div className="error-message">This component may have been removed or renamed.</div>
      </div>
    );
  }

  // Use migrated renderer if available
  if (hasRenderer(component.type)) {
    const renderer = getRenderer(component.type);
    if (renderer) {
      const context: RendererContext = {
        allComponents,
        breakpoint,
        useStaticStyles,
        componentWrapper,
        childrenWrapper: ChildrenWrapper,
        resolveBounds,
        isEditorMode,
        activeLocale,
        siteId,
      };

      const result = renderer({ component, context });

      if (!result) return null;

      const Wrapper = (componentWrapper || React.Fragment) as React.ComponentType<{
        id?: string;
        items?: string[];
        children: React.ReactNode;
        parentId?: string;
      }>;
      const wrapperProps = componentWrapper ? { id: component.id } : {};

      // Check if this is a modern renderer (like FrameRenderer) that returns complete elements
      // Modern renderers don't return a className or style - they handle everything internally
      const isModernRenderer = !result.className && Object.keys(result.style || {}).length === 0;

      const dirOverride = component.frame?.text?.direction as string | undefined;

      if (isModernRenderer) {
        // Modern renderers (FrameRenderer) - return content directly without extra wrapper
        if (dirOverride) {
          return (
            <Wrapper {...wrapperProps}>
              <div dir={dirOverride} style={{ display: 'contents' }}>
                {result.content}
              </div>
            </Wrapper>
          );
        }
        return <Wrapper {...wrapperProps}>{result.content}</Wrapper>;
      } else {
        // Legacy renderers (TextRenderer, ImageRenderer, etc.) - need wrapper with className and styles
        const baseStyles = {};
        const mergedStyles: React.CSSProperties = useStaticStyles
          ? {}
          : {
              ...baseStyles,
              ...result.style,
            };

        const renderLegacyNode = (
          <div
            id={component.id}
            className={`bn-component bn-component-${component.type} ${result.className || ''}`}
            style={mergedStyles}
            data-component-id={component.id}
            dir={dirOverride}
            {...(result.dataAttributes || {})}
          >
            {result.content}
          </div>
        );

        return <Wrapper {...wrapperProps}>{renderLegacyNode}</Wrapper>;
      }
    }
  }

  // Fallback for components without renderers (should be rare)
  const Wrapper = (componentWrapper || React.Fragment) as React.ComponentType<{
    id?: string;
    items?: string[];
    children: React.ReactNode;
    parentId?: string;
  }>;
  const wrapperProps = componentWrapper ? { id: component.id } : {};
  const style = {};

  const layoutStyle: React.CSSProperties = useStaticStyles ? {} : style;

  return (
    <Wrapper {...wrapperProps}>
      <div
        id={component.id}
        className={`bn-component bn-component-${component.type}`}
        style={layoutStyle}
        data-component-id={component.id}
      >
        <ChildrenWrapper items={component.children} parentId={component.id}>
          {component.children.map((childId) => (
            <ComponentRenderer
              key={childId}
              component={allComponents[childId]}
              allComponents={allComponents}
              breakpoint={breakpoint}
              useStaticStyles={useStaticStyles}
              activeLocale={activeLocale}
              componentWrapper={componentWrapper}
              childrenWrapper={ChildrenWrapper}
              resolveBounds={resolveBounds}
              isEditorMode={isEditorMode}
              siteId={siteId}
            />
          ))}
        </ChildrenWrapper>
      </div>
    </Wrapper>
  );
};
