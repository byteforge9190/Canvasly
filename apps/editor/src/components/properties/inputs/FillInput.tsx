import React, { useState } from 'react';
import type {
  Fill,
  GradientStop,
  SolidFill,
  LinearGradientFill,
  RadialGradientFill,
  ImageFill,
} from '@canvasly/dsl-schema';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { ColorInput } from './ColorInput';
import { ImageInput } from './PropertyInputs';

interface FillInputProps {
  value: Fill;
  onChange: (value: Fill) => void;
  label?: string;
}

export const FillInput: React.FC<FillInputProps> = ({ value, onChange, label = 'Fill' }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTypeChange = (type: Fill['type']) => {
    switch (type) {
      case 'none':
        onChange({ type: 'none' });
        break;
      case 'solid':
        onChange({ type: 'solid', color: '#ffffff' });
        break;
      case 'linear-gradient':
        onChange({
          type: 'linear-gradient',
          angle: 90,
          stops: [
            { color: '#3b82f6', position: 0 },
            { color: '#8b5cf6', position: 100 },
          ],
        });
        break;
      case 'radial-gradient':
        onChange({
          type: 'radial-gradient',
          shape: 'circle',
          position: 'center',
          stops: [
            { color: '#3b82f6', position: 0 },
            { color: '#8b5cf6', position: 100 },
          ],
        });
        break;
      case 'image':
        onChange({
          type: 'image',
          src: '',
          fit: 'crop',
          position: 'center',
          resolution: 'auto',
        });
        break;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {label}
      </label>

      {/* Fill Type Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronDown
            size={14}
            className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
          />
        </button>

        <select
          value={value.type}
          onChange={(e) => handleTypeChange(e.target.value as Fill['type'])}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
        >
          <option value="none">None</option>
          <option value="solid">Solid Color</option>
          <option value="linear-gradient">Linear Gradient</option>
          <option value="radial-gradient">Radial Gradient</option>
          <option value="image">Image</option>
        </select>
      </div>

      {/* Fill Properties */}
      {isExpanded && value.type !== 'none' && (
        <div className="pl-8 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {value.type === 'solid' && <SolidFillInput value={value} onChange={onChange} />}
          {value.type === 'linear-gradient' && (
            <LinearGradientInput value={value} onChange={onChange} />
          )}
          {value.type === 'radial-gradient' && (
            <RadialGradientInput value={value} onChange={onChange} />
          )}
          {value.type === 'image' && <ImageFillInput value={value} onChange={onChange} />}
        </div>
      )}
    </div>
  );
};

// Solid Fill Input
const SolidFillInput: React.FC<{ value: SolidFill; onChange: (v: Fill) => void }> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <ColorInput
        schema={{
          key: 'fill.color',
          path: 'fill.color',
          domain: 'style',
          label: 'Color',
          type: 'color',
          defaultValue: '#ffffff',
        }}
        value={value.color}
        onChange={(color) => onChange({ ...value, color: color as string })}
      />
    </div>
  );
};

// Linear Gradient Input
const LinearGradientInput: React.FC<{
  value: LinearGradientFill;
  onChange: (v: Fill) => void;
}> = ({ value, onChange }) => {
  const addStop = () => {
    const newStop: GradientStop = {
      color: '#ffffff',
      position: 50,
    };
    onChange({ ...value, stops: [...value.stops, newStop] });
  };

  const removeStop = (index: number) => {
    if (value.stops.length <= 2) return; // Keep at least 2 stops
    const newStops = value.stops.filter((_, i) => i !== index);
    onChange({ ...value, stops: newStops });
  };

  const updateStop = (index: number, updates: Partial<GradientStop>) => {
    const newStops = [...value.stops];
    newStops[index] = { ...newStops[index], ...updates };
    onChange({ ...value, stops: newStops });
  };

  return (
    <div className="space-y-4">
      {/* Angle */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Angle
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={value.angle}
            onChange={(e) => onChange({ ...value, angle: parseInt(e.target.value) })}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
          />
          <span className="text-[11px] font-mono text-zinc-400 w-12 text-right">
            {value.angle}°
          </span>
        </div>
      </div>

      {/* Gradient Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
            Color Stops
          </label>
          <button
            onClick={addStop}
            className="p-1 text-zinc-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded transition-all"
            title="Add stop"
          >
            <Plus size={14} />
          </button>
        </div>

        {value.stops.map((stop, index) => (
          <div key={index} className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Stop {index + 1}
              </span>
              {value.stops.length > 2 && (
                <button
                  onClick={() => removeStop(index)}
                  className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                  title="Remove stop"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            <ColorInput
              schema={{
                key: `fill.stops.${index}.color`,
                path: `fill.stops.${index}.color`,
                domain: 'style',
                label: 'Color',
                type: 'color',
                defaultValue: '#000000',
              }}
              value={stop.color}
              onChange={(color) => updateStop(index, { color: color as string })}
            />

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
                Position
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) => updateStop(index, { position: parseInt(e.target.value) })}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200 font-mono"
                />
                <span className="text-[11px] text-zinc-500 font-medium">%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Radial Gradient Input
const RadialGradientInput: React.FC<{
  value: RadialGradientFill;
  onChange: (v: Fill) => void;
}> = ({ value, onChange }) => {
  const addStop = () => {
    const newStop: GradientStop = { color: '#ffffff', position: 50 };
    onChange({ ...value, stops: [...value.stops, newStop] });
  };

  const removeStop = (index: number) => {
    if (value.stops.length <= 2) return;
    const newStops = value.stops.filter((_, i) => i !== index);
    onChange({ ...value, stops: newStops });
  };

  const updateStop = (index: number, updates: Partial<GradientStop>) => {
    const newStops = [...value.stops];
    newStops[index] = { ...newStops[index], ...updates };
    onChange({ ...value, stops: newStops });
  };

  return (
    <div className="space-y-4">
      {/* Shape */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Shape
        </label>
        <select
          value={value.shape}
          onChange={(e) => onChange({ ...value, shape: e.target.value as 'circle' | 'ellipse' })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200"
        >
          <option value="circle">Circle</option>
          <option value="ellipse">Ellipse</option>
        </select>
      </div>

      {/* Position */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Position
        </label>
        <select
          value={value.position}
          onChange={(e) => onChange({ ...value, position: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200"
        >
          <option value="center">Center</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="top left">Top Left</option>
          <option value="top right">Top Right</option>
          <option value="bottom left">Bottom Left</option>
          <option value="bottom right">Bottom Right</option>
        </select>
      </div>

      {/* Color Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
            Color Stops
          </label>
          <button
            onClick={addStop}
            className="p-1 text-zinc-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded transition-all"
            title="Add stop"
          >
            <Plus size={14} />
          </button>
        </div>

        {value.stops.map((stop, index) => (
          <div key={index} className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Stop {index + 1}
              </span>
              {value.stops.length > 2 && (
                <button
                  onClick={() => removeStop(index)}
                  className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                  title="Remove stop"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            <ColorInput
              schema={{
                key: `fill.stops.${index}.color`,
                path: `fill.stops.${index}.color`,
                domain: 'style',
                label: 'Color',
                type: 'color',
                defaultValue: '#000000',
              }}
              value={stop.color}
              onChange={(color) => updateStop(index, { color: color as string })}
            />

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
                Position
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) => updateStop(index, { position: parseInt(e.target.value) })}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200 font-mono"
                />
                <span className="text-[11px] text-zinc-500 font-medium">%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Image Fill Input
const ImageFillInput: React.FC<{ value: ImageFill; onChange: (v: Fill) => void }> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Image Source - Reuse existing ImageInput component */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Image
        </label>
        <ImageInput
          schema={{
            key: 'fill.src',
            path: 'fill.src',
            domain: 'style',
            label: 'Image',
            type: 'image',
            defaultValue: '',
            ui: { helpText: 'Upload an image or enter a URL' },
          }}
          value={value.src}
          onChange={(src) => onChange({ ...value, src: src as string })}
        />
      </div>

      {/* Alt Text */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Alt Text
        </label>
        <input
          type="text"
          value={value.alt || ''}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder="Describe the image"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200"
        />
        <p className="text-[10px] text-zinc-600 ml-0.5">Important for accessibility</p>
      </div>

      {/* Fit */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Fit
        </label>
        <select
          value={value.fit}
          onChange={(e) => onChange({ ...value, fit: e.target.value as ImageFill['fit'] })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200"
        >
          <option value="fill">Fill - Stretch to fit</option>
          <option value="fit">Fit - Contain within bounds</option>
          <option value="crop">Crop - Cover entire area</option>
          <option value="tile">Tile - Repeat pattern</option>
        </select>
      </div>

      {/* Position */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Position
        </label>
        <select
          value={value.position}
          onChange={(e) => onChange({ ...value, position: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200"
        >
          <option value="center">Center</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="top left">Top Left</option>
          <option value="top right">Top Right</option>
          <option value="bottom left">Bottom Left</option>
          <option value="bottom right">Bottom Right</option>
        </select>
      </div>

      {/* Resolution */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Resolution
        </label>
        <select
          value={value.resolution}
          onChange={(e) =>
            onChange({ ...value, resolution: e.target.value as ImageFill['resolution'] })
          }
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200"
        >
          <option value="auto">Auto</option>
          <option value="small">Small (400px)</option>
          <option value="medium">Medium (800px)</option>
          <option value="large">Large (1200px)</option>
          <option value="original">Original</option>
        </select>
        <p className="text-[10px] text-zinc-600 ml-0.5">Image quality/size optimization</p>
      </div>

      {/* Tint */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Tint (Optional)
        </label>
        <ColorInput
          schema={{
            key: 'fill.tint',
            path: 'fill.tint',
            domain: 'style',
            label: 'Tint Color',
            type: 'color',
            defaultValue: '',
          }}
          value={value.tint || ''}
          onChange={(tint) => onChange({ ...value, tint: tint as string })}
        />
      </div>

      {value.tint && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
            Tint Opacity
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={value.tintOpacity || 0.3}
              onChange={(e) => onChange({ ...value, tintOpacity: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800"
            />
            <span className="text-[11px] font-mono text-zinc-400 w-12 text-right">
              {Math.round((value.tintOpacity || 0.3) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
