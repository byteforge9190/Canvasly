# Theme System

The theme system provides a comprehensive solution for managing site-wide design tokens including colors, typography, spacing, and more.

## Overview

The theme system consists of:

- **Types**: TypeScript interfaces that match the backend Go models
- **Defaults**: Default theme configuration and merge utilities
- **CSS Generation**: Convert theme tokens to CSS custom properties
- **Validation**: Ensure theme structure is valid

## Basic Usage

```typescript
import {
  DEFAULT_THEME,
  generateThemeCSS,
  mergeTheme,
  cssVar,
  type SiteTheme,
} from '@bn/dsl-schema';

// Use the default theme
const theme = DEFAULT_THEME;

// Generate CSS variables
const css = generateThemeCSS(theme);
console.log(css);
// Output:
// :root {
//   --color-primary: #2563eb;
//   --color-secondary: #64748b;
//   --font-family: Inter, system-ui, -apple-system, sans-serif;
//   ...
// }

// Use in component styles
const buttonStyles = `
  background-color: ${cssVar('colors', 'primary')};
  color: ${cssVar('colors', 'textInverse')};
  border-radius: ${cssVar('borderRadius', 'small')};
  font-family: ${cssVar('typography', 'fontFamily')};
`;
```

## Theme Structure

```typescript
interface SiteTheme {
  colors: {
    // Brand colors
    primary: string;
    primaryHover: string;
    primaryLight: string;
    secondary: string;
    secondaryHover: string;
    accent: string;

    // Background colors
    background: string;
    surface: string;
    surfaceHover: string;

    // Text colors
    text: string;
    textMuted: string;
    textInverse: string;

    // UI colors
    border: string;
    borderHover: string;
    divider: string;

    // Semantic colors
    error: string;
    errorLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
  };

  typography: {
    fontFamily: string;
    headingFontFamily: string;
    monoFontFamily: string;
    baseFontSize: string;
    lineHeight: string;
    headingLineHeight: string;
    headingFontWeight: string;
    scale: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
  };

  spacing: {
    unit: string;
    sectionPadding: string;
    containerMaxWidth: string;
    containerPadding: string;
  };

  borderRadius: {
    none: string;
    small: string;
    medium: string;
    large: string;
    xl: string;
    full: string;
  };

  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  transitions?: {
    fast: string;
    normal: string;
    slow: string;
  };
}
```

## Merging Themes

```typescript
import { mergeTheme, DEFAULT_THEME } from '@bn/dsl-schema';

// Create a custom theme by merging with defaults
const customTheme = mergeTheme(DEFAULT_THEME, {
  colors: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

// Only the specified properties are overridden
console.log(customTheme.colors.primary); // '#8b5cf6'
console.log(customTheme.colors.secondary); // '#64748b' (from default)
console.log(customTheme.typography.fontFamily); // 'Roboto, sans-serif'
console.log(customTheme.typography.baseFontSize); // '16px' (from default)
```

## CSS Variable Generation

```typescript
import { generateThemeCSS, generateThemeVariables, applyThemeVariables } from '@bn/dsl-schema';

// Generate complete CSS stylesheet
const css = generateThemeCSS(theme);

// Generate as key-value map
const variables = generateThemeVariables(theme);
console.log(variables['--color-primary']); // '#2563eb'

// Apply to DOM element
const element = document.documentElement;
applyThemeVariables(element, theme);
```

## Using CSS Variables in Components

```typescript
import { cssVar } from '@bn/dsl-schema';

// Generate CSS var() functions
const styles = {
  backgroundColor: cssVar('colors', 'primary'),
  color: cssVar('colors', 'textInverse'),
  padding: cssVar('spacing', 'unit'),
  borderRadius: cssVar('borderRadius', 'small'),
  boxShadow: cssVar('shadows', 'md'),
  fontFamily: cssVar('typography', 'fontFamily'),
  fontSize: cssVar('typography', 'baseFontSize'),
  transition: cssVar('transitions', 'normal'),
};

// With fallbacks
const safeStyles = {
  backgroundColor: cssVar('colors', 'primary', '#2563eb'),
  borderRadius: cssVar('borderRadius', 'small', '4px'),
};
```

## Theme Validation

```typescript
import { validateTheme, getThemeWithDefaults } from '@bn/dsl-schema';

// Validate theme structure
const isValid = validateTheme(someTheme);

if (!isValid) {
  console.error('Invalid theme structure');
}

// Get theme with fallback to defaults
const safeTheme = getThemeWithDefaults(partialTheme);
```

## Integration with React/Vue Components

### React Example

```tsx
import React from 'react';
import { cssVar } from '@bn/dsl-schema';

const Button: React.FC<{ variant?: 'primary' | 'secondary' }> = ({
  variant = 'primary',
  children,
}) => {
  const styles = {
    backgroundColor: cssVar('colors', variant),
    color: cssVar('colors', 'textInverse'),
    border: 'none',
    borderRadius: cssVar('borderRadius', 'small'),
    padding: `calc(${cssVar('spacing', 'unit')} * 2) calc(${cssVar('spacing', 'unit')} * 4)`,
    fontFamily: cssVar('typography', 'fontFamily'),
    fontSize: cssVar('typography', 'baseFontSize'),
    cursor: 'pointer',
    transition: cssVar('transitions', 'normal'),
  };

  return <button style={styles}>{children}</button>;
};
```

### CSS-in-JS Example

```typescript
import styled from 'styled-components';
import { cssVar } from '@bn/dsl-schema';

const StyledButton = styled.button`
  background-color: ${cssVar('colors', 'primary')};
  color: ${cssVar('colors', 'textInverse')};
  border: none;
  border-radius: ${cssVar('borderRadius', 'small')};
  padding: calc(${cssVar('spacing', 'unit')} * 2) calc(${cssVar('spacing', 'unit')} * 4);
  font-family: ${cssVar('typography', 'fontFamily')};
  font-size: ${cssVar('typography', 'baseFontSize')};
  cursor: pointer;
  transition: ${cssVar('transitions', 'normal')};

  &:hover {
    background-color: ${cssVar('colors', 'primaryHover')};
  }
`;
```

## API Integration

The theme types are designed to work seamlessly with the backend API:

```typescript
import type {
  SiteThemeResponse,
  UpdateSiteThemeInput,
  ApplyThemePresetInput,
} from '@bn/dsl-schema';

// Fetch site theme
const response: SiteThemeResponse = await fetch('/api/v1/sites/123/theme').then((res) =>
  res.json(),
);

// Update theme
const updateInput: UpdateSiteThemeInput = {
  theme: customTheme,
  merge: true,
};

await fetch('/api/v1/sites/123/theme', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateInput),
});

// Apply preset
const presetInput: ApplyThemePresetInput = {
  presetSlug: 'dark',
};

await fetch('/api/v1/sites/123/apply-preset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(presetInput),
});
```

## Best Practices

1. **Use semantic color names**: Prefer `primary`, `secondary` over specific colors like `blue`, `red`
2. **Leverage CSS variables**: Use `cssVar()` helper for consistent variable naming
3. **Validate themes**: Always validate theme structure before applying
4. **Merge with defaults**: Use `getThemeWithDefaults()` to ensure complete themes
5. **Type safety**: Use TypeScript interfaces for compile-time validation

## Performance Considerations

- CSS variables are applied at runtime, so changes are instant
- Use `generateThemeVariables()` for programmatic access without string parsing
- Cache generated CSS when possible to avoid regeneration
- Consider using CSS-in-JS libraries that support CSS variables for optimal performance
