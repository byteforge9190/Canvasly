/**
 * Shadow System - Professional shadow configuration
 * Provides type-safe shadow configuration with type, position, color, and effects
 */

import type { Shadow, BoxShadow, RealisticShadow, ShadowType, ShadowPosition } from './frame.types';

// Re-export types for convenience
export type { ShadowType, ShadowPosition, BoxShadow, RealisticShadow };

// Default box shadow configuration
export const DEFAULT_BOX_SHADOW: BoxShadow = {
  type: 'box',
  position: 'outside',
  color: '#00000040', // Black with 25% opacity
  x: 0,
  y: 2,
  blur: 8,
  spread: 0,
  enabled: false,
};

// Default realistic shadow configuration
export const DEFAULT_REALISTIC_SHADOW: RealisticShadow = {
  type: 'realistic',
  position: 'outside',
  color: '#00000040', // Black with 25% opacity
  x: 0,
  y: 2,
  diffusion: 8, // 8px blur (same as default box shadow)
  focus: 0, // 0px spread (same as default box shadow)
  enabled: false,
};

// Default shadow (box type for backward compatibility)
export const DEFAULT_SHADOW: Shadow = DEFAULT_BOX_SHADOW;

// Common box shadow presets
export const BOX_SHADOW_PRESETS: Record<string, BoxShadow> = {
  none: { ...DEFAULT_BOX_SHADOW, enabled: false },
  sm: {
    ...DEFAULT_BOX_SHADOW,
    y: 1,
    blur: 2,
    color: '#00000020',
    enabled: true,
  },
  md: {
    ...DEFAULT_BOX_SHADOW,
    y: 2,
    blur: 8,
    color: '#00000040',
    enabled: true,
  },
  lg: {
    ...DEFAULT_BOX_SHADOW,
    y: 4,
    blur: 16,
    spread: 2,
    color: '#00000060',
    enabled: true,
  },
  xl: {
    ...DEFAULT_BOX_SHADOW,
    y: 8,
    blur: 24,
    spread: 4,
    color: '#00000080',
    enabled: true,
  },
  inner: {
    ...DEFAULT_BOX_SHADOW,
    position: 'inside',
    y: 2,
    blur: 4,
    color: '#00000030',
    enabled: true,
  },
};

// Common realistic shadow presets
export const REALISTIC_SHADOW_PRESETS: Record<string, RealisticShadow> = {
  none: { ...DEFAULT_REALISTIC_SHADOW, enabled: false },
  soft: {
    ...DEFAULT_REALISTIC_SHADOW,
    diffusion: 12, // High blur for soft edges
    focus: -2, // Slight negative spread for softer appearance
    color: '#00000020',
    enabled: true,
  },
  medium: {
    ...DEFAULT_REALISTIC_SHADOW,
    diffusion: 8, // Medium blur
    focus: 0, // No spread
    color: '#00000040',
    enabled: true,
  },
  sharp: {
    ...DEFAULT_REALISTIC_SHADOW,
    diffusion: 4, // Low blur for sharp edges
    focus: 2, // Positive spread for sharper appearance
    color: '#00000060',
    enabled: true,
  },
  dramatic: {
    ...DEFAULT_REALISTIC_SHADOW,
    y: 4,
    diffusion: 16, // High blur for dramatic effect
    focus: -4, // Negative spread for diffused look
    color: '#00000080',
    enabled: true,
  },
};

// Combined presets for backward compatibility
export const SHADOW_PRESETS: Record<string, Shadow> = {
  ...BOX_SHADOW_PRESETS,
  ...REALISTIC_SHADOW_PRESETS,
};

// Type guards
export function isShadow(value: unknown): value is Shadow {
  if (!value || typeof value !== 'object') return false;

  const shadow = value as Record<string, unknown>;

  // Check common properties
  if (
    !('type' in shadow) ||
    !('position' in shadow) ||
    !('color' in shadow) ||
    !('x' in shadow) ||
    !('y' in shadow) ||
    !('enabled' in shadow)
  ) {
    return false;
  }

  // Check type-specific properties
  if (shadow.type === 'box') {
    return 'blur' in shadow && 'spread' in shadow;
  } else if (shadow.type === 'realistic') {
    return 'diffusion' in shadow && 'focus' in shadow;
  }

  return false;
}

export function isBoxShadow(value: unknown): value is BoxShadow {
  return isShadow(value) && (value as Shadow).type === 'box';
}

export function isRealisticShadow(value: unknown): value is RealisticShadow {
  return isShadow(value) && (value as Shadow).type === 'realistic';
}

// Helper to check if shadow is enabled and valid
export function isValidShadow(shadow: Shadow | undefined): boolean {
  return !!shadow && shadow.enabled;
}

// Helper to get CSS string from shadow
export function shadowToCSS(shadow: Shadow): string {
  if (!shadow.enabled) return 'none';

  const position = shadow.position === 'inside' ? 'inset ' : '';

  if (isBoxShadow(shadow)) {
    return `${position}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
  } else if (isRealisticShadow(shadow)) {
    // For realistic shadows, diffusion maps to blur and focus maps to spread directly
    return `${position}${shadow.x}px ${shadow.y}px ${shadow.diffusion}px ${shadow.focus}px ${shadow.color}`;
  }

  return 'none';
}

// Helper to parse color with opacity
export function parseShadowColor(color: string): { hex: string; opacity: number } {
  // Handle hex colors with opacity (e.g., #00000080)
  if (color.length === 9 && color.startsWith('#')) {
    const hex = color.slice(0, 7);
    const opacityHex = color.slice(7, 9);
    const opacity = parseInt(opacityHex, 16) / 255;
    return { hex, opacity };
  }

  // Handle standard hex colors
  return { hex: color, opacity: 1 };
}

// Helper to create color with opacity
export function createShadowColor(hex: string, opacity: number): string {
  if (opacity === 1) return hex;

  const opacityHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${opacityHex}`;
}
