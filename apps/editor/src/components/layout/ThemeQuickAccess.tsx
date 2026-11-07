import React, { useState } from 'react';
import { Palette, ExternalLink } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeQuickAccess: React.FC = () => {
  const { colors, isLoading } = useTheme();
  const [showPreview, setShowPreview] = useState(false);

  const handleOpenThemeEditor = () => {
    // Get siteId from URL params
    const params = new URLSearchParams(window.location.search);
    const siteId = params.get('siteId');

    if (siteId) {
      console.log('Theme editor is available in production mode only');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#333] transition-colors"
        title="Theme Colors"
      >
        <Palette size={18} />
      </button>

      {showPreview && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowPreview(false)} />

          {/* Preview Panel */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#222] border border-[#333] rounded-lg shadow-xl z-50 p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Theme Colors</h3>
              <button
                onClick={handleOpenThemeEditor}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Edit Theme
                <ExternalLink size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {/* Primary Colors */}
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Brand</div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <span className="text-[9px] text-gray-400">Primary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.secondary }}
                    />
                    <span className="text-[9px] text-gray-400">Secondary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.accent }}
                    />
                    <span className="text-[9px] text-gray-400">Accent</span>
                  </div>
                </div>
              </div>

              {/* Semantic Colors */}
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">
                  Semantic
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.success }}
                    />
                    <span className="text-[9px] text-gray-400">Success</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.error }}
                    />
                    <span className="text-[9px] text-gray-400">Error</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.warning }}
                    />
                    <span className="text-[9px] text-gray-400">Warning</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.info }}
                    />
                    <span className="text-[9px] text-gray-400">Info</span>
                  </div>
                </div>
              </div>

              {/* Background Colors */}
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">
                  Background
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.background }}
                    />
                    <span className="text-[9px] text-gray-400">Page</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.surface }}
                    />
                    <span className="text-[9px] text-gray-400">Surface</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded border border-[#444]"
                      style={{ backgroundColor: colors.text }}
                    />
                    <span className="text-[9px] text-gray-400">Text</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
