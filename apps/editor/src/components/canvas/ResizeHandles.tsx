import React, { useState, useRef, useEffect } from 'react';

interface ResizeHandlesProps {
  selectedId: string;
  iframeDocument: Document;
  onResize: (id: string, width: number | null, height: number | null) => void;
  resizable?: {
    horizontal: boolean;
    vertical: boolean;
  };
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  selectedId,
  iframeDocument,
  onResize,
  resizable = { horizontal: true, vertical: true },
}) => {
  const [bounds, setBounds] = useState<DOMRect | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const updateBounds = () => {
      const element = iframeDocument.querySelector(
        `[data-component-id="${selectedId}"]`,
      ) as HTMLElement | null;
      if (element) {
        setBounds(element.getBoundingClientRect());
      }
    };

    updateBounds();

    // Use ResizeObserver for more accurate updates
    const element = iframeDocument.querySelector(`[data-component-id="${selectedId}"]`);
    let resizeObserver: ResizeObserver | null = null;

    if (element) {
      resizeObserver = new ResizeObserver(() => {
        updateBounds();
      });
      resizeObserver.observe(element);
      // Also observe parent for layout shifts
      if (element.parentElement) {
        resizeObserver.observe(element.parentElement);
      }
    }

    const win = iframeDocument.defaultView;
    if (win) {
      win.addEventListener('resize', updateBounds);
      win.addEventListener('scroll', updateBounds);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (win) {
        win.removeEventListener('resize', updateBounds);
        win.removeEventListener('scroll', updateBounds);
      }
    };
  }, [selectedId, iframeDocument]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeDirection || !bounds) return;

      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      let newWidth = startPosRef.current.width;
      let newHeight = startPosRef.current.height;

      // Horizontal resize
      if (resizable.horizontal) {
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(50, startPosRef.current.width + deltaX);
        } else if (resizeDirection.includes('w')) {
          newWidth = Math.max(50, startPosRef.current.width - deltaX);
        }
      }

      // Vertical resize
      if (resizable.vertical) {
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(30, startPosRef.current.height + deltaY);
        } else if (resizeDirection.includes('n')) {
          newHeight = Math.max(30, startPosRef.current.height - deltaY);
        }
      }

      // Update element immediately for smooth feedback
      const element = iframeDocument.querySelector(
        `[data-component-id="${selectedId}"]`,
      ) as HTMLElement | null;
      if (element) {
        if (resizable.horizontal) {
          element.style.width = `${newWidth}px`;
        }
        if (resizable.vertical) {
          element.style.height = `${newHeight}px`;
        }
      }
    };

    const handleMouseUp = () => {
      const currentDirection = resizeDirection;
      setIsResizing(false);
      setResizeDirection(null);

      // Commit only the dimensions that were actually modified
      const element = iframeDocument.querySelector(
        `[data-component-id="${selectedId}"]`,
      ) as HTMLElement | null;
      if (element && currentDirection) {
        // Determine which dimensions were modified based on resize direction
        const modifiedWidth = currentDirection.includes('e') || currentDirection.includes('w');
        const modifiedHeight = currentDirection.includes('n') || currentDirection.includes('s');

        const finalWidth = modifiedWidth ? parseFloat(element.style.width) : null;
        const finalHeight = modifiedHeight ? parseFloat(element.style.height) : null;

        // Only call onResize if at least one dimension was modified
        if (finalWidth || finalHeight) {
          onResize(selectedId, finalWidth, finalHeight);
        }
      }
    };

    iframeDocument.addEventListener('mousemove', handleMouseMove);
    iframeDocument.addEventListener('mouseup', handleMouseUp);

    return () => {
      iframeDocument.removeEventListener('mousemove', handleMouseMove);
      iframeDocument.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, bounds, selectedId, onResize, resizable, iframeDocument]);

  if (!bounds) return null;

  const handleMouseDown = (direction: ResizeDirection) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    setResizeDirection(direction);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: bounds.width,
      height: bounds.height,
    };
  };

  const handleStyle = {
    position: 'absolute' as const,
    backgroundColor: '#3b82f6',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '2px',
    zIndex: 10000,
    pointerEvents: 'auto' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  const cornerSize = 8;
  const edgeThickness = 4;

  return (
    <>
      {/* Corner Handles */}
      {resizable.horizontal && resizable.vertical && (
        <>
          {/* Top-left */}
          <div
            style={{
              ...handleStyle,
              left: bounds.left - cornerSize / 2,
              top: bounds.top - cornerSize / 2,
              width: cornerSize,
              height: cornerSize,
              cursor: 'nw-resize',
            }}
            onMouseDown={handleMouseDown('nw')}
          />
          {/* Top-right */}
          <div
            style={{
              ...handleStyle,
              left: bounds.right - cornerSize / 2,
              top: bounds.top - cornerSize / 2,
              width: cornerSize,
              height: cornerSize,
              cursor: 'ne-resize',
            }}
            onMouseDown={handleMouseDown('ne')}
          />
          {/* Bottom-left */}
          <div
            style={{
              ...handleStyle,
              left: bounds.left - cornerSize / 2,
              top: bounds.bottom - cornerSize / 2,
              width: cornerSize,
              height: cornerSize,
              cursor: 'sw-resize',
            }}
            onMouseDown={handleMouseDown('sw')}
          />
          {/* Bottom-right */}
          <div
            style={{
              ...handleStyle,
              left: bounds.right - cornerSize / 2,
              top: bounds.bottom - cornerSize / 2,
              width: cornerSize,
              height: cornerSize,
              cursor: 'se-resize',
            }}
            onMouseDown={handleMouseDown('se')}
          />
        </>
      )}

      {/* Edge Handles */}
      {resizable.horizontal && (
        <>
          {/* Left */}
          <div
            style={{
              ...handleStyle,
              left: bounds.left - edgeThickness / 2,
              top: bounds.top + bounds.height / 2 - 20,
              width: edgeThickness,
              height: 40,
              cursor: 'ew-resize',
            }}
            onMouseDown={handleMouseDown('w')}
          />
          {/* Right */}
          <div
            style={{
              ...handleStyle,
              left: bounds.right - edgeThickness / 2,
              top: bounds.top + bounds.height / 2 - 20,
              width: edgeThickness,
              height: 40,
              cursor: 'ew-resize',
            }}
            onMouseDown={handleMouseDown('e')}
          />
        </>
      )}

      {resizable.vertical && (
        <>
          {/* Top */}
          <div
            style={{
              ...handleStyle,
              left: bounds.left + bounds.width / 2 - 20,
              top: bounds.top - edgeThickness / 2,
              width: 40,
              height: edgeThickness,
              cursor: 'ns-resize',
            }}
            onMouseDown={handleMouseDown('n')}
          />
          {/* Bottom */}
          <div
            style={{
              ...handleStyle,
              left: bounds.left + bounds.width / 2 - 20,
              top: bounds.bottom - edgeThickness / 2,
              width: 40,
              height: edgeThickness,
              cursor: 'ns-resize',
            }}
            onMouseDown={handleMouseDown('s')}
          />
        </>
      )}
    </>
  );
};
