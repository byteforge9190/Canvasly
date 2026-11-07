import type { Component } from '@canvasly/dsl-schema';
import type { ComponentContent } from '../types/component';

/**
 * Extracts a component tree starting from a root component ID
 */
export function extractComponentTree(
  rootId: string,
  components: Record<string, Component>,
): ComponentContent {
  const extractedComponents: Record<string, Component> = {};

  const traverse = (id: string) => {
    const comp = components[id];
    if (!comp) return;

    extractedComponents[id] = JSON.parse(JSON.stringify(comp));
    comp.children.forEach((childId) => traverse(childId));
  };

  traverse(rootId);

  return {
    components: extractedComponents,
    rootComponentId: rootId,
  };
}

/**
 * Regenerates all component IDs in a ComponentContent structure
 */
export function regenerateComponentIds(
  content: ComponentContent,
  generateId: () => string,
): { newContent: ComponentContent; idMap: Record<string, string> } {
  const idMap: Record<string, string> = {};
  const newComponents: Record<string, Component> = {};

  // First pass: generate new IDs
  Object.keys(content.components).forEach((oldId) => {
    idMap[oldId] = generateId();
  });

  // Second pass: update all references
  Object.entries(content.components).forEach(([oldId, comp]) => {
    const newId = idMap[oldId];
    const newComp = JSON.parse(JSON.stringify(comp)) as Component;

    newComp.id = newId;
    newComp.parentId = comp.parentId ? idMap[comp.parentId] || null : null;
    newComp.children = comp.children.map((childId) => idMap[childId]).filter(Boolean);

    newComponents[newId] = newComp;
  });

  return {
    newContent: {
      components: newComponents,
      rootComponentId: idMap[content.rootComponentId],
    },
    idMap,
  };
}
