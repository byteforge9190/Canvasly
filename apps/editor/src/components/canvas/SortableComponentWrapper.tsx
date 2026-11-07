import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableComponentWrapperProps {
  id: string;
  children: React.ReactNode;
}

export const SortableComponentWrapper: React.FC<SortableComponentWrapperProps> = ({
  id,
  children,
}) => {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bn-sortable-item">
      {children}
    </div>
  );
};
