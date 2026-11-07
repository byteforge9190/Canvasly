/**
 * aiGenerationStore.ts
 * Zustand store for AI page generation state.
 */
import { create } from 'zustand';
import type { SectionPlan, SectionFailedData } from '../lib/aiPageApi';

export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'cancelled' | 'error';

export interface AIGenerationState {
  // Status
  status: GenerationStatus;
  error: string | null;

  // Plan
  plan: string[];
  totalSections: number;
  completedSections: number;
  currentSectionType: string | null;
  failedSections: SectionFailedData[];

  // Reconnect support
  lastEventId: string | null;
  idempotencyKey: string | null;

  // Cancellation
  abortController: AbortController | null;

  // Actions
  startGeneration: (idempotencyKey: string, abortController: AbortController) => void;
  setPlan: (plan: SectionPlan) => void;
  markSectionStarted: (sectionType: string) => void;
  markSectionComplete: () => void;
  markSectionFailed: (data: SectionFailedData) => void;
  setLastEventId: (id: string) => void;
  complete: () => void;
  cancel: () => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useAIGenerationStore = create<AIGenerationState>()((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  status: 'idle',
  error: null,
  plan: [],
  totalSections: 0,
  completedSections: 0,
  currentSectionType: null,
  failedSections: [],
  lastEventId: null,
  idempotencyKey: null,
  abortController: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  startGeneration: (idempotencyKey, abortController) => {
    set({
      status: 'generating',
      error: null,
      plan: [],
      totalSections: 0,
      completedSections: 0,
      currentSectionType: null,
      failedSections: [],
      lastEventId: null,
      idempotencyKey,
      abortController,
    });
  },

  setPlan: (plan: SectionPlan) => {
    set({
      plan: plan.plan,
      totalSections: plan.total_sections,
    });
  },

  markSectionStarted: (sectionType: string) => {
    set({ currentSectionType: sectionType });
  },

  markSectionComplete: () => {
    set((state) => ({
      completedSections: state.completedSections + 1,
      currentSectionType: null,
    }));
  },

  markSectionFailed: (data: SectionFailedData) => {
    set((state) => ({
      failedSections: [...state.failedSections, data],
    }));
  },

  setLastEventId: (id: string) => {
    set({ lastEventId: id });
  },

  complete: () => {
    set({
      status: 'complete',
      currentSectionType: null,
      abortController: null,
    });
  },

  cancel: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({
      status: 'cancelled',
      currentSectionType: null,
      abortController: null,
    });
  },

  setError: (error: string) => {
    set({
      status: 'error',
      error,
      currentSectionType: null,
      abortController: null,
    });
  },

  reset: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({
      status: 'idle',
      error: null,
      plan: [],
      totalSections: 0,
      completedSections: 0,
      currentSectionType: null,
      failedSections: [],
      lastEventId: null,
      idempotencyKey: null,
      abortController: null,
    });
  },
}));
