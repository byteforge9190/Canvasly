import type { CSSProperties } from 'react';
import type {
  Component,
  Breakpoint,
  NormalizedPageState,
  BorderValue,
  SpacingValue,
  FrameProps,
} from '@canvasly/dsl-schema';
import { BREAKPOINTS, DEFAULT_FRAME } from '@canvasly/dsl-schema';
import { resolveFrameStyles } from './frame.resolver';

/**
 * Gets effective props for a component at a specific breakpoint (non-hook version)
 */
import { resolveFillToCSS } from './fill-resolver';

/**
 * Deep merges two objects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
  if (
    typeof target !== 'object' ||
    target === null ||
    typeof source !== 'object' ||
    source === null
  ) {
    return source;
  }
  const result = { ...target };
  Object.keys(source).forEach((key) => {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  });
  return result;
}

/**
 * Gets effective frame properties for a component at a specific breakpoint
 */
export function getEffectiveFrame(component: Component, breakpoint?: Breakpoint): FrameProps {
  const baseFrame = component.frame || DEFAULT_FRAME;
  const responsive = component.responsive || {};

  if (!breakpoint || !responsive[breakpoint]?.frame) {
    return baseFrame;
  }
  // We use our deep merge to combine base frame with override frame
  return deepMerge(baseFrame, responsive[breakpoint]!.frame);
}

/**
 * Formats a BorderValue object into a CSS string
 */
function formatBorder(border: BorderValue | string | unknown): string {
  if (typeof border === 'string') return border;
  if (!border || typeof border !== 'object') return 'none';
  const b = border as BorderValue;
  return `${b.width || '0px'} ${b.style || 'solid'} ${b.color || 'transparent'}`;
}

/**
 * Formats a SpacingValue object into a CSS string
 */
function formatSpacing(spacing: SpacingValue | string | unknown): string {
  if (typeof spacing === 'string') return spacing;
  if (!spacing || typeof spacing !== 'object') return '0';
  const s = spacing as Record<string, string>;
  const { top = '0', right = '0', bottom = '0', left = '0' } = s;
  return `${top} ${right} ${bottom} ${left}`;
}

/**
 * Normalizes complex style objects (like BorderValue) into plain CSS values
 */
export function normalizeStyles(styles: CSSProperties): CSSProperties {
  const normalized: Record<string, string | number> = {};

  Object.entries(styles).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (typeof value === 'object') {
      if (key.includes('margin') || key.includes('padding')) {
        normalized[key] = formatSpacing(value);
      } else if (key.includes('border') && !key.includes('radius')) {
        normalized[key] = formatBorder(value);
      } else {
        normalized[key] = value;
      }
    } else {
      normalized[key] = value;
    }
  });

  return normalized as CSSProperties;
}

/**
 * Converts a CSSProperties object to a CSS string
 */
function cssToStyleString(style: CSSProperties): string {
  return Object.entries(style)
    .map(([key, value]) => {
      if (value === undefined || value === null || value === '') return '';

      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      let formattedValue = value;

      if (typeof value === 'object') {
        if (kebabKey.includes('margin') || kebabKey.includes('padding')) {
          formattedValue = formatSpacing(value);
        } else if (kebabKey.includes('border') && !kebabKey.includes('radius')) {
          formattedValue = formatBorder(value);
        }
      }

      return `${kebabKey}: ${formattedValue};`;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Generates the CSS rule for a component
 */
function generateComponentCSS(componentId: string, styles: CSSProperties): string {
  return `[data-component-id="${componentId}"] { ${cssToStyleString(styles)} }\n`;
}

/**
 * Generates responsive CSS for the entire page
 *
 * Strategy: Desktop-first approach using max-width media queries
 * - Base styles apply to all screen sizes (desktop as default)
 * - Tablet overrides apply at <=1024px
 * - Mobile overrides apply at <=768px
 */
export function generateResponsiveCSS(state: NormalizedPageState): string {
  let css = '';

  // 1. Generate base styles
  Object.values(state.components).forEach((component) => {
    // Resolve frame styles
    const frame = getEffectiveFrame(component);
    const frameStyles = resolveFrameStyles(frame);
    const fillStyles = frame.style?.fill ? resolveFillToCSS(frame.style.fill) : {};

    const finalStyles = normalizeStyles({
      ...frameStyles,
      ...fillStyles,
    });

    css += generateComponentCSS(component.id, finalStyles);
  });

  // 2. Generate tablet overrides
  let tabletCss = '';
  Object.values(state.components).forEach((component) => {
    if (component.responsive?.tablet) {
      const frame = getEffectiveFrame(component, 'tablet');
      const frameStyles = resolveFrameStyles(frame);
      const fillStyles = frame.style?.fill ? resolveFillToCSS(frame.style.fill) : {};

      const finalStyles = normalizeStyles({
        ...frameStyles,
        ...fillStyles,
      });

      tabletCss += `  ${generateComponentCSS(component.id, finalStyles).trim()}\n`;
    }
  });

  if (tabletCss) {
    css += `@media (max-width: ${BREAKPOINTS.tablet}px) {\n${tabletCss}}\n`;
  }

  // 3. Generate mobile overrides
  let mobileCss = '';
  Object.values(state.components).forEach((component) => {
    if (component.responsive?.mobile) {
      const frame = getEffectiveFrame(component, 'mobile');
      const frameStyles = resolveFrameStyles(frame);
      const fillStyles = frame.style?.fill ? resolveFillToCSS(frame.style.fill) : {};

      const finalStyles = normalizeStyles({
        ...frameStyles,
        ...fillStyles,
      });

      mobileCss += `  ${generateComponentCSS(component.id, finalStyles).trim()}\n`;
    }
  });

  if (mobileCss) {
    css += `@media (max-width: ${BREAKPOINTS.mobile}px) {\n${mobileCss}}\n`;
  }

  return css;
}
