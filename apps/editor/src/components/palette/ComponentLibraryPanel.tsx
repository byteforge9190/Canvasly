import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, Trash2, Copy, Edit2, AlertCircle, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { ComponentListItem } from '../../types/component';
import type { DropIntent } from '@canvasly/dsl-schema';

interface ComponentLibraryPanelProps {
  siteId: string;
  onInsert: (componentId: string, intent: DropIntent) => void;
}

export const ComponentLibraryPanel: React.FC<ComponentLibraryPanelProps> = ({
  siteId,
  onInsert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'created'>('created');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const {
    componentLibrary,
    loadComponentLibrary,
    deleteComponentFromLibrary,
    duplicateComponentInLibrary,
    updateComponentMetadata,
  } = useEditorStore();

  const { components, isLoading, error } = componentLibrary;

  // Load components on mount
  useEffect(() => {
    if (siteId) {
      loadComponentLibrary(siteId);
    }
  }, [siteId, loadComponentLibrary]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get all unique tags from components
  const allTags = Array.from(new Set(components.flatMap((comp) => comp.tags || []))).sort();

  // Filter and sort components
  const filteredComponents = components
    .filter((comp) => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesName = comp.name.toLowerCase().includes(searchLower);
        const matchesDescription = comp.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some((tag) => comp.tags?.includes(tag));
        if (!hasSelectedTag) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usage_count - a.usage_count;
        case 'created':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleDelete = async (componentId: string) => {
    try {
      await deleteComponentFromLibrary(componentId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete component:', err);
    }
  };

  const handleDuplicate = async (componentId: string) => {
    try {
      await duplicateComponentInLibrary(componentId);
    } catch (err) {
      console.error('Failed to duplicate component:', err);
    }
  };

  const handleStartEdit = (component: ComponentListItem) => {
    setEditingId(component.id);
    setEditingName(component.name);
  };

  const handleSaveEdit = async (componentId: string) => {
    if (!editingName.trim()) return;

    try {
      await updateComponentMetadata(componentId, { name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      console.error('Failed to update component name:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleInsert = useCallback(
    (componentId: string) => {
      // Default intent: insert at end of page
      const intent: DropIntent = {
        type: 'inside',
        targetId: null,
        index: undefined,
      };
      onInsert(componentId, intent);
    },
    [onInsert],
  );

  // Loading state
  if (isLoading && components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Loader2 size={32} className="text-brand-blue animate-spin mb-3" />
        <p className="text-zinc-400 text-sm font-medium">Loading components...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 mb-3">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="text-red-400 text-sm font-medium text-center">{error}</p>
        <button
          onClick={() => loadComponentLibrary(siteId)}
          className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 mb-4">
          <Package size={32} className="text-zinc-500" />
        </div>
        <h3 className="text-zinc-300 text-sm font-bold mb-2">No Components Yet</h3>
        <p className="text-zinc-500 text-xs leading-relaxed max-w-50">
          Right-click any component in your page and select "Save to Component Library" to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-[10px] font-bold text-zinc-500 uppercase">
            Sort:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'created')}
            className="flex-1 px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
          >
            <option value="created">Recently Added</option>
            <option value="name">Name (A-Z)</option>
            <option value="usage">Most Used</option>
          </select>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Filter by Tag:</label>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Component Grid */}
      {filteredComponents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <p className="text-zinc-500 text-xs">No components match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTags([]);
            }}
            className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredComponents.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              isEditing={editingId === component.id}
              editingName={editingName}
              isDeleteConfirm={deleteConfirmId === component.id}
              onInsert={() => handleInsert(component.id)}
              onDelete={() => setDeleteConfirmId(component.id)}
              onConfirmDelete={() => handleDelete(component.id)}
              onCancelDelete={() => setDeleteConfirmId(null)}
              onDuplicate={() => handleDuplicate(component.id)}
              onStartEdit={() => handleStartEdit(component)}
              onSaveEdit={() => handleSaveEdit(component.id)}
              onCancelEdit={handleCancelEdit}
              onEditNameChange={setEditingName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Component Card Sub-component
interface ComponentCardProps {
  component: ComponentListItem;
  isEditing: boolean;
  editingName: string;
  isDeleteConfirm: boolean;
  onInsert: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onDuplicate: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (name: string) => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  isEditing,
  editingName,
  isDeleteConfirm,
  onInsert,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  onDuplicate,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
}) => {
  return (
    <div className="group relative bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-brand-blue/30 transition-all">
      {/* Thumbnail/Preview Area */}
      <button
        onClick={onInsert}
        className="w-full p-4 text-left hover:bg-zinc-900/30 transition-all"
      >
        <div className="flex items-start gap-3">
          {/* Thumbnail Placeholder */}
          <div className="shrink-0 w-12 h-12 bg-zinc-800/50 border border-zinc-700/50 rounded-lg flex items-center justify-center">
            <Package size={20} className="text-zinc-500" />
          </div>

          {/* Component Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => onEditNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveEdit();
                  if (e.key === 'Escape') onCancelEdit();
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 bg-zinc-900 border border-brand-blue/50 rounded text-zinc-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                autoFocus
              />
            ) : (
              <h4 className="text-sm font-bold text-zinc-100 truncate">{component.name}</h4>
            )}

            {component.description && !isEditing && (
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{component.description}</p>
            )}

            {/* Tags */}
            {component.tags && component.tags.length > 0 && !isEditing && (
              <div className="flex flex-wrap gap-1 mt-2">
                {component.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-zinc-800/50 border border-zinc-700/50 rounded text-[9px] font-bold text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
                {component.tags.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                    +{component.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Usage Count */}
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] text-zinc-600 font-medium">
                Used {component.usage_count} {component.usage_count === 1 ? 'time' : 'times'}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Action Buttons - Show on Hover */}
      {!isEditing && !isDeleteConfirm && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="p-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"
            title="Rename"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 bg-zinc-900/90 hover:bg-red-900/50 border border-zinc-700/50 hover:border-red-500/30 rounded-lg text-zinc-400 hover:text-red-400 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={onCancelEdit}
            className="flex-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSaveEdit}
            disabled={!editingName.trim()}
            className="flex-1 px-3 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirm && (
        <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 gap-3">
          <p className="text-zinc-300 text-xs font-bold text-center">Delete "{component.name}"?</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={onCancelDelete}
              className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmDelete}
              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
