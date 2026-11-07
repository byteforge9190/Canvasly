import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../../src/contexts/ThemeContext';
import { DEFAULT_THEME } from '@bn/dsl-schema';
import type { SiteTheme } from '@bn/dsl-schema';

// Re-export specific utilities to avoid react-refresh issues
export { screen, waitFor, within, fireEvent } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: SiteTheme;
  siteId?: string | null;
  initialTheme?: SiteTheme;
}

/**
 * Custom render function with ThemeContext provider
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithTheme(<MyComponent />, {
 *   theme: customTheme,
 *   siteId: 'test-site-123'
 * });
 * ```
 */
export function renderWithTheme(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { theme = DEFAULT_THEME, siteId = null, initialTheme, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider siteId={siteId} initialTheme={initialTheme || theme}>
        {children}
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Custom render function with Zustand store provider
 * Note: Zustand stores are global by default, so we need to reset them between tests
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithStore(<MyComponent />);
 * ```
 */
export function renderWithStore(ui: ReactElement, options: RenderOptions = {}) {
  // Zustand stores are global, so we just render the component
  // Store state should be reset in beforeEach/afterEach hooks
  return render(ui, options);
}

/**
 * Custom render function with both ThemeContext and Zustand store
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />, {
 *   theme: customTheme,
 *   siteId: 'test-site-123'
 * });
 * ```
 */
export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { theme = DEFAULT_THEME, siteId = null, initialTheme, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider siteId={siteId} initialTheme={initialTheme || theme}>
        {children}
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Default export for convenience
export { render };
