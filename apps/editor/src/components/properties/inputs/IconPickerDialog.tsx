import React, { useState, useMemo } from 'react';
import { X, Check, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface IconPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

const POPULAR_ICONS = [
  'Star',
  'Heart',
  'Home',
  'User',
  'Mail',
  'Phone',
  'MapPin',
  'Calendar',
  'Clock',
  'Search',
  'Settings',
  'Menu',
  'X',
  'Check',
  'ChevronRight',
  'ChevronLeft',
  'ChevronDown',
  'ChevronUp',
  'ArrowRight',
  'ArrowLeft',
  'ArrowUp',
  'ArrowDown',
  'Plus',
  'Minus',
  'Edit',
  'Trash2',
  'Download',
  'Upload',
  'Share2',
  'Copy',
  'ExternalLink',
  'Link',
  'Image',
  'Video',
  'Music',
  'File',
  'Folder',
  'Save',
  'Send',
  'MessageCircle',
  'Bell',
  'AlertCircle',
  'Info',
  'HelpCircle',
  'CheckCircle',
  'XCircle',
  'Eye',
  'EyeOff',
  'Lock',
  'Unlock',
  'ShoppingCart',
  'CreditCard',
  'DollarSign',
  'Gift',
  'Tag',
  'Bookmark',
  'ThumbsUp',
  'ThumbsDown',
  'Smile',
  'Frown',
  'Zap',
  'TrendingUp',
  'TrendingDown',
  'BarChart',
  'PieChart',
  'Activity',
  'Award',
  'Target',
  'Flag',
  'Globe',
  'Wifi',
  'Bluetooth',
  'Battery',
  'Power',
  'Sun',
  'Moon',
  'Cloud',
  'CloudRain',
  'Umbrella',
  'Coffee',
  'Briefcase',
  'Package',
  'Truck',
  'Plane',
  'Car',
  'Bike',
  'Camera',
  'Film',
  'Mic',
  'Headphones',
  'Monitor',
  'Smartphone',
  'Tablet',
  'Laptop',
  'Printer',
  'Database',
  'Server',
  'Code',
  'Terminal',
  'GitBranch',
  'Github',
  'Twitter',
  'Facebook',
  'Instagram',
  'Linkedin',
  'Youtube',
];

export function IconPickerDialog({
  isOpen,
  onClose,
  onSelect,
  currentIcon,
}: IconPickerDialogProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(currentIcon || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Debug: Log available icons on mount
  React.useEffect(() => {
    if (isOpen) {
      const icons = LucideIcons as Record<string, unknown>;
      console.log('Total Lucide icons available:', Object.keys(icons).length);
      console.log('Sample icons:', Object.keys(icons).slice(0, 10));
      console.log('Star icon exists:', !!icons['Star']);
      console.log('Star icon type:', typeof icons['Star']);
    }
  }, [isOpen]);

  const filteredIcons = useMemo(() => {
    if (!searchQuery) return POPULAR_ICONS;
    const query = searchQuery.toLowerCase();
    return POPULAR_ICONS.filter((icon) => icon.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleSelect = () => {
    if (selectedIcon) {
      onSelect(selectedIcon);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col text-zinc-200 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-zinc-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-blue/10 border border-brand-blue/20">
              <Search className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight">Select Icon</h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                Search and choose from thousands of Lucide icons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[13px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-zinc-900/30">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <Search className="w-6 h-6 text-zinc-700" />
              </div>
              <p className="text-[13px] text-zinc-500 font-medium">
                No icons found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5">
              {filteredIcons.map((iconName) => {
                const icons = LucideIcons as Record<string, unknown>;
                const IconComponent = icons[iconName];
                const isValidIcon =
                  IconComponent &&
                  (typeof IconComponent === 'function' ||
                    (typeof IconComponent === 'object' && IconComponent !== null));

                const Icon = (
                  isValidIcon ? IconComponent : LucideIcons.CircleHelp
                ) as React.ComponentType<{
                  size?: number;
                  strokeWidth?: number;
                }>;

                return (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className={`relative aspect-square rounded-xl border flex items-center justify-center transition-all hover:bg-zinc-800 group ${
                      selectedIcon === iconName
                        ? 'border-brand-blue bg-brand-blue/10 ring-4 ring-brand-blue/10'
                        : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                    }`}
                    title={iconName}
                  >
                    <div
                      className={`text-zinc-400 group-hover:text-zinc-100 group-hover:scale-110 transition-all ${
                        selectedIcon === iconName ? 'text-brand-blue' : ''
                      }`}
                    >
                      <Icon size={20} strokeWidth={2} />
                    </div>

                    {selectedIcon === iconName && (
                      <div className="absolute -top-1 -right-1 bg-brand-blue text-white p-0.5 rounded-full shadow-lg ring-1 ring-white/20">
                        <Check className="w-2.5 h-2.5 stroke-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-zinc-800/50 bg-zinc-950/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-[13px] font-semibold transition-all border border-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedIcon}
            className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-brand-blue/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Select Icon
          </button>
        </div>
      </div>
    </div>
  );
}
