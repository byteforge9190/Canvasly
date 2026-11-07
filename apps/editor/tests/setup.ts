import React from 'react';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

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

// Mock IntersectionObserver (often needed for editor components)
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn().mockReturnValue([]),
}));
// Mock lucide-react with a Proxy to handle any icon name as a valid React component
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy(actual as any, {
    get: (target, prop) => {
      // Handle non-string props (like Symbol.toStringTag)
      if (typeof prop !== 'string') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (target as any)[prop];
      }

      // If the property exists in the actual module and is not a component (lowercase or special), return it
      if (prop[0] === prop[0].toLowerCase() && prop !== 'React') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (target as any)[prop];
      }

      // Return a stable component for any icon name
      const iconName = prop;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MockIcon = (props: any) => {
        return React.createElement(
          'span',
          { ...props, 'data-testid': `${iconName.toLowerCase()}-icon` },
          iconName,
        );
      };
      MockIcon.displayName = iconName;
      return MockIcon;
    },
  });
});
