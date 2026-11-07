import React from 'react';
import type {
  Transition,
  EasePreset,
  SpringBasis,
  SpringTimeTransition,
  SpringPhysicsTransition,
  EaseTransition,
} from '@canvasly/dsl-schema';

interface TransitionEditorProps {
  value: Transition;
  onChange: (value: Transition) => void;
}

const EASE_PRESETS: { label: string; value: EasePreset }[] = [
  { label: 'Linear', value: 'linear' },
  { label: 'Ease In', value: 'ease-in' },
  { label: 'Ease Out', value: 'ease-out' },
  { label: 'Ease In Out', value: 'ease-in-out' },
  { label: 'Back In', value: 'back-in' },
  { label: 'Back Out', value: 'back-out' },
  { label: 'Back In Out', value: 'back-in-out' },
  { label: 'Custom Bezier', value: 'custom-bezier' },
];

export const TransitionEditor: React.FC<TransitionEditorProps> = ({ value, onChange }) => {
  const mode = value.mode;

  const handleModeChange = (newMode: 'spring' | 'ease') => {
    if (newMode === 'spring') {
      onChange({
        mode: 'spring',
        basis: 'time',
        duration: 0.3,
        bounce: 0.25,
        delay: 0,
      });
    } else {
      onChange({
        mode: 'ease',
        preset: 'ease-out',
        duration: 0.3,
        delay: 0,
      });
    }
  };

  return (
    <div className="space-y-4 pt-2 border-t border-zinc-800/50 mt-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Transition
        </span>
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => handleModeChange('spring')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
              mode === 'spring' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Spring
          </button>
          <button
            onClick={() => handleModeChange('ease')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
              mode === 'ease' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Ease
          </button>
        </div>
      </div>

      {mode === 'spring' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Basis</span>
            <select
              value={(value as SpringTimeTransition | SpringPhysicsTransition).basis}
              onChange={(e) =>
                onChange({
                  ...value,
                  basis: e.target.value as SpringBasis,
                } as SpringTimeTransition | SpringPhysicsTransition)
              }
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-300 focus:outline-none"
            >
              <option value="time">Time-based</option>
              <option value="physics">Physics-based</option>
            </select>
          </div>

          {(value as SpringTimeTransition | SpringPhysicsTransition).basis === 'time' ? (
            <>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Duration</span>
                  <span className="text-zinc-500">{(value as SpringTimeTransition).duration}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={(value as SpringTimeTransition).duration}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      duration: parseFloat(e.target.value),
                    } as SpringTimeTransition)
                  }
                  className="w-full accent-brand-blue"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Bounce</span>
                  <span className="text-zinc-500">{(value as SpringTimeTransition).bounce}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={(value as SpringTimeTransition).bounce}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      bounce: parseFloat(e.target.value),
                    } as SpringTimeTransition)
                  }
                  className="w-full accent-brand-blue"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Stiffness</span>
                  <span className="text-zinc-500">
                    {(value as SpringPhysicsTransition).stiffness}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={(value as SpringPhysicsTransition).stiffness}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      stiffness: parseFloat(e.target.value),
                    } as SpringPhysicsTransition)
                  }
                  className="w-full accent-brand-blue"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Damping</span>
                  <span className="text-zinc-500">
                    {(value as SpringPhysicsTransition).damping}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={(value as SpringPhysicsTransition).damping}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      damping: parseFloat(e.target.value),
                    } as SpringPhysicsTransition)
                  }
                  className="w-full accent-brand-blue"
                />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400">Delay</span>
              <span className="text-zinc-500">
                {(value as SpringTimeTransition | SpringPhysicsTransition).delay}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={(value as SpringTimeTransition | SpringPhysicsTransition).delay}
              onChange={(e) =>
                onChange({
                  ...value,
                  delay: parseFloat(e.target.value),
                } as SpringTimeTransition | SpringPhysicsTransition)
              }
              className="w-full accent-brand-blue"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Preset</span>
            <select
              value={(value as EaseTransition).preset}
              onChange={(e) =>
                onChange({ ...value, preset: e.target.value as EasePreset } as EaseTransition)
              }
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-300 focus:outline-none"
            >
              {EASE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {(value as EaseTransition).preset === 'custom-bezier' && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400">Bezier Curve</span>
              <input
                type="text"
                value={(value as EaseTransition).bezier || ''}
                onChange={(e) => onChange({ ...value, bezier: e.target.value } as EaseTransition)}
                placeholder="0.1, 0.7, 1.0, 0.1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-[11px] text-zinc-200 placeholder-zinc-700 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400">Duration</span>
              <span className="text-zinc-500">{(value as EaseTransition).duration}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={(value as EaseTransition).duration}
              onChange={(e) =>
                onChange({ ...value, duration: parseFloat(e.target.value) } as EaseTransition)
              }
              className="w-full accent-brand-blue"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400">Delay</span>
              <span className="text-zinc-500">{(value as EaseTransition).delay}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={(value as EaseTransition).delay}
              onChange={(e) =>
                onChange({ ...value, delay: parseFloat(e.target.value) } as EaseTransition)
              }
              className="w-full accent-brand-blue"
            />
          </div>
        </div>
      )}
    </div>
  );
};
