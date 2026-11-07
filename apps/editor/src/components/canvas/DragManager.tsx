import React, { useEffect, useRef } from 'react';
import type { Component } from '@canvasly/dsl-schema';

interface DragManagerProps {
  selectedId: string;
  component: Component;
  iframeDocument: Document;
  onDrag: (newTop: number, newLeft: number) => void;
  onDragPreview?: (previewTop: number, previewLeft: number) => void;
}

export const DragManager: React.FC<DragManagerProps> = ({
  selectedId,
  component,
  iframeDocument,
  onDrag,
  onDragPreview,
}) => {
  // Use a Ref to hold mutable drag state to avoid React render cycles during interaction
  const dragStateRef = useRef<{
    isDragging: boolean;
    startTop: number;
    startLeft: number;
    startMouseX: number;
    startMouseY: number;
    lastDeltaX: number;
    lastDeltaY: number;
    scaleFactor: number; // To handle zoom/transform contexts
    rafId: number | null;
    element: HTMLElement;
  } | null>(null);

  const positionType = component.frame?.position?.type;
  const isDraggable =
    (positionType === 'absolute' || positionType === 'fixed') && !component.isLocked;

  useEffect(() => {
    if (!isDraggable || !selectedId) return;

    const element = iframeDocument.getElementById(selectedId);
    if (!element) return;

    const handlePointerDown = (e: PointerEvent) => {
      // 1. Validation & Filtering
      if ((e.button !== 0 && e.pointerType === 'mouse') || !element) return;

      const target = e.target as HTMLElement;
      // Robust check for interactive elements to prevent drag conflict
      if (
        target.closest('.resize-handle') ||
        target.closest('[data-toolbar]') ||
        target.closest('input, textarea, select, button, a') ||
        target.hasAttribute('data-no-drag')
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // 2. Capture Pointer & Setup Styles
      element.setPointerCapture(e.pointerId);
      element.style.cursor = 'grabbing';
      element.style.willChange = 'transform';
      element.style.userSelect = 'none';
      // Force hardware acceleration layer
      element.style.transform = 'translate3d(0,0,0)';

      // 3. Calculate Context Scale (Crucial for Zoom/Iframes)
      // We compare rendered rect width vs internal offsetWidth to determine global scale.
      const rect = element.getBoundingClientRect();
      // Fallback to 1 if width is 0 to avoid division by zero
      const scaleFactor = element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;

      const currentTop = component.frame?.position?.top ?? 0;
      const currentLeft = component.frame?.position?.left ?? 0;

      // 4. Initialize State
      dragStateRef.current = {
        isDragging: true,
        startTop: currentTop,
        startLeft: currentLeft,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        lastDeltaX: 0,
        lastDeltaY: 0,
        scaleFactor: scaleFactor || 1,
        rafId: null,
        element,
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || !state.isDragging) return;

      e.preventDefault();

      // 1. Calculate Delta (Corrected for Scale)
      // If canvas is zoomed out (scale < 1), 1px mouse move = >1px element move
      const rawDeltaX = e.clientX - state.startMouseX;
      const rawDeltaY = e.clientY - state.startMouseY;

      const deltaX = rawDeltaX / state.scaleFactor;
      const deltaY = rawDeltaY / state.scaleFactor;

      state.lastDeltaX = deltaX;
      state.lastDeltaY = deltaY;

      // 2. Schedule Visual Update via RAF
      if (state.rafId === null) {
        state.rafId = requestAnimationFrame(() => {
          if (!dragStateRef.current) return;

          const { lastDeltaX, lastDeltaY, startTop, startLeft, element } = dragStateRef.current;

          // Performance: Use translate3d for GPU composition
          element.style.transform = `translate3d(${lastDeltaX}px, ${lastDeltaY}px, 0)`;

          // Ephemeral State: Update properties panel without committing to store
          if (onDragPreview) {
            onDragPreview(Math.round(startTop + lastDeltaY), Math.round(startLeft + lastDeltaX));
          }

          dragStateRef.current.rafId = null;
        });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || !state.isDragging) return;

      // 1. Cleanup RAF & Events
      if (state.rafId !== null) cancelAnimationFrame(state.rafId);
      element.releasePointerCapture(e.pointerId);

      // 2. Calculate Final Coordinates
      // Rounding prevents sub-pixel blurring on final placement
      const finalTop = Math.round(state.startTop + state.lastDeltaY);
      const finalLeft = Math.round(state.startLeft + state.lastDeltaX);

      // 3. "Smooth Hand-off" (The fix for visual jumping)
      // Manually set the Top/Left properties to the DOM *before* React updates.
      // This ensures that when we remove the transform, the element is already
      // at the correct position, preventing the frame gap/jump.
      element.style.top = `${finalTop}px`;
      element.style.left = `${finalLeft}px`;
      element.style.transform = ''; // Clear transform immediately

      // Reset interaction styles
      element.style.cursor = 'move'; // Return to hover state
      element.style.willChange = '';
      element.style.userSelect = '';

      // 4. Commit to Store
      onDrag(finalTop, finalLeft);

      dragStateRef.current = null;
    };

    // Attach listeners
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);

    // Initial cursor set
    element.style.cursor = 'move';

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);

      if (dragStateRef.current?.rafId) {
        cancelAnimationFrame(dragStateRef.current.rafId);
      }

      // Cleanup styles
      element.style.cursor = '';
      element.style.transform = '';
      element.style.willChange = '';
      element.style.userSelect = '';
    };
  }, [selectedId, component, isDraggable, onDrag, onDragPreview, iframeDocument]);

  return null;
};
