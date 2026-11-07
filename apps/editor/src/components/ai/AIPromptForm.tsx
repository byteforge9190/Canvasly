import React from 'react';
import { Sparkles, ChevronDown, ExternalLink } from 'lucide-react';

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'bold', label: 'Bold & Impactful' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'playful', label: 'Playful' },
];

interface AIPromptFormProps {
  onSubmit: (prompt: string, stylePreference: string) => void;
  isGenerating: boolean;
}

export const AIPromptForm: React.FC<AIPromptFormProps> = ({ onSubmit, isGenerating }) => {
  const [prompt, setPrompt] = React.useState('');

  const [stylePreference, setStylePreference] = React.useState('modern');

  // Check for quick-prompt from sessionStorage on mount
  React.useEffect(() => {
    const quickPrompt = sessionStorage.getItem('ai-quick-prompt');
    if (quickPrompt) {
      setPrompt(quickPrompt);
      sessionStorage.removeItem('ai-quick-prompt');
    }
  }, []);

  const charCount = prompt.trim().length;
  const isValid = charCount >= 10 && charCount <= 2000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isGenerating) return;
    onSubmit(prompt.trim(), stylePreference);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-brand-blue animate-pulse" />
        <span className="text-[14px] font-bold bg-linear-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
          Generate with AI
        </span>
      </div>

      <p className="text-[12px] text-zinc-400 leading-relaxed font-medium">
        Describe your business and what you need. The AI will build a complete page
        section-by-section.
      </p>

      {/* Prompt textarea */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center mb-1">
          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Tell us about your business
          </label>
          <a
            href={`${import.meta.env.VITE_MANAGE_DASHBOARD_URL || ''}/docs/editor-guide/ai-prompting`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Prompting Tips <ExternalLink size={10} />
          </a>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A landing page for a dental clinic in Cairo offering teeth whitening, braces, and implants for families and young professionals."
          rows={6}
          maxLength={2000}
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-[13px] text-zinc-200 placeholder:text-zinc-600 resize-none shadow-inner focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 transition-all duration-300"
        />
        <div className="flex justify-between items-center">
          <span
            className={`text-[10px] ${
              charCount < 10
                ? 'text-zinc-600'
                : charCount > 1900
                  ? 'text-amber-500'
                  : 'text-zinc-600'
            }`}
          >
            {charCount < 10 && charCount > 0 ? `${10 - charCount} more chars needed` : ''}
          </span>
          <span className="text-[10px] text-zinc-700">{charCount}/2000</span>
        </div>
      </div>

      {/* Style row */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            Style
          </label>
          <div className="relative">
            <select
              value={stylePreference}
              onChange={(e) => setStylePreference(e.target.value)}
              className="w-full appearance-none bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2.5 text-[12px] font-medium text-zinc-300 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 pr-7 cursor-pointer transition-colors hover:bg-zinc-800/80"
            >
              {STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isGenerating}
        className={`relative overflow-hidden flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 active:scale-[0.98] ${
          isValid && !isGenerating
            ? 'bg-linear-to-r from-brand-blue to-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/20'
            : 'bg-zinc-800/50 text-zinc-600 border border-zinc-800 cursor-not-allowed'
        }`}
      >
        {isValid && !isGenerating && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        )}
        <Sparkles size={14} className={isValid && !isGenerating ? 'animate-pulse' : ''} />
        <span className="relative z-10">
          {isGenerating ? 'Generating Database…' : 'Generate Full Page'}
        </span>
      </button>
    </form>
  );
};
