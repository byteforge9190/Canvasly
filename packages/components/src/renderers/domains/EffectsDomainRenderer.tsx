import React from 'react';
import type {
  FrameEffects,
  EffectStateConfig,
  EasePreset,
  Transition,
  Transform3D,
} from '@canvasly/dsl-schema';
import { resolveFillToCSS } from '../../utils/fill-resolver';
import { shadowToCSSString } from '../../utils/shadow-resolver';

export interface EffectsDomainRendererProps {
  effects: FrameEffects;
  componentId: string;
  baseStyles: React.CSSProperties;
  isEditorMode: boolean;
}

export interface EffectsRenderResult {
  cssClasses: string[];
  inlineStyles: React.CSSProperties;
  cssVariables: Record<string, string>;
  dataAttributes: Record<string, string>;
  requiresJS: boolean;
}

/**
 * renderEffectsDomain
 * Generates the necessary CSS classes, variables, and attributes to apply effects to a component.
 */
export function renderEffectsDomain({ effects }: EffectsDomainRendererProps): EffectsRenderResult {
  const cssClasses: string[] = [];
  const inlineStyles: React.CSSProperties = {};
  const cssVariables: Record<string, string> = {};
  const dataAttributes: Record<string, string> = {};

  // ========== RENDER STATES (Unified Logic) ==========
  if (effects.states) {
    const states = effects.states;

    // Iterate over all enabled states
    Object.entries(states).forEach(([stateName, stateConfig]) => {
      // Skip UI-only helper keys
      if (stateName === 'activeState') return;

      const config = stateConfig as EffectStateConfig;
      if (!config?.enabled || !config.state) return;

      // Add state-specific CSS class
      cssClasses.push(`bn-effect-state-${stateName}`);

      // Generate CSS variables for this state
      const prefix = `--${stateName}`;
      if (config.state.opacity !== undefined) {
        cssVariables[`${prefix}-opacity`] = config.state.opacity.toString();
      }
      if (config.state.scale !== undefined) {
        cssVariables[`${prefix}-scale`] = config.state.scale.toString();
      }

      // Handle rotation (2D vs 3D)
      if (config.state.rotate) {
        if ('rotate' in config.state.rotate) {
          cssVariables[`${prefix}-rotate`] = `${config.state.rotate.rotate}deg`;
        } else {
          const rotate3d = config.state.rotate as Transform3D;
          cssClasses.push(`bn-effect-state-${stateName}-3d`);
          cssVariables[`${prefix}-rotate-x`] = `${rotate3d.rotateX || 0}deg`;
          cssVariables[`${prefix}-rotate-y`] = `${rotate3d.rotateY || 0}deg`;
          cssVariables[`${prefix}-rotate-z`] = `${rotate3d.rotateZ || 0}deg`;
        }
      }

      // Handle skew
      if (config.state.skew) {
        cssVariables[`${prefix}-skew-x`] = `${config.state.skew.skewX || 0}deg`;
        cssVariables[`${prefix}-skew-y`] = `${config.state.skew.skewY || 0}deg`;
      }

      // Handle fill (background)
      if (config.state.fill) {
        const fillCSS = resolveFillToCSS(config.state.fill);
        if (fillCSS.background) {
          cssVariables[`${prefix}-background`] = fillCSS.background as string;
        } else if (fillCSS.backgroundColor) {
          cssVariables[`${prefix}-background`] = fillCSS.backgroundColor as string;
        }
      }

      // Handle shadow
      if (config.state.shadow) {
        const shadowStr = shadowToCSSString(config.state.shadow);
        if (shadowStr) {
          cssVariables[`${prefix}-shadow`] = shadowStr;
        }
      }

      // Generate transition CSS and store per-state
      const transition = generateTransitionCSS(config.state.transition);
      cssVariables[`${prefix}-transition`] = transition;

      // Handle appear-specific attributes
      if (stateName === 'appear' && 'threshold' in config) {
        const appearConfig = config as EffectStateConfig & { threshold?: number; repeat?: boolean };
        dataAttributes['data-appear-threshold'] = appearConfig.threshold?.toString() || '0.5';
        dataAttributes['data-appear-repeat'] = appearConfig.repeat?.toString() || 'false';

        // Set initial state variables for appear animation
        cssVariables['--appear-initial-opacity'] = '0';
        cssVariables['--appear-initial-y'] = '20px'; // Default slide-up effect
      }
    });
  }

  // ========== RENDER SYSTEMS (Specialized Logic) ==========
  if (effects.systems) {
    const systems = effects.systems;

    // Loop system
    if (systems.loop?.enabled) {
      const loop = systems.loop;
      cssClasses.push(`bn-effect-loop-${loop.type}`);
      cssVariables['--loop-duration'] = `${loop.duration}s`;
      cssVariables['--loop-easing'] = easingToCss(loop.easing);
      dataAttributes['data-loop-offscreen'] = loop.offScreen;

      // Type-specific variables
      if (loop.type === 'rotate' && loop.rotateDegrees) {
        cssVariables['--loop-rotate-degrees'] = `${loop.rotateDegrees}deg`;
      } else if (loop.type === 'scale') {
        cssVariables['--loop-scale-from'] = loop.scaleFrom?.toString() || '1';
        cssVariables['--loop-scale-to'] = loop.scaleTo?.toString() || '1.1';
      } else if (loop.type === 'position') {
        cssVariables['--loop-position-x'] = `${loop.positionX || 0}px`;
        cssVariables['--loop-position-y'] = `${loop.positionY || 20}px`;
      }
    }

    // Ticker system
    if (systems.ticker?.enabled) {
      const ticker = systems.ticker;
      cssClasses.push('bn-effect-ticker');
      dataAttributes['data-ticker-speed'] = ticker.speed.toString();
      dataAttributes['data-ticker-hover'] = ticker.hover.toString();
      dataAttributes['data-ticker-direction'] = ticker.direction;
      dataAttributes['data-ticker-draggable'] = ticker.draggable.toString();
    }

    // Scroll system
    if (systems.scroll?.enabled) {
      cssClasses.push('bn-effect-scroll');
      dataAttributes['data-scroll-config'] = JSON.stringify(systems.scroll.config);
    }
  }

  return {
    cssClasses,
    inlineStyles,
    cssVariables,
    dataAttributes,
    requiresJS: needsJavaScript(effects),
  };
}

// Helper to determine if JavaScript runtime is needed
function needsJavaScript(effects: FrameEffects): boolean {
  return !!(
    effects.states?.appear?.enabled ||
    effects.systems?.loop?.enabled ||
    effects.systems?.ticker?.enabled ||
    effects.systems?.scroll?.enabled
  );
}

/**
 * Convert EasePreset to valid CSS timing function
 */
function easingToCss(preset: EasePreset): string {
  switch (preset) {
    case 'linear':
      return 'linear';
    case 'ease-in':
      return 'cubic-bezier(0.4, 0, 1, 1)';
    case 'ease-out':
      return 'cubic-bezier(0, 0, 0.2, 1)';
    case 'ease-in-out':
      return 'cubic-bezier(0.4, 0, 0.2, 1)';
    case 'back-in':
      return 'cubic-bezier(0.6, -0.28, 0.735, 0.045)';
    case 'back-out':
      return 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    case 'back-in-out':
      return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    case 'custom-bezier':
      return 'ease'; // Fallback
    default:
      return 'ease';
  }
}

/**
 * Generate CSS transition string from Transition config.
 * Each property must have its own timing — e.g.,
 * "opacity 0.3s ease 0s, transform 0.3s ease 0s" — because CSS only
 * applies duration/easing to the LAST property in a comma-joined list
 * when they are written as "opacity, transform 0.3s ease".
 */
function generateTransitionCSS(transition: Transition): string {
  const properties = ['opacity', 'transform', 'background', 'box-shadow'];

  let duration: number;
  let easing: string;
  let delay: number;

  if (transition.mode === 'spring') {
    if (transition.basis === 'time') {
      duration = transition.duration;
      delay = transition.delay;
      easing =
        transition.bounce > 0
          ? `cubic-bezier(0.34, 1.56, 0.64, 1)`
          : `cubic-bezier(0.4, 0, 0.2, 1)`;
    } else {
      const { stiffness, damping, mass, delay: d } = transition;
      duration = Math.sqrt(mass / stiffness) * (damping / 10);
      delay = d;
      easing = damping < 20 ? `cubic-bezier(0.34, 1.56, 0.64, 1)` : `cubic-bezier(0.4, 0, 0.2, 1)`;
    }
  } else {
    duration = transition.duration;
    delay = transition.delay;
    const { preset, bezier } = transition;
    switch (preset) {
      case 'linear':
        easing = 'linear';
        break;
      case 'ease-in':
        easing = 'cubic-bezier(0.4, 0, 1, 1)';
        break;
      case 'ease-out':
        easing = 'cubic-bezier(0, 0, 0.2, 1)';
        break;
      case 'ease-in-out':
        easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
        break;
      case 'back-in':
        easing = 'cubic-bezier(0.6, -0.28, 0.735, 0.045)';
        break;
      case 'back-out':
        easing = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        break;
      case 'back-in-out':
        easing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        break;
      case 'custom-bezier':
        easing = bezier ? `cubic-bezier(${bezier})` : 'ease';
        break;
      default:
        easing = 'ease';
    }
  }

  // Each property gets its own timing to produce valid CSS
  return properties.map((prop) => `${prop} ${duration.toFixed(2)}s ${easing} ${delay}s`).join(', ');
}

/**
 * Helper to check if any effect is enabled
 */
export function hasAnyEffectEnabled(effects: FrameEffects): boolean {
  const stateEnabled = effects.states
    ? Object.values(effects.states).some((s) => (s as EffectStateConfig | undefined)?.enabled)
    : false;
  const systemEnabled = effects.systems
    ? Object.values(effects.systems).some((s) => (s as { enabled: boolean } | undefined)?.enabled)
    : false;
  return stateEnabled || systemEnabled;
}
