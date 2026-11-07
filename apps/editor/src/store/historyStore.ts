/**
 * History Store - Patch-based undo/redo system using Immer
 *
 * CRITICAL: Uses Immer patches instead of full state snapshots to prevent
 * memory issues with large page trees.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { enablePatches, produceWithPatches, applyPatches, type Patch } from 'immer';
import type { NormalizedPageState } from '@canvasly/dsl-schema';

// Enable Immer patches globally
enablePatches();

export interface HistoryEntry {
  patches: Patch[];
  inversePatches: Patch[];
  description: string;
  timestamp: number;
}

interface HistoryState {
  // History entries
  entries: HistoryEntry[];
  currentIndex: number;
  maxEntries: number;

  // Dirty state tracking
  isDirty: boolean;
  lastSavedIndex: number;

  // Memory monitoring
  estimatedMemoryUsage: number;

  // Actions
  recordChange: (
    prevState: NormalizedPageState,
    nextState: NormalizedPageState,
  ) => { patches: Patch[]; inversePatches: Patch[] };
  pushEntry: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
  undo: (currentState: NormalizedPageState) => NormalizedPageState | null;
  redo: (currentState: NormalizedPageState) => NormalizedPageState | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  markSaved: () => void;
  getHistoryInfo: () => { total: number; current: number; canUndo: boolean; canRedo: boolean };
}

// Estimate memory usage of patches (rough approximation)
const estimatePatchMemory = (patches: Patch[]): number => {
  return JSON.stringify(patches).length * 2; // UTF-16 chars = 2 bytes each
};

// Compress rapid changes (merge patches within time window)
const COMPRESSION_WINDOW_MS = 500;

export const useHistoryStore = create<HistoryState>()(
  subscribeWithSelector((set, get) => ({
    entries: [],
    currentIndex: -1,
    maxEntries: 50,
    isDirty: false,
    lastSavedIndex: -1,
    estimatedMemoryUsage: 0,

    recordChange: (prevState, nextState) => {
      // Use produceWithPatches to generate patches
      const [, patches, inversePatches] = produceWithPatches(prevState, (draft) => {
        // Copy all properties from nextState to draft
        Object.assign(draft, nextState);
      });

      return { patches, inversePatches };
    },

    pushEntry: (entry) => {
      set((state) => {
        const now = Date.now();
        const newEntry: HistoryEntry = {
          ...entry,
          timestamp: now,
        };

        // Check if we should compress with previous entry
        const lastEntry = state.entries[state.currentIndex];
        if (
          lastEntry &&
          now - lastEntry.timestamp < COMPRESSION_WINDOW_MS &&
          lastEntry.description === newEntry.description
        ) {
          // Merge patches with previous entry
          const mergedEntry: HistoryEntry = {
            patches: [...lastEntry.patches, ...entry.patches],
            inversePatches: [...entry.inversePatches, ...lastEntry.inversePatches],
            description: entry.description,
            timestamp: now,
          };

          const newEntries = [...state.entries];
          newEntries[state.currentIndex] = mergedEntry;

          return {
            entries: newEntries,
            isDirty: true,
            estimatedMemoryUsage:
              state.estimatedMemoryUsage -
              estimatePatchMemory(lastEntry.patches) -
              estimatePatchMemory(lastEntry.inversePatches) +
              estimatePatchMemory(mergedEntry.patches) +
              estimatePatchMemory(mergedEntry.inversePatches),
          };
        }

        // Truncate any redo history (entries after currentIndex)
        const truncatedEntries = state.entries.slice(0, state.currentIndex + 1);

        // Add new entry
        const newEntries = [...truncatedEntries, newEntry];
        let newIndex = newEntries.length - 1;
        let memoryDelta =
          estimatePatchMemory(entry.patches) + estimatePatchMemory(entry.inversePatches);

        // Enforce max entries limit - remove oldest entry if over limit
        let finalEntries = newEntries;
        if (newEntries.length > state.maxEntries) {
          const removed = newEntries[0];
          finalEntries = newEntries.slice(1);
          newIndex--;
          if (removed) {
            memoryDelta -=
              estimatePatchMemory(removed.patches) + estimatePatchMemory(removed.inversePatches);
          }
        }

        return {
          entries: finalEntries,
          currentIndex: newIndex,
          isDirty: true,
          estimatedMemoryUsage: Math.max(0, state.estimatedMemoryUsage + memoryDelta),
        };
      });
    },

    undo: (currentState) => {
      const state = get();
      if (state.currentIndex < 0) return null;

      const entry = state.entries[state.currentIndex];
      if (!entry) return null;

      // Apply inverse patches to get previous state
      const previousState = applyPatches(currentState, entry.inversePatches);

      set({
        currentIndex: state.currentIndex - 1,
        isDirty: state.currentIndex - 1 !== state.lastSavedIndex,
      });

      return previousState;
    },

    redo: (currentState) => {
      const state = get();
      if (state.currentIndex >= state.entries.length - 1) return null;

      const entry = state.entries[state.currentIndex + 1];
      if (!entry) return null;

      // Apply forward patches to get next state
      const nextState = applyPatches(currentState, entry.patches);

      set({
        currentIndex: state.currentIndex + 1,
        isDirty: state.currentIndex + 1 !== state.lastSavedIndex,
      });

      return nextState;
    },

    canUndo: () => get().currentIndex >= 0,
    canRedo: () => get().currentIndex < get().entries.length - 1,

    clearHistory: () =>
      set({
        entries: [],
        currentIndex: -1,
        isDirty: false,
        lastSavedIndex: -1,
        estimatedMemoryUsage: 0,
      }),

    markSaved: () =>
      set((state) => ({
        isDirty: false,
        lastSavedIndex: state.currentIndex,
      })),

    getHistoryInfo: () => {
      const state = get();
      return {
        total: state.entries.length,
        current: state.currentIndex + 1,
        canUndo: state.currentIndex >= 0,
        canRedo: state.currentIndex < state.entries.length - 1,
      };
    },
  })),
);
