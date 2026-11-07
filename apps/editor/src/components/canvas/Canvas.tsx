import React, { useRef, useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '../../store/editorStore';
import type { DropIntent } from '@canvasly/dsl-schema';
import { SelectionManager } from './SelectionManager';
import { useTheme } from '../../hooks/useTheme';
import { EmptyStateOverlay } from './EmptyStateOverlay';
import { emptyStateStorage } from '../../lib/emptyStateStorage';
interface CanvasProps {
  dragPosition?: { x: number; y: number } | null;
  draggedType?: string | null;
  onDropTargetChange?: (target: DropIntent | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  dragPosition,
  draggedType,
  onDropTargetChange,
}) => {
  const { device, zoom, pageState, showGrid, isDragging, pageId, isPageEmpty, setLeftPanel } =
    useEditorStore();
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root-target',
  });

  const [manuallyDismissedPageId, setManuallyDismissedPageId] = useState<string | null>(null);

  const isDismissed = pageId
    ? emptyStateStorage.hasSeenEmptyState(pageId) || manuallyDismissedPageId === pageId
    : true;

  const handleDismiss = () => {
    if (pageId) {
      emptyStateStorage.markEmptyStateSeen(pageId);
      setManuallyDismissedPageId(pageId);
    }
  };

  const handleOpenAI = () => {
    setLeftPanel('ai');
    handleDismiss();
  };

  const showEmptyState = isPageEmpty() && !isDismissed && !isDragging;

  const getWidth = () => {
    switch (device) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      default:
        return '100%';
    }
  };

  const height = '100%';

  // Send state to iframe when it changes
  useEffect(() => {
    if (iframeRef.current && pageState) {
      iframeRef.current.contentWindow?.postMessage({ type: 'UPDATE_STATE', state: pageState }, '*');
    }
  }, [pageState]);

  // Send breakpoint to iframe when device changes
  useEffect(() => {
    if (iframeRef.current) {
      // Map device to breakpoint - desktop uses base (undefined), only mobile/tablet have overrides
      const breakpoint: 'mobile' | 'tablet' | undefined =
        device === 'mobile' ? 'mobile' : device === 'tablet' ? 'tablet' : undefined;

      iframeRef.current.contentWindow?.postMessage({ type: 'UPDATE_BREAKPOINT', breakpoint }, '*');
    }
  }, [device]);

  // Send selection to iframe
  const selectedIds = useEditorStore((state) => state.selectedIds);
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'UPDATE_SELECTION', selectedIds }, '*');
    }
  }, [selectedIds]);

  // Send hover to iframe
  const hoveredId = useEditorStore((state) => state.hoveredId);
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'UPDATE_HOVER', hoveredId }, '*');
    }
  }, [hoveredId]);

  // Send theme to iframe when it changes
  useEffect(() => {
    if (iframeRef.current && theme) {
      iframeRef.current.contentWindow?.postMessage({ type: 'UPDATE_THEME', theme }, '*');
    }
  }, [theme]);

  // Send locale to iframe when it changes
  const activeLocale = useEditorStore((state) => state.activeLocale);
  useEffect(() => {
    if (iframeRef.current && activeLocale) {
      iframeRef.current.contentWindow?.postMessage(
        { type: 'UPDATE_LOCALE', locale: activeLocale },
        '*',
      );
    }
  }, [activeLocale]);

  // Send drag position to iframe
  useEffect(() => {
    if (isDragging && dragPosition && iframeRef.current) {
      const iframeRect = iframeRef.current.getBoundingClientRect();
      const x = (dragPosition.x - iframeRect.left) / zoom;
      const y = (dragPosition.y - iframeRect.top) / zoom;

      iframeRef.current.contentWindow?.postMessage(
        {
          type: 'FIND_DROP_TARGET',
          x,
          y,
          draggedType,
        },
        '*',
      );
    } else if (!isDragging) {
      onDropTargetChange?.(null);
    }
  }, [isDragging, dragPosition, zoom, draggedType, onDropTargetChange]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, id, multi } = event.data;
      if (type === 'IFRAME_READY') {
        // Send both state and theme when iframe is ready
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'UPDATE_STATE', state: pageState },
          '*',
        );
        if (theme) {
          iframeRef.current?.contentWindow?.postMessage({ type: 'UPDATE_THEME', theme }, '*');
        }

        const activeLocale = useEditorStore.getState().activeLocale;
        if (activeLocale) {
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'UPDATE_LOCALE', locale: activeLocale },
            '*',
          );
        }

        // Enable overlay
        iframeRef.current?.contentWindow?.postMessage({ type: 'SHOW_OVERLAY', show: true }, '*');
      } else if (type === 'COMPONENT_CLICKED') {
        const state = useEditorStore.getState();
        state.selectComponent(id, multi);
      } else if (type === 'COMPONENT_HOVERED') {
        useEditorStore.getState().hoverComponent(id);
      } else if (type === 'DROP_TARGET_FOUND') {
        onDropTargetChange?.(event.data.target);
      } else if (type === 'COMPONENT_MOVED') {
        const { id, overId } = event.data;
        const state = useEditorStore.getState();
        if (state.pageState) {
          const overComp = state.pageState.components[overId];

          let newParentId: string | null = null;
          let newIndex = 0;

          if (overComp) {
            newParentId = overComp.parentId;
            const parentComp = newParentId ? state.pageState.components[newParentId] : null;
            const children = parentComp ? parentComp.children : state.pageState.componentOrder;
            newIndex = children.indexOf(overId);
          } else if (overId === 'root' || overId === 'canvas-root-target') {
            newParentId = null;
            newIndex = state.pageState.componentOrder.length;
          }

          state.moveComponent(id, {
            type: 'inside',
            targetId: newParentId,
            index: newIndex,
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pageState, onDropTargetChange, theme]);

  return (
    <div
      ref={setNodeRef}
      data-testid="editor-canvas"
      className={`relative w-full h-full overflow-hidden bg-zinc-950 transition-colors 
        ${isOver ? 'bg-zinc-900' : ''} 
        ${isDragging ? 'border-2 border-dashed border-brand-blue/30' : ''}`}
    >
      {/* Rulers */}
      <div className="absolute top-0 left-0 w-full h-6 bg-zinc-900 border-b border-zinc-800 z-20 flex items-end overflow-hidden shadow-sm">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-20 border-l border-zinc-800 h-2 text-[9px] font-mono text-zinc-600 pl-1 pb-0.5"
          >
            {i * 100}
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0 h-full w-6 bg-zinc-900 border-r border-zinc-800 z-20 flex flex-col items-end overflow-hidden shadow-sm">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 h-20 border-t border-zinc-800 w-2 text-[9px] font-mono text-zinc-600 pt-1 pr-0.5 vertical-text"
          >
            {i * 100}
          </div>
        ))}
      </div>

      {/* Canvas content area - offset by rulers */}
      <div
        className="absolute flex flex-col items-center overflow-auto custom-scrollbar"
        style={{
          top: '24px',
          left: '24px',
          right: 0,
          bottom: 0,
          padding: '40px',
        }}
      >
        <div
          className={`relative transition-all duration-300 ease-in-out shadow-2xl bg-white overflow-hidden ${isOver ? 'ring-2 ring-brand-blue ring-inset' : ''}`}
          style={{
            width: getWidth(),
            height: height,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Grid Overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          )}

          <iframe
            ref={iframeRef}
            src="/preview"
            className={`w-full h-full border-none relative z-10 ${isDragging ? 'pointer-events-none' : ''}`}
            title="Editor Preview"
          />

          {/* Selection Manager - renders overlays inside iframe */}
          <SelectionManager iframeRef={iframeRef} />
        </div>

        {/* Empty State Overlay */}
        {showEmptyState && <EmptyStateOverlay onDismiss={handleDismiss} onOpenAI={handleOpenAI} />}
      </div>
    </div>
  );
};
