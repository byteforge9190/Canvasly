import React from 'react';
import type { TickerSystem } from '@canvasly/dsl-schema';

interface TickerEditorProps {
  value: TickerSystem;
  onChange: (value: TickerSystem) => void;
}

export const TickerEditor: React.FC<TickerEditorProps> = ({ value, onChange }) => {
  const updateProp = <K extends keyof TickerSystem>(prop: K, val: TickerSystem[K]) => {
    onChange({ ...value, [prop]: val });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Draggable Toggle - Moved to top for visibility */}
      <div className="flex items-center justify-between bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/50">
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-200 uppercase font-bold tracking-wider">
            Draggable
          </span>
          <p className="text-[9px] text-zinc-500">Allow pointer/touch interaction</p>
        </div>
        <button
          onClick={() => updateProp('draggable', !value.draggable)}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
            value.draggable
              ? 'bg-brand-blue shadow-[0_0_12px_rgba(59,130,246,0.3)]'
              : 'bg-zinc-800 border border-zinc-700/50'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              value.draggable ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Speed Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Base Speed (%)</span>
          <input
            type="number"
            min="0"
            step="10"
            value={value.speed}
            onChange={(e) => updateProp('speed', parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200 focus:outline-none focus:border-brand-blue/50 transition-all font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">Hover Mod. (%)</span>
          <input
            type="number"
            min="-100"
            max="100"
            step="10"
            value={value.hover}
            onChange={(e) => updateProp('hover', parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200 focus:outline-none focus:border-brand-blue/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Direction Selection */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">Scroll Direction</span>
        <div className="flex gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 shadow-inner">
          {(['left', 'right'] as const).map((d) => (
            <button
              key={d}
              onClick={() => updateProp('direction', d)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${
                value.direction === d
                  ? 'bg-zinc-800 text-brand-blue shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
        <p className="text-[10px] text-zinc-500 leading-relaxed italic">
          Tip: Ticker creates a seamless loop by automatically cloning your content. Best used with
          marquee-style layouts.
        </p>
      </div>
    </div>
  );
};
