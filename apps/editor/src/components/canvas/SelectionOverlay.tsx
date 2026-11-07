import React, { useEffect, useState, useRef } from 'react';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Clipboard,
  ClipboardPaste,
  Save,
} from 'lucide-react';
import type { Component } from '@canvasly/dsl-schema';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';

interface SelectionOverlayProps {
  selectedId: string;
  component: Component;
  iframeDocument: Document;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onLock: (id: string) => void;
  onUnlock: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onCopy: (id: string) => void;
  onPaste?: (id: string) => void;
  hasCopiedComponent?: boolean;
  onSaveToLibrary?: (id: string) => void;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  selectedId,
  component,
  iframeDocument,
  onDuplicate,
  onDelete,
  onLock,
  onUnlock,
  onMoveUp,
  onMoveDown,
  onCopy,
  onPaste,
  hasCopiedComponent = false,
  onSaveToLibrary,
}) => {
  const [bounds, setBounds] = useState<DOMRect | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateBounds = () => {
      const element = iframeDocument.querySelector(`[data-component-id="${selectedId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setBounds(rect);
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

  // Handle right-click for context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const element = iframeDocument.querySelector(`[data-component-id="${selectedId}"]`);
      if (element && element.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }
    };

    iframeDocument.addEventListener('contextmenu', handleContextMenu);
    return () => {
      iframeDocument.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [selectedId, iframeDocument]);

  // Build context menu items
  const getContextMenuItems = (): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];

    // Only show "Save to Component Library" for frame components
    if (component.type === 'frame' && onSaveToLibrary) {
      items.push({
        id: 'save-to-library',
        label: 'Save to Component Library',
        icon: <Save size={14} />,
        action: () => {
          // The ContextMenu will handle closing itself after this action
          onSaveToLibrary(selectedId);
        },
      });
      items.push({ id: 'divider-0', label: '-', divider: true });
    }

    items.push(
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: <Copy size={14} />,
        shortcut: '⌘D',
        action: () => onDuplicate(selectedId),
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: <Clipboard size={14} />,
        shortcut: '⌘C',
        action: () => onCopy(selectedId),
      },
    );

    if (onPaste) {
      items.push({
        id: 'paste',
        label: 'Paste',
        icon: <ClipboardPaste size={14} />,
        shortcut: '⌘V',
        disabled: !hasCopiedComponent,
        action: () => onPaste(selectedId),
      });
    }

    items.push({ id: 'divider-1', label: '-', divider: true });

    items.push(
      {
        id: 'move-up',
        label: 'Move Up',
        icon: <ArrowUp size={14} />,
        action: () => onMoveUp(selectedId),
      },
      {
        id: 'move-down',
        label: 'Move Down',
        icon: <ArrowDown size={14} />,
        action: () => onMoveDown(selectedId),
      },
    );

    items.push({ id: 'divider-2', label: '-', divider: true });

    items.push({
      id: 'lock',
      label: component.isLocked ? 'Unlock' : 'Lock',
      icon: component.isLocked ? <Unlock size={14} /> : <Lock size={14} />,
      action: () => (component.isLocked ? onUnlock(selectedId) : onLock(selectedId)),
    });

    items.push({
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} />,
      shortcut: '⌫',
      danger: true,
      disabled: component.isLocked,
      action: () => onDelete(selectedId),
    });

    return items;
  };

  if (!bounds) return null;

  const toolbarTop = bounds.top - 40;
  const showToolbarBelow = toolbarTop < 10;

  return (
    <>
      {/* Selection Outline */}
      <div
        style={{
          position: 'absolute',
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
          border: '2px solid #3b82f6',
          pointerEvents: 'none',
          zIndex: 9998,
          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2)',
          borderRadius: '4px',
        }}
      />

      {/* Component Label */}
      <div
        style={{
          position: 'absolute',
          left: bounds.left,
          top: bounds.top - 20,
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '2px 8px',
          fontSize: '10px',
          fontWeight: '700',
          borderRadius: '4px 4px 0 0',
          pointerEvents: 'none',
          zIndex: 9999,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        }}
      >
        {component.type}
        {component.isLocked && <Lock size={10} strokeWidth={3} />}
      </div>

      {/* Floating Toolbar */}
      <div
        ref={toolbarRef}
        style={{
          position: 'absolute',
          left: bounds.left + bounds.width / 2,
          top: showToolbarBelow ? bounds.bottom + 12 : bounds.top - 48,
          transform: 'translateX(-50%)',
          backgroundColor: '#18181b', // zinc-900
          border: '1px solid #27272a', // zinc-800
          borderRadius: '12px',
          padding: '4px',
          display: 'flex',
          gap: '2px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      >
        <ToolbarButton
          icon={<Copy size={14} />}
          label="Duplicate"
          onClick={() => onDuplicate(selectedId)}
        />
        <ToolbarButton
          icon={<Clipboard size={14} />}
          label="Copy"
          onClick={() => onCopy(selectedId)}
        />
        {component.isLocked ? (
          <ToolbarButton
            icon={<Unlock size={14} />}
            label="Unlock"
            onClick={() => onUnlock(selectedId)}
          />
        ) : (
          <ToolbarButton
            icon={<Lock size={14} />}
            label="Lock"
            onClick={() => onLock(selectedId)}
          />
        )}
        <div style={{ width: '1px', backgroundColor: '#27272a', margin: '4px 2px' }} />
        <ToolbarButton
          icon={<ArrowUp size={14} />}
          label="Move Up"
          onClick={() => onMoveUp(selectedId)}
        />
        <ToolbarButton
          icon={<ArrowDown size={14} />}
          label="Move Down"
          onClick={() => onMoveDown(selectedId)}
        />
        <div style={{ width: '1px', backgroundColor: '#27272a', margin: '4px 2px' }} />
        <ToolbarButton
          icon={<Trash2 size={14} />}
          label="Delete"
          onClick={() => onDelete(selectedId)}
          danger
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onClick, danger }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        padding: '6px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        color: danger ? '#ef4444' : '#9ca3af',
        cursor: 'pointer',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger ? '#7f1d1d' : '#374151';
        e.currentTarget.style.color = danger ? '#fca5a5' : '#f3f4f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = danger ? '#ef4444' : '#9ca3af';
      }}
    >
      {icon}
    </button>
  );
};
