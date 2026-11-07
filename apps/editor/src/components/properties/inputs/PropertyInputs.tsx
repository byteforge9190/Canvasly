import React, { useState } from 'react';
import type {
  PropertySchema,
  LinkValue,
  Fill,
  Border,
  PaddingValue,
  Shadow,
  FrameEffects,
} from '@canvasly/dsl-schema';
import { ColorInput } from './ColorInput';
import { AssetDialog } from './AssetDialog';
import { LinkField } from './LinkField';
import { ArrayField } from './ArrayField';
import { IconInput } from './IconInput';
import { FormPickerInput } from './FormPickerInput';
import { FillInput } from './FillInput';
import { BorderInput } from './BorderInput';
import { PaddingInput } from './PaddingInput';
import { ShadowInput } from './ShadowInput';
import { EffectsInput } from './EffectsInput';
import { useEditorStore } from '../../../store/editorStore';

interface BaseInputProps {
  schema: PropertySchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

// Text Input Component
export const TextInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>
      <input
        type="text"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={schema.ui?.placeholder}
        data-testid={`property-input-${schema.key}`}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
      />
      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};

// Number Input Component
export const NumberInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
    onChange(val);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>
      <input
        type="number"
        value={(value as number) || ''}
        onChange={handleChange}
        min={schema.ui?.min}
        max={schema.ui?.max}
        step={schema.ui?.step || 1}
        placeholder={schema.ui?.placeholder}
        data-testid={`property-input-${schema.key}`}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
      />
      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};

// Select/Dropdown Component
export const SelectInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>
      <div className="relative">
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`property-input-${schema.key}`}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all appearance-none cursor-pointer shadow-sm shadow-black/20"
        >
          {schema.ui?.options?.map((option) => (
            <option key={option.value} value={option.value} className="bg-zinc-900">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};

// Toggle/Boolean Input Component
export const ToggleInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  const isChecked = Boolean(value);

  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex-1 mr-4">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-normal">
          {schema.label}
        </label>
        {schema.ui?.helpText && (
          <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">{schema.ui.helpText}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!isChecked)}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
          isChecked
            ? 'bg-brand-blue shadow-[0_0_12px_rgba(59,130,246,0.3)]'
            : 'bg-zinc-800 border border-zinc-700/50'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
            isChecked ? 'translate-x-5.5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};

// Spacing Input Component (for padding, margin, gap)
export const SpacingInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="20px, 1rem, 2em"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
        />
        <div className="flex gap-1.5">
          {['0', '10px', '20px', '40px'].map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className="flex-1 py-1.5 text-[10px] font-bold bg-zinc-800/50 border border-zinc-800 rounded-md text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 transition-all"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};

// Rich Text Input Component (Basic)
export const RichTextInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>
      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shadow-sm shadow-black/20">
        <div className="bg-zinc-900 border-b border-zinc-800 px-2 py-1 flex gap-1">
          <button className="w-7 h-7 flex items-center justify-center text-[11px] font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded-md transition-all">
            B
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-[11px] italic text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded-md transition-all">
            I
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-[11px] underline text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded-md transition-all">
            U
          </button>
        </div>
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={schema.ui?.rows || 4}
          placeholder={schema.ui?.placeholder}
          className="w-full bg-transparent px-3 py-2 text-[13px] text-zinc-200 focus:outline-none resize-none placeholder-zinc-700"
        />
      </div>
      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};

// ... imports

// Image Selector Component
export const ImageInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const siteId = useEditorStore((state) => state.siteId);

  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>

      {typeof value === 'string' && value !== '' && (
        <div className="relative aspect-video bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden group shadow-inner">
          <img src={value as string} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onChange('')}
              className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all border border-zinc-700/50"
        >
          {value ? 'Change URL' : 'Add from URL'}
        </button>
        <button
          onClick={() => setIsAssetDialogOpen(true)}
          className="flex-1 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-3 py-2 rounded-lg text-[13px] font-semibold transition-all border border-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!siteId}
          title={!siteId ? 'Site ID not found' : 'Upload or select image'}
        >
          Choose Image
        </button>
      </div>

      {showUrlInput && (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 transition-all"
        />
      )}

      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}

      {siteId && (
        <AssetDialog
          isOpen={isAssetDialogOpen}
          onClose={() => setIsAssetDialogOpen(false)}
          onSelect={(asset) => onChange(asset.url)}
          siteId={siteId}
        />
      )}
    </div>
  );
};

// Link Picker Component (Legacy - kept for backward compatibility)
export const LinkInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  const [linkType, setLinkType] = useState<'external' | 'internal'>('external');

  // Always use LinkField for the link domain (link.linkTo)
  // For other link fields (like interaction.href), check if it's a LinkValue object
  const shouldUseLinkField =
    schema.domain === 'link' ||
    (value !== undefined && typeof value === 'object' && value !== null && 'type' in value);

  // For LinkValue objects or link domain, use the new LinkField component
  if (shouldUseLinkField) {
    return (
      <LinkField
        schema={schema}
        value={value as LinkValue}
        onChange={(newValue) => onChange(newValue)}
      />
    );
  }

  // For simple string links (legacy), use the old behavior
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>

      <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-2 shadow-sm shadow-black/20">
        <button
          onClick={() => setLinkType('external')}
          className={`flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            linkType === 'external'
              ? 'bg-zinc-800 text-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          External URL
        </button>
        <button
          onClick={() => setLinkType('internal')}
          className={`flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            linkType === 'internal'
              ? 'bg-zinc-800 text-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Internal Page
        </button>
      </div>

      {linkType === 'external' ? (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.ui?.placeholder || 'https://example.com'}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 shadow-sm shadow-black/20"
        />
      ) : (
        <select
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-600 cursor-not-allowed italic shadow-sm shadow-black/20"
          disabled
        >
          <option>Home (Coming Soon)</option>
        </select>
      )}

      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};

// Video Input Component
export const VideoInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  const [showUrlInput, setShowUrlInput] = useState(false);

  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>

      {typeof value === 'string' && value !== '' && (
        <div className="relative aspect-video bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden group shadow-inner">
          <video
            src={value as string}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onChange('')}
              className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all border border-zinc-700/50"
        >
          {value ? 'Change URL' : 'Add from URL'}
        </button>
        <button
          className="flex-1 bg-zinc-900 text-zinc-600 px-3 py-2 rounded-lg text-[13px] font-semibold cursor-not-allowed border border-zinc-800"
          disabled
        >
          Upload (Soon)
        </button>
      </div>

      {showUrlInput && (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.ui?.placeholder || 'https://example.com/video.mp4'}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 shadow-sm shadow-black/20"
        />
      )}

      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};

// Main Property Input Router Component
export const PropertyInput: React.FC<BaseInputProps> = ({ schema, value, onChange }) => {
  switch (schema.type) {
    case 'string':
      return <TextInput schema={schema} value={value} onChange={onChange} />;
    case 'number':
      return <NumberInput schema={schema} value={value} onChange={onChange} />;
    case 'boolean':
      return <ToggleInput schema={schema} value={value} onChange={onChange} />;
    case 'color':
      return <ColorInput schema={schema} value={value} onChange={onChange} />;
    case 'select':
      return <SelectInput schema={schema} value={value} onChange={onChange} />;
    case 'spacing':
      return <SpacingInput schema={schema} value={value} onChange={onChange} />;
    case 'richtext':
      return <RichTextInput schema={schema} value={value} onChange={onChange} />;
    case 'image':
      return <ImageInput schema={schema} value={value} onChange={onChange} />;
    case 'link':
      return <LinkInput schema={schema} value={value} onChange={onChange} />;
    case 'video':
      return <VideoInput schema={schema} value={value} onChange={onChange} />;
    case 'fill':
      return (
        <FillInput
          value={(value as Fill) || { type: 'none' }}
          onChange={onChange}
          label={schema.label}
        />
      );
    case 'border':
      return (
        <BorderInput value={value as Border | undefined} onChange={onChange} label={schema.label} />
      );
    case 'padding':
      return (
        <PaddingInput
          value={value as number | PaddingValue | undefined}
          onChange={onChange}
          label={schema.label}
        />
      );
    case 'shadow':
      return (
        <ShadowInput value={value as Shadow | undefined} onChange={onChange} label={schema.label} />
      );
    case 'array':
      return <ArrayField schema={schema} value={value as unknown[]} onChange={onChange} />;
    case 'icon':
      return <IconInput schema={schema} value={value} onChange={onChange} />;
    case 'form-picker':
      return <FormPickerInput schema={schema} value={value} onChange={onChange} />;
    case 'effects':
      return (
        <EffectsInput
          value={value as FrameEffects | undefined}
          onChange={(newValue) => onChange(newValue)}
          label={schema.label}
        />
      );
    default:
      if (schema.domain === 'effects') {
        return (
          <EffectsInput
            value={value as FrameEffects | undefined}
            onChange={(newValue) => onChange(newValue)}
            label={schema.label}
          />
        );
      }
      return <TextInput schema={schema} value={value} onChange={onChange} />;
  }
};
