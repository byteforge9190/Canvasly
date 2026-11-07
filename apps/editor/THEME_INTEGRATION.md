# Theme Integration Quick Reference

## For Component Developers

### Using Theme in Editor Components

```typescript
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { theme, colors, typography } = useTheme();

  return (
    <div style={{ color: colors.primary }}>
      Themed content
    </div>
  );
}
```

### Using Theme Colors in Color Picker

```typescript
import { useThemeColorOptions } from './hooks/useTheme';

function ColorPicker() {
  const themeColors = useThemeColorOptions();

  return (
    <select>
      {themeColors.map(({ label, value, token }) => (
        <option key={token} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
```

### Detecting Theme Tokens

```typescript
import { useThemeColorToken } from './hooks/useTheme';

function ColorDisplay({ color }) {
  const token = useThemeColorToken(color);

  return (
    <div>
      Color: {color}
      {token && <span>Theme token: {token}</span>}
    </div>
  );
}
```

## For Iframe/Preview Components

### Using CSS Variables

```css
.my-component {
  /* Colors */
  background-color: var(--color-primary);
  color: var(--color-text);
  border-color: var(--color-border);

  /* Typography */
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);

  /* Spacing */
  padding: var(--spacing-unit);
  max-width: var(--container-max-width);

  /* Border Radius */
  border-radius: var(--radius-medium);

  /* Shadows */
  box-shadow: var(--shadow-sm);

  /* Transitions */
  transition: var(--transition-normal);
}

.my-component:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}
```

### Available CSS Variables

#### Colors

```css
--color-primary
--color-primary-hover
--color-primary-light
--color-secondary
--color-secondary-hover
--color-accent
--color-background
--color-surface
--color-surface-hover
--color-text
--color-text-muted
--color-text-inverse
--color-border
--color-border-hover
--color-divider
--color-error
--color-error-light
--color-success
--color-success-light
--color-warning
--color-warning-light
--color-info
--color-info-light
```

#### Typography

```css
--font-family
--font-family-heading
--font-family-mono
--font-size-base
--font-size-xs
--font-size-sm
--font-size-lg
--font-size-xl
--font-size-2xl
--font-size-3xl
--font-size-4xl
--font-size-5xl
--line-height
--line-height-heading
--font-weight-heading
```

#### Spacing

```css
--spacing-unit
--spacing-section
--container-max-width
--container-padding
```

#### Border Radius

```css
--radius-none
--radius-small
--radius-medium
--radius-large
--radius-xl
--radius-full
```

#### Shadows

```css
--shadow-none
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

#### Transitions

```css
--transition-fast
--transition-normal
--transition-slow
```

## Common Patterns

### Themed Button

```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-medium);
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4);
  font-family: var(--font-family);
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}
```

### Themed Card

```css
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  padding: calc(var(--spacing-unit) * 6);
  box-shadow: var(--shadow-md);
  transition: var(--transition-normal);
}

.card:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-lg);
}
```

### Themed Typography

```css
.heading {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-heading);
  line-height: var(--line-height-heading);
  color: var(--color-text);
}

.heading-xl {
  font-size: var(--font-size-4xl);
}

.body-text {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--color-text);
}

.muted-text {
  color: var(--color-text-muted);
}
```

### Themed Container

```css
.container {
  max-width: var(--container-max-width);
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
  margin: 0 auto;
}

.section {
  padding-top: var(--spacing-section);
  padding-bottom: var(--spacing-section);
}
```

## Debugging

### Check if Theme is Loaded

```typescript
const { theme, isLoading, error } = useTheme();

console.log('Theme loaded:', !isLoading);
console.log('Theme error:', error);
console.log('Primary color:', theme.colors.primary);
```

### Inspect CSS Variables in Browser

```javascript
// In browser console
const root = document.documentElement;
const primary = getComputedStyle(root).getPropertyValue('--color-primary');
console.log('Primary color:', primary);
```

### Check Iframe Theme

```javascript
// In iframe console
const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
console.log('Iframe primary color:', primary);
```

## Troubleshooting

### Theme Not Loading

1. Check if siteId is in URL params
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Verify authentication cookies

### CSS Variables Not Working

1. Check if theme is injected into iframe
2. Inspect iframe document head for `<style id="bn-theme-variables">`
3. Verify CSS variable syntax: `var(--color-primary)`
4. Check browser DevTools computed styles

### Colors Not Updating

1. Verify theme is being sent to iframe via postMessage
2. Check iframe message listener is active
3. Inspect theme state in React DevTools
4. Clear browser cache

### Theme Colors Not in Picker

1. Verify ThemeProvider wraps the component
2. Check useThemeColorOptions() returns data
3. Verify theme.colors is populated
4. Check for TypeScript errors

## Best Practices

1. **Always use CSS variables** in iframe components
2. **Provide fallbacks** for CSS variables: `var(--color-primary, #2563eb)`
3. **Use theme hooks** instead of direct context access
4. **Test with different themes** to ensure flexibility
5. **Avoid hardcoded colors** in component styles
6. **Use semantic color names** (primary, secondary) not specific colors
7. **Leverage theme tokens** in color pickers
8. **Document theme dependencies** in component docs

## Examples

See:

- `apps/editor/src/components/layout/ThemeQuickAccess.tsx` - Theme preview
- `apps/editor/src/components/properties/inputs/ColorInput.tsx` - Theme color picker
- `apps/editor/src/components/canvas/IframeRenderer.tsx` - CSS variable injection
- `apps/editor/src/contexts/ThemeContext.tsx` - Theme management

## Support

For questions or issues:

1. Check this guide
2. Review implementation docs in `docs/SITE_THEME_SYSTEM_IMPLEMENTATION.md`
3. Check context README in `apps/editor/src/contexts/README.md`
4. Review Phase 5 summary in `docs/PHASE_5_IMPLEMENTATION_SUMMARY.md`
