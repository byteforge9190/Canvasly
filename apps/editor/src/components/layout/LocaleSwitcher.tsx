import React from 'react';
import { Globe } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { Locale } from '@canvasly/dsl-schema';

export const LocaleSwitcher: React.FC = () => {
  const { activeLocale, defaultLocale, supportedLocales, setActiveLocale } = useEditorStore();

  const locales =
    supportedLocales && supportedLocales.length > 0 ? supportedLocales : [defaultLocale];

  return (
    <div className="flex items-center gap-2 bg-zinc-950/50 rounded-lg px-2 py-1 border border-zinc-800/50">
      <Globe size={14} className="text-zinc-500" />
      <select
        value={activeLocale}
        onChange={(e) => setActiveLocale(e.target.value as Locale)}
        className="bg-transparent text-[11px] font-medium text-zinc-300 outline-none border-none cursor-pointer hover:text-white"
        title="Switch Language context"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="bg-zinc-900 text-zinc-300">
            {new Intl.DisplayNames(['en'], { type: 'language' }).of(loc)}
            {loc === defaultLocale ? ' (Default)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
