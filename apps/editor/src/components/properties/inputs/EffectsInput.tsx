import React, { useState } from 'react';
import type {
  FrameEffects,
  EffectState,
  EffectStateConfig,
  EffectStates,
  EffectSystems,
  LoopSystem,
  TickerSystem,
  ScrollSystem,
} from '@canvasly/dsl-schema';
import { EffectStateEditor } from './EffectStateEditor';
import { LoopEditor } from './LoopEditor';
import { TickerEditor } from './TickerEditor';
import { ScrollEditor } from './ScrollEditor';
import { MousePointer2, Touchpad, Target, Eye, Repeat, Activity, MousePointer } from 'lucide-react';

interface EffectsInputProps {
  value: FrameEffects | undefined;
  onChange: (value: FrameEffects) => void;
  label?: string;
}

export const EffectsInput: React.FC<EffectsInputProps> = ({ value, onChange }) => {
  // Local UI state for tab/category selection
  // This is NOT stored in frame data, purely for the property panel UI
  const [category, setCategory] = useState<'states' | 'systems'>('states');
  const [activeState, setActiveState] = useState<'hover' | 'press' | 'focus' | 'appear'>('hover');
  const [activeSystem, setActiveSystem] = useState<'loop' | 'ticker' | 'scroll'>('loop');

  const effects = value || {};

  const handleStateChange = <K extends keyof EffectStates>(
    stateName: K,
    stateValue: EffectStates[K],
  ) => {
    const newStates = { ...(effects.states || {}) } as EffectStates;
    newStates[stateName] = stateValue;
    onChange({ ...effects, states: newStates });
  };

  const handleSystemChange = <K extends keyof EffectSystems>(
    systemName: K,
    systemValue: EffectSystems[K],
  ) => {
    const newSystems = { ...(effects.systems || {}) } as EffectSystems;
    newSystems[systemName] = systemValue;
    onChange({ ...effects, systems: newSystems });
  };

  const getInitialState = (): EffectState => ({
    opacity: 1,
    scale: 1,
    transition: {
      mode: 'spring',
      basis: 'time',
      duration: 0.3,
      bounce: 0.25,
      delay: 0,
    },
  });

  const getInitialLoop = (): LoopSystem => ({
    enabled: true,
    type: 'rotate',
    duration: 2,
    easing: 'linear',
    offScreen: 'pause',
    rotateDegrees: 360,
  });

  const getInitialTicker = (): TickerSystem => ({
    enabled: true,
    speed: 50,
    hover: 0,
    direction: 'left',
    draggable: false,
  });

  const getInitialScroll = (): ScrollSystem => ({
    enabled: true,
    config: {
      type: 'speed',
      multiplier: 1.5,
    },
  });

  const renderStatesPanel = () => {
    const states = effects.states || {};
    const config = states[activeState] as EffectStateConfig | undefined;
    const isEnabled = config?.enabled || false;

    return (
      <div className="space-y-4">
        {/* State Selector */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
          {[
            { id: 'hover', icon: MousePointer2, label: 'Hover' },
            { id: 'press', icon: Touchpad, label: 'Press' },
            { id: 'focus', icon: Target, label: 'Focus' },
            { id: 'appear', icon: Eye, label: 'Appear' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveState(s.id as 'hover' | 'press' | 'focus' | 'appear')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                activeState === s.id
                  ? 'bg-zinc-800 text-brand-blue shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <s.icon size={14} />
              <span className="text-[10px] font-bold">{s.label}</span>
            </button>
          ))}
        </div>

        {/* State Toggle */}
        <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-zinc-200 capitalize">
              {activeState} State
            </span>
            <p className="text-[10px] text-zinc-500">Enable visual state on {activeState}</p>
          </div>
          <button
            onClick={() => {
              handleStateChange(activeState, {
                enabled: !isEnabled,
                state: config?.state || getInitialState(),
              });
            }}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
              isEnabled
                ? 'bg-brand-blue shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'bg-zinc-800 border border-zinc-700/50'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* State Editor */}
        {isEnabled && (
          <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/30 space-y-4">
            {activeState === 'appear' && (
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-800/50">
                {(() => {
                  const appearConfig = config as EffectStateConfig & {
                    threshold?: number;
                    repeat?: boolean;
                  };
                  return (
                    <>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">
                          Threshold
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={appearConfig.threshold ?? 0.5}
                          onChange={(e) =>
                            handleStateChange(activeState, {
                              ...appearConfig,
                              threshold: parseFloat(e.target.value),
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-300"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">
                          Repeat
                        </span>
                        <button
                          onClick={() =>
                            handleStateChange(activeState, {
                              ...appearConfig,
                              repeat: !appearConfig.repeat,
                            })
                          }
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            appearConfig.repeat
                              ? 'bg-brand-blue border-brand-blue text-white'
                              : 'border-zinc-700'
                          }`}
                        >
                          {appearConfig.repeat && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            <EffectStateEditor
              value={config!.state}
              onChange={(newState) =>
                handleStateChange(activeState, { ...config!, state: newState })
              }
            />
          </div>
        )}
      </div>
    );
  };

  const renderSystemsPanel = () => {
    const systems = effects.systems || {};
    const config = systems[activeSystem];
    const isEnabled = config?.enabled || false;

    return (
      <div className="space-y-4">
        {/* System Selector */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
          {[
            { id: 'loop', icon: Repeat, label: 'Loop' },
            { id: 'ticker', icon: Activity, label: 'Ticker' },
            { id: 'scroll', icon: MousePointer, label: 'Scroll' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSystem(s.id as 'loop' | 'ticker' | 'scroll')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                activeSystem === s.id
                  ? 'bg-zinc-800 text-brand-blue shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <s.icon size={14} />
              <span className="text-[10px] font-bold">{s.label}</span>
            </button>
          ))}
        </div>

        {/* System Toggle */}
        <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-zinc-200 capitalize">
              {activeSystem} System
            </span>
            <p className="text-[10px] text-zinc-500">Enable {activeSystem} animation</p>
          </div>
          <button
            onClick={() => {
              if (activeSystem === 'loop') {
                handleSystemChange('loop', {
                  ...((config as LoopSystem) || getInitialLoop()),
                  enabled: !isEnabled,
                });
              } else if (activeSystem === 'ticker') {
                handleSystemChange('ticker', {
                  ...((config as TickerSystem) || getInitialTicker()),
                  enabled: !isEnabled,
                });
              } else if (activeSystem === 'scroll') {
                handleSystemChange('scroll', {
                  ...((config as ScrollSystem) || getInitialScroll()),
                  enabled: !isEnabled,
                });
              }
            }}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
              isEnabled
                ? 'bg-brand-blue shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'bg-zinc-800 border border-zinc-700/50'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* System Editor */}
        {isEnabled && (
          <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/30">
            {activeSystem === 'loop' && (
              <LoopEditor
                value={config as LoopSystem}
                onChange={(newVal) => handleSystemChange('loop', newVal)}
              />
            )}
            {activeSystem === 'ticker' && (
              <TickerEditor
                value={config as TickerSystem}
                onChange={(newVal) => handleSystemChange('ticker', newVal)}
              />
            )}
            {activeSystem === 'scroll' && (
              <ScrollEditor
                value={config as ScrollSystem}
                onChange={(newVal) => handleSystemChange('scroll', newVal)}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Category Toggle */}
      <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
        <button
          onClick={() => setCategory('states')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${
            category === 'states'
              ? 'bg-zinc-800 text-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          States
        </button>
        <button
          onClick={() => setCategory('systems')}
          className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${
            category === 'systems'
              ? 'bg-zinc-800 text-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Systems
        </button>
      </div>

      {category === 'states' ? renderStatesPanel() : renderSystemsPanel()}
    </div>
  );
};
