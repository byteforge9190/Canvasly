import { useEffect, useRef } from 'react';
import { EffectsRuntime } from '../effects/EffectsRuntime';

/**
 * Hook to initialize and manage the EffectsRuntime.
 * This should be used at a high level in the application to enable
 * JS-driven effects (Appear, Scroll, Ticker, etc.)
 *
 * KEY DESIGN: The MutationObserver is DISCONNECTED before running init()
 * and RECONNECTED afterwards. This prevents an infinite loop where
 * Ticker's DOM cloning triggers the observer which re-runs init() endlessly.
 */
export function useEffectsRuntime() {
  const runtimeRef = useRef<EffectsRuntime | null>(null);

  useEffect(() => {
    const runtime = new EffectsRuntime();
    runtimeRef.current = runtime;

    let observer: MutationObserver | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let isInitializing = false;

    /**
     * Scan the DOM for effect elements and initialize them.
     * The observer is disconnected during this process so that any DOM
     * mutations produced by init (e.g. ticker cloning) do NOT re-trigger
     * the observer and cause an infinite loop.
     */
    const init = () => {
      // Re-entrancy guard – if we're already inside init(), skip.
      if (isInitializing) return;
      isInitializing = true;

      // Disconnect observer to prevent our own DOM mutations from
      // firing back into the observer callback.
      observer?.disconnect();

      try {
        // Clean up previous state before re-scanning
        runtime.cleanup();

        const appearElements = document.querySelectorAll('.bn-effect-state-appear');
        const scrollElements = document.querySelectorAll('.bn-effect-scroll');
        const tickerElements = document.querySelectorAll('.bn-effect-ticker');
        const loopElements = document.querySelectorAll('[class*="bn-effect-loop-"]');

        if (appearElements.length > 0) {
          runtime.initAppearEffects(Array.from(appearElements) as HTMLElement[]);
        }
        if (scrollElements.length > 0) {
          runtime.initScrollEffects(Array.from(scrollElements) as HTMLElement[]);
        }
        if (tickerElements.length > 0) {
          runtime.initTickerEffects(Array.from(tickerElements) as HTMLElement[]);
        }
        if (loopElements.length > 0) {
          runtime.initLoopEffects(Array.from(loopElements) as HTMLElement[]);
        }
      } finally {
        isInitializing = false;

        // Reconnect observer AFTER all DOM mutations are done.
        if (observer) {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
        }
      }
    };

    /**
     * Debounced init – coalesces rapid DOM mutations (e.g. React re-renders)
     * into a single init pass.
     */
    const debouncedInit = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(init, 150);
    };

    // Initial scan (slightly delayed for DOM readiness)
    const timeoutId = setTimeout(init, 100);

    // Observe DOM for new effect elements being added/removed.
    observer = new MutationObserver((_mutations) => {
      // Use the debounced version so rapid mutations are coalesced.
      debouncedInit();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timeoutId);
      if (debounceTimer) clearTimeout(debounceTimer);
      observer?.disconnect();
      observer = null;
      runtime.cleanup();
      runtimeRef.current = null;
    };
  }, []);

  return runtimeRef.current;
}
