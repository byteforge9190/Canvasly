/**
 * Default theme values and utilities
 * This matches the backend GetDefaultTheme() function
 */

import type { SiteTheme, ThemeUpdate } from './types.js';

/**
 * Default theme configuration
 * This must match the backend models/theme.go GetDefaultTheme() function
 */
export const DEFAULT_THEME: SiteTheme = {
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    secondary: '#64748b',
    secondaryHover: '#475569',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: '#1e293b',
    textMuted: '#64748b',
    textInverse: '#ffffff',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    divider: '#e2e8f0',
    error: '#ef4444',
    errorLight: '#fee2e2',
    success: '#22c55e',
    successLight: '#dcfce7',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#3b82f6',
    infoLight: '#dbeafe',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    headingFontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    monoFontFamily: 'ui-monospace, monospace',
    baseFontSize: '16px',
    lineHeight: '1.6',
    headingLineHeight: '1.2',
    headingFontWeight: '700',
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
  },
  spacing: {
    unit: '4px',
    sectionPadding: '80px',
    containerMaxWidth: '1200px',
    containerPadding: '24px',
  },
  borderRadius: {
    none: '0',
    small: '4px',
    medium: '8px',
    large: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
};

/**
 * Deep merge utility for theme updates
 * Safely merges partial theme updates with existing theme
 */
export function mergeTheme(base: SiteTheme, updates: ThemeUpdate): SiteTheme {
  const result = { ...base };

  if (updates.colors) {
    result.colors = { ...base.colors, ...updates.colors };
  }

  if (updates.typography) {
    result.typography = {
      ...base.typography,
      ...updates.typography,
      scale: updates.typography.scale
        ? { ...base.typography.scale, ...updates.typography.scale }
        : base.typography.scale,
    };
  }

  if (updates.spacing) {
    result.spacing = { ...base.spacing, ...updates.spacing };
  }

  if (updates.borderRadius) {
    result.borderRadius = { ...base.borderRadius, ...updates.borderRadius };
  }

  if (updates.shadows) {
    result.shadows = { ...base.shadows, ...updates.shadows };
  }

  if (updates.transitions) {
    result.transitions = { ...base.transitions, ...updates.transitions };
  }

  return result;
}

/**
 * Get theme with fallback to defaults
 * Ensures all required theme properties are present
 */
export function getThemeWithDefaults(theme?: Partial<SiteTheme>): SiteTheme {
  if (!theme) {
    return DEFAULT_THEME;
  }

  return mergeTheme(DEFAULT_THEME, theme);
}

/**
 * Validate theme structure
 * Basic validation to ensure theme has required properties
 */
export function validateTheme(theme: unknown): theme is SiteTheme {
  if (!theme || typeof theme !== 'object') {
    return false;
  }

  const t = theme as Record<string, unknown>;

  // Check required top-level properties
  const requiredProps = ['colors', 'typography', 'spacing', 'borderRadius', 'shadows'];
  for (const prop of requiredProps) {
    if (!t[prop] || typeof t[prop] !== 'object') {
      return false;
    }
  }

  // Basic color validation
  const colors = t.colors as Record<string, unknown>;
  const requiredColors = ['primary', 'secondary', 'background', 'text'];
  for (const color of requiredColors) {
    if (!colors[color] || typeof colors[color] !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Create a minimal theme for testing/development
 */
export function createMinimalTheme(overrides: ThemeUpdate = {}): SiteTheme {
  const minimal: SiteTheme = {
    colors: {
      primary: '#000000',
      primaryHover: '#333333',
      primaryLight: '#f0f0f0',
      secondary: '#666666',
      secondaryHover: '#444444',
      accent: '#ff6b35',
      background: '#ffffff',
      surface: '#fafafa',
      surfaceHover: '#f5f5f5',
      text: '#000000',
      textMuted: '#666666',
      textInverse: '#ffffff',
      border: '#e0e0e0',
      borderHover: '#cccccc',
      divider: '#e0e0e0',
      error: '#dc2626',
      errorLight: '#fef2f2',
      success: '#16a34a',
      successLight: '#f0fdf4',
      warning: '#ca8a04',
      warningLight: '#fefce8',
      info: '#2563eb',
      infoLight: '#eff6ff',
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      headingFontFamily: 'system-ui, sans-serif',
      monoFontFamily: 'monospace',
      baseFontSize: '16px',
      lineHeight: '1.5',
      headingLineHeight: '1.2',
      headingFontWeight: '600',
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
    },
    spacing: {
      unit: '4px',
      sectionPadding: '64px',
      containerMaxWidth: '1024px',
      containerPadding: '16px',
    },
    borderRadius: {
      none: '0',
      small: '2px',
      medium: '4px',
      large: '8px',
      xl: '16px',
      full: '9999px',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 2px 4px rgba(0, 0, 0, 0.1)',
      lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
      xl: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
  };

  return mergeTheme(minimal, overrides);
}
