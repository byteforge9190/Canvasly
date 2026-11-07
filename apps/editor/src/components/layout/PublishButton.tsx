import { CloudCheckIcon } from 'lucide-react';
import React from 'react';

interface PublishButtonProps {
  className?: string;
}

export const PublishButton: React.FC<PublishButtonProps> = ({ className = '' }) => {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm font-semibold transition-all border border-zinc-700 cursor-not-allowed ${className}`}
      title="Publishing is not available in local mode"
      disabled
    >
      <CloudCheckIcon className="w-4 h-4" />
      <span>Publish</span>
    </button>
  );
};
