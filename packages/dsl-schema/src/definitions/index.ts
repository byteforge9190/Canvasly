import type { ComponentDefinition } from '../schema';
import { FrameComponentDefinition } from './frame.definition';

// Re-export frame definitions
export * from './frame.definition';
export * from './frame.presets';
export * from './button-frame.presets';

// Aggregate all definitions
export const ALL_COMPONENT_DEFINITIONS: ComponentDefinition[] = [FrameComponentDefinition];

// Helper to get definition by type
export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return ALL_COMPONENT_DEFINITIONS.find((def) => def.type === type);
}

// Helper to get definitions by category
export function getDefinitionsByCategory(category: string): ComponentDefinition[] {
  return ALL_COMPONENT_DEFINITIONS.filter((def) => def.category === category);
}
