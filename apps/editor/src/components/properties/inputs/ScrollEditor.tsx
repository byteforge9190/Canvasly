import React from 'react';
import type { ScrollSystem, ScrollEffectConfig, ScrollEffectType } from '@canvasly/dsl-schema';

interface ScrollEditorProps {
  value: ScrollSystem;
  onChange: (value: ScrollSystem) => void;
}

export const ScrollEditor: React.FC<ScrollEditorProps> = ({ value, onChange }) => {
  const config = value.config;

  const updateConfig = (newConfig: ScrollEffectConfig) => {
    onChange({ ...value, config: newConfig });
  };

  const setType = (type: ScrollEffectType) => {
    if (type === 'animation') {
      updateConfig({
        type: 'animation',
        property: 'opacity',
        from: 0,
        to: 1,
        start: 0,
        end: 50,
      });
    } else if (type === 'speed') {
      updateConfig({
        type: 'speed',
        multiplier: 1.5,
      });
    } else if (type === 'transform') {
      updateConfig({
        type: 'transform',
        translateY: -50,
      });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Type Selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">Scroll Effect Type</span>
        <div className="flex gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
          {(['animation', 'speed', 'transform'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-1 text-[10px] font-bold rounded transition-all capitalize ${
                config.type === t
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Settings */}
      {config.type === 'animation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Property</span>
              <select
                value={config.property}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    property: e.target.value as
                      | 'opacity'
                      | 'scale'
                      | 'rotate'
                      | 'translateX'
                      | 'translateY',
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-1 py-1 text-[11px] text-zinc-300 appearance-none"
              >
                {['opacity', 'scale', 'rotate', 'translateX', 'translateY'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">From</span>
                <input
                  type="number"
                  step="0.1"
                  value={config.from}
                  onChange={(e) => updateConfig({ ...config, from: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">To</span>
                <input
                  type="number"
                  step="0.1"
                  value={config.to}
                  onChange={(e) => updateConfig({ ...config, to: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Start (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={config.start}
                onChange={(e) => updateConfig({ ...config, start: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">End (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={config.end}
                onChange={(e) => updateConfig({ ...config, end: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Speed Settings */}
      {config.type === 'speed' && (
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">
            Scroll Speed Multiplier
          </span>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.1"
              max="4"
              step="0.1"
              value={config.multiplier}
              onChange={(e) => updateConfig({ ...config, multiplier: parseFloat(e.target.value) })}
              className="flex-1 accent-brand-blue"
            />
            <span className="text-[11px] font-mono text-brand-blue w-8">{config.multiplier}x</span>
          </div>
          <p className="text-[10px] text-zinc-500 italic mt-1">
            Values &gt; 1 create a parallax effect.
          </p>
        </div>
      )}

      {/* Transform Settings */}
      {config.type === 'transform' && (
        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Parallax Y (px)</span>
            <input
              type="number"
              value={config.translateY ?? 0}
              onChange={(e) => updateConfig({ ...config, translateY: parseFloat(e.target.value) })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Parallax X (px)</span>
            <input
              type="number"
              value={config.translateX ?? 0}
              onChange={(e) => updateConfig({ ...config, translateX: parseFloat(e.target.value) })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Scale</span>
            <input
              type="number"
              step="0.1"
              value={config.scale ?? 1}
              onChange={(e) => updateConfig({ ...config, scale: parseFloat(e.target.value) })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Rotate (deg)</span>
            <input
              type="number"
              value={config.rotate ?? 0}
              onChange={(e) => updateConfig({ ...config, rotate: parseFloat(e.target.value) })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
            />
          </div>
        </div>
      )}

      <div className="p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
        <p className="text-[10px] text-zinc-500 leading-relaxed italic">
          Tip: Scroll effects trigger as the element passes through the viewport. Combined with
          sticky positioning, you can create complex scroll experiences.
        </p>
      </div>
    </div>
  );
};
