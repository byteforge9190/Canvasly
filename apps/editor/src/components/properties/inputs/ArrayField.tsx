import React, { useState } from 'react';
import type { PropertySchema } from '@canvasly/dsl-schema';
import { ChevronDown, ChevronRight, GripVertical, Trash2, Copy, Plus } from 'lucide-react';
import { PropertyInput } from './PropertyInputs';
import { generateId } from '@canvasly/dsl-schema';

interface ArrayFieldProps {
  schema: PropertySchema;
  value: unknown[];
  onChange: (value: unknown[]) => void;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({ schema, value, onChange }) => {
  const items = Array.isArray(value) ? value : [];
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const itemSchema = schema.itemSchema || [];
  const itemLabelKey = schema.ui?.itemLabel || 'label';
  const addButtonText = schema.ui?.addButtonText || 'Add Item';
  const maxItems = schema.ui?.maxItems;
  const isReorderable = schema.ui?.reorderable !== false;
  const isCollapsible = schema.ui?.collapsible !== false;

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const addItem = () => {
    if (maxItems && items.length >= maxItems) return;

    const newItem: Record<string, unknown> = {};
    itemSchema.forEach((field) => {
      if (field.key === 'id') {
        newItem[field.key] =
          typeof field.defaultValue === 'function' ? field.defaultValue() : generateId();
      } else {
        newItem[field.key] =
          typeof field.defaultValue === 'function' ? field.defaultValue() : field.defaultValue;
      }
    });

    const newItems = [...items, newItem];
    onChange(newItems);
    setExpandedItems(new Set([...expandedItems, items.length]));
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
    const newExpanded = new Set(expandedItems);
    newExpanded.delete(index);
    setExpandedItems(newExpanded);
  };

  const duplicateItem = (index: number) => {
    if (maxItems && items.length >= maxItems) return;

    const itemToDuplicate = items[index] as Record<string, unknown>;
    const duplicatedItem = { ...itemToDuplicate };

    // Generate new ID if item has an id field
    if ('id' in duplicatedItem) {
      duplicatedItem.id = generateId();
    }

    const newItems = [...items];
    newItems.splice(index + 1, 0, duplicatedItem);
    onChange(newItems);
    setExpandedItems(new Set([...expandedItems, index + 1]));
  };

  const updateItem = (index: number, field: string, fieldValue: unknown) => {
    const newItems = [...items];
    newItems[index] = { ...(newItems[index] as Record<string, unknown>), [field]: fieldValue };
    onChange(newItems);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    onChange(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getItemLabel = (item: unknown, index: number): string => {
    if (typeof item === 'object' && item !== null && itemLabelKey in item) {
      const label = (item as Record<string, unknown>)[itemLabelKey];
      return String(label || `Item ${index + 1}`);
    }
    return `Item ${index + 1}`;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {schema.label}
        </label>
        {maxItems && (
          <span className="text-[10px] font-bold text-zinc-600">
            {items.length} / {maxItems}
          </span>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const isExpanded = expandedItems.has(index);
          const itemLabel = getItemLabel(item, index);

          return (
            <div
              key={index}
              draggable={isReorderable}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-all ${
                draggedIndex === index ? 'opacity-50 ring-2 ring-brand-blue/30' : ''
              }`}
            >
              {/* Item Header */}
              <div className="flex items-center gap-2 p-2 bg-zinc-900/50">
                {isReorderable && (
                  <button
                    className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 p-1 rounded transition-colors"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <GripVertical size={14} />
                  </button>
                )}

                {isCollapsible && (
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="text-zinc-500 hover:text-zinc-200 p-1 rounded transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}

                <span className="flex-1 text-[12px] font-bold text-zinc-300 truncate tracking-tight">
                  {itemLabel}
                </span>

                <div className="flex gap-0.5">
                  <button
                    onClick={() => duplicateItem(index)}
                    disabled={maxItems ? items.length >= maxItems : false}
                    className="p-1.5 text-zinc-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all disabled:opacity-30"
                    title="Duplicate"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Item Fields */}
              {isExpanded && (
                <div className="p-3 space-y-4 border-t border-zinc-900 bg-zinc-950/30">
                  {itemSchema
                    .filter((field) => !field.hidden)
                    .map((field) => {
                      const fieldValue = (item as Record<string, unknown>)[field.key];
                      return (
                        <PropertyInput
                          key={field.key}
                          schema={field}
                          value={fieldValue}
                          onChange={(newValue) => updateItem(index, field.key, newValue)}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Button */}
      <button
        onClick={addItem}
        disabled={maxItems ? items.length >= maxItems : false}
        className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-brand-blue/30 rounded-xl px-3 py-2.5 text-[12px] font-bold text-zinc-400 hover:text-brand-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] mt-2"
      >
        <Plus size={15} />
        {addButtonText}
      </button>

      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-2 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};
