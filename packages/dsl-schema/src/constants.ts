export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const COMPONENT_CATEGORIES = {
  LAYOUT: 'layout',
  UI: 'ui',
  MEDIA: 'media',
  INTERACTIVE: 'interactive',
  DATA: 'data',
  FORM: 'form',
} as const;
