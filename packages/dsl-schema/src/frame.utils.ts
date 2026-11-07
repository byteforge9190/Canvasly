/**
 * Get a value from a nested object by dot-path
 * @example getByPath({ layout: { gap: '20px' } }, 'layout.gap') → '20px'
 */
export function getByPath(obj: any, path: string): unknown {
  return path.split('.').reduce((acc: any, key) => {
    if (acc && typeof acc === 'object') return acc[key];
    return undefined;
  }, obj);
}

/**
 * Set a value in a nested object by dot-path (immutable)
 * @example setByPath({ layout: { mode: 'block' } }, 'layout.gap', '20px')
 *   → { layout: { mode: 'block', gap: '20px' } }
 */
export function setByPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const result = { ...(obj as any) };
  let current: any = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] || {}) };
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result as T;
}

/**
 * Apply multiple path-based mutations at once
 * @example applyFrameMutations(frame, { 'layout.mode': 'flex', 'layout.gap': '16px' })
 */
export function applyFrameMutations<T>(frame: T, mutations: Record<string, unknown>): T {
  let result = { ...(frame as any) };
  for (const [path, value] of Object.entries(mutations)) {
    result = setByPath(result, path, value);
  }
  return result as T;
}

/**
 * Deep merges two objects (immutable)
 */
export function deepMerge<T extends object>(target: T, source: any): T {
  const result = { ...(target as any) };
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = (target as any)[key];

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      result[key] = deepMerge(targetValue || {}, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  });
  return result as T;
}
