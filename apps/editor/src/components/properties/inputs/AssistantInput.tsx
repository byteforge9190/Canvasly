import React from 'react';
import type { AssistantDomain } from '@canvasly/dsl-schema';
import { ColorInput } from './ColorInput';

interface AssistantInputProps {
  value: AssistantDomain | undefined;
  onChange: (value: AssistantDomain) => void;
}

export const AssistantInput: React.FC<AssistantInputProps> = ({ value, onChange }) => {
  const currentValue: AssistantDomain = value || {
    accentColor: '#3b82f6',
    assistantBubbleColor: '#f3f4f6',
    userBubbleColor: '#3b82f6',
    headerTitle: 'Ask us anything',
    inputPlaceholder: 'Type a message...',
    toggleIcon: 'MessageCircle',
    toggleIconSize: 28,
    toggleButtonColor: '#3b82f6',
    toggleIconColor: '#ffffff',
  };

  const handleChange = (field: keyof AssistantDomain, newValue: string | number) => {
    onChange({
      ...currentValue,
      [field]: newValue,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Header Title
        </label>
        <input
          type="text"
          value={currentValue.headerTitle || ''}
          onChange={(e) => handleChange('headerTitle', e.target.value)}
          placeholder="Ask us anything"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Input Placeholder
        </label>
        <input
          type="text"
          value={currentValue.inputPlaceholder || ''}
          onChange={(e) => handleChange('inputPlaceholder', e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Accent Color
        </label>
        <ColorInput
          schema={{
            key: 'accentColor',
            label: 'Accent Color',
            type: 'color',
            defaultValue: '#3b82f6',
          }}
          value={currentValue.accentColor || '#3b82f6'}
          onChange={(newValue) => handleChange('accentColor', newValue as string)}
        />
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          Primary color for buttons and user messages
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Assistant Bubble Color
        </label>
        <ColorInput
          schema={{
            key: 'assistantBubbleColor',
            label: 'Assistant Bubble',
            type: 'color',
            defaultValue: '#f3f4f6',
          }}
          value={currentValue.assistantBubbleColor || '#f3f4f6'}
          onChange={(newValue) => handleChange('assistantBubbleColor', newValue as string)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          User Bubble Color
        </label>
        <ColorInput
          schema={{
            key: 'userBubbleColor',
            label: 'User Bubble',
            type: 'color',
            defaultValue: '#3b82f6',
          }}
          value={currentValue.userBubbleColor || '#3b82f6'}
          onChange={(newValue) => handleChange('userBubbleColor', newValue as string)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
          Font Family
        </label>
        <input
          type="text"
          value={currentValue.fontFamily || ''}
          onChange={(e) => handleChange('fontFamily', e.target.value)}
          placeholder="inherit"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
        />
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          Leave empty to inherit from site theme
        </p>
      </div>

      <div className="pt-4 border-t border-zinc-800/50 mt-4">
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
          Toggle Button Appearance
        </label>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
              Toggle Icon
            </label>
            <input
              type="text"
              value={currentValue.toggleIcon || 'MessageCircle'}
              onChange={(e) => handleChange('toggleIcon', e.target.value)}
              placeholder="Lucide Icon (e.g. MessageCircle)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
              Icon Size (px)
            </label>
            <input
              type="number"
              value={currentValue.toggleIconSize || 28}
              onChange={(e) => handleChange('toggleIconSize', parseInt(e.target.value) || 28)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
              Button Color
            </label>
            <ColorInput
              schema={{
                key: 'toggleButtonColor',
                label: 'Toggle Button',
                type: 'color',
                defaultValue: '#3b82f6',
              }}
              value={currentValue.toggleButtonColor || currentValue.accentColor || '#3b82f6'}
              onChange={(newValue) => handleChange('toggleButtonColor', newValue as string)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
              Icon Color
            </label>
            <ColorInput
              schema={{
                key: 'toggleIconColor',
                label: 'Toggle Icon',
                type: 'color',
                defaultValue: '#ffffff',
              }}
              value={currentValue.toggleIconColor || '#ffffff'}
              onChange={(newValue) => handleChange('toggleIconColor', newValue as string)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
