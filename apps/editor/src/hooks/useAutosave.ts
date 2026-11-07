/**
 * Autosave Hook - Automatically saves page state with debouncing
 *
 * Features:
 * - Debounced saves to prevent excessive API calls
 * - Dirty state tracking
 * - Conflict detection on save
 * - Save status indicators
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useHistoryStore } from '../store/historyStore';

interface UseAutosaveOptions {
  /** Debounce delay in milliseconds (default: 2000) */
  delay?: number;
  /** Whether autosave is enabled (default: true) */
  enabled?: boolean;
  /** Function to save page to server */
  savePage?: (
    content: unknown,
    version: number,
  ) => Promise<{ version: number } | { conflict: true; version: number }>;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

export const useAutosave = (options: UseAutosaveOptions = {}) => {
  const { delay = 2000, enabled = true, savePage } = options;

  const { pageState, pageVersion, setConflict, markSynced } = useEditorStore();
  const { isDirty, markSaved } = useHistoryStore();

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousStateRef = useRef<string | null>(null);

  // Default save function (mock)
  const defaultSavePage = useCallback(async (): Promise<
    { version: number } | { conflict: true; version: number }
  > => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation:
    // const response = await fetch(`/api/pages/${pageId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content, expectedVersion: version }),
    // });
    // if (response.status === 409) {
    //   const data = await response.json();
    //   return { conflict: true, version: data.currentVersion };
    // }
    // return await response.json();

    // Mock: always succeed with incremented version
    return { version: pageVersion + 1 };
  }, [pageVersion]);

  // Perform save
  const performSave = useCallback(async () => {
    if (!pageState || !isDirty) return;

    const stateString = JSON.stringify(pageState);

    // Skip if state hasn't actually changed
    if (stateString === previousStateRef.current) {
      return;
    }

    setStatus('saving');

    try {
      const saver = savePage || defaultSavePage;
      const result = await saver(pageState, pageVersion);

      if ('conflict' in result && result.conflict) {
        setStatus('conflict');
        setConflict(result.version);
      } else {
        setStatus('saved');
        setLastSaved(new Date());
        markSynced(result.version);
        markSaved();
        previousStateRef.current = stateString;

        // Reset to idle after showing "saved" briefly
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('[Autosave] Save failed:', error);
      setStatus('error');

      // Reset to idle after showing error briefly
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [
    pageState,
    pageVersion,
    isDirty,
    savePage,
    defaultSavePage,
    setConflict,
    markSynced,
    markSaved,
  ]);

  // Debounced save trigger
  useEffect(() => {
    if (!enabled || !isDirty) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(performSave, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isDirty, delay, performSave]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave();
  }, [performSave]);

  // Save on page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, isDirty]);

  return {
    status,
    isDirty,
    lastSaved,
    saveNow,
  };
};
