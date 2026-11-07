import React from 'react';
import type { LoopSystem, EasePreset } from '@canvasly/dsl-schema';

interface LoopEditorProps {
  value: LoopSystem;
  onChange: (value: LoopSystem) => void;
}

const EASING_OPTIONS: { value: EasePreset; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'back-in', label: 'Back In' },
  { value: 'back-out', label: 'Back Out' },
  { value: 'back-in-out', label: 'Back In-Out' },
];

export const LoopEditor: React.FC<LoopEditorProps> = ({ value, onChange }) => {
  const updateProp = <K extends keyof LoopSystem>(prop: K, val: LoopSystem[K]) => {
    onChange({ ...value, [prop]: val });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Type Selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">Animation Type</span>
        <div className="flex gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
          {(['rotate', 'scale', 'position'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateProp('type', t)}
              className={`flex-1 py-1 text-[10px] font-bold rounded transition-all capitalize ${
                value.type === t ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Type-Specific Settings */}
      <div className="grid grid-cols-2 gap-4">
        {value.type === 'rotate' && (
          <div className="space-y-1.5 col-span-2">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Rotation Degrees</span>
            <input
              type="number"
              value={value.rotateDegrees ?? 360}
              onChange={(e) => updateProp('rotateDegrees', parseFloat(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
            />
          </div>
        )}

        {value.type === 'scale' && (
          <>
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">From</span>
              <input
                type="number"
                step="0.1"
                value={value.scaleFrom ?? 1}
                onChange={(e) => updateProp('scaleFrom', parseFloat(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">To</span>
              <input
                type="number"
                step="0.1"
                value={value.scaleTo ?? 1.1}
                onChange={(e) => updateProp('scaleTo', parseFloat(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
              />
            </div>
          </>
        )}

        {value.type === 'position' && (
          <>
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Move X (px)</span>
              <input
                type="number"
                value={value.positionX ?? 0}
                onChange={(e) => updateProp('positionX', parseFloat(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Move Y (px)</span>
              <input
                type="number"
                value={value.positionY ?? 10}
                onChange={(e) => updateProp('positionY', parseFloat(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
              />
            </div>
          </>
        )}
      </div>

      {/* Common Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Duration (s)</span>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={value.duration}
            onChange={(e) => updateProp('duration', parseFloat(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Easing</span>
          <select
            value={value.easing}
            onChange={(e) => updateProp('easing', e.target.value as EasePreset)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-1 py-1 text-[11px] text-zinc-300 appearance-none"
          >
            {EASING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">Pause Offscreen</span>
        <button
          onClick={() => updateProp('offScreen', value.offScreen === 'pause' ? 'play' : 'pause')}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            value.offScreen === 'pause'
              ? 'bg-brand-blue border-brand-blue text-white'
              : 'border-zinc-700'
          }`}
        >
          {value.offScreen === 'pause' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
        </button>
      </div>
    </div>
  );
};
