import type { ComponentRendererFn } from './base/types';

// Core renderers
import { FrameRenderer } from './FrameRenderer';

// Renderer registry
const rendererRegistry = new Map<string, ComponentRendererFn>();

// Register all built-in renderers
const builtInRenderers = [FrameRenderer];

builtInRenderers.forEach((renderer) => {
  if ('componentType' in renderer) {
    if (Array.isArray(renderer.componentType)) {
      renderer.componentType.forEach((type) => {
        rendererRegistry.set(type, renderer);
      });
    } else {
      rendererRegistry.set(renderer.componentType as string, renderer);
    }
  }
});

/**
 * Get a renderer for a specific component type
 */
export function getRenderer(type: string): ComponentRendererFn | undefined {
  return rendererRegistry.get(type);
}

/**
 * Register a custom renderer (for plugins/extensions)
 */
export function registerRenderer(type: string, renderer: ComponentRendererFn): void {
  if (rendererRegistry.has(type)) {
    console.warn(`Overwriting existing renderer for type: ${type}`);
  }
  rendererRegistry.set(type, renderer);
}

/**
 * Check if a renderer exists for a type
 */
export function hasRenderer(type: string): boolean {
  return rendererRegistry.has(type);
}

/**
 * Get all registered renderer types
 */
export function getRegisteredTypes(): string[] {
  return Array.from(rendererRegistry.keys());
}

// Re-export types and hooks
export * from './base/types';
