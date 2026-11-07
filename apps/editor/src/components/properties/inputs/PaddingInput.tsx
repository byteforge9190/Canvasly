import React, { useState } from 'react';
import type { PaddingValue } from '@canvasly/dsl-schema';
import { ChevronDown, Link2, Unlink2 } from 'lucide-react';

interface PaddingInputProps {
  value: number | PaddingValue | undefined;
  onChange: (value: number | PaddingValue | undefined) => void;
  label?: string;
}

export const PaddingInput: React.FC<PaddingInputProps> = ({
  value,
  onChange,
  label = 'Padding',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine if padding is linked (uniform) or unlinked (per-side)
  const isLinked = !value || typeof value === 'number';

  // Get current padding values
  const getPaddingValues = (): { top: number; right: number; bottom: number; left: number } => {
    if (!value) return { top: 0, right: 0, bottom: 0, left: 0 };
    if (typeof value === 'number') {
      return { top: value, right: value, bottom: value, left: value };
    }
    return {
      top: value.top || 0,
      right: value.right || 0,
      bottom: value.bottom || 0,
      left: value.left || 0,
    };
  };

  const paddingValues = getPaddingValues();

  // Toggle between linked and unlinked padding
  const handleToggleLink = () => {
    if (!value) {
      // Initialize with default padding when clicking on "No padding"
      onChange(16); // Default to 16px uniform padding
      return;
    }

    if (isLinked) {
      // Convert to per-side (unlink)
      const currentPadding = typeof value === 'number' ? value : 0;
      onChange({
        top: currentPadding,
        right: currentPadding,
        bottom: currentPadding,
        left: currentPadding,
      });
    } else {
      // Convert to uniform (link) - use top value
      const sides = value as PaddingValue;
      onChange(sides.top || 0);
    }
  };

  // Handle uniform padding change
  const handleUniformPaddingChange = (newPadding: number) => {
    if (!value) {
      onChange(newPadding);
      return;
    }
    onChange(newPadding);
  };

  // Handle per-side padding change
  const handleSidePaddingChange = (
    side: 'top' | 'right' | 'bottom' | 'left',
    newPadding: number,
  ) => {
    if (!value) {
      const newSides: PaddingValue = { [side]: newPadding };
      onChange(newSides);
      return;
    }

    const currentSides =
      typeof value === 'number'
        ? { top: value, right: value, bottom: value, left: value }
        : {
            top: value.top || 0,
            right: value.right || 0,
            bottom: value.bottom || 0,
            left: value.left || 0,
          };

    onChange({
      ...currentSides,
      [side]: newPadding,
    });
  };

  const hasPadding =
    value !== undefined &&
    (typeof value === 'number'
      ? value > 0
      : (value.top || 0) > 0 ||
        (value.right || 0) > 0 ||
        (value.bottom || 0) > 0 ||
        (value.left || 0) > 0);

  // Get display text for padding summary
  const getPaddingSummary = (): string => {
    if (!hasPadding) return 'No padding';

    if (isLinked) {
      return `${value}px`;
    } else {
      const sides = value as PaddingValue;
      const allSame =
        sides.top === sides.right && sides.right === sides.bottom && sides.bottom === sides.left;
      if (allSame) {
        return `${sides.top}px`;
      }
      return `${sides.top || 0}/${sides.right || 0}/${sides.bottom || 0}/${sides.left || 0}px`;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {label}
      </label>

      {/* Padding Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
          disabled={!hasPadding}
        >
          <ChevronDown
            size={14}
            className={`text-zinc-500 transition-transform ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            } ${!hasPadding ? 'opacity-30' : ''}`}
          />
        </button>

        <button
          onClick={() => handleToggleLink()}
          className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-all shadow-sm shadow-black/20 text-left ${
            hasPadding
              ? 'bg-brand-blue/10 border border-brand-blue/30 text-brand-blue'
              : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{getPaddingSummary()}</span>
            <div className="flex items-center gap-1">
              {isLinked ? (
                <Link2 size={12} className="text-brand-blue" />
              ) : (
                <Unlink2 size={12} className="text-zinc-500" />
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Padding Properties */}
      {isExpanded && hasPadding && value && (
        <div className="pl-8 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Padding Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
                Padding Values
              </label>
              <button
                onClick={handleToggleLink}
                className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors group"
                title={isLinked ? 'Unlink sides' : 'Link sides'}
              >
                {isLinked ? (
                  <Link2 size={12} className="text-brand-blue group-hover:text-brand-blue/80" />
                ) : (
                  <Unlink2 size={12} className="text-zinc-500 group-hover:text-zinc-400" />
                )}
              </button>
            </div>

            {isLinked ? (
              // Uniform padding control
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="4"
                  value={typeof value === 'number' ? value : 0}
                  onChange={(e) => handleUniformPaddingChange(parseInt(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                />
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={typeof value === 'number' ? value : 0}
                  onChange={(e) => handleUniformPaddingChange(parseInt(e.target.value) || 0)}
                  className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-[12px] text-zinc-200 font-mono text-right"
                />
                <span className="text-[11px] text-zinc-500 font-medium">px</span>
              </div>
            ) : (
              // Per-side padding controls
              <div className="space-y-2">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold w-12">
                      {side}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="4"
                      value={paddingValues[side] || 0}
                      onChange={(e) => handleSidePaddingChange(side, parseInt(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                    />
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={paddingValues[side] || 0}
                      onChange={(e) => handleSidePaddingChange(side, parseInt(e.target.value) || 0)}
                      className="w-14 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-200 font-mono text-right"
                    />
                    <span className="text-[10px] text-zinc-500 font-medium">px</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
