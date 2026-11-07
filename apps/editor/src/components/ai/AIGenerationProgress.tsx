import React from 'react';
import { Check, X, AlertTriangle, Sparkles } from 'lucide-react';
import type { SectionFailedData } from '../../lib/aiPageApi';

interface AIGenerationProgressProps {
  plan: string[];
  completedSections: number;
  totalSections: number;
  currentSectionType: string | null;
  failedSections: SectionFailedData[];
  onCancel: () => void;
  isComplete?: boolean;
}

function formatSectionName(sectionType: string): string {
  return sectionType
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const AIGenerationProgress: React.FC<AIGenerationProgressProps> = ({
  plan,
  completedSections,
  totalSections,
  currentSectionType,
  failedSections,
  onCancel,
  isComplete = false,
}) => {
  const progressPercent =
    totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  const failedTypes = new Set(failedSections.map((f) => f.type));

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Check size={16} className="text-emerald-400" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-brand-blue/20" />
              <div className="absolute inset-0 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
              <Sparkles size={12} className="text-brand-blue animate-pulse" />
            </div>
          )}
          <span className="text-[14px] font-bold bg-linear-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            {isComplete ? 'Assembly Complete' : 'Synthesizing Page Structure'}
          </span>
        </div>
        {!isComplete && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Cancel generation"
          >
            <X size={12} />
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2 relative">
        <div className="absolute -top-6 right-0">
          <span className="text-[11px] font-mono font-medium text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            {progressPercent}%
          </span>
        </div>
        <div className="h-2 bg-zinc-900/80 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
          <div
            className="h-full bg-linear-to-r from-blue-600 via-brand-blue to-cyan-400 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Lead Glow */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-r from-transparent to-white/40 mix-blend-overlay" />
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
            {completedSections} / {totalSections} Components Rendered
          </span>
        </div>
      </div>

      {/* Section checklist */}
      {plan.length > 0 && (
        <div className="flex flex-col gap-2 mt-4 max-h-72 overflow-y-auto custom-scrollbar pr-2">
          {plan.map((sectionType, idx) => {
            const isDone = idx < completedSections;
            const isActive = sectionType === currentSectionType && !isDone;
            const isFailed = failedTypes.has(sectionType);

            // Generate deterministic varying widths for skeletons based on index
            const skeletonWidths = [
              [40, 60],
              [30, 70, 40],
              [80, 50],
              [50, 40, 30],
            ][idx % 4];

            return (
              <div
                key={`${sectionType}-${idx}`}
                className={`flex flex-col gap-2 px-3 py-3 rounded-xl transition-all duration-500 border relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)]'
                    : isDone && !isFailed
                      ? 'bg-zinc-900 border-zinc-800/50'
                      : isDone && isFailed
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-zinc-900/30 border-transparent opacity-50'
                }`}
                style={{
                  animation: `slideIn 0.4s ease-out forwards`,
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                  transform: 'translateX(-10px)',
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                )}

                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center w-5 h-5">
                    {isDone && !isFailed ? (
                      <Check
                        size={14}
                        className="text-emerald-500 drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]"
                      />
                    ) : isDone && isFailed ? (
                      <AlertTriangle size={14} className="text-amber-500" />
                    ) : isActive ? (
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-ping" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    )}
                  </div>

                  <span
                    className={`text-[12px] tracking-wide ${
                      isActive
                        ? 'text-white font-semibold'
                        : isDone
                          ? 'text-zinc-300 font-medium'
                          : 'text-zinc-600 font-medium'
                    }`}
                  >
                    {formatSectionName(sectionType)}
                  </span>
                </div>

                {/* Intelligent structural Skeleton for active sections */}
                {isActive && (
                  <div className="pl-8 flex flex-col gap-1.5 pb-1">
                    <div className="h-1 bg-linear-to-r from-blue-500/40 to-cyan-400/10 rounded-full w-full mb-1" />
                    <div className="flex gap-2">
                      {skeletonWidths.map((w, i) => (
                        <div
                          key={i}
                          className="h-8 bg-zinc-800 rounded-md relative overflow-hidden"
                          style={{ width: `${w}%` }}
                        >
                          <div
                            className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-zinc-700/30 to-transparent"
                            style={{ animationDelay: `${i * 200}ms` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Failed section warnings */}
      {failedSections.length > 0 && (
        <div className="flex flex-col gap-1">
          {failedSections.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg"
            >
              <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[11px] text-amber-400">
                <strong>{formatSectionName(f.type)}</strong> section skipped
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
