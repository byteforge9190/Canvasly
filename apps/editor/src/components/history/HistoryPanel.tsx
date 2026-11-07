/**
 * History Panel - Visual display of undo/redo history with action descriptions
 */
import React from 'react';
import { History, Undo2, Redo2, Trash2, Clock, HardDrive } from 'lucide-react';
import { useHistoryStore } from '../../store/historyStore';

interface HistoryPanelProps {
  onUndo: () => void;
  onRedo: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onUndo, onRedo }) => {
  const { entries, currentIndex, isDirty, estimatedMemoryUsage, clearHistory, canUndo, canRedo } =
    useHistoryStore();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatMemory = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/10">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700/50">
              <History size={15} className="text-zinc-400" />
            </div>
            <div>
              <span className="font-bold text-[13px] text-zinc-200">History</span>
              {isDirty && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-bold rounded-md border border-amber-500/20 uppercase tracking-wider">
                  Unsaved
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo()}
              className={`p-2 rounded-xl transition-all ${
                canUndo()
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 shadow-sm'
                  : 'text-zinc-700 cursor-not-allowed opacity-50'
              }`}
              title="Undo (⌘Z)"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo()}
              className={`p-2 rounded-xl transition-all ${
                canRedo()
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 shadow-sm'
                  : 'text-zinc-700 cursor-not-allowed opacity-50'
              }`}
              title="Redo (⌘⇧Z)"
            >
              <Redo2 size={14} />
            </button>
          </div>
        </div>

        {/* Memory usage indicator */}
        <div className="flex items-center gap-3 px-1 py-1 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
            <HardDrive size={10} className="text-zinc-600" />
            <span>{formatMemory(estimatedMemoryUsage)}</span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
            <Clock size={10} className="text-zinc-600" />
            <span>
              {currentIndex + 1} / {entries.length} actions
            </span>
          </div>
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700/30">
              <History size={24} className="opacity-40" />
            </div>
            <p className="text-[13px] font-bold text-zinc-400">No history yet</p>
            <p className="text-[11px] font-medium mt-1 leading-relaxed opacity-60">
              Your edits will appear here, allowing you to travel through time.
            </p>
          </div>
        ) : (
          <div className="py-2">
            {/* Current state indicator for Redo */}
            {currentIndex < entries.length - 1 && (
              <div className="mx-3 mt-1 mb-3 px-3 py-1.5 bg-brand-blue/5 border border-brand-blue/10 rounded-lg">
                <p className="text-[9px] font-bold text-brand-blue/70 uppercase tracking-widest text-center">
                  Redo available ({entries.length - 1 - currentIndex} steps)
                </p>
              </div>
            )}

            {entries
              .slice()
              .reverse()
              .map((entry, reversedIndex) => {
                const actualIndex = entries.length - 1 - reversedIndex;
                const isCurrent = actualIndex === currentIndex;
                const isFuture = actualIndex > currentIndex;

                return (
                  <div
                    key={entry.timestamp}
                    onClick={() => {
                      const diff = actualIndex - currentIndex;
                      if (diff > 0) {
                        for (let i = 0; i < diff; i++) onRedo();
                      } else if (diff < 0) {
                        for (let i = 0; i < -diff; i++) onUndo();
                      }
                    }}
                    className={`
                      mx-2 px-3 py-2 rounded-xl transition-all cursor-pointer mb-1 group
                      ${isCurrent ? 'bg-zinc-800 border border-zinc-700/50 shadow-sm' : 'hover:bg-zinc-800/40 border border-transparent'}
                      ${isFuture ? 'opacity-40' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[12px] font-bold truncate leading-snug ${isCurrent ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'}`}
                        >
                          {entry.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-medium text-zinc-600">
                          <Clock size={10} />
                          <span>{formatTime(entry.timestamp)}</span>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-black rounded border border-brand-blue/20 uppercase tracking-tighter shrink-0 mt-0.5">
                          NOW
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Initial state */}
            <div
              className={`
                mx-2 px-3 py-3 rounded-xl transition-all border
                ${currentIndex === -1 ? 'bg-zinc-800 border-zinc-700/50' : 'border-transparent text-zinc-600'}
              `}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${currentIndex === -1 ? 'bg-brand-blue animate-pulse' : 'bg-zinc-700'}`}
                />
                <p
                  className={`text-[11px] font-bold uppercase tracking-widest ${currentIndex === -1 ? 'text-zinc-200' : 'text-zinc-500'}`}
                >
                  Initial state
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/20">
          <button
            onClick={clearHistory}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20"
          >
            <Trash2 size={13} />
            Purge History
          </button>
        </div>
      )}
    </div>
  );
};
