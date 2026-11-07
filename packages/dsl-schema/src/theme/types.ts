/**
 * Theme system types for the DSL Schema package
 * These types match the backend Go models exactly for API compatibility
 */

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderHover: string;
  divider: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
}

export interface ThemeFontScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  monoFontFamily: string;
  baseFontSize: string;
  lineHeight: string;
  headingLineHeight: string;
  headingFontWeight: string;
  scale: ThemeFontScale;
}

export interface ThemeSpacing {
  unit: string;
  sectionPadding: string;
  containerMaxWidth: string;
  containerPadding: string;
}

export interface ThemeBorderRadius {
  none: string;
  small: string;
  medium: string;
  large: string;
  xl: string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeTransitions {
  fast: string;
  normal: string;
  slow: string;
}

export interface SiteTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  transitions?: ThemeTransitions;
}

export interface ThemePreset {
  id: string;
  name: string;
  slug: string;
  description?: string;
  theme: SiteTheme;
  thumbnail_url?: string;
  is_system: boolean;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ThemePresetListItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  is_system: boolean;
}

export interface UpdateSiteThemeInput {
  theme?: SiteTheme;
  theme_preset?: string;
  merge?: boolean;
}

export interface ApplyThemePresetInput {
  preset_slug: string;
}

// Theme-related API response types
export interface SiteThemeResponse {
  theme: SiteTheme;
  theme_preset?: string;
}

export interface ThemePresetsResponse {
  presets: ThemePresetListItem[];
}

export interface ApplyPresetResponse {
  theme: SiteTheme;
  theme_preset: string;
  message: string;
}

// CSS Variable mapping types
export type CSSVariableMap = Record<string, string>;

// Theme token categories for organization
export type ThemeTokenCategory =
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'borderRadius'
  | 'shadows'
  | 'transitions';

// Utility types for theme manipulation
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ThemeUpdate = DeepPartial<SiteTheme>;
