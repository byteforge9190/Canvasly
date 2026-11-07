import React, { useState } from 'react';
import type { PropertySchema } from '@canvasly/dsl-schema';
import { isCSSVariable } from '@canvasly/dsl-schema';
import { useThemeColorOptions, useResolveColor } from '../../../hooks/useTheme';

interface ColorInputProps {
  schema: PropertySchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

// Parse hex to HSL
const hexToHSL = (hex: string): { h: number; s: number; l: number; a: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0, a: 1 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const a = result[4] ? parseInt(result[4], 16) / 255 : 1;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100), a };
};

// Convert HSL to hex
const hslToHex = (h: number, s: number, l: number, a: number): string => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const alphaHex =
    a < 1
      ? Math.round(a * 255)
          .toString(16)
          .padStart(2, '0')
      : '';
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`;
};

// Expanded color palette with more options
const colorPalette = {
  Grays: [
    '#000000',
    '#1F2937',
    '#374151',
    '#4B5563',
    '#6B7280',
    '#9CA3AF',
    '#D1D5DB',
    '#E5E7EB',
    '#F3F4F6',
    '#FFFFFF',
  ],
  Reds: [
    '#7F1D1D',
    '#991B1B',
    '#B91C1C',
    '#DC2626',
    '#EF4444',
    '#F87171',
    '#FCA5A5',
    '#FECACA',
    '#FEE2E2',
    '#FEF2F2',
  ],
  Oranges: [
    '#7C2D12',
    '#9A3412',
    '#C2410C',
    '#EA580C',
    '#F97316',
    '#FB923C',
    '#FDBA74',
    '#FED7AA',
    '#FFEDD5',
    '#FFF7ED',
  ],
  Yellows: [
    '#713F12',
    '#854D0E',
    '#A16207',
    '#CA8A04',
    '#EAB308',
    '#FACC15',
    '#FDE047',
    '#FEF08A',
    '#FEF9C3',
    '#FEFCE8',
  ],
  Greens: [
    '#14532D',
    '#166534',
    '#15803D',
    '#16A34A',
    '#22C55E',
    '#4ADE80',
    '#86EFAC',
    '#BBF7D0',
    '#DCFCE7',
    '#F0FDF4',
  ],
  Teals: [
    '#134E4A',
    '#115E59',
    '#0F766E',
    '#0D9488',
    '#14B8A6',
    '#2DD4BF',
    '#5EEAD4',
    '#99F6E4',
    '#CCFBF1',
    '#F0FDFA',
  ],
  Blues: [
    '#1E3A8A',
    '#1E40AF',
    '#1D4ED8',
    '#2563EB',
    '#3B82F6',
    '#60A5FA',
    '#93C5FD',
    '#BFDBFE',
    '#DBEAFE',
    '#EFF6FF',
  ],
  Purples: [
    '#581C87',
    '#6B21A8',
    '#7C3AED',
    '#8B5CF6',
    '#A78BFA',
    '#C4B5FD',
    '#DDD6FE',
    '#EDE9FE',
    '#F5F3FF',
    '#FAF5FF',
  ],
  Pinks: [
    '#831843',
    '#9F1239',
    '#BE123C',
    '#E11D48',
    '#F43F5E',
    '#FB7185',
    '#FDA4AF',
    '#FECDD3',
    '#FFE4E6',
    '#FFF1F2',
  ],
};

export const ColorInput: React.FC<ColorInputProps> = ({ schema, value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'theme' | 'palette' | 'custom'>('theme');
  const themeColors = useThemeColorOptions();

  // Resolve the actual color value for display (CSS var -> hex)
  const currentValue = (value as string) || '#000000';
  const resolvedColor = useResolveColor(currentValue);
  const isThemeColor = isCSSVariable(currentValue);

  const [hsl, setHsl] = useState(hexToHSL(resolvedColor));

  const updateHSL = (updates: Partial<typeof hsl>) => {
    const newHsl = { ...hsl, ...updates };
    setHsl(newHsl);
    onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l, newHsl.a));
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>
      <div className="flex gap-2">
        <div
          className="w-9 h-9 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all shrink-0 shadow-sm"
          style={{ backgroundColor: resolvedColor }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={currentValue}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
            // Resolve for HSL preview
            const resolved = isCSSVariable(newValue) ? resolvedColor : newValue;
            setHsl(hexToHSL(resolved));
          }}
          placeholder="var(--color-primary) or #000000"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all font-mono shadow-sm shadow-black/20"
        />
      </div>
      {showPicker && (
        <div className="mt-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl z-20">
          {/* Tabs */}
          <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/50 mb-3">
            <button
              onClick={() => setPickerTab('theme')}
              className={`flex-1 px-2 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                pickerTab === 'theme'
                  ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Theme
            </button>
            <button
              onClick={() => setPickerTab('palette')}
              className={`flex-1 px-2 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                pickerTab === 'palette'
                  ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Palette
            </button>
            <button
              onClick={() => setPickerTab('custom')}
              className={`flex-1 px-2 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                pickerTab === 'custom'
                  ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Custom
            </button>
          </div>

          {pickerTab === 'theme' ? (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              <div className="text-[10px] font-bold text-zinc-600 mb-2 uppercase tracking-widest ml-0.5">
                Theme Colors
              </div>
              <div className="grid grid-cols-2 gap-2">
                {themeColors.map(({ label, value: colorValue, token, cssVar }) => (
                  <button
                    key={token}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      currentValue === cssVar
                        ? 'border-brand-blue bg-brand-blue/10'
                        : 'border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700'
                    }`}
                    onClick={() => {
                      // Store the CSS variable reference, not the hex value
                      onChange(cssVar);
                      setHsl(hexToHSL(colorValue));
                    }}
                    title={`${label} (${cssVar})`}
                  >
                    <div
                      className="w-6 h-6 rounded-md border border-black/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: colorValue }}
                    />
                    <span className="text-[11px] font-medium text-zinc-300 truncate">{label}</span>
                  </button>
                ))}
              </div>
              {isThemeColor && (
                <div className="mt-3 p-2.5 bg-brand-blue/5 border border-brand-blue/20 rounded-lg text-[10px] text-brand-blue leading-relaxed">
                  Linked to Theme: <span className="font-mono font-bold">{currentValue}</span>
                </div>
              )}
            </div>
          ) : pickerTab === 'palette' ? (
            <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(colorPalette).map(([name, colors]) => (
                <div key={name}>
                  <div className="text-[10px] font-bold text-zinc-600 mb-2 uppercase tracking-widest ml-0.5">
                    {name}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 shadow-sm ${
                          resolvedColor.toUpperCase() === color.toUpperCase()
                            ? 'border-brand-blue ring-2 ring-brand-blue/20'
                            : 'border-zinc-800/50 hover:border-zinc-600'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onChange(color);
                          setHsl(hexToHSL(color));
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pb-1">
              {/* Hue Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-0.5">
                  <span>Hue</span>
                  <span className="text-zinc-400 font-mono">{hsl.h}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hsl.h}
                  onChange={(e) => updateHSL({ h: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
                  style={{
                    background:
                      'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                  }}
                />
              </div>

              {/* Saturation Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-0.5">
                  <span>Saturation</span>
                  <span className="text-zinc-400 font-mono">{hsl.s}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.s}
                  onChange={(e) => updateHSL({ s: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`,
                  }}
                />
              </div>

              {/* Lightness Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-0.5">
                  <span>Lightness</span>
                  <span className="text-zinc-400 font-mono">{hsl.l}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => updateHSL({ l: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`,
                  }}
                />
              </div>

              {/* Opacity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-0.5">
                  <span>Opacity</span>
                  <span className="text-zinc-400 font-mono">{Math.round(hsl.a * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.a * 100}
                  onChange={(e) => updateHSL({ a: parseInt(e.target.value) / 100 })}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer shadow-inner"
                  style={{
                    background: `linear-gradient(to right, transparent, ${hslToHex(hsl.h, hsl.s, hsl.l, 1)})`,
                  }}
                />
              </div>

              {/* Color Preview */}
              <div className="flex items-center gap-2 pt-1">
                <div
                  className="w-full h-10 rounded-lg border border-zinc-800 shadow-inner"
                  style={{ backgroundColor: resolvedColor }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};
