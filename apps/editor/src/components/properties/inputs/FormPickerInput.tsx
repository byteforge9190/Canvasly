import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { formsApi } from '../../../lib/api';
import type { PropertySchema } from '@canvasly/dsl-schema';

interface FormPickerInputProps {
  schema: PropertySchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

// Expected format: [DOMAIN]/api/v1/public/forms/:formId/submit
const getFormIdFromUrl = (url: unknown): string => {
  if (typeof url !== 'string' || !url) return '';
  const match = url.match(/\/api\/v1\/public\/forms\/([^/]+)\/submit/);
  return match ? match[1] : '';
};

// Check if the value is an internal form URL or external URL
const isInternalFormUrl = (url: unknown): boolean => {
  if (typeof url !== 'string' || !url) return false;
  return url.includes('/api/v1/public/forms/') && url.includes('/submit');
};

export const FormPickerInput: React.FC<FormPickerInputProps> = ({ schema, value, onChange }) => {
  const siteId = useEditorStore((state) => state.siteId);
  const [forms, setForms] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'form' | 'url'>('form');

  const selectedFormId = getFormIdFromUrl(value);
  const currentValue = typeof value === 'string' ? value : '';

  // Set initial mode based on current value and sync if value changes from outside
  useEffect(() => {
    if (currentValue) {
      setInputMode(isInternalFormUrl(currentValue) ? 'form' : 'url');
    }
  }, [currentValue]);

  const handleFormChange = (newFormId: string) => {
    if (!newFormId) {
      onChange('');
    } else {
      // Construct the full URL format expected by the publisher
      const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      onChange(`${apiUrl}/api/v1/public/forms/${newFormId}/submit`);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    onChange(newUrl);
  };

  useEffect(() => {
    const fetchForms = async () => {
      if (!siteId) return;
      try {
        setLoading(true);
        const data = await formsApi.list(siteId);
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load forms:', err);
        setError('Failed to load forms');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [siteId]);

  if (!siteId) {
    return (
      <div className="text-[10px] text-gray-500 italic p-1">
        Site ID missing. Cannot load forms.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">
        {schema.label}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-2 shadow-sm shadow-black/20">
        <button
          onClick={() => setInputMode('form')}
          className={`flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            inputMode === 'form'
              ? 'bg-zinc-800 text-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Internal Form
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
            inputMode === 'url'
              ? 'bg-zinc-800 text-zinc-200 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          External URL
        </button>
      </div>

      {inputMode === 'form' ? (
        <>
          {loading ? (
            <div className="text-[10px] text-gray-500 animate-pulse p-1">Loading forms...</div>
          ) : error ? (
            <div className="text-[10px] text-red-500 p-1">Error: {error}</div>
          ) : (
            <>
              <select
                value={selectedFormId}
                onChange={(e) => handleFormChange(e.target.value)}
                data-testid={`property-input-${schema.key}`}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all appearance-none cursor-pointer shadow-sm shadow-black/20"
              >
                <option value="">Select a form...</option>
                {Array.isArray(forms) &&
                  forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
              </select>
              {forms.length === 0 && (
                <p className="text-[10px] text-yellow-500 mt-1">
                  No forms found. Create one in the dashboard first.
                </p>
              )}
            </>
          )}
        </>
      ) : (
        <input
          type="text"
          value={isInternalFormUrl(currentValue) ? '' : currentValue}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/api/submit"
          data-testid={`property-input-${schema.key}`}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm shadow-black/20"
        />
      )}

      {schema.ui?.helpText && (
        <p className="text-[10px] text-zinc-600 mt-1.5 ml-0.5 leading-relaxed">
          {schema.ui.helpText}
        </p>
      )}
    </div>
  );
};
