import React, { useState } from 'react';
import type { Border, BorderStyle, BorderWidthSides } from '@canvasly/dsl-schema';
import { ChevronDown, Link2, Unlink2 } from 'lucide-react';
import { ColorInput } from './ColorInput';

interface BorderInputProps {
  value: Border | undefined;
  onChange: (value: Border | undefined) => void;
  label?: string;
}

export const BorderInput: React.FC<BorderInputProps> = ({ value, onChange, label = 'Border' }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine if width is linked (uniform) or unlinked (per-side)
  const isLinked = !value || typeof value.width === 'number';

  // Get current width values
  const getWidthValues = (): { top: number; right: number; bottom: number; left: number } => {
    if (!value) return { top: 0, right: 0, bottom: 0, left: 0 };
    if (typeof value.width === 'number') {
      return { top: value.width, right: value.width, bottom: value.width, left: value.width };
    }
    return value.width;
  };

  const widthValues = getWidthValues();

  // Handle enabling/disabling border
  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      onChange({
        width: 1,
        style: 'solid',
        color: '#000000',
      });
    } else {
      onChange(undefined);
    }
  };

  // Toggle between linked and unlinked widths
  const handleToggleLink = () => {
    if (!value) return;

    if (isLinked) {
      // Convert to per-side (unlink)
      const currentWidth = typeof value.width === 'number' ? value.width : 1;
      onChange({
        ...value,
        width: {
          top: currentWidth,
          right: currentWidth,
          bottom: currentWidth,
          left: currentWidth,
        },
      });
    } else {
      // Convert to uniform (link) - use top value
      const sides = value.width as BorderWidthSides;
      onChange({
        ...value,
        width: sides.top,
      });
    }
  };

  // Handle uniform width change
  const handleUniformWidthChange = (newWidth: number) => {
    if (!value) return;
    onChange({ ...value, width: newWidth });
  };

  // Handle per-side width change
  const handleSideWidthChange = (side: 'top' | 'right' | 'bottom' | 'left', newWidth: number) => {
    if (!value) return;
    const currentSides =
      typeof value.width === 'number'
        ? { top: value.width, right: value.width, bottom: value.width, left: value.width }
        : value.width;

    onChange({
      ...value,
      width: {
        ...currentSides,
        [side]: newWidth,
      },
    });
  };

  const hasBorder = value !== undefined && value.style !== 'none';

  // Get display text for border summary
  const getBorderSummary = (): string => {
    if (!hasBorder || !value) return 'No border';

    if (isLinked) {
      return `${value.width}px ${value.style} ${value.color}`;
    } else {
      const sides = value.width as BorderWidthSides;
      const allSame =
        sides.top === sides.right && sides.right === sides.bottom && sides.bottom === sides.left;
      if (allSame) {
        return `${sides.top}px ${value.style} ${value.color}`;
      }
      return `${sides.top}/${sides.right}/${sides.bottom}/${sides.left}px ${value.style}`;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {label}
      </label>

      {/* Border Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
          disabled={!hasBorder}
        >
          <ChevronDown
            size={14}
            className={`text-zinc-500 transition-transform ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            } ${!hasBorder ? 'opacity-30' : ''}`}
          />
        </button>

        <button
          onClick={() => handleToggle(!hasBorder)}
          className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-all shadow-sm shadow-black/20 text-left ${
            hasBorder
              ? 'bg-brand-blue/10 border border-brand-blue/30 text-brand-blue'
              : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          {getBorderSummary()}
        </button>
      </div>

      {/* Border Properties */}
      {isExpanded && hasBorder && value && (
        <div className="pl-8 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Width Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
                Width
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
              // Uniform width control
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={typeof value.width === 'number' ? value.width : 1}
                  onChange={(e) => handleUniformWidthChange(parseInt(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                />
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={typeof value.width === 'number' ? value.width : 1}
                  onChange={(e) => handleUniformWidthChange(parseInt(e.target.value) || 0)}
                  className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-[12px] text-zinc-200 font-mono text-right"
                />
                <span className="text-[11px] text-zinc-500 font-medium">px</span>
              </div>
            ) : (
              // Per-side width controls
              <div className="space-y-2">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold w-12">
                      {side}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={widthValues[side]}
                      onChange={(e) => handleSideWidthChange(side, parseInt(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={widthValues[side]}
                      onChange={(e) => handleSideWidthChange(side, parseInt(e.target.value) || 0)}
                      className="w-14 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-200 font-mono text-right"
                    />
                    <span className="text-[10px] text-zinc-500 font-medium">px</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Style */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
              Style
            </label>
            <select
              value={value.style}
              onChange={(e) => onChange({ ...value, style: e.target.value as BorderStyle })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="groove">Groove</option>
              <option value="ridge">Ridge</option>
              <option value="inset">Inset</option>
              <option value="outset">Outset</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Color */}
          <ColorInput
            schema={{
              key: 'border.color',
              path: 'border.color',
              domain: 'style',
              label: 'Color',
              type: 'color',
              defaultValue: '#000000',
            }}
            value={value.color}
            onChange={(color) => onChange({ ...value, color: color as string })}
          />
        </div>
      )}
    </div>
  );
};
