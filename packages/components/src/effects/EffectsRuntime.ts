import type { ScrollEffectConfig } from '@canvasly/dsl-schema';

/**
 * Runtime system for effects that require JavaScript
 * - Intersection Observer for appear effects
 * - Scroll listeners for scroll effects
 * - Ticker animation loops
 *
 * IMPORTANT – Idempotency:
 * Each init* method may be called multiple times (e.g. after React
 * re-renders detected by MutationObserver). They must therefore:
 *   1.  Skip elements that have already been initialized (via a
 *       `data-*-initialized` marker attribute).
 *   2.  Never produce DOM mutations that would re-trigger the
 *       MutationObserver in an infinite loop.
 *   3.  Track event listeners so `cleanup()` can remove them.
 */
export class EffectsRuntime {
  private intersectionObserver?: IntersectionObserver;
  private loopObserver?: IntersectionObserver;
  private scrollListeners: Map<string, () => void> = new Map();
  /** Abort controllers keyed by element id – used to remove hover listeners. */
  private tickerHoverControllers: Map<string, AbortController> = new Map();
  /** Abort controllers keyed by element id – used to remove drag listeners. */
  private tickerDragControllers: Map<string, AbortController> = new Map();
  /** Track which ticker elements we've initialized. */
  private initializedTickers: Set<string> = new Set();
  /** Track hover states for speed calculation. */
  private tickerHoverStates: Map<string, boolean> = new Map();
  /** Track if a ticker is currently being dragged. */
  private tickerDragStates: Map<string, boolean> = new Map();

  // Initialize appear effects
  initAppearEffects(elements: HTMLElement[]) {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const threshold = parseFloat(element.dataset.appearThreshold || '0.5');

          if (entry.intersectionRatio >= threshold) {
            element.classList.add('bn-appeared');

            // If not repeatable, unobserve
            if (element.dataset.appearRepeat !== 'true') {
              this.intersectionObserver?.unobserve(element);
            }
          } else if (element.dataset.appearRepeat === 'true') {
            element.classList.remove('bn-appeared');
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => this.intersectionObserver?.observe(el));
  }

  // Initialize scroll effects
  initScrollEffects(elements: HTMLElement[]) {
    elements.forEach((element) => {
      let config: ScrollEffectConfig;
      try {
        config = JSON.parse(element.dataset.scrollConfig || '{}');
      } catch (e) {
        console.error('Failed to parse scroll config', e);
        return;
      }

      const listener = () => {
        const rect = element.getBoundingClientRect();
        const scrollProgress = this.calculateScrollProgress(rect);

        this.applyScrollEffect(element, config, scrollProgress);
      };

      this.scrollListeners.set(element.id, listener);
      window.addEventListener('scroll', listener, { passive: true });
      listener(); // Initial call
    });
  }

  // Initialize ticker effects
  initTickerEffects(elements: HTMLElement[]) {
    elements.forEach((element) => {
      const elementId = element.id || element.dataset.componentId || '';

      // ── Idempotency: skip if already initialized ──
      if (this.initializedTickers.has(elementId) && element.dataset.tickerInitialized === 'true') {
        // Just update speed in case config changed
        this.updateTickerSpeed(element, elementId);

        // Check if drag state changed
        const draggable = element.dataset.tickerDraggable === 'true';
        if (draggable) {
          this.initTickerDrag(element, elementId);
        } else {
          this.tickerDragControllers.get(elementId)?.abort();
          this.tickerDragControllers.delete(elementId);
          element.style.cursor = '';
        }
        return;
      }

      // Look for the wrapper that React created (has data-ticker-wrapper attribute)
      const wrapper = element.querySelector(
        '.bn-effect-ticker-wrapper[data-ticker-wrapper="true"]',
      );
      if (!wrapper) {
        // Fallback: wrapper might exist without the attribute (from publisher)
        const fallbackWrapper = element.querySelector('.bn-effect-ticker-wrapper');
        if (!fallbackWrapper) return;

        // Use the fallback wrapper
        this.initTickerWithWrapper(element, fallbackWrapper as HTMLElement, elementId);
        return;
      }

      this.initTickerWithWrapper(element, wrapper as HTMLElement, elementId);
    });
  }

  private initTickerWithWrapper(element: HTMLElement, wrapper: HTMLElement, elementId: string) {
    const content = wrapper.querySelector('.bn-effect-ticker-content');
    if (!content) return;

    // Remove any stale clones from previous initialization
    wrapper.querySelectorAll('.bn-effect-ticker-clone').forEach((el) => el.remove());

    // Calculate how many clones we need to fill the viewport
    const contentWidth = (content as HTMLElement).scrollWidth;
    const viewportWidth = element.offsetWidth || window.innerWidth;
    const clonesNeeded = Math.max(1, Math.ceil((viewportWidth * 2) / contentWidth));

    // Create clones and add to the wrapper
    for (let i = 0; i < clonesNeeded; i++) {
      const clone = content.cloneNode(true) as HTMLElement;
      clone.classList.remove('bn-effect-ticker-content');
      clone.classList.add('bn-effect-ticker-clone');
      clone.setAttribute('aria-hidden', 'true');
      wrapper.appendChild(clone);
    }

    // Set CSS variable for animation (total items = original + clones)
    element.style.setProperty('--ticker-item-count', String(clonesNeeded + 1));

    // Mark as initialized
    element.dataset.tickerInitialized = 'true';
    this.initializedTickers.add(elementId);

    // Apply speed / hover logic
    this.initTickerHoverListeners(element, elementId);
    this.updateTickerSpeed(element, elementId);

    // Add drag functionality if enabled
    const draggable = element.dataset.tickerDraggable === 'true';
    if (draggable) {
      this.initTickerDrag(element, elementId);
    }
  }

  private initTickerHoverListeners(element: HTMLElement, elementId: string) {
    this.tickerHoverControllers.get(elementId)?.abort();

    const controller = new AbortController();
    this.tickerHoverControllers.set(elementId, controller);
    const signal = controller.signal;

    element.addEventListener(
      'mouseenter',
      () => {
        this.tickerHoverStates.set(elementId, true);
        this.updateTickerSpeed(element, elementId);
      },
      { signal },
    );

    element.addEventListener(
      'mouseleave',
      () => {
        this.tickerHoverStates.set(elementId, false);
        this.updateTickerSpeed(element, elementId);
      },
      { signal },
    );
  }

  /**
   * Calculate and apply playbackRate based on speed and hover modifier.
   */
  private updateTickerSpeed(element: HTMLElement, elementId: string) {
    const wrapper = element.querySelector('.bn-effect-ticker-wrapper');
    if (!wrapper) return;

    // Retrieve animations from the wrapper
    const animations = wrapper.getAnimations({ subtree: false });
    const tickerAnim = animations.find(
      (a) =>
        (a as CSSAnimation).animationName === 'bn-ticker-scroll-left' ||
        (a as CSSAnimation).animationName === 'bn-ticker-scroll-right',
    );

    if (!tickerAnim) {
      // If animation hasn't started yet, try again in next frame
      requestAnimationFrame(() => this.updateTickerSpeed(element, elementId));
      return;
    }

    const speed = parseFloat(element.dataset.tickerSpeed || '50');
    const hoverPercent = parseFloat(element.dataset.tickerHover || '0');
    const isHovering = this.tickerHoverStates.get(elementId) || false;
    const isDragging = this.tickerDragStates.get(elementId) || false;

    // Base rate: 100% speed = 1/20 playbackRate (assuming 1s CSS duration)
    // Actually, if we set 1s in CSS, and want 20s for 100% speed:
    // Rate = 1/20 * (speed/100) = speed / 2000
    const baseRate = speed / 2000;

    // Hover modifier is relative: +10% means speed * 1.1, -50% means speed * 0.5
    const hoverModifier = 1 + hoverPercent / 100;

    // While dragging, we ignore hover speed shifts and pause the animation
    const effectiveRate = isDragging ? 0 : isHovering ? baseRate * hoverModifier : baseRate;

    tickerAnim.playbackRate = effectiveRate;
  }

  /**
   * Apply / update the CSS custom properties that drive the ticker
   * animation speed.  This is safe to call repeatedly.
   */

  private initTickerDrag(element: HTMLElement, elementId: string) {
    // Abort any previous drag listeners for this element
    this.tickerDragControllers.get(elementId)?.abort();

    const controller = new AbortController();
    this.tickerDragControllers.set(elementId, controller);
    const signal = controller.signal;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const pauseAnimation = () => {
      this.tickerDragStates.set(elementId, true);
      this.updateTickerSpeed(element, elementId);
    };

    const resumeAnimation = () => {
      this.tickerDragStates.set(elementId, false);
      this.updateTickerSpeed(element, elementId);
    };

    element.addEventListener(
      'mousedown',
      (e: MouseEvent) => {
        isDragging = true;
        startX = e.pageX - element.offsetLeft;
        scrollLeft = element.scrollLeft;
        element.style.cursor = 'grabbing';
        pauseAnimation();
      },
      { signal },
    );

    element.addEventListener(
      'mouseleave',
      () => {
        if (isDragging) {
          isDragging = false;
          element.style.cursor = 'grab';
          resumeAnimation();
        }
      },
      { signal },
    );

    element.addEventListener(
      'mouseup',
      () => {
        isDragging = false;
        element.style.cursor = 'grab';
        resumeAnimation();
      },
      { signal },
    );

    element.addEventListener(
      'mousemove',
      (e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - element.offsetLeft;
        const walk = (x - startX) * 2;
        element.scrollLeft = scrollLeft - walk;
      },
      { signal },
    );

    element.style.cursor = 'grab';
  }

  // Initialize loop effects
  initLoopEffects(elements: HTMLElement[]) {
    // Only observe elements with offScreen='pause'
    const pauseElements = Array.from(elements).filter((el) => el.dataset.loopOffscreen === 'pause');

    if (pauseElements.length === 0 || !window.IntersectionObserver) return;

    this.loopObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            element.classList.add('bn-loop-visible');
          } else {
            element.classList.remove('bn-loop-visible');
          }
        });
      },
      { threshold: 0 },
    );

    pauseElements.forEach((el) => this.loopObserver?.observe(el));
  }

  private calculateScrollProgress(rect: DOMRect): number {
    const windowHeight = window.innerHeight;
    const elementTop = rect.top;
    const elementHeight = rect.height;

    // Progress from 0 (element entering viewport) to 1 (element leaving viewport)
    const progress = 1 - (elementTop + elementHeight) / (windowHeight + elementHeight);
    return Math.max(0, Math.min(1, progress));
  }

  private applyScrollEffect(element: HTMLElement, config: ScrollEffectConfig, progress: number) {
    if (config.type === 'animation') {
      const { property, from, to, start, end } = config;
      const effectProgress = this.mapRange(progress, start / 100, end / 100, 0, 1);
      const value = this.lerp(from, to, effectProgress);

      switch (property) {
        case 'opacity':
          element.style.opacity = value.toString();
          break;
        case 'scale':
          element.style.transform = `scale(${value})`;
          break;
        case 'rotate':
          element.style.transform = `rotate(${value}deg)`;
          break;
        case 'translateX':
          element.style.transform = `translateX(${value}px)`;
          break;
        case 'translateY':
          element.style.transform = `translateY(${value}px)`;
          break;
      }
    } else if (config.type === 'speed') {
      const { multiplier } = config;
      const offset = progress * 100 * (multiplier - 1);
      element.style.transform = `translateY(${offset}px)`;
    } else if (config.type === 'transform') {
      const transforms: string[] = [];
      if (config.translateX) transforms.push(`translateX(${config.translateX * progress}px)`);
      if (config.translateY) transforms.push(`translateY(${config.translateY * progress}px)`);
      if (config.scale) transforms.push(`scale(${1 + (config.scale - 1) * progress})`);
      if (config.rotate) transforms.push(`rotate(${config.rotate * progress}deg)`);

      element.style.transform = transforms.join(' ');
      if (config.opacity !== undefined) {
        element.style.opacity = (1 - (1 - config.opacity) * progress).toString();
      }
    }
  }

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * Math.max(0, Math.min(1, t));
  }

  private mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number {
    if (inMax === inMin) return outMin;
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  cleanup() {
    // Observers
    this.intersectionObserver?.disconnect();
    this.loopObserver?.disconnect();

    // Scroll listeners
    this.scrollListeners.forEach((listener) => {
      window.removeEventListener('scroll', listener);
    });
    this.scrollListeners.clear();

    // Ticker: abort listeners and clean up clones
    this.tickerHoverControllers.forEach((controller) => controller.abort());
    this.tickerHoverControllers.clear();
    this.tickerDragControllers.forEach((controller) => controller.abort());
    this.tickerDragControllers.clear();

    // Clean up ticker clones (React manages the wrapper structure)
    this.initializedTickers.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const wrapper = el.querySelector('.bn-effect-ticker-wrapper');
        if (wrapper) {
          // Only remove clones, leave the wrapper and content for React to manage
          wrapper.querySelectorAll('.bn-effect-ticker-clone').forEach((clone) => clone.remove());
        }
        delete el.dataset.tickerInitialized;
      }
    });
    this.initializedTickers.clear();
  }
}
