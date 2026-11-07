import type { Shadow, BoxShadow, RealisticShadow } from '@canvasly/dsl-schema';
import type { CSSProperties } from 'react';

/**
 * Type guard to check if shadow is a BoxShadow
 */
function isBoxShadow(shadow: Shadow): shadow is BoxShadow {
  return shadow.type === 'box';
}

/**
 * Type guard to check if shadow is a RealisticShadow
 */
function isRealisticShadow(shadow: Shadow): shadow is RealisticShadow {
  return shadow.type === 'realistic';
}

/**
 * Resolve a Shadow object to CSS properties
 */
export function resolveShadowToCSS(shadow: Shadow | undefined): CSSProperties {
  if (!shadow || !shadow.enabled) {
    return {};
  }

  const position = shadow.position === 'inside' ? 'inset ' : '';
  let cssValue: string;

  if (isBoxShadow(shadow)) {
    cssValue = `${position}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
  } else if (isRealisticShadow(shadow)) {
    // For realistic shadows, diffusion maps to blur and focus maps to spread directly
    cssValue = `${position}${shadow.x}px ${shadow.y}px ${shadow.diffusion}px ${shadow.focus}px ${shadow.color}`;
  } else {
    return {};
  }

  return {
    boxShadow: cssValue,
  };
}

/**
 * Convert shadow to CSS string
 */
export function shadowToCSSString(shadow: Shadow | undefined): string {
  if (!shadow || !shadow.enabled) {
    return 'none';
  }

  const position = shadow.position === 'inside' ? 'inset ' : '';

  if (isBoxShadow(shadow)) {
    return `${position}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
  } else if (isRealisticShadow(shadow)) {
    // For realistic shadows, diffusion maps to blur and focus maps to spread directly
    return `${position}${shadow.x}px ${shadow.y}px ${shadow.diffusion}px ${shadow.focus}px ${shadow.color}`;
  }

  return 'none';
}

/**
 * Check if shadow is valid and enabled
 */
export function isValidShadow(shadow: Shadow | undefined): boolean {
  return !!shadow && shadow.enabled;
}

/**
 * Create default shadow configuration
 */
export function createDefaultShadow(): BoxShadow {
  return {
    type: 'box',
    position: 'outside',
    color: '#00000040',
    x: 0,
    y: 2,
    blur: 8,
    spread: 0,
    enabled: false,
  };
}

/**
 * Create shadow presets
 */
export const SHADOW_PRESETS: Record<string, BoxShadow | undefined> = {
  none: undefined,
  sm: {
    type: 'box' as const,
    position: 'outside' as const,
    color: '#00000020',
    x: 0,
    y: 1,
    blur: 2,
    spread: 0,
    enabled: true,
  },
  md: {
    type: 'box' as const,
    position: 'outside' as const,
    color: '#00000040',
    x: 0,
    y: 2,
    blur: 8,
    spread: 0,
    enabled: true,
  },
  lg: {
    type: 'box' as const,
    position: 'outside' as const,
    color: '#00000060',
    x: 0,
    y: 4,
    blur: 16,
    spread: 2,
    enabled: true,
  },
  xl: {
    type: 'box' as const,
    position: 'outside' as const,
    color: '#00000080',
    x: 0,
    y: 8,
    blur: 24,
    spread: 4,
    enabled: true,
  },
  inner: {
    type: 'box' as const,
    position: 'inside' as const,
    color: '#00000030',
    x: 0,
    y: 2,
    blur: 4,
    spread: 0,
    enabled: true,
  },
};
