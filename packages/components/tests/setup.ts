import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { DEFAULT_THEME } from '@canvasly/dsl-schema';
import type { SiteTheme } from '@canvasly/dsl-schema';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

/**
 * Mock theme context for component testing
 * Components may need theme data for styling
 */
export const mockTheme: SiteTheme = DEFAULT_THEME;

/**
 * Create a mock theme with custom values
 */
export function createMockTheme(overrides?: Partial<SiteTheme>): SiteTheme {
  return {
    ...DEFAULT_THEME,
    ...overrides,
  };
}

/**
 * Mock theme context value
 * Use this when testing components that consume theme context
 */
export const mockThemeContext = {
  theme: mockTheme,
  isLoading: false,
  error: null,
  updateTheme: vi.fn(),
  resetTheme: vi.fn(),
  refreshTheme: vi.fn().mockResolvedValue(undefined),
};

/**
 * Create a mock theme context with custom values
 */
export function createMockThemeContext(overrides?: Partial<typeof mockThemeContext>) {
  return {
    ...mockThemeContext,
    ...overrides,
  };
}
