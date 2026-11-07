import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import {
  Trash2,
  BoxSelect,
  Layers,
  Copy,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
} from 'lucide-react';
import { getComponentDefinition, DEFAULT_FRAME } from '@canvasly/dsl-schema';
import type { SectionType } from '@canvasly/dsl-schema';
import { FrameInspector } from '../properties/FrameInspector';

type ResponsiveBreakpoint = 'mobile' | 'tablet';

export const PropertyPanel: React.FC = () => {
  const {
    selectedIds,
    pageState,
    deleteComponent,
    updateComponentProps,
    duplicateComponent,
    copyComponent,
  } = useEditorStore();

  const [activeBreakpoint, setActiveBreakpoint] = useState<ResponsiveBreakpoint | null>(null);

  const selectedId = selectedIds[0];
  const component = selectedId && pageState ? pageState.components[selectedId] : null;
  const definition = component ? getComponentDefinition(component.type) : null;

  // Reset all properties to defaults
  const handleResetAll = () => {
    if (!definition || !component) return;

    if (activeBreakpoint) {
      const responsive = JSON.parse(JSON.stringify(component.responsive));
      if (responsive[activeBreakpoint]) {
        responsive[activeBreakpoint].frame = {};
      }
      updateComponentProps(component.id, { responsive });
    } else {
      // Reset to default frame values
      updateComponentProps(component.id, { frame: definition.defaultFrame || DEFAULT_FRAME });
    }
  };

  if (!component || !definition) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-900">
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-700 shadow-inner">
          <BoxSelect size={32} />
        </div>
        <div className="text-[13px] font-medium text-zinc-400 max-w-45 leading-relaxed">
          Select a component on the canvas to edit its properties
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900" data-testid="property-panel">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/20">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1 px-1.5 rounded bg-brand-blue/10 border border-brand-blue/20">
              <Layers size={13} className="text-brand-blue" />
            </div>
            <span className="font-bold text-[11px] uppercase tracking-widest text-zinc-400">
              {component.type}
            </span>
          </div>
          <div className="flex gap-0.5">
            <button
              onClick={() => copyComponent(component.id)}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all"
              title="Copy"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => duplicateComponent(component.id)}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all"
              title="Duplicate"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => deleteComponent(component.id)}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {component.name && (
          <div className="text-[10px] font-medium text-zinc-600 mt-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            NAME: <span className="text-zinc-400">{component.name}</span>
          </div>
        )}

        {/* Component ID - for overlay anchoring */}
        <div className="text-[10px] font-medium text-zinc-600 mt-2 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          ID: <span className="text-zinc-400 font-mono">{component.id}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(component.id);
            }}
            className="ml-auto p-1 text-zinc-500 hover:text-brand-blue hover:bg-zinc-800 rounded transition-all"
            title="Copy ID"
          >
            <Copy size={11} />
          </button>
        </div>

        {/* Section Type — for generic context components (frames, flex containers, etc) */}
        {(component.componentContext === 'generic' ||
          (component.type === 'frame' && !component.componentContext)) && (
          <div className="mt-3">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-violet-500" />
              Section Type
            </div>
            <div className="relative">
              <select
                id={`section-type-${component.id}`}
                value={component.sectionType ?? ''}
                onChange={(e) =>
                  updateComponentProps(component.id, {
                    sectionType: (e.target.value as SectionType) || undefined,
                  })
                }
                className="w-full appearance-none bg-zinc-950/80 border border-zinc-700/60 text-zinc-300 text-[11px] font-medium rounded-lg px-3 py-2 pr-7 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all cursor-pointer"
              >
                <option value="">— None (auto-detect)</option>
                <optgroup label="Structure">
                  <option value="header">Header / Nav</option>
                  <option value="hero">Hero</option>
                  <option value="footer">Footer</option>
                </optgroup>
                <optgroup label="Content">
                  <option value="about">About</option>
                  <option value="features">Features</option>
                  <option value="services">Services</option>
                  <option value="blog-post">Blog Post</option>
                </optgroup>
                <optgroup label="Social Proof">
                  <option value="testimonials">Testimonials</option>
                  <option value="team">Team</option>
                  <option value="stats">Stats / Metrics</option>
                  <option value="gallery">Gallery</option>
                </optgroup>
                <optgroup label="Conversion">
                  <option value="pricing">Pricing</option>
                  <option value="faq">FAQ</option>
                  <option value="cta">Call to Action</option>
                  <option value="contact-form">Contact Form</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path
                    d="M1 1l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            {component.sectionType && (
              <p className="text-[9px] text-violet-400/70 mt-1 font-medium uppercase tracking-widest">
                ✦ AEO: structured data will be generated
              </p>
            )}
          </div>
        )}
      </div>

      {/* Responsive Breakpoint Selector */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/10">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 ml-1">
          Editing Mode
        </div>
        <div className="flex gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800/50">
          <button
            onClick={() => setActiveBreakpoint(null)}
            className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-[11px] font-semibold transition-all border ${
              !activeBreakpoint
                ? 'bg-zinc-800 text-brand-blue shadow-sm border-brand-blue/30'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-700'
            }`}
          >
            <Monitor size={13} />
            Base
          </button>
          <button
            onClick={() => setActiveBreakpoint('tablet')}
            className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-[11px] font-semibold transition-all border ${
              activeBreakpoint === 'tablet'
                ? 'bg-zinc-800 text-brand-blue shadow-sm border-brand-blue/30'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-700'
            }`}
          >
            <Tablet size={13} />
            Tablet
          </button>
          <button
            onClick={() => setActiveBreakpoint('mobile')}
            className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-[11px] font-semibold transition-all border ${
              activeBreakpoint === 'mobile'
                ? 'bg-zinc-800 text-brand-blue shadow-sm border-brand-blue/30'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-700'
            }`}
          >
            <Smartphone size={13} />
            Mobile
          </button>
        </div>

        {useEditorStore.getState().activeLocale !== useEditorStore.getState().defaultLocale && (
          <div className={`mt-3 p-2 rounded border bg-brand-blue/5 border-brand-blue/20`}>
            <p className="text-[10px] font-medium text-brand-blue leading-relaxed flex items-center gap-1.5">
              <Globe size={11} />
              {!component.localized ||
              !component.localized[useEditorStore.getState().activeLocale] ||
              !component.localized[useEditorStore.getState().activeLocale].frame
                ? 'Using default language format. Edits will create a new translation.'
                : 'Editing independent localized version.'}
            </p>
          </div>
        )}

        {activeBreakpoint && (
          <p className="text-[10px] font-medium text-brand-blue/80 mt-3 px-1 leading-relaxed">
            Editing {activeBreakpoint} overrides. Changes only affect screens ≤{' '}
            {activeBreakpoint === 'mobile' ? '479px' : '767px'}.
          </p>
        )}
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {definition?.frameSchema ? (
          <FrameInspector
            component={component}
            frameSchema={definition.frameSchema}
            activeBreakpoint={activeBreakpoint}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-700 shadow-inner">
              <BoxSelect size={32} />
            </div>
            <div className="text-[13px] font-medium text-zinc-400 max-w-45 leading-relaxed">
              No properties available for this component
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/20 space-y-2">
        <button
          onClick={handleResetAll}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border border-transparent hover:border-zinc-700"
        >
          <RotateCcw size={13} />
          Reset {activeBreakpoint ? `${activeBreakpoint} overrides` : 'to defaults'}
        </button>
      </div>
    </div>
  );
};
