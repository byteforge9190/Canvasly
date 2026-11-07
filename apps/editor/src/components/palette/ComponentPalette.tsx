import React, { useState } from 'react';
import {
  MousePointer2,
  Layout,
  Grid,
  Square,
  Heading1,
  Heading2,
  Heading3,
  Type as TypeIcon,
  Tag,
  Image as ImageIcon,
  Star,
  FileText,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Link as LinkIcon,
  Package,
  ChevronDown,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { DraggablePaletteItem } from './DraggablePaletteItem';
import { SectionLibrary } from './SectionLibrary';
import { ComponentLibraryPanel } from './ComponentLibraryPanel';
import { useEditorStore } from '../../store/editorStore';
import type { DropIntent } from '@canvasly/dsl-schema';

const COMPONENT_TYPES = [
  // Text components (Frame-based)
  { type: 'frame', label: 'Heading 1', icon: Heading1, category: 'text', presetId: 'heading-1' },
  { type: 'frame', label: 'Heading 2', icon: Heading2, category: 'text', presetId: 'heading-2' },
  { type: 'frame', label: 'Heading 3', icon: Heading3, category: 'text', presetId: 'heading-3' },
  { type: 'frame', label: 'Paragraph', icon: TypeIcon, category: 'text', presetId: 'paragraph' },
  { type: 'frame', label: 'Label', icon: Tag, category: 'text', presetId: 'label' },

  // Layout components
  { type: 'frame', label: 'Frame', icon: Square, category: 'layout' },
  { type: 'frame', label: 'Flex Row', icon: Layout, category: 'layout', presetId: 'flex-row' },
  {
    type: 'frame',
    label: 'Flex Column',
    icon: Layout,
    category: 'layout',
    presetId: 'flex-column',
  },
  { type: 'frame', label: '3-Column Grid', icon: Grid, category: 'layout', presetId: 'grid-3col' },
  { type: 'frame', label: 'Bento Grid', icon: Grid, category: 'layout', presetId: 'bento-grid' },

  // UI components
  { type: 'frame', label: 'Image', icon: ImageIcon, category: 'ui', presetId: 'image' },
  { type: 'frame', label: 'Icon', icon: Star, category: 'ui', presetId: 'icon' },

  // Interactive components
  {
    type: 'frame',
    label: 'Primary Button',
    icon: MousePointer2,
    category: 'interactive',
    presetId: 'button-primary',
  },
  {
    type: 'frame',
    label: 'Outline Button',
    icon: MousePointer2,
    category: 'interactive',
    presetId: 'button-outline',
  },
  {
    type: 'frame',
    label: 'Ghost Button',
    icon: MousePointer2,
    category: 'interactive',
    presetId: 'button-ghost',
  },
  {
    type: 'frame',
    label: 'Submit Button',
    icon: MousePointer2,
    category: 'interactive',
    presetId: 'button-submit',
  },
  { type: 'frame', label: 'Form', icon: FileText, category: 'interactive', presetId: 'form' },
  {
    type: 'frame',
    label: 'AI Chat Assistant',
    icon: MessageCircle,
    category: 'interactive',
    presetId: 'assistant-chat',
  },

  // Form Input components
  {
    type: 'frame',
    label: 'Text Input',
    icon: TypeIcon,
    category: 'form',
    presetId: 'input-text',
  },
  {
    type: 'frame',
    label: 'Textarea',
    icon: AlignLeft,
    category: 'form',
    presetId: 'input-textarea',
  },
  { type: 'frame', label: 'Email Input', icon: Mail, category: 'form', presetId: 'input-email' },
  {
    type: 'frame',
    label: 'Number Input',
    icon: Hash,
    category: 'form',
    presetId: 'input-number',
  },
  { type: 'frame', label: 'Phone Input', icon: Phone, category: 'form', presetId: 'input-phone' },
  { type: 'frame', label: 'URL Input', icon: LinkIcon, category: 'form', presetId: 'input-url' },
];

export const ComponentPalette: React.FC = () => {
  const [isMyComponentsExpanded, setIsMyComponentsExpanded] = useState(false);
  const { siteId, insertComponentFromLibrary } = useEditorStore();

  // Group components by category
  const componentsByCategory = COMPONENT_TYPES.reduce(
    (acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    },
    {} as Record<string, typeof COMPONENT_TYPES>,
  );

  const categoryOrder = ['text', 'layout', 'ui', 'interactive', 'form'];
  const categoryLabels = {
    text: 'Text',
    layout: 'Layout',
    ui: 'UI',
    interactive: 'Interactive',
    form: 'Form Inputs',
  };

  const handleInsertComponent = async (componentId: string, intent: DropIntent) => {
    try {
      await insertComponentFromLibrary(componentId, intent);
      // Show success feedback
      alert('Component inserted successfully!');
    } catch (error) {
      console.error('Failed to insert component:', error);
      alert('Failed to insert component. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      <div className="shrink-0 p-4 border-b border-zinc-800">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Components
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        <SectionLibrary />

        {/* My Components Section */}
        {siteId && (
          <div className="space-y-3">
            <button
              onClick={() => setIsMyComponentsExpanded(!isMyComponentsExpanded)}
              className="w-full flex items-center justify-between p-3 bg-zinc-950/50 hover:bg-zinc-900/50 rounded-xl border border-zinc-800/80 transition-all hover:border-brand-blue/30 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                  <Package size={16} />
                </div>
                <div>
                  <span className="text-[13px] font-bold text-zinc-100 tracking-tight">
                    My Components
                  </span>
                  <p className="text-[10px] font-medium text-zinc-500 mt-0.5 group-hover:text-zinc-400 transition-colors">
                    Your saved components
                  </p>
                </div>
              </div>
              {isMyComponentsExpanded ? (
                <ChevronDown
                  size={16}
                  className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                />
              ) : (
                <ChevronRight
                  size={16}
                  className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                />
              )}
            </button>

            {isMyComponentsExpanded && (
              <div className="pl-2">
                <ComponentLibraryPanel siteId={siteId} onInsert={handleInsertComponent} />
              </div>
            )}
          </div>
        )}

        {categoryOrder.map((category) => {
          const components = componentsByCategory[category];
          if (!components || components.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3 ml-1">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {components.map((item) => (
                  <DraggablePaletteItem
                    key={item.presetId ? `${item.type}-${item.presetId}` : item.type}
                    type={item.type}
                    label={item.label}
                    icon={item.icon}
                    presetId={item.presetId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
