import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { LucideIcon } from 'lucide-react';

interface DraggablePaletteItemProps {
  type: string;
  label: string;
  icon: LucideIcon;
  presetId?: string;
}

export const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({
  type,
  label,
  icon: Icon,
  presetId,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: presetId ? `palette-${type}-${presetId}` : `palette-${type}`,
    data: {
      type: 'palette-item',
      componentType: type,
      presetId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`palette-item-${type}`}
      className={`
        flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-800 bg-zinc-950/30 
        hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-grab active:cursor-grabbing group
        ${isDragging ? 'opacity-50 border-zinc-700' : ''}
      `}
    >
      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/50 flex items-center justify-center mb-2.5 text-zinc-500 group-hover:text-zinc-200 group-hover:bg-zinc-800 transition-colors">
        <Icon size={18} />
      </div>
      <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
        {label}
      </span>
    </div>
  );
};
