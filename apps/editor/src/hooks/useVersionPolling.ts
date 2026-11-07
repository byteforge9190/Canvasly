/**
 * Version Polling Hook - Detects stale tabs by polling for version changes
 *
 * This hook periodically checks if the page version on the server has changed,
 * and triggers a conflict state if a newer version is detected.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';

interface UseVersionPollingOptions {
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
  /** Function to fetch current version from server */
  fetchVersion?: () => Promise<number>;
}

export const useVersionPolling = (options: UseVersionPollingOptions = {}) => {
  const { interval = 30000, enabled = true, fetchVersion } = options;

  const { pageVersion, setConflict, hasConflict } = useEditorStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCheckedRef = useRef<number>(0);

  // Default fetch function (mock - in real app, this would call API)
  const defaultFetchVersion = useCallback(async (): Promise<number> => {
    // In a real implementation, this would be:
    // const response = await fetch(`/api/pages/${pageId}/version`);
    // const data = await response.json();
    // return data.version;

    // For now, return current version (no conflict simulation)
    return pageVersion;
  }, [pageVersion]);

  const checkVersion = useCallback(async () => {
    if (hasConflict) return; // Don't check if already in conflict state

    try {
      const fetcher = fetchVersion || defaultFetchVersion;
      const serverVersion = await fetcher();

      if (serverVersion > pageVersion) {
        console.log(
          `[VersionPolling] Conflict detected: server v${serverVersion} > local v${pageVersion}`,
        );
        setConflict(serverVersion);
      }

      lastCheckedRef.current = Date.now();
    } catch (error) {
      console.error('[VersionPolling] Failed to check version:', error);
    }
  }, [pageVersion, hasConflict, setConflict, fetchVersion, defaultFetchVersion]);

  // Setup polling interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check after a short delay
    const initialTimeout = setTimeout(checkVersion, 5000);

    // Setup recurring interval
    intervalRef.current = setInterval(checkVersion, interval);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, checkVersion]);

  // Also check on window focus (user returns to tab)
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      // Only check if it's been more than 10 seconds since last check
      if (Date.now() - lastCheckedRef.current > 10000) {
        checkVersion();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, checkVersion]);

  return {
    checkVersion,
    getLastChecked: () => lastCheckedRef.current,
  };
};
