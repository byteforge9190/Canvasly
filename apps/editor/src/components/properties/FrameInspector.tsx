import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { PropertyInput } from './inputs/PropertyInputs';
import { getByPath, DEFAULT_FRAME } from '@canvasly/dsl-schema';
import type {
  Component,
  FrameSchema,
  FrameSchemaSection,
  PropertySchema,
  FrameProps,
  Breakpoint,
  RecursivePartial,
} from '@canvasly/dsl-schema';

interface FrameInspectorProps {
  component: Component;
  frameSchema: FrameSchema;
  activeBreakpoint?: Breakpoint | null;
}

/**
 * FrameInspector - Specialized property editor for Frame-based components.
 * Renders semantic design sections (Layout, Style, Spacing, etc.) using accordions.
 */
export const FrameInspector: React.FC<FrameInspectorProps> = ({
  component,
  frameSchema,
  activeBreakpoint,
}) => {
  const { updateFrameProps } = useEditorStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: false,
    layout: true,
    size: false,
    position: false,
    style: false,
    semantic: false,
    interaction: false,
    overlay: false,
    basicons: false,
    link: false,
    form: false,
    input: false,
    assistant: false,
    effects: false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter sections based on componentContext
  const visibleSections = frameSchema.sections.filter((section) => {
    // Layout section should not appear for text components (they don't have children)
    if (section.domain === 'layout') {
      return component.componentContext !== 'text' && component.componentContext !== 'input';
    }
    // Text section only for text components
    if (section.domain === 'text') {
      return component.componentContext === 'text';
    }
    // Basicons section only for icon components
    if (section.domain === 'basicons') {
      return component.componentContext === 'icon';
    }
    // Link section only for text components
    if (section.domain === 'link') {
      return component.componentContext === 'text';
    }
    // Form section only for form components
    if (section.domain === 'form') {
      return component.componentContext === 'form';
    }
    // Input section only for input components
    if (section.domain === 'input') {
      return component.componentContext === 'input';
    }
    // Assistant section only for assistant components
    if (section.domain === 'assistant') {
      return component.componentContext === 'assistant';
    }
    // Semantic section should not appear for form, input, and assistant components
    if (section.domain === 'semantic') {
      return (
        component.componentContext !== 'form' &&
        component.componentContext !== 'input' &&
        component.componentContext !== 'assistant'
      );
    }
    // Interaction section only for button components or when semantic tag is button/a
    if (section.domain === 'interaction') {
      const semanticTag = component.frame?.semantic?.tag;
      const hasOverlayTrigger = component.frame?.interaction?.triggersOverlay;
      return (
        component.componentContext === 'button' ||
        semanticTag === 'button' ||
        semanticTag === 'a' ||
        hasOverlayTrigger
      );
    }
    // Overlay section - always show (users can enable/disable overlays)
    if (section.domain === 'overlay') {
      return true;
    }
    return true;
  });

  // Helper function to check if a schema should be visible based on componentContext
  const isSchemaVisibleForContext = (schema: PropertySchema): boolean => {
    const context = component.componentContext;

    // Define which fields are allowed for each context
    const contextFieldRules: Record<string, Record<string, string[]>> = {
      text: {
        style: ['style.opacity'], // Text components only show opacity in style
      },
      image: {
        style: [
          'style.fill',
          'style.borderRadius',
          'style.shadow',
          'style.opacity',
          'style.overflow',
        ],
      },
      input: {
        style: [
          'style.fill',
          'style.border',
          'style.borderRadius',
          'style.shadow',
          'style.opacity',
          'style.placeholderColor',
        ],
      },
    };

    // If no context or no rules for this context, show all fields
    if (!context || !contextFieldRules[context]) {
      return true;
    }

    const rules = contextFieldRules[context];
    const domain = schema.domain;

    // If no rules for this domain, show all fields in that domain
    if (!domain || !rules[domain]) {
      return true;
    }

    // Check if this specific field is in the allowed list
    return rules[domain].includes(schema.key);
  };

  // Resolve effective frame based on breakpoint and locale
  const baseFrame = component.frame || DEFAULT_FRAME;
  const { activeLocale, defaultLocale } = useEditorStore();
  const isDefaultLocale = activeLocale === defaultLocale;

  let overrideFrame: RecursivePartial<FrameProps> | null = null;
  let localeFrame: RecursivePartial<FrameProps> | null = null;

  if (activeBreakpoint && component.responsive[activeBreakpoint]?.frame) {
    overrideFrame = component.responsive[activeBreakpoint]!.frame;
  }
  if (!isDefaultLocale && component.localized?.[activeLocale]?.frame) {
    localeFrame = component.localized[activeLocale].frame;
  }

  const getValue = (path: string) => {
    // 1. Check Responsive Override first (highest specificity)
    if (activeBreakpoint && overrideFrame) {
      const overrideVal = getByPath(overrideFrame, path);
      if (overrideVal !== undefined) return overrideVal;
    }
    // 2. Check Locale Override second
    if (localeFrame) {
      const localeVal = getByPath(localeFrame, path);
      if (localeVal !== undefined) return localeVal;
    }
    // 3. Fallback to base frame
    return getByPath(baseFrame, path);
  };

  // For comparisons (showWhen), we should use the effective value
  const getConditionValue = (path: string) => {
    return getValue(path);
  };

  return (
    <div className="space-y-1">
      {visibleSections.map((section: FrameSchemaSection) => {
        const isExpanded = expandedSections[section.domain] ?? false;

        // Filter schemas within semantic section based on context
        let sectionSchemas = section.schemas;
        if (section.domain === 'semantic' && component.componentContext) {
          sectionSchemas = section.schemas.map((schema) => {
            if (schema.key === 'semantic.tag') {
              // Context-specific tag options
              const contextTagOptions: Record<string, Array<{ label: string; value: string }>> = {
                text: [
                  { label: 'Heading 1', value: 'h1' },
                  { label: 'Heading 2', value: 'h2' },
                  { label: 'Heading 3', value: 'h3' },
                  { label: 'Heading 4', value: 'h4' },
                  { label: 'Heading 5', value: 'h5' },
                  { label: 'Heading 6', value: 'h6' },
                  { label: 'Paragraph', value: 'p' },
                  { label: 'Span', value: 'span' },
                  { label: 'Label', value: 'label' },
                  { label: 'Strong', value: 'strong' },
                  { label: 'Emphasis', value: 'em' },
                ],
                button: [
                  { label: 'Button', value: 'button' },
                  { label: 'Link (a)', value: 'a' },
                ],
                image: [
                  { label: 'Container (div)', value: 'div' },
                  { label: 'Link (a)', value: 'a' },
                ],
              };

              const contextOptions = component.componentContext
                ? contextTagOptions[component.componentContext]
                : undefined;
              if (contextOptions) {
                return {
                  ...schema,
                  ui: {
                    ...schema.ui,
                    options: contextOptions,
                  },
                };
              }
            }
            return schema;
          });
        }

        return (
          <div
            key={section.domain}
            className={`border-b border-zinc-800/50 last:border-0 overflow-hidden ${
              isExpanded ? 'bg-zinc-950/30' : ''
            }`}
          >
            <button
              onClick={() => toggleSection(section.domain)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors group ${
                isExpanded
                  ? 'bg-zinc-800/20 border-l-2 border-brand-blue'
                  : 'hover:bg-zinc-800/30 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    isExpanded ? 'text-brand-blue' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {section.label}
                </span>
              </div>
              {isExpanded ? (
                <ChevronDown size={14} className="text-brand-blue" />
              ) : (
                <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 bg-zinc-950/20">
                {sectionSchemas.map((field: PropertySchema) => {
                  // Check if schema should be visible for this componentContext
                  if (!isSchemaVisibleForContext(field)) {
                    return null;
                  }

                  // Use path-based lookup
                  const val = field.path ? getValue(field.path) : undefined;
                  const hasOverride =
                    activeBreakpoint &&
                    overrideFrame &&
                    field.path &&
                    getByPath(overrideFrame, field.path) !== undefined;

                  // Check visibility logic (showWhen)
                  if (field.showWhen) {
                    const { key, operator, value } = field.showWhen;
                    const targetValue = getConditionValue(key);

                    let isVisible = true;
                    switch (operator) {
                      case 'eq':
                        isVisible = targetValue === value;
                        break;
                      case 'neq':
                        isVisible = targetValue !== value;
                        break;
                      case 'exists':
                        isVisible =
                          targetValue !== undefined && targetValue !== null && targetValue !== '';
                        break;
                    }

                    if (!isVisible) return null;
                  }

                  // Additional check: hide rows field when masonry is enabled
                  if (field.key === 'layout.rows') {
                    const masonryValue = getConditionValue('layout.masonry');
                    if (masonryValue === true) return null;
                  }

                  // Additional check: hide right/bottom/left for sticky position
                  if (
                    field.key === 'position.right' ||
                    field.key === 'position.bottom' ||
                    field.key === 'position.left'
                  ) {
                    const positionType = getConditionValue('position.type');
                    if (positionType === 'sticky') return null;
                  }

                  return (
                    <div key={field.key} className="relative group/prop">
                      {hasOverride && (
                        <div
                          className="absolute -left-4 top-0 w-1 h-full bg-brand-blue rounded-r transition-all group-hover/prop:w-1.5"
                          title="Responsive Override"
                        />
                      )}
                      {!hasOverride &&
                        localeFrame &&
                        field.path &&
                        getByPath(localeFrame, field.path) !== undefined && (
                          <div
                            className="absolute -left-4 top-0 w-1 h-full bg-purple-500 rounded-r transition-all group-hover/prop:w-1.5"
                            title="Locale Override"
                          />
                        )}
                      <PropertyInput
                        schema={field}
                        value={val}
                        onChange={(newValue) => {
                          if (field.path) {
                            updateFrameProps(
                              component.id,
                              field.path,
                              newValue,
                              activeBreakpoint || undefined,
                            );
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
