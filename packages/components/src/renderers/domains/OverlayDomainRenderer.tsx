import React from 'react';
import type { Component, FrameProps, Breakpoint } from '@canvasly/dsl-schema';
import { resolveFrameStyles } from '../../utils/frame.resolver';
import { resolveFillToCSS } from '../../utils/fill-resolver';
import { ComponentRenderer } from '../../ComponentRenderer';
import { useOverlayStore } from '../../contexts/OverlayStore';
import { OverlayWrapper } from '../OverlayWrapper';
import { resolveOverlayZIndex } from '../../utils/overlay-zindex';
import type { RendererResult } from '../base/types';

interface OverlayDomainRendererProps {
  component: Component;
  frame: FrameProps;
  allComponents: Record<string, Component>;
  breakpoint?: Breakpoint;
  useStaticStyles?: boolean;
  componentWrapper?: React.ComponentType<{ id: string; children: React.ReactNode }>;
  childrenWrapper?: React.ComponentType<{
    items: string[];
    children: React.ReactNode;
    parentId: string;
  }>;
  resolveBounds?: (componentId: string) => DOMRect | null;
  isEditorMode?: boolean;
  activeLocale?: import('@canvasly/dsl-schema').Locale;
}

/**
 * Renders overlay components in three modes:
 * 1. SSR (Publisher): Hidden div with data attributes
 * 2. Editor: Visible in flow with dashed border
 * 3. Runtime: Portaled with positioning
 */
export function renderOverlayDomain({
  component,
  frame,
  allComponents,
  breakpoint,
  useStaticStyles,
  componentWrapper,
  childrenWrapper: ChildrenWrapper,
  resolveBounds,
  isEditorMode,
  activeLocale,
}: OverlayDomainRendererProps): RendererResult {
  const semantic = frame.semantic || { tag: 'div' };
  const Tag = (semantic.tag as keyof JSX.IntrinsicElements) || 'div';
  const Wrapper = ChildrenWrapper || React.Fragment;

  // Helper to render children
  const renderChildren = () => (
    <Wrapper items={component.children} parentId={component.id}>
      {component.children.map((childId: string) => {
        const childComponent = allComponents[childId];
        if (!childComponent) return null;

        return (
          <ComponentRenderer
            key={childId}
            component={childComponent}
            allComponents={allComponents}
            breakpoint={breakpoint}
            useStaticStyles={useStaticStyles}
            componentWrapper={componentWrapper}
            childrenWrapper={ChildrenWrapper}
            resolveBounds={resolveBounds}
            isEditorMode={isEditorMode}
            activeLocale={activeLocale}
          />
        );
      })}
    </Wrapper>
  );

  // PUBLISHER MODE (SSR): Render as hidden static HTML
  if (useStaticStyles) {
    const frameStyles = {};
    const fillStyles = frame.style?.fill ? resolveFillToCSS(frame.style.fill) : {};
    const combinedStyles: React.CSSProperties = {
      ...frameStyles,
      ...fillStyles,
      display: 'none', // Hidden by default in SSR
    };

    const content = React.createElement(
      Tag,
      {
        id: component.id,
        className: 'bn-component bn-component-frame bn-overlay bn-overlay-ssr',
        style: combinedStyles,
        'data-component-id': component.id,
        'data-overlay-id': component.id,
        'data-trigger-id': frame.position?.anchor?.targetId,
        'data-overlay-type': frame.overlay?.modal ? 'modal' : 'popover',
        'data-placement': frame.position?.anchor?.placement || 'bottom',
        'data-offset': frame.position?.anchor?.offset?.toString() || '8',
        'data-dismiss-outside': frame.overlay?.dismissOnClickOutside?.toString() || 'true',
        'data-dismiss-escape': frame.overlay?.dismissOnEscape?.toString() || 'true',
        'data-backdrop': frame.overlay?.backdropEnabled?.toString() || 'false',
        'data-animation-enter': frame.overlay?.animationEnter || 'fade',
        'data-animation-exit': frame.overlay?.animationExit || 'fade',
        'data-animation-duration': frame.overlay?.animationDuration?.toString() || '200',
      },
      renderChildren(),
    );

    return { content, style: {} };
  }

  // EDITOR MODE: Render in document flow for editing
  if (isEditorMode) {
    const frameStyles = resolveFrameStyles(frame);
    const fillStyles = frame.style?.fill ? resolveFillToCSS(frame.style.fill) : {};
    const combinedStyles: React.CSSProperties = {
      ...frameStyles,
      ...fillStyles,
      position: 'relative',
      opacity: 0.8,
      border: '2px dashed #3b82f6',
    };

    const content = React.createElement(
      Tag,
      {
        id: component.id,
        className: 'bn-component bn-component-frame bn-overlay bn-overlay-editor',
        style: combinedStyles,
        'data-component-id': component.id,
      },
      renderChildren(),
    );

    return { content, style: {} };
  }

  // RUNTIME MODE: Full overlay behavior with portal
  const isOpen = useOverlayStore((state) => state.openOverlays.has(component.id));
  const close = useOverlayStore((state) => state.close);

  if (!isOpen) {
    return { content: null, style: {} };
  }

  // Calculate z-index
  const openOrder = Array.from(useOverlayStore.getState().openOverlays.keys()).indexOf(
    component.id,
  );
  const zIndex = resolveOverlayZIndex(frame, component.id, openOrder);

  // Render overlay content
  const frameStyles = resolveFrameStyles(frame);
  const fillStyles = frame.style?.fill ? resolveFillToCSS(frame.style.fill) : {};
  const combinedStyles: React.CSSProperties = {
    ...frameStyles,
    ...fillStyles,
  };

  const overlayContent = React.createElement(
    Tag,
    {
      id: component.id,
      className: 'bn-component bn-component-frame',
      style: combinedStyles,
      'data-component-id': component.id,
    },
    renderChildren(),
  );

  const anchor = frame.position?.anchor;
  const content = (
    <OverlayWrapper
      overlayId={component.id}
      overlay={frame.overlay!}
      triggerId={anchor?.targetId}
      placement={anchor?.placement || 'bottom'}
      offset={anchor?.offset || 8}
      zIndex={zIndex}
      onClose={() => close(component.id)}
    >
      {overlayContent}
    </OverlayWrapper>
  );

  return { content, style: {} };
}
