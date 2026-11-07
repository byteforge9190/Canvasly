import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import type { PropertySchema } from '@canvasly/dsl-schema';
import { IconPickerDialog } from './IconPickerDialog';

interface IconInputProps {
  schema: PropertySchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

export const IconInput: React.FC<IconInputProps> = ({ schema, value, onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const iconName = (value as string) || '';

  const renderIcon = (name: string) => {
    if (!name) return null;
    try {
      const icons = LucideIcons as Record<string, unknown>;
      const IconComponent = icons[name];
      // Check if it's a valid React component (object with $$typeof or function)
      if (
        IconComponent &&
        (typeof IconComponent === 'function' ||
          (typeof IconComponent === 'object' && IconComponent !== null))
      ) {
        const Icon = IconComponent as React.ComponentType<{
          size?: number;
          strokeWidth?: number;
        }>;
        return <Icon size={24} strokeWidth={2} />;
      }
    } catch (e) {
      console.error(`Failed to render icon: ${name}`, e);
    }
    return <span className="text-xs text-gray-500">{name}</span>;
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>

      {iconName && (
        <div
          className="relative bg-zinc-950 rounded-xl border border-zinc-800 p-6 flex flex-col items-center justify-center group shadow-inner"
          style={{ minHeight: '100px' }}
        >
          <div className="text-zinc-200 group-hover:scale-110 transition-transform duration-300">
            {renderIcon(iconName)}
          </div>
          <div className="mt-2 text-[10px] font-mono text-zinc-600 truncate max-w-full italic">
            {iconName}
          </div>

          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-all border border-red-500/20 shadow-sm"
          >
            REMOVE
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex-1 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-3 py-2 rounded-lg text-[13px] font-semibold transition-all border border-brand-blue/20"
        >
          {iconName ? 'Change Icon' : 'Choose Icon'}
        </button>
        <input
          type="text"
          value={iconName}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.ui?.placeholder || 'Star, Heart...'}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 transition-all shadow-sm"
        />
      </div>

      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}

      <IconPickerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelect={(icon) => onChange(icon)}
        currentIcon={iconName}
      />
    </div>
  );
};
