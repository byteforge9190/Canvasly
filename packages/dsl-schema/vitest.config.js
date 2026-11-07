import { defineConfig } from 'vitest/config';
/**
 * Vitest Configuration for DSL Schema Package
 *
 * Configures testing environment for schema validation and type definitions.
 * Uses Node environment since this package doesn't require DOM APIs.
 */
export default defineConfig({
  test: {
    name: 'dsl-schema',
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/index.ts', // Re-export files
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
