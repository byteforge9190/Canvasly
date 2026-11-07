/**
 * Runtime resolver for overlay positioning
 * This is the default resolver used in browser environments
 */
export const runtimeResolveBounds = (componentId: string): DOMRect | null => {
  const element = document.getElementById(componentId);
  return element?.getBoundingClientRect() || null;
};
