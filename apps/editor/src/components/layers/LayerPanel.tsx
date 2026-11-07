/**
 * Layer Panel - Component tree view with drag-to-reorder and lock toggles
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Search,
  Layers,
  GripVertical,
  Type,
  LayoutGrid,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { Component, NormalizedPageState } from '@canvasly/dsl-schema';

// Icon mapping for component types
const componentIcons: Record<string, React.ReactNode> = {
  text: <Type size={14} />,
  frame: <LayoutGrid size={14} />,
};

interface LayerItemProps {
  component: Component;
  pageState: NormalizedPageState;
  depth: number;
  isSelected: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onToggleLock: (id: string) => void;
  onRename: (id: string, name: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  searchQuery: string;
  draggedId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (id: string, position: 'before' | 'after' | 'inside') => void;
  dropTarget: { id: string; position: 'before' | 'after' | 'inside' } | null;
}

const LayerItem: React.FC<LayerItemProps> = ({
  component,
  pageState,
  depth,
  isSelected,
  onSelect,
  onToggleLock,
  onRename,
  expandedIds,
  onToggleExpand,
  searchQuery,
  draggedId,
  onDragStart,
  onDragEnd,
  onDragOver,
  dropTarget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(component.name || component.type);

  const hasChildren = component.children.length > 0;
  const isExpanded = expandedIds.has(component.id);
  const isDragging = draggedId === component.id;
  const isDropTarget = dropTarget?.id === component.id;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(component.name || component.type);
  };

  const handleNameSubmit = () => {
    setIsEditing(false);
    if (editName.trim() && editName !== component.name) {
      onRename(component.id, editName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(component.name || component.type);
    }
  };

  // Filter check for search
  const matchesSearch =
    !searchQuery ||
    component.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.type.toLowerCase().includes(searchQuery.toLowerCase());

  // Check if any children match search
  const hasMatchingChildren = useMemo(() => {
    if (!searchQuery) return false;
    const checkChildren = (ids: string[]): boolean => {
      return ids.some((id) => {
        const child = pageState.components[id];
        if (!child) return false;
        const matches =
          child.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          child.type.toLowerCase().includes(searchQuery.toLowerCase());
        return matches || checkChildren(child.children);
      });
    };
    return checkChildren(component.children);
  }, [component.children, pageState.components, searchQuery]);

  if (!matchesSearch && !hasMatchingChildren) return null;

  const icon = componentIcons[component.type] || <LayoutGrid size={14} />;

  return (
    <div className={`${isDragging ? 'opacity-50' : ''}`}>
      {/* Drop indicator - before */}
      {isDropTarget && dropTarget?.position === 'before' && (
        <div className="h-0.5 bg-blue-500 mx-2" style={{ marginLeft: `${depth * 16 + 8}px` }} />
      )}

      <div
        className={`
          flex items-center gap-1.5 px-3 py-1.5 cursor-pointer group rounded-md mx-1 transition-all
          ${isSelected ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'}
          ${isDropTarget && dropTarget?.position === 'inside' ? 'bg-brand-blue/20 ring-1 ring-brand-blue' : ''}
        `}
        style={{ marginLeft: `${depth * 12}px` }}
        onClick={(e) => onSelect(component.id, e.metaKey || e.ctrlKey)}
        onDoubleClick={handleDoubleClick}
        draggable={!component.isLocked}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(component.id);
        }}
        onDragEnd={onDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const height = rect.height;

          if (hasChildren && y > height * 0.25 && y < height * 0.75) {
            onDragOver(component.id, 'inside');
          } else if (y < height / 2) {
            onDragOver(component.id, 'before');
          } else {
            onDragOver(component.id, 'after');
          }
        }}
      >
        {/* Drag handle */}
        <div className="opacity-0 group-hover:opacity-50 cursor-grab">
          <GripVertical size={12} />
        </div>

        {/* Expand/collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(component.id);
            }}
            className="p-0.5 hover:bg-[#444] rounded"
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Icon */}
        <span
          className={`${isSelected ? 'text-brand-blue' : 'text-zinc-500 group-hover:text-zinc-400'}`}
        >
          {icon}
        </span>

        {/* Name */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-zinc-950 border border-brand-blue rounded px-1.5 py-0.5 text-[11px] text-white outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-[11px] font-medium truncate">
            {component.name || component.type}
          </span>
        )}

        {/* Lock indicator */}
        {component.isLocked && <Lock size={12} className="text-yellow-500" />}

        {/* Action buttons (visible on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(component.id);
            }}
            className="p-1 hover:bg-[#444] rounded"
            title={component.isLocked ? 'Unlock' : 'Lock'}
          >
            {component.isLocked ? (
              <Lock size={12} className="text-yellow-500" />
            ) : (
              <Unlock size={12} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Drop indicator - after */}
      {isDropTarget && dropTarget?.position === 'after' && (
        <div className="h-0.5 bg-blue-500 mx-2" style={{ marginLeft: `${depth * 16 + 8}px` }} />
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {component.children.map((childId) => {
            const child = pageState.components[childId];
            if (!child) return null;
            return (
              <LayerItem
                key={childId}
                component={child}
                pageState={pageState}
                depth={depth + 1}
                isSelected={false}
                onSelect={onSelect}
                onToggleLock={onToggleLock}
                onRename={onRename}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                searchQuery={searchQuery}
                draggedId={draggedId}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                dropTarget={dropTarget}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const LayerPanel: React.FC = () => {
  const { pageState, selectedIds, selectComponent, lockComponent, unlockComponent, moveComponent } =
    useEditorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: 'before' | 'after' | 'inside';
  } | null>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleLock = useCallback(
    (id: string) => {
      const state = useEditorStore.getState();
      if (state.pageState?.components[id]) {
        const component = state.pageState.components[id];
        if (component.isLocked) {
          unlockComponent(id);
        } else {
          lockComponent(id);
        }
      }
    },
    [lockComponent, unlockComponent],
  );

  const handleRename = useCallback((id: string, name: string) => {
    const state = useEditorStore.getState();
    if (state.pageState?.components[id]) {
      // Update component name via store
      useEditorStore.setState((s) => {
        if (!s.pageState) return s;
        return {
          ...s,
          pageState: {
            ...s.pageState,
            components: {
              ...s.pageState.components,
              [id]: {
                ...s.pageState.components[id],
                name,
              },
            },
          },
        };
      });
    }
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedId && dropTarget && draggedId !== dropTarget.id) {
      // Perform the move
      const intent =
        dropTarget.position === 'inside'
          ? { type: 'inside' as const, targetId: dropTarget.id }
          : dropTarget.position === 'before'
            ? { type: 'before' as const, targetId: dropTarget.id }
            : { type: 'after' as const, targetId: dropTarget.id };

      moveComponent(draggedId, intent);
    }
    setDraggedId(null);
    setDropTarget(null);
  }, [draggedId, dropTarget, moveComponent]);

  const handleDragOver = useCallback(
    (id: string, position: 'before' | 'after' | 'inside') => {
      if (draggedId && id !== draggedId) {
        setDropTarget({ id, position });
      }
    },
    [draggedId],
  );

  // Expand all matching items when searching
  const filteredExpandedIds = useMemo(() => {
    if (!searchQuery || !pageState) return expandedIds;

    const expanded = new Set(expandedIds);

    // Auto-expand parents of matching items
    const expandParents = (id: string) => {
      const component = pageState.components[id];
      if (component?.parentId) {
        expanded.add(component.parentId);
        expandParents(component.parentId);
      }
    };

    Object.values(pageState.components).forEach((comp) => {
      if (
        comp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.type.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        expandParents(comp.id);
      }
    });

    return expanded;
  }, [searchQuery, pageState, expandedIds]);

  if (!pageState) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        No page loaded
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} className="text-zinc-500" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-500">
            Layers
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search layers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-blue transition-all"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {pageState.componentOrder.map((compId) => {
          const component = pageState.components[compId];
          if (!component) return null;
          return (
            <LayerItem
              key={compId}
              component={component}
              pageState={pageState}
              depth={0}
              isSelected={selectedIds.includes(compId)}
              onSelect={selectComponent}
              onToggleLock={handleToggleLock}
              onRename={handleRename}
              expandedIds={filteredExpandedIds}
              onToggleExpand={handleToggleExpand}
              searchQuery={searchQuery}
              draggedId={draggedId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              dropTarget={dropTarget}
            />
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t border-zinc-800 text-[10px] font-medium text-zinc-600 flex justify-between items-center bg-zinc-950/20">
        <span>{Object.keys(pageState.components).length} components</span>
        <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/50">TREE</span>
      </div>
    </div>
  );
};
