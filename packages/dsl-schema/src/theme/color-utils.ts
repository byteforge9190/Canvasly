/**
 * Color utilities for theme system
 * Handles conversion between color values and CSS variable references
 */

import type { ThemeColors } from './types.js';

/**
 * Check if a string is a CSS variable reference
 * @example isCSSVariable('var(--color-primary)') // true
 * @example isCSSVariable('#ff0000') // false
 */
export function isCSSVariable(value: string): boolean {
  return /^var\(--[a-z-]+\)$/.test(value.trim());
}

/**
 * Extract the variable name from a CSS variable reference
 * @example extractVariableName('var(--color-primary)') // '--color-primary'
 * @example extractVariableName('var(--color-primary, #ff0000)') // '--color-primary'
 */
export function extractVariableName(cssVar: string): string | null {
  const match = cssVar.match(/^var\((--[a-z-]+)(?:,\s*.+)?\)$/);
  return match ? match[1] : null;
}

/**
 * Convert a theme color token to a CSS variable reference
 * @example colorTokenToCSSVar('primary') // 'var(--color-primary)'
 * @example colorTokenToCSSVar('primaryHover') // 'var(--color-primary-hover)'
 */
export function colorTokenToCSSVar(token: string): string {
  // Convert camelCase to kebab-case
  const kebabToken = token.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return `var(--color-${kebabToken})`;
}

/**
 * Convert a CSS variable reference to a theme color token
 * @example cssVarToColorToken('var(--color-primary)') // 'primary'
 * @example cssVarToColorToken('var(--color-primary-hover)') // 'primaryHover'
 */
export function cssVarToColorToken(cssVar: string): string | null {
  const varName = extractVariableName(cssVar);
  if (!varName || !varName.startsWith('--color-')) {
    return null;
  }

  // Remove '--color-' prefix and convert kebab-case to camelCase
  const kebabToken = varName.replace('--color-', '');
  return kebabToken.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Check if a color value matches a theme color
 * Returns the token name if it matches, null otherwise
 */
export function findColorToken(colorValue: string, themeColors: ThemeColors): string | null {
  const normalizedValue = colorValue.trim().toUpperCase();

  for (const [token, value] of Object.entries(themeColors)) {
    if (value.toUpperCase() === normalizedValue) {
      return token;
    }
  }

  return null;
}

/**
 * Convert a color value to a CSS variable reference if it matches a theme color
 * Otherwise returns the original value
 */
export function colorValueToCSSVar(colorValue: string, themeColors: ThemeColors): string {
  // If already a CSS variable, return as-is
  if (isCSSVariable(colorValue)) {
    return colorValue;
  }

  // Try to find matching theme color
  const token = findColorToken(colorValue, themeColors);
  if (token) {
    return colorTokenToCSSVar(token);
  }

  // Return original value if no match
  return colorValue;
}

/**
 * Resolve a CSS variable to its actual color value
 * If the value is not a CSS variable, returns it as-is
 */
export function resolveCSSVar(value: string, themeColors: ThemeColors): string {
  // If not a CSS variable, return as-is
  if (!isCSSVariable(value)) {
    return value;
  }

  // Extract token and resolve
  const token = cssVarToColorToken(value);
  if (token && token in themeColors) {
    return themeColors[token as keyof ThemeColors];
  }

  // Return original if can't resolve
  return value;
}

/**
 * Get a human-readable label for a color token
 * @example getColorTokenLabel('primary') // 'Primary'
 * @example getColorTokenLabel('primaryHover') // 'Primary Hover'
 */
export function getColorTokenLabel(token: string): string {
  return token
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Get all theme colors as options for a color picker
 * Returns both the CSS variable reference and the resolved color value
 */
export function getThemeColorOptions(themeColors: ThemeColors): Array<{
  label: string;
  token: string;
  cssVar: string;
  value: string;
}> {
  return Object.entries(themeColors).map(([token, value]) => ({
    label: getColorTokenLabel(token),
    token,
    cssVar: colorTokenToCSSVar(token),
    value,
  }));
}
