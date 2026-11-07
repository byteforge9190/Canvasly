/**
 * Theme system exports for DSL Schema
 * Provides TypeScript types and utilities for the site theme system
 */

// Types
export type {
  ThemeColors,
  ThemeFontScale,
  ThemeTypography,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeTransitions,
  SiteTheme,
  ThemePreset,
  ThemePresetListItem,
  UpdateSiteThemeInput,
  ApplyThemePresetInput,
  SiteThemeResponse,
  ThemePresetsResponse,
  ApplyPresetResponse,
  CSSVariableMap,
  ThemeTokenCategory,
  DeepPartial,
  ThemeUpdate,
} from './types.js';

// Default theme and utilities
export {
  DEFAULT_THEME,
  mergeTheme,
  getThemeWithDefaults,
  validateTheme,
  createMinimalTheme,
} from './defaults.js';

// CSS generation utilities
export {
  generateThemeCSS,
  generateThemeVariables,
  applyThemeVariables,
  removeThemeVariables,
  getThemeVariable,
  cssVar,
  createThemeStyles,
  generateCompleteThemeCSS,
  THEME_UTILITY_CLASSES,
} from './css.js';

// Color utilities
export {
  isCSSVariable,
  extractVariableName,
  colorTokenToCSSVar,
  cssVarToColorToken,
  findColorToken,
  colorValueToCSSVar,
  resolveCSSVar,
  getColorTokenLabel,
  getThemeColorOptions,
} from './color-utils.js';
