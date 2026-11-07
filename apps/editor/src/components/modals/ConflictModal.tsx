/**
 * Conflict Resolution Modal - Shown when optimistic locking detects a version conflict
 */
import React from 'react';
import { AlertTriangle, RefreshCw, Upload } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface ConflictModalProps {
  onReload: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({ onReload }) => {
  const { hasConflict, conflictVersion, resolveConflict } = useEditorStore();

  if (!hasConflict) return null;

  const handleOverwrite = () => {
    resolveConflict('overwrite');
  };

  const handleReload = () => {
    resolveConflict('reload');
    onReload();
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#222] border border-[#444] rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#333] bg-yellow-500/10">
          <div className="p-2 bg-yellow-500/20 rounded-full">
            <AlertTriangle size={24} className="text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Page Modified</h2>
            <p className="text-sm text-gray-400">Version conflict detected (v{conflictVersion})</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-300">
            This page was modified in another session or tab. Your current changes may conflict with
            the newer version.
          </p>

          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333]">
            <p className="text-xs text-gray-500 mb-2">Choose how to proceed:</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>
                <strong className="text-gray-300">Overwrite:</strong> Save your changes and replace
                the server version
              </li>
              <li>
                <strong className="text-gray-300">Reload:</strong> Discard your changes and load the
                latest version
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-[#333] bg-[#1a1a1a]">
          <button
            onClick={handleReload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#333] hover:bg-[#444] text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Reload Latest
          </button>
          <button
            onClick={handleOverwrite}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Upload size={16} />
            Overwrite
          </button>
        </div>
      </div>
    </div>
  );
};
