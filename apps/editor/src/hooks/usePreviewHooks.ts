import { useEffect, useRef, useState } from 'react';

// === useIntersectionObserver ===
interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * useIntersectionObserver - Lazy rendering trigger for gallery previews.
 * Only renders content when scrolled into viewport.
 */
export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '100px',
  triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (triggerOnce && hasTriggered.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          hasTriggered.current = true;
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

// === useSectionPreviewSizing ===
interface PreviewSizingResult {
  height: number;
  scale: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  needsScaling: boolean;
}

interface UseSectionPreviewSizingOptions {
  estimatedHeight?: number;
  preferredScale?: number;
  defaultBreakpoint?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * useSectionPreviewSizing - Framer-style sizing: sections show fully but scaled down.
 *
 * - Sections render at natural height (no cropping)
 * - Tall sections (>500px) are scaled down proportionally
 * - Container height matches scaled height
 * - Full content always visible
 */
export function useSectionPreviewSizing(
  _sectionId: string,
  {
    estimatedHeight,
    preferredScale,
    defaultBreakpoint = 'desktop',
  }: UseSectionPreviewSizingOptions = {},
): PreviewSizingResult {
  const baseHeight = estimatedHeight || 600;

  if (baseHeight > 500) {
    const targetDisplayHeight = 500;
    const scale = preferredScale || targetDisplayHeight / baseHeight;

    return {
      height: targetDisplayHeight,
      scale,
      breakpoint: 'desktop',
      needsScaling: true,
    };
  }

  return {
    height: baseHeight,
    scale: 1.0,
    breakpoint: defaultBreakpoint,
    needsScaling: false,
  };
}
