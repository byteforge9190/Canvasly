import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  action?: () => void;
  children?: ContextMenuItem[];
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);

  // Update position after mount when we have the menu dimensions
  React.useLayoutEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10;
    }

    // Ensure menu doesn't go off the left or top edge
    adjustedX = Math.max(10, adjustedX);
    adjustedY = Math.max(10, adjustedY);

    if (adjustedX !== x || adjustedY !== y) {
      setPosition({ x: adjustedX, y: adjustedY });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selectableItems = items.filter((item) => !item.divider && !item.disabled);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => {
            const nextIndex = prev + 1;
            return nextIndex >= selectableItems.length ? 0 : nextIndex;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => {
            const nextIndex = prev - 1;
            return nextIndex < 0 ? selectableItems.length - 1 : nextIndex;
          });
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (activeIndex >= 0 && selectableItems[activeIndex]?.children) {
            setSubmenuOpen(selectableItems[activeIndex].id);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          setSubmenuOpen(null);
          break;

        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0) {
            const item = selectableItems[activeIndex];
            if (item?.action && !item.disabled) {
              item.action();
              onClose();
            } else if (item?.children) {
              setSubmenuOpen(item.id);
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          if (submenuOpen) {
            setSubmenuOpen(null);
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, activeIndex, submenuOpen, onClose]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;

    if (item.children) {
      setSubmenuOpen(submenuOpen === item.id ? null : item.id);
    } else if (item.action) {
      item.action();
      onClose();
    }
  };

  const renderMenuItem = (item: ContextMenuItem, index: number, isSubmenu = false) => {
    if (item.divider) {
      return (
        <div
          key={item.id}
          style={{
            height: '1px',
            backgroundColor: '#374151',
            margin: '4px 0',
          }}
        />
      );
    }

    const isActive = !isSubmenu && activeIndex === index;
    const hasSubmenu = !!item.children;
    const isSubmenuOpen = submenuOpen === item.id;

    return (
      <div key={item.id} style={{ position: 'relative' }}>
        <button
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => {
            if (!isSubmenu) {
              setActiveIndex(index);
              // Open submenu on hover if item has children
              if (hasSubmenu) {
                setSubmenuOpen(item.id);
              } else {
                setSubmenuOpen(null);
              }
            }
          }}
          disabled={item.disabled}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: isActive ? '#374151' : 'transparent',
            border: 'none',
            color: item.disabled ? '#6b7280' : item.danger ? '#ef4444' : '#f3f4f6',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            textAlign: 'left',
            transition: 'background-color 0.15s',
            opacity: item.disabled ? 0.5 : 1,
          }}
          onMouseOver={(e) => {
            if (!item.disabled && !isActive) {
              e.currentTarget.style.backgroundColor = '#374151';
            }
          }}
          onMouseOut={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {item.icon && (
            <span style={{ display: 'flex', alignItems: 'center', width: '16px' }}>
              {item.icon}
            </span>
          )}
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.shortcut && (
            <span
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginLeft: 'auto',
              }}
            >
              {item.shortcut}
            </span>
          )}
          {hasSubmenu && (
            <ChevronRight
              size={14}
              style={{
                marginLeft: 'auto',
                color: '#9ca3af',
              }}
            />
          )}
        </button>

        {/* Submenu */}
        {hasSubmenu && isSubmenuOpen && item.children && (
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              marginLeft: '4px',
              backgroundColor: '#1f2937',
              borderRadius: '6px',
              padding: '4px',
              minWidth: '180px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
              zIndex: 10001,
              pointerEvents: 'auto',
            }}
          >
            {item.children.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        backgroundColor: '#1f2937',
        borderRadius: '6px',
        padding: '4px',
        minWidth: '200px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        zIndex: 10000,
        pointerEvents: 'auto',
      }}
    >
      {items.map((item, index) => renderMenuItem(item, index))}
    </div>
  );
};
