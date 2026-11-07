import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { NormalizedPageState, Component } from '@canvasly/dsl-schema';

interface BreadcrumbNavProps {
  selectedId: string | null;
  pageState: NormalizedPageState;
  onSelectComponent: (id: string | null) => void;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  selectedId,
  pageState,
  onSelectComponent,
}) => {
  if (!selectedId || !pageState) return null;

  const buildBreadcrumb = (componentId: string): Component[] => {
    const path: Component[] = [];
    let current = pageState.components[componentId];

    while (current) {
      path.unshift(current);
      if (current.parentId && pageState.components[current.parentId]) {
        current = pageState.components[current.parentId];
      } else {
        break;
      }
    }

    return path;
  };

  const breadcrumb = buildBreadcrumb(selectedId);

  return (
    <div className="h-9 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 text-[11px] overflow-x-auto shadow-inner">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <button
          onClick={() => onSelectComponent(null)}
          className="text-zinc-500 hover:text-zinc-200 transition-colors uppercase tracking-wider font-bold"
        >
          Page
        </button>
        {breadcrumb.length > 0 && <ChevronRight size={12} className="text-zinc-700" />}

        {breadcrumb.map((comp, index) => (
          <React.Fragment key={comp.id}>
            <button
              onClick={() => onSelectComponent(comp.id)}
              className={`px-1.5 py-1 rounded-md transition-all ${
                index === breadcrumb.length - 1
                  ? 'text-brand-blue font-bold tracking-tight bg-brand-blue/5 border border-brand-blue/10'
                  : 'text-zinc-400 hover:text-zinc-100 font-semibold hover:bg-zinc-800'
              }`}
            >
              {comp.name || comp.type}
              {comp.isLocked && ' 🔒'}
            </button>
            {index < breadcrumb.length - 1 && <ChevronRight size={12} className="text-zinc-700" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
