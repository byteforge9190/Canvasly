/**
 * CSS variable generation and theme utilities
 * Converts theme tokens to CSS custom properties
 */

import type { SiteTheme, CSSVariableMap } from './types.js';
import { getThemeWithDefaults } from './defaults.js';

/**
 * Convert camelCase to kebab-case for CSS variables
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generate CSS custom properties from theme
 * This matches the backend theme_service.go GenerateCSS function
 *
 * Handles partial or null themes by merging with defaults
 */
export function generateThemeCSS(theme: SiteTheme | Partial<SiteTheme> | null | undefined): string {
  // Ensure we have a complete theme by merging with defaults
  const completeTheme = getThemeWithDefaults(theme ?? undefined);

  const lines: string[] = [':root {'];

  // Colors
  Object.entries(completeTheme.colors).forEach(([key, value]) => {
    const cssVar = `--color-${camelToKebab(key)}`;
    lines.push(`  ${cssVar}: ${value};`);
  });

  // Typography
  lines.push(`  --font-family: ${completeTheme.typography.fontFamily};`);
  lines.push(`  --font-family-heading: ${completeTheme.typography.headingFontFamily};`);
  lines.push(`  --font-family-mono: ${completeTheme.typography.monoFontFamily};`);
  lines.push(`  --font-size-base: ${completeTheme.typography.baseFontSize};`);
  lines.push(`  --line-height: ${completeTheme.typography.lineHeight};`);
  lines.push(`  --line-height-heading: ${completeTheme.typography.headingLineHeight};`);
  lines.push(`  --font-weight-heading: ${completeTheme.typography.headingFontWeight};`);

  // Typography scale
  Object.entries(completeTheme.typography.scale).forEach(([key, value]) => {
    lines.push(`  --font-size-${key}: ${value};`);
  });

  // Spacing
  lines.push(`  --spacing-unit: ${completeTheme.spacing.unit};`);
  lines.push(`  --spacing-section: ${completeTheme.spacing.sectionPadding};`);
  lines.push(`  --container-max-width: ${completeTheme.spacing.containerMaxWidth};`);
  lines.push(`  --container-padding: ${completeTheme.spacing.containerPadding};`);

  // Border Radius
  Object.entries(completeTheme.borderRadius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(completeTheme.shadows).forEach(([key, value]) => {
    lines.push(`  --shadow-${key}: ${value};`);
  });

  // Transitions (optional)
  if (completeTheme.transitions) {
    Object.entries(completeTheme.transitions).forEach(([key, value]) => {
      lines.push(`  --transition-${key}: ${value};`);
    });
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate CSS variables as a key-value map
 * Useful for programmatic access to theme tokens
 *
 * Handles partial or null themes by merging with defaults
 */
export function generateThemeVariables(
  theme: SiteTheme | Partial<SiteTheme> | null | undefined,
): CSSVariableMap {
  // Ensure we have a complete theme by merging with defaults
  const completeTheme = getThemeWithDefaults(theme ?? undefined);

  const variables: CSSVariableMap = {};

  // Colors
  Object.entries(completeTheme.colors).forEach(([key, value]) => {
    variables[`--color-${camelToKebab(key)}`] = value;
  });

  // Typography
  variables['--font-family'] = completeTheme.typography.fontFamily;
  variables['--font-family-heading'] = completeTheme.typography.headingFontFamily;
  variables['--font-family-mono'] = completeTheme.typography.monoFontFamily;
  variables['--font-size-base'] = completeTheme.typography.baseFontSize;
  variables['--line-height'] = completeTheme.typography.lineHeight;
  variables['--line-height-heading'] = completeTheme.typography.headingLineHeight;
  variables['--font-weight-heading'] = completeTheme.typography.headingFontWeight;

  // Typography scale
  Object.entries(completeTheme.typography.scale).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value;
  });

  // Spacing
  variables['--spacing-unit'] = completeTheme.spacing.unit;
  variables['--spacing-section'] = completeTheme.spacing.sectionPadding;
  variables['--container-max-width'] = completeTheme.spacing.containerMaxWidth;
  variables['--container-padding'] = completeTheme.spacing.containerPadding;

  // Border Radius
  Object.entries(completeTheme.borderRadius).forEach(([key, value]) => {
    variables[`--radius-${key}`] = value;
  });

  // Shadows
  Object.entries(completeTheme.shadows).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });

  // Transitions
  if (completeTheme.transitions) {
    Object.entries(completeTheme.transitions).forEach(([key, value]) => {
      variables[`--transition-${key}`] = value;
    });
  }

  return variables;
}

/**
 * Apply theme variables to a DOM element
 * Useful for runtime theme switching
 */
export function applyThemeVariables(
  element: HTMLElement,
  theme: SiteTheme | Partial<SiteTheme> | null | undefined,
): void {
  const variables = generateThemeVariables(theme);

  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

/**
 * Remove theme variables from a DOM element
 */
export function removeThemeVariables(
  element: HTMLElement,
  theme: SiteTheme | Partial<SiteTheme> | null | undefined,
): void {
  const variables = generateThemeVariables(theme);

  Object.keys(variables).forEach((property) => {
    element.style.removeProperty(property);
  });
}

/**
 * Get CSS variable name for a theme token
 * Useful for building CSS-in-JS styles
 */
export function getThemeVariable(category: string, token: string): string {
  const kebabCategory = camelToKebab(category);
  const kebabToken = camelToKebab(token);

  // Handle special cases
  if (category === 'colors') {
    return `--color-${kebabToken}`;
  }

  if (category === 'typography') {
    if (token.includes('fontSize') || token === 'baseFontSize') {
      return `--font-size-${kebabToken.replace('font-size-', '')}`;
    }
    if (token.includes('fontFamily')) {
      return `--font-family${kebabToken.includes('heading') ? '-heading' : kebabToken.includes('mono') ? '-mono' : ''}`;
    }
    if (token.includes('lineHeight')) {
      return `--line-height${kebabToken.includes('heading') ? '-heading' : ''}`;
    }
    if (token.includes('fontWeight')) {
      return `--font-weight-${kebabToken.replace('font-weight-', '')}`;
    }
  }

  if (category === 'spacing') {
    return `--spacing-${kebabToken}`;
  }

  if (category === 'borderRadius') {
    return `--radius-${kebabToken}`;
  }

  if (category === 'shadows') {
    return `--shadow-${kebabToken}`;
  }

  if (category === 'transitions') {
    return `--transition-${kebabToken}`;
  }

  return `--${kebabCategory}-${kebabToken}`;
}

/**
 * Create a CSS var() function call for a theme token
 */
export function cssVar(category: string, token: string, fallback?: string): string {
  const variable = getThemeVariable(category, token);
  return fallback ? `var(${variable}, ${fallback})` : `var(${variable})`;
}

/**
 * Generate CSS for component styles using theme tokens
 * Helper for creating theme-aware component styles
 */
export function createThemeStyles(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([selector, rules]) => `${selector} { ${rules} }`)
    .join('\n');
}

/**
 * Common CSS utility classes using theme variables
 */
export const THEME_UTILITY_CLASSES = `
/* Theme-aware utility classes */
.theme-bg-primary { background-color: var(--color-primary); }
.theme-bg-secondary { background-color: var(--color-secondary); }
.theme-bg-surface { background-color: var(--color-surface); }
.theme-bg-background { background-color: var(--color-background); }

.theme-text-primary { color: var(--color-text); }
.theme-text-muted { color: var(--color-text-muted); }
.theme-text-inverse { color: var(--color-text-inverse); }

.theme-border { border-color: var(--color-border); }
.theme-border-hover:hover { border-color: var(--color-border-hover); }

.theme-shadow-sm { box-shadow: var(--shadow-sm); }
.theme-shadow-md { box-shadow: var(--shadow-md); }
.theme-shadow-lg { box-shadow: var(--shadow-lg); }

.theme-rounded-sm { border-radius: var(--radius-small); }
.theme-rounded-md { border-radius: var(--radius-medium); }
.theme-rounded-lg { border-radius: var(--radius-large); }

.theme-font-base { font-family: var(--font-family); }
.theme-font-heading { font-family: var(--font-family-heading); }
.theme-font-mono { font-family: var(--font-family-mono); }

.theme-transition-fast { transition: var(--transition-fast); }
.theme-transition-normal { transition: var(--transition-normal); }
.theme-transition-slow { transition: var(--transition-slow); }
`;

/**
 * Generate a complete CSS stylesheet with theme variables and utilities
 */
export function generateCompleteThemeCSS(
  theme: SiteTheme | Partial<SiteTheme> | null | undefined,
): string {
  return [generateThemeCSS(theme), '', THEME_UTILITY_CLASSES].join('\n');
}
