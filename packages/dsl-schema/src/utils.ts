import type { Component, NormalizedPageState, Page } from './types';

// Re-export utilities
export * from './utils/id-generator';

/**
 * Normalizes a Page object into a NormalizedPageState.
 * This flattens the nested structure for easier manipulation in the editor.
 */
export function normalizePage(page: Page): NormalizedPageState {
  const { componentOrder, components, ...pageMetadata } = page;

  return {
    page: pageMetadata,
    components: { ...components },
    componentOrder: componentOrder || [],
  };
}

/**
 * Denormalizes a NormalizedPageState back into a Page object.
 */
export function denormalizePage(state: NormalizedPageState): Page {
  return {
    ...state.page,
    componentOrder: state.componentOrder,
    components: state.components,
  };
}

/**
 * Recursively finds all child component IDs for a given component.
 */
export function getAllChildIds(
  componentId: string,
  components: Record<string, Component>,
): string[] {
  const component = components[componentId];
  if (!component) return [];

  let ids: string[] = [];
  component.children.forEach((childId) => {
    ids.push(childId);
    ids = ids.concat(getAllChildIds(childId, components));
  });

  return ids;
}

/**
 * Creates a deep clone of a component with a new ID.
 */
export function cloneComponent(
  component: Component,
  newId: string,
  newParentId: string | null = null,
): Component {
  return {
    ...JSON.parse(JSON.stringify(component)),
    id: newId,
    parentId: newParentId,
    metadata: {
      ...component.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
