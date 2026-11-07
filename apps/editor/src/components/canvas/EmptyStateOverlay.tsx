'use client';

import React from 'react';
import {
  Sparkles,
  Wand2,
  ArrowRight,
  X,
  LayoutGrid,
  FileText,
  Building2,
  ShoppingBag,
} from 'lucide-react';

interface EmptyStateOverlayProps {
  onDismiss: () => void;
  onOpenAI?: () => void;
}

const QUICK_PROMPTS = [
  {
    icon: Building2,
    label: 'Business Landing',
    prompt:
      'A professional landing page for a business with hero section, services, testimonials, and contact form',
  },
  {
    icon: FileText,
    label: 'About Page',
    prompt: 'An about us page with company story, team section, mission statement, and values',
  },
  {
    icon: ShoppingBag,
    label: 'Product Showcase',
    prompt: 'A product showcase page with features, pricing tiers, FAQ section, and call-to-action',
  },
];

export const EmptyStateOverlay: React.FC<EmptyStateOverlayProps> = ({ onDismiss, onOpenAI }) => {
  const [hoveredPrompt, setHoveredPrompt] = React.useState<number | null>(null);

  const handleQuickPrompt = (prompt: string) => {
    onOpenAI?.();
    // Store the prompt to be used when AI panel opens
    sessionStorage.setItem('ai-quick-prompt', prompt);
  };

  const handleStartFromScratch = () => {
    onDismiss();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-500">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-2xl mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-700">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-linear-to-r from-blue-600/20 via-brand-blue/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-60" />

        <div className="relative bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-600 via-brand-blue to-cyan-500" />

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl transition-all z-10"
          >
            <X size={18} />
          </button>

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-5 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Sparkles size={28} className="text-brand-blue" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                Build with AI
              </h1>
              <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                Describe your page and let AI create a stunning, complete layout in seconds.
              </p>
            </div>

            {/* Primary CTA */}
            <button
              onClick={onOpenAI}
              className="group w-full relative overflow-hidden bg-linear-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white rounded-2xl p-5 mb-6 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] active:scale-[0.98]"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />

              <div className="relative flex items-center justify-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Wand2 size={22} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">Generate with AI</div>
                  <div className="text-blue-100 text-xs opacity-80">
                    Create a complete page in seconds
                  </div>
                </div>
                <ArrowRight
                  size={20}
                  className="ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                />
              </div>
            </button>

            {/* Quick Prompts */}
            <div className="mb-6">
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 text-center">
                Quick Start Ideas
              </div>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  const isHovered = hoveredPrompt === idx;

                  return (
                    <button
                      key={idx}
                      onMouseEnter={() => setHoveredPrompt(idx)}
                      onMouseLeave={() => setHoveredPrompt(null)}
                      onClick={() => handleQuickPrompt(item.prompt)}
                      className={`group relative p-4 rounded-xl border transition-all duration-300 text-left ${
                        isHovered
                          ? 'bg-zinc-800/80 border-zinc-700 scale-[1.02]'
                          : 'bg-zinc-950/50 border-zinc-800/50 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg mb-2 transition-colors ${
                          isHovered ? 'bg-blue-500/20' : 'bg-zinc-900'
                        }`}
                      >
                        <Icon
                          size={18}
                          className={`transition-colors ${isHovered ? 'text-brand-blue' : 'text-zinc-500'}`}
                        />
                      </div>
                      <div className="text-xs font-medium text-zinc-300">{item.label}</div>

                      {/* Hover glow */}
                      {isHovered && (
                        <div className="absolute inset-0 rounded-xl bg-blue-500/5 animate-in fade-in" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600 font-medium">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Secondary Option */}
            <button
              onClick={handleStartFromScratch}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 transition-all text-sm font-medium"
            >
              <LayoutGrid size={16} />
              Start from Scratch with Components
            </button>
          </div>
        </div>

        {/* Subtle footer hint */}
        <div className="text-center mt-4 text-xs text-zinc-600">
          You can always access AI from the
          <span className="inline-flex items-center gap-1 mx-1 text-zinc-500">
            <Sparkles size={12} />
            AI
          </span>
          tab in the sidebar
        </div>
      </div>
    </div>
  );
};
