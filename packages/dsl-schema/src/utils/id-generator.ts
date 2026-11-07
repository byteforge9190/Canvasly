/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix = 'item'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Remap item IDs to prevent collisions during import/merge
 */
export function remapItemIds<T extends { id: string; children?: T[] }>(
  items: T[],
  componentId: string,
): T[] {
  const usedIds = new Set<string>();

  const remapItem = (item: T): T => {
    let newId = `${componentId}-${generateId()}`;
    while (usedIds.has(newId)) {
      newId = `${componentId}-${generateId()}`;
    }
    usedIds.add(newId);

    return {
      ...item,
      id: newId,
      children: item.children?.map(remapItem) as T['children'],
    };
  };

  return items.map(remapItem);
}
