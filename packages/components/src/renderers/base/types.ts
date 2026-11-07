import type { Component, Breakpoint } from '@canvasly/dsl-schema';
import type { CSSProperties, ReactNode, ComponentType } from 'react';

export interface RendererContext {
  allComponents: Record<string, Component>;
  breakpoint?: Breakpoint;
  useStaticStyles?: boolean;
  componentWrapper?: ComponentType<{ id: string; children: ReactNode }>;
  childrenWrapper?: ComponentType<{ items: string[]; children: ReactNode; parentId: string }>;
  // Function to render a child component
  renderChild?: (childId: string) => ReactNode;
  isEditor?: boolean;
  // Overlay-specific
  isEditorMode?: boolean;
  activeLocale?: import('@canvasly/dsl-schema').Locale;
  resolveBounds?: (componentId: string) => DOMRect | null; // Injected resolver
  siteId?: string; // Site ID for assistant widget
}

export interface ComponentRendererProps {
  component: Component;
  context: RendererContext;
}

export interface RendererResult {
  content: ReactNode;
  style: CSSProperties;
  className?: string;
  dataAttributes?: Record<string, string>;
}

export type ComponentRendererFn = (props: ComponentRendererProps) => RendererResult | null;
