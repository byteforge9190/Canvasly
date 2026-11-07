import React, { useState } from 'react';
import type { Shadow, BoxShadow, RealisticShadow, ShadowPosition } from '@canvasly/dsl-schema';
import { ChevronDown, Box, Layers, Circle, Square } from 'lucide-react';
import { ColorInput } from './ColorInput';

interface ShadowInputProps {
  value: Shadow | undefined;
  onChange: (value: Shadow | undefined) => void;
  label?: string;
}

export const ShadowInput: React.FC<ShadowInputProps> = ({ value, onChange, label = 'Shadow' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Default shadow if none exists
  const shadow: Shadow = value || {
    type: 'box',
    position: 'outside',
    color: '#00000040',
    x: 0,
    y: 2,
    blur: 8,
    spread: 0,
    enabled: false,
  };

  const hasShadow = shadow.enabled;

  // Toggle shadow on/off
  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      onChange({
        ...shadow,
        enabled: true,
      });
    } else {
      onChange({
        ...shadow,
        enabled: false,
      });
    }
  };

  // Update shadow property with type safety
  const updateShadow = (updates: Partial<Shadow>) => {
    // Create new shadow object based on current type
    if (shadow.type === 'box') {
      const boxShadow = shadow as BoxShadow;
      // Filter out realistic-specific properties and build a clean update object
      const cleanUpdates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'diffusion' && key !== 'focus' && key !== 'layers') {
          cleanUpdates[key] = value;
        }
      }

      const newShadow: BoxShadow = {
        ...boxShadow,
        ...(cleanUpdates as Partial<BoxShadow>),
      };
      onChange(newShadow);
    } else {
      const realisticShadow = shadow as RealisticShadow;
      // Filter out box-specific properties and build a clean update object
      const cleanUpdates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'blur' && key !== 'spread') {
          cleanUpdates[key] = value;
        }
      }

      const newShadow: RealisticShadow = {
        ...realisticShadow,
        ...(cleanUpdates as Partial<RealisticShadow>),
      };
      onChange(newShadow);
    }
  };

  // Apply preset
  const applyPreset = (preset: Partial<Shadow>) => {
    if (preset.enabled === false) {
      // Disable shadow
      if (shadow.type === 'box') {
        const boxShadow = shadow as BoxShadow;
        onChange({
          ...boxShadow,
          enabled: false,
        });
      } else {
        const realisticShadow = shadow as RealisticShadow;
        onChange({
          ...realisticShadow,
          enabled: false,
        });
      }
    } else {
      // Apply preset values
      if (shadow.type === 'box') {
        const boxShadow = shadow as BoxShadow;
        onChange({
          ...boxShadow,
          ...preset,
          enabled: true,
        } as BoxShadow);
      } else {
        const realisticShadow = shadow as RealisticShadow;
        onChange({
          ...realisticShadow,
          ...preset,
          enabled: true,
        } as RealisticShadow);
      }
    }
  };

  // Common presets based on shadow type
  const getPresets = () => {
    if (shadow.type === 'box') {
      return [
        { name: 'None', value: { enabled: false } },
        { name: 'Small', value: { y: 1, blur: 2, color: '#00000020' } },
        { name: 'Medium', value: { y: 2, blur: 8, color: '#00000040' } },
        { name: 'Large', value: { y: 4, blur: 16, spread: 2, color: '#00000060' } },
        { name: 'X-Large', value: { y: 8, blur: 24, spread: 4, color: '#00000080' } },
        {
          name: 'Inner',
          value: { position: 'inside' as ShadowPosition, y: 2, blur: 4, color: '#00000030' },
        },
      ];
    } else {
      // Realistic shadow presets (using pixel values for diffusion/focus)
      return [
        { name: 'None', value: { enabled: false } },
        { name: 'Soft', value: { diffusion: 12, focus: -2, color: '#00000020' } },
        { name: 'Medium', value: { diffusion: 8, focus: 0, color: '#00000040' } },
        { name: 'Sharp', value: { diffusion: 4, focus: 2, color: '#00000060' } },
        { name: 'Dramatic', value: { y: 4, diffusion: 16, focus: -4, color: '#00000080' } },
        {
          name: 'Inner',
          value: {
            position: 'inside' as ShadowPosition,
            y: 2,
            diffusion: 6,
            focus: 0,
            color: '#00000030',
          },
        },
      ];
    }
  };

  const presets = getPresets();

  // Get display text for shadow summary
  const getShadowSummary = (): string => {
    if (!hasShadow) return 'No shadow';

    const position = shadow.position === 'inside' ? 'Inner ' : '';
    const type = shadow.type === 'realistic' ? 'Realistic ' : '';

    if (shadow.type === 'box') {
      const boxShadow = shadow as BoxShadow;
      return `${position}${type}${boxShadow.x}px ${boxShadow.y}px ${boxShadow.blur}px`;
    } else {
      const realisticShadow = shadow as RealisticShadow;
      return `${position}${type}${realisticShadow.x}px ${realisticShadow.y}px (Blur:${realisticShadow.diffusion}px, Spread:${realisticShadow.focus}px)`;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {label}
      </label>

      {/* Shadow Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
          disabled={!hasShadow}
        >
          <ChevronDown
            size={14}
            className={`text-zinc-500 transition-transform ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            } ${!hasShadow ? 'opacity-30' : ''}`}
          />
        </button>

        <button
          onClick={() => handleToggle(!hasShadow)}
          className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-all shadow-sm shadow-black/20 text-left ${
            hasShadow
              ? 'bg-brand-blue/10 border border-brand-blue/30 text-brand-blue'
              : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          {getShadowSummary()}
        </button>
      </div>

      {/* Shadow Properties */}
      {isExpanded && (
        <div className="pl-8 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
              Presets
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.value)}
                  className={`px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                    !hasShadow && preset.name === 'None'
                      ? 'bg-brand-blue/10 border border-brand-blue/30 text-brand-blue'
                      : 'bg-zinc-800/50 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Type and Position - Stacked for better clarity */}
          <div className="space-y-4">
            {/* Shadow Type - Full width */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
                Shadow Type
              </label>
              <div className="flex gap-1 bg-zinc-950/50 p-1 rounded-lg border border-zinc-800/50">
                <button
                  onClick={() => {
                    if (shadow.type === 'realistic') {
                      // Convert realistic shadow to box shadow
                      const realisticShadow = shadow as RealisticShadow;
                      const newBoxShadow: BoxShadow = {
                        type: 'box',
                        position: realisticShadow.position,
                        color: realisticShadow.color,
                        x: realisticShadow.x,
                        y: realisticShadow.y,
                        blur: realisticShadow.diffusion, // Direct mapping: diffusion -> blur
                        spread: realisticShadow.focus, // Direct mapping: focus -> spread
                        enabled: realisticShadow.enabled,
                      };
                      onChange(newBoxShadow);
                    } else {
                      updateShadow({ type: 'box' });
                    }
                  }}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-md transition-all ${
                    shadow.type === 'box'
                      ? 'bg-zinc-800 text-brand-blue border border-brand-blue/30'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                  }`}
                >
                  <Box size={14} />
                  <span className="text-[10px] font-medium">Box</span>
                  <span className="text-[9px] text-zinc-600 mt-0.5">Blur & spread</span>
                </button>
                <button
                  onClick={() => {
                    if (shadow.type === 'box') {
                      // Convert box shadow to realistic shadow
                      const boxShadow = shadow as BoxShadow;
                      const newRealisticShadow: RealisticShadow = {
                        type: 'realistic',
                        position: boxShadow.position,
                        color: boxShadow.color,
                        x: boxShadow.x,
                        y: boxShadow.y,
                        diffusion: boxShadow.blur, // Direct mapping: blur -> diffusion
                        focus: boxShadow.spread, // Direct mapping: spread -> focus
                        enabled: boxShadow.enabled,
                      };
                      onChange(newRealisticShadow);
                    } else {
                      updateShadow({ type: 'realistic' });
                    }
                  }}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-md transition-all ${
                    shadow.type === 'realistic'
                      ? 'bg-zinc-800 text-brand-blue border border-brand-blue/30'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                  }`}
                >
                  <Layers size={14} />
                  <span className="text-[10px] font-medium">Realistic</span>
                  <span className="text-[9px] text-zinc-600 mt-0.5">Diffusion & focus</span>
                </button>
              </div>
            </div>

            {/* Shadow Position - Full width */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
                Shadow Position
              </label>
              <div className="flex gap-1 bg-zinc-950/50 p-1 rounded-lg border border-zinc-800/50">
                <button
                  onClick={() => updateShadow({ position: 'outside' })}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-md transition-all ${
                    shadow.position === 'outside'
                      ? 'bg-zinc-800 text-brand-blue border border-brand-blue/30'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                  }`}
                >
                  <Square size={14} />
                  <span className="text-[10px] font-medium">Outside</span>
                  <span className="text-[9px] text-zinc-600 mt-0.5">Standard drop shadow</span>
                </button>
                <button
                  onClick={() => updateShadow({ position: 'inside' })}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-md transition-all ${
                    shadow.position === 'inside'
                      ? 'bg-zinc-800 text-brand-blue border border-brand-blue/30'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                  }`}
                >
                  <Circle size={14} />
                  <span className="text-[10px] font-medium">Inside</span>
                  <span className="text-[9px] text-zinc-600 mt-0.5">Inset shadow (inner)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Color */}
          <ColorInput
            schema={{
              key: 'shadow.color',
              path: 'shadow.color',
              domain: 'style',
              label: 'Color',
              type: 'color',
              defaultValue: '#00000040',
            }}
            value={shadow.color}
            onChange={(color) => updateShadow({ color: color as string })}
          />

          {/* Offset Controls */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
              Offset
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* X Offset */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">X</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{shadow.x}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={shadow.x}
                  onChange={(e) => updateShadow({ x: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                />
              </div>

              {/* Y Offset */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Y</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{shadow.y}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={shadow.y}
                  onChange={(e) => updateShadow({ y: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* Effects - Different controls based on shadow type */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
              {shadow.type === 'box' ? 'Box Effects' : 'Realistic Effects'}
            </label>

            {shadow.type === 'box' ? (
              // Box shadow controls
              <div className="grid grid-cols-2 gap-3">
                {/* Blur Radius */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">Blur</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(shadow as BoxShadow).blur}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={(shadow as BoxShadow).blur}
                    onChange={(e) => updateShadow({ blur: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                  />
                </div>

                {/* Spread Radius */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">Spread</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(shadow as BoxShadow).spread}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={(shadow as BoxShadow).spread}
                    onChange={(e) => updateShadow({ spread: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                  />
                </div>
              </div>
            ) : (
              // Realistic shadow controls (using pixel values)
              <div className="grid grid-cols-2 gap-3">
                {/* Diffusion (Blur) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">Diffusion</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(shadow as RealisticShadow).diffusion}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={(shadow as RealisticShadow).diffusion}
                    onChange={(e) => updateShadow({ diffusion: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                  />
                  <div className="text-[9px] text-zinc-600 mt-1">
                    Blur radius (softness of edges)
                  </div>
                </div>

                {/* Focus (Spread) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">Focus</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(shadow as RealisticShadow).focus}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={(shadow as RealisticShadow).focus}
                    onChange={(e) => updateShadow({ focus: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                  />
                  <div className="text-[9px] text-zinc-600 mt-1">
                    Spread radius (sharpness/size)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
