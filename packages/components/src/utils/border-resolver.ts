import type { Border, BorderWidthSides } from '@canvasly/dsl-schema';
import type { CSSProperties } from 'react';

import { featureFlags } from './feature-flags';

/**
 * Resolve a Border object to CSS properties
 * Supports both uniform and per-side border widths
 */
export function resolveBorderToCSS(border: Border | undefined): CSSProperties {
  if (!border || border.style === 'none') {
    return {};
  }

  const css: CSSProperties = {
    borderStyle: border.style,
    borderColor: border.color,
  };

  // Handle width - can be uniform number or per-side object
  if (typeof border.width === 'number') {
    // Uniform width
    if (border.width === 0) {
      return {};
    }
    css.borderWidth = `${border.width}px`;
  } else {
    // Per-side widths
    const sides = border.width as BorderWidthSides;

    // Check if all sides are zero
    if (sides.top === 0 && sides.right === 0 && sides.bottom === 0 && sides.left === 0) {
      return {};
    }

    // Apply per-side widths
    if (featureFlags.enableLogicalProperties) {
      css.borderBlockStartWidth = `${sides.top}px`;
      css.borderInlineEndWidth = `${sides.right}px`;
      css.borderBlockEndWidth = `${sides.bottom}px`;
      css.borderInlineStartWidth = `${sides.left}px`;
    } else {
      css.borderTopWidth = `${sides.top}px`;
      css.borderRightWidth = `${sides.right}px`;
      css.borderBottomWidth = `${sides.bottom}px`;
      css.borderLeftWidth = `${sides.left}px`;
    }
  }

  return css;
}
