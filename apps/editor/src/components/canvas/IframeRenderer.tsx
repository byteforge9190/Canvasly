import React, { useState, useEffect } from 'react';
import type {
  NormalizedPageState,
  DropIntent,
  Breakpoint,
  SiteTheme,
  Locale,
} from '@canvasly/dsl-schema';
import { getComponentDefinition, generateThemeCSS, DEFAULT_THEME, isRTL } from '@canvasly/dsl-schema';
import { Renderer } from '@canvasly/components';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableComponentWrapper } from './SortableComponentWrapper';

export const IframeRenderer: React.FC = () => {
  const [state, setState] = useState<NormalizedPageState | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropIntent | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint | undefined>(undefined);
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [activeLocale, setActiveLocale] = useState<import('@canvasly/dsl-schema').Locale | undefined>(
    undefined,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const stateRef = React.useRef<NormalizedPageState | null>(null);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (activeLocale) {
      document.documentElement.lang = activeLocale;
      document.documentElement.dir = isRTL(activeLocale as Locale) ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  }, [activeLocale]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const currentState = stateRef.current;
      if (event.data.type === 'UPDATE_STATE') {
        setState(event.data.state);
        setDropTarget(null);
      } else if (event.data.type === 'UPDATE_SELECTION') {
        setSelectedIds(event.data.selectedIds);
      } else if (event.data.type === 'UPDATE_HOVER') {
        setHoveredId(event.data.hoveredId);
      } else if (event.data.type === 'UPDATE_BREAKPOINT') {
        setBreakpoint(event.data.breakpoint);
      } else if (event.data.type === 'UPDATE_THEME') {
        setTheme(event.data.theme);
      } else if (event.data.type === 'UPDATE_LOCALE') {
        setActiveLocale(event.data.locale);
      } else if (event.data.type === 'SHOW_OVERLAY') {
        setShowOverlay(event.data.show);
      } else if (event.data.type === 'FIND_DROP_TARGET') {
        const { x, y, draggedType } = event.data;
        const elements = document.elementsFromPoint(x, y);

        let target: DropIntent | null = null;

        // Helper to check if a component can accept a child of a given type
        const canAcceptChild = (parentType: string, childType?: string): boolean => {
          const parentDef = getComponentDefinition(parentType);
          if (!parentDef || !parentDef.acceptsChildren) return false;

          // If no allowedChildTypes, accept any child
          if (!parentDef.allowedChildTypes || parentDef.allowedChildTypes.length === 0) {
            return true;
          }

          // If we don't know the dragged type, be permissive
          if (!childType) return true;

          // Check if the child type is in the allowed list
          return parentDef.allowedChildTypes.includes(childType);
        };

        // Helper to check if we can drop beside/before/after a component
        const canDropRelativeTo = (
          comp: { parentId: string | null; type: string },
          childType?: string,
        ): boolean => {
          if (!comp.parentId) return true;

          const parentComp = currentState?.components[comp.parentId];
          if (parentComp) {
            return canAcceptChild(parentComp.type, childType);
          }

          return true; // Root level
        };

        for (const element of elements) {
          const componentEl = element.closest('.bn-component') as HTMLElement;

          if (componentEl) {
            const compId = componentEl.getAttribute('data-component-id') || componentEl.id;
            const comp = currentState?.components[compId];
            if (comp) {
              const compDef = getComponentDefinition(comp.type);
              const rect = componentEl.getBoundingClientRect();
              const relativeX = x - rect.left;
              const relativeY = y - rect.top;
              const width = rect.width;
              const height = rect.height;

              // Proximity thresholds
              const edgeThreshold = Math.min(width * 0.2, 40);
              const verticalThreshold = Math.min(height * 0.2, 20);

              // Check if this component accepts children and can accept the dragged type
              const acceptsThisChild =
                compDef?.acceptsChildren && canAcceptChild(comp.type, draggedType);

              // 1. Check for "beside" (left/right edges) - only if parent allows
              if (relativeX < edgeThreshold && canDropRelativeTo(comp, draggedType)) {
                target = { type: 'beside', targetId: comp.id, side: 'left' };
                break;
              } else if (
                relativeX > width - edgeThreshold &&
                canDropRelativeTo(comp, draggedType)
              ) {
                target = { type: 'beside', targetId: comp.id, side: 'right' };
                break;
              }

              // 2. Check for "before/after" (top/bottom edges) - only if parent allows
              if (relativeY < verticalThreshold && canDropRelativeTo(comp, draggedType)) {
                target = { type: 'before', targetId: comp.id };
                break;
              } else if (
                relativeY > height - verticalThreshold &&
                canDropRelativeTo(comp, draggedType)
              ) {
                target = { type: 'after', targetId: comp.id };
                break;
              }

              // 3. If it's a container component that accepts this child, drop inside
              if (acceptsThisChild) {
                target = { type: 'inside', targetId: comp.id, index: comp.children.length };
                break;
              }

              // 4. If we can't drop inside, try to drop relative to this component
              if (canDropRelativeTo(comp, draggedType)) {
                target = { type: 'after', targetId: comp.id };
                break;
              }

              // 5. Continue searching up the tree (don't break, let the loop continue)
            }
          } else if (element.classList.contains('bn-renderer')) {
            target = {
              type: 'inside',
              targetId: 'root', // Symbolic ID for root level in the flattened schema
              index: currentState?.componentOrder.length || 0,
            };
            break;
          }
        }

        setDropTarget(target);
        window.parent.postMessage({ type: 'DROP_TARGET_FOUND', target }, '*');
      }
    };

    window.addEventListener('message', handleMessage);

    // Tell parent we are ready
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      window.parent.postMessage(
        {
          type: 'COMPONENT_MOVED',
          id: active.id,
          overId: over.id,
        },
        '*',
      );
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const targetEl = e.target as HTMLElement;

      const target = targetEl.closest('.bn-component');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const compId = target.getAttribute('data-component-id') || target.id;
        window.parent.postMessage(
          {
            type: 'COMPONENT_CLICKED',
            id: compId,
            multi: e.metaKey || e.ctrlKey,
          },
          '*',
        );
      } else {
        window.parent.postMessage({ type: 'COMPONENT_CLICKED', id: null }, '*');
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.bn-component');
      if (target) {
        const compId = target.getAttribute('data-component-id') || target.id;
        window.parent.postMessage({ type: 'COMPONENT_HOVERED', id: compId }, '*');
      } else {
        window.parent.postMessage({ type: 'COMPONENT_HOVERED', id: null }, '*');
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-pulse text-gray-400">Loading preview...</div>
      </div>
    );
  }

  // Get all component IDs for sortable context (unused)

  const SortableChildrenWrapper: React.FC<{
    items: string[];
    children: React.ReactNode;
    parentId: string;
  }> = ({ items, children }) => {
    return (
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Renderer
          state={state}
          breakpoint={breakpoint}
          activeLocale={activeLocale}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          componentWrapper={SortableComponentWrapper as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          childrenWrapper={SortableChildrenWrapper as any}
        />
      </DndContext>

      {/* Selection Overlay Root - Always present for stable Portals */}
      {showOverlay && (
        <div
          id="selection-overlay-root"
          style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
        />
      )}

      {/* Selection Styles */}
      <style>{`
        ${selectedIds
          .map(
            (id) => `
          [id="${id}"] {
            outline: 2px solid #3b82f6 !important;
            outline-offset: -2px !important;
          }
        `,
          )
          .join('')}
        
        ${
          hoveredId
            ? `
          [id="${hoveredId}"]:not(.selected) {
            outline: 2px solid rgba(59, 130, 246, 0.5) !important;
            outline-offset: -2px !important;
          }
        `
            : ''
        }

        ${
          dropTarget?.targetId
            ? `
          [id="${dropTarget.targetId}"] {
            position: relative;
            ${
              dropTarget.type === 'inside'
                ? `
              background-color: rgba(59, 130, 246, 0.1) !important;
              outline: 2px dashed #3b82f6 !important;
              outline-offset: -2px !important;
            `
                : ''
            }
          }

          [id="${dropTarget.targetId}"]::after {
            content: '';
            position: absolute;
            pointer-events: none;
            z-index: 100;
            background-color: #3b82f6;
            transition: all 0.2s ease;
            
            ${
              dropTarget.type === 'beside' && dropTarget.side === 'left'
                ? `
              left: -4px;
              top: 0;
              bottom: 0;
              width: 4px;
              box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
            `
                : ''
            }
            
            ${
              dropTarget.type === 'beside' && dropTarget.side === 'right'
                ? `
              right: -4px;
              top: 0;
              bottom: 0;
              width: 4px;
              box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
            `
                : ''
            }
            
            ${
              dropTarget.type === 'before'
                ? `
              top: -4px;
              left: 0;
              right: 0;
              height: 4px;
              box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
            `
                : ''
            }
            
            ${
              dropTarget.type === 'after'
                ? `
              bottom: -4px;
              left: 0;
              right: 0;
              height: 4px;
              box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
            `
                : ''
            }
          }
        `
            : ''
        }
      `}</style>

      {/* Global styles for the iframe */}
      <style>{`
        ${generateThemeCSS(theme)}
        
        body {
          margin: 0;
          font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: var(--color-background, #f8f9fa);
        }
        .bn-renderer {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .bn-component {
          transition: all 0.2s ease-in-out;
          position: relative;
        }
        /* Sortable wrapper - use 'contents' to make wrapper transparent to layout */
        .bn-sortable-item {
          display: contents;
        }
        /* Fallback for browsers without 'contents' support */
        @supports not (display: contents) {
          .bn-sortable-item {
            display: block;
            width: 100%;
          }
          /* Only use inline-block for truly inline components */
          .bn-sortable-item:has(.bn-semantic-span),
          .bn-sortable-item:has(.bn-semantic-a:not(.bn-component-frame)),
          .bn-sortable-item:has(.bn-component-icon) {
            display: inline-block;
            width: auto;
          }
        }
      `}</style>
    </div>
  );
};
