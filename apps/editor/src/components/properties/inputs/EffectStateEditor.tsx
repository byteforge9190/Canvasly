import React from 'react';
import type {
  EffectState,
  Transform2D,
  Transform3D,
  SkewTransform,
  Fill,
  Shadow,
} from '@canvasly/dsl-schema';
import { TransitionEditor } from './TransitionEditor';
import { FillInput } from './FillInput';
import { ShadowInput } from './ShadowInput';

interface EffectStateEditorProps {
  value: EffectState;
  onChange: (value: EffectState) => void;
}

export const EffectStateEditor: React.FC<EffectStateEditorProps> = ({ value, onChange }) => {
  const updateProp = <K extends keyof EffectState>(prop: K, val: EffectState[K]) => {
    onChange({ ...value, [prop]: val });
  };

  const rotate = value.rotate || { rotate: 0 };
  const is3d = !('rotate' in rotate);

  const toggle3d = () => {
    if (is3d) {
      const r3d = rotate as Transform3D;
      updateProp('rotate', { rotate: r3d.rotateZ || 0 });
    } else {
      const r2d = rotate as Transform2D;
      updateProp('rotate', {
        rotateX: 0,
        rotateY: 0,
        rotateZ: r2d.rotate || 0,
      });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Opacity */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-zinc-400">Opacity</span>
          <span className="text-zinc-500">{Math.round((value.opacity ?? 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value.opacity ?? 1}
          onChange={(e) => updateProp('opacity', parseFloat(e.target.value))}
          className="w-full accent-brand-blue"
        />
      </div>

      {/* Scale */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-zinc-400">Scale</span>
          <span className="text-zinc-500">{(value.scale ?? 1).toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={value.scale ?? 1}
          onChange={(e) => updateProp('scale', parseFloat(e.target.value))}
          className="w-full accent-brand-blue"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">Rotation</span>
          <button
            onClick={toggle3d}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
              is3d ? 'bg-brand-blue/10 text-brand-blue' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {is3d ? '3D' : '2D'}
          </button>
        </div>

        {!is3d ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Z-Axis</span>
              <span className="text-zinc-500">{(rotate as Transform2D).rotate || 0}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={(rotate as Transform2D).rotate || 0}
              onChange={(e) => updateProp('rotate', { rotate: parseInt(e.target.value) })}
              className="w-full accent-brand-blue"
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-600 uppercase font-bold text-center block">
                X
              </span>
              <input
                type="number"
                value={(rotate as Transform3D).rotateX || 0}
                onChange={(e) =>
                  updateProp('rotate', {
                    ...(rotate as Transform3D),
                    rotateX: parseInt(e.target.value),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-zinc-300 text-center"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-600 uppercase font-bold text-center block">
                Y
              </span>
              <input
                type="number"
                value={(rotate as Transform3D).rotateY || 0}
                onChange={(e) =>
                  updateProp('rotate', {
                    ...(rotate as Transform3D),
                    rotateY: parseInt(e.target.value),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-zinc-300 text-center"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-600 uppercase font-bold text-center block">
                Z
              </span>
              <input
                type="number"
                value={(rotate as Transform3D).rotateZ || 0}
                onChange={(e) =>
                  updateProp('rotate', {
                    ...(rotate as Transform3D),
                    rotateZ: parseInt(e.target.value),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-zinc-300 text-center"
              />
            </div>
          </div>
        )}
      </div>

      {/* Skew */}
      <div className="space-y-3">
        <span className="text-[11px] text-zinc-400 block">Skew</span>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-600">X-Axis</span>
              <span className="text-zinc-500">{value.skew?.skewX || 0}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              value={value.skew?.skewX || 0}
              onChange={(e) =>
                updateProp('skew', {
                  ...(value.skew || {}),
                  skewX: parseInt(e.target.value),
                } as SkewTransform)
              }
              className="w-full accent-brand-blue"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-600">Y-Axis</span>
              <span className="text-zinc-500">{value.skew?.skewY || 0}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              value={value.skew?.skewY || 0}
              onChange={(e) =>
                updateProp('skew', {
                  ...(value.skew || {}),
                  skewY: parseInt(e.target.value),
                } as SkewTransform)
              }
              className="w-full accent-brand-blue"
            />
          </div>
        </div>
      </div>

      {/* Fill (Background) */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-zinc-400 block">Fill</span>
        <FillInput
          value={value.fill || { type: 'none' }}
          onChange={(fill) => updateProp('fill', fill as Fill)}
        />
      </div>

      {/* Shadow */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-zinc-400 block">Shadow</span>
        <ShadowInput
          value={value.shadow as Shadow | undefined}
          onChange={(shadow) => updateProp('shadow', shadow as Shadow)}
          label=""
        />
      </div>

      {/* Transition */}
      <TransitionEditor
        value={value.transition}
        onChange={(transition) => updateProp('transition', transition)}
      />
    </div>
  );
};
