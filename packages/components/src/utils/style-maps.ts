// Border mappings
export const borderMap = (color: string): Record<string, string> => ({
  none: 'none',
  thin: `1px solid ${color}`,
  medium: `2px solid ${color}`,
  thick: `4px solid ${color}`,
});

// Filter mappings for images
export const filterMap: Record<string, Record<string, string> | string> = {
  none: 'none',
  grayscale: { light: 'grayscale(0.5)', medium: 'grayscale(1)', strong: 'grayscale(1)' },
  sepia: { light: 'sepia(0.5)', medium: 'sepia(0.8)', strong: 'sepia(1)' },
  blur: { light: 'blur(2px)', medium: 'blur(4px)', strong: 'blur(8px)' },
  brightness: { light: 'brightness(1.1)', medium: 'brightness(1.2)', strong: 'brightness(1.4)' },
  contrast: { light: 'contrast(1.2)', medium: 'contrast(1.4)', strong: 'contrast(1.6)' },
  saturate: { light: 'saturate(1.3)', medium: 'saturate(1.6)', strong: 'saturate(2)' },
};

// Transition duration mappings
export const transitionDurationMap: Record<string, string> = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

// Helper to get filter value
export function getFilterValue(filter: string, intensity: string): string {
  if (filter === 'none') return 'none';
  const filterConfig = filterMap[filter];
  if (typeof filterConfig === 'object') {
    return filterConfig[intensity] || 'none';
  }
  return filterConfig || 'none';
}
