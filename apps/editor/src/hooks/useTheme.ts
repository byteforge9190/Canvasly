import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { ThemeColors } from '@canvasly/dsl-schema';
import {
  generateThemeVariables,
  cssVar,
  getThemeColorOptions,
  resolveCSSVar,
  isCSSVariable,
  findColorToken,
} from '@canvasly/dsl-schema';

/**
 * Hook for accessing theme context
 * Must be used within a ThemeProvider
 */
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook for accessing theme in editor components
 * Provides theme data and utilities for working with theme tokens
 */
export function useTheme() {
  const { theme, isLoading, error, updateTheme, resetTheme, refreshTheme } = useThemeContext();

  return {
    theme,
    isLoading,
    error,
    updateTheme,
    resetTheme,
    refreshTheme,

    // Convenience accessors
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
    transitions: theme.transitions,

    // Utility functions
    getVariable: (category: string, token: string) => cssVar(category, token),
    getVariables: () => generateThemeVariables(theme),
  };
}

/**
 * Hook for getting theme colors with fallbacks
 * Useful for color pickers and style editors
 */
export function useThemeColors(): ThemeColors {
  const { colors } = useTheme();
  return colors;
}

/**
 * Hook for checking if a color is a theme token
 * Returns the token name if it matches a theme color
 */
export function useThemeColorToken(color: string): string | null {
  const colors = useThemeColors();

  // Check if it's a CSS variable first
  if (isCSSVariable(color)) {
    return color; // Return the CSS variable as-is
  }

  // Otherwise, try to find matching color value
  return findColorToken(color, colors);
}

/**
 * Hook for getting all theme colors as options for color picker
 * Returns CSS variable references instead of raw values
 */
export function useThemeColorOptions(): Array<{
  label: string;
  token: string;
  cssVar: string;
  value: string;
}> {
  const colors = useThemeColors();
  return getThemeColorOptions(colors);
}

/**
 * Hook for resolving a color value (CSS var or hex) to its actual hex value
 */
export function useResolveColor(color: string): string {
  const colors = useThemeColors();
  return resolveCSSVar(color, colors);
}
