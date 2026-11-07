import type { CSSProperties } from 'react';
import type {
  FrameProps,
  FrameLayout,
  FrameSize,
  FramePosition,
  FrameSpacing,
  FrameStyle,
  FrameSemantic,
  AlignmentValue,
  PaddingValue,
} from '@canvasly/dsl-schema';

import { resolveBorderToCSS } from './border-resolver';
import { resolveShadowToCSS } from './shadow-resolver';
import { featureFlags } from './feature-flags';

/**
 * Normalizes alignment values for CSS
 */
function normalizeAlignment(value: AlignmentValue | string | undefined): string | undefined {
  if (!value) return undefined;
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

/**
 * Resolves FrameProps into a CSSProperties object
 */
export function resolveFrameStyles(frame: FrameProps): CSSProperties {
  return {
    ...resolveLayout(frame.layout),
    ...resolveSize(frame.size, frame.semantic, frame.layout, frame.position),
    ...resolvePosition(frame.position),
    ...resolveSpacing(frame.spacing),
    ...resolveStyle(frame.style),
    ...resolveBorderToCSS(frame.style?.border),
    ...resolveShadowToCSS(frame.style?.shadow),
  };
}

function resolveLayout(layout?: FrameLayout): CSSProperties {
  const css: CSSProperties = {};
  if (!layout) return css;

  if (layout.type === 'stack') {
    css.display = 'flex';

    // Convert direction to flex-direction
    if (layout.direction === 'horizontal') {
      css.flexDirection = 'row';
    } else {
      css.flexDirection = 'column';
    }

    // Convert distribution to justify-content
    if (layout.distribution) {
      css.justifyContent = normalizeAlignment(layout.distribution);
    }

    // Convert alignment to align-items
    if (layout.alignment) {
      css.alignItems = normalizeAlignment(layout.alignment);
    }

    // Convert wrap to flex-wrap
    css.flexWrap = layout.wrap ? 'wrap' : 'nowrap';
  } else if (layout.type === 'grid') {
    css.display = 'grid';

    // Handle columns
    if (layout.columns) {
      css.gridTemplateColumns = `repeat(${layout.columns}, 1fr)`;
    }

    // Handle rows (only if not masonry)
    if (layout.rows && !layout.masonry) {
      css.gridTemplateRows = `repeat(${layout.rows}, auto)`;
    }

    // Handle masonry (auto-flow dense)
    if (layout.masonry) {
      css.gridAutoRows = 'auto';
      css.gridAutoFlow = 'dense';
    }
  }

  // Handle gap (convert number to px)
  if (layout.gap !== undefined && layout.gap !== null) {
    css.gap = typeof layout.gap === 'number' ? `${layout.gap}px` : layout.gap;
  }

  // Handle padding (can be number or PaddingValue object)
  if (layout.padding !== undefined && layout.padding !== null) {
    if (typeof layout.padding === 'number') {
      css.padding = `${layout.padding}px`;
    } else {
      applyPaddingValueToCSS(layout.padding, css);
    }
  }

  return css;
}

function resolveSize(
  size?: FrameSize,
  semantic?: FrameSemantic,
  layout?: FrameLayout,
  position?: FramePosition,
): CSSProperties {
  const css: CSSProperties = {};
  if (!size) return css;

  // Check if element is absolutely positioned
  const isAbsolute = position?.type === 'absolute' || position?.type === 'fixed';

  // Resolve Width
  const widthMode = size.widthMode || 'auto';
  switch (widthMode) {
    case 'fixed':
      if (size.width !== undefined) {
        css.width = `${size.width}px`;
      }
      break;
    case 'fill':
      // For absolute/fixed positioned elements, only use 100% if no left/right are set
      // Otherwise it will overflow the viewport
      if (isAbsolute && (position.left !== undefined || position.right !== undefined)) {
        css.width = 'auto';
      } else {
        css.width = '100%';
      }
      break;
    case 'fit-content':
      css.width = 'fit-content';
      break;
    case 'auto':
    default:
      // Intelligent defaults based on semantic tag and layout
      if (semantic?.tag === 'button' || semantic?.tag === 'span' || semantic?.tag === 'a') {
        css.width = 'auto';
      } else if (layout?.type === 'stack' || layout?.type === 'grid') {
        // Don't auto-fill width for absolutely positioned containers
        css.width = isAbsolute ? 'auto' : '100%';
      } else {
        css.width = 'auto';
      }
      break;
  }

  // Resolve Height
  const heightMode = size.heightMode || 'auto';
  switch (heightMode) {
    case 'fixed':
      if (size.height !== undefined) {
        css.height = `${size.height}px`;
      }
      break;
    case 'fill':
      // For absolute/fixed positioned elements, only use 100% if no top/bottom are set
      if (isAbsolute && (position.top !== undefined || position.bottom !== undefined)) {
        css.height = 'auto';
      } else {
        css.height = '100%';
      }
      break;
    case 'fit-content':
      css.height = 'fit-content';
      break;
    case 'auto':
    default:
      css.height = 'auto';
      break;
  }

  // Apply constraints (convert numbers to px)
  if (size.minWidth !== undefined) css.minWidth = `${size.minWidth}px`;
  if (size.maxWidth !== undefined) css.maxWidth = `${size.maxWidth}px`;
  if (size.minHeight !== undefined) css.minHeight = `${size.minHeight}px`;
  if (size.maxHeight !== undefined) css.maxHeight = `${size.maxHeight}px`;

  return css;
}

function resolvePosition(pos?: FramePosition): CSSProperties {
  const css: CSSProperties = {};
  if (!pos) return css;

  // Handle position type - always apply when explicitly set
  if (pos.type) {
    css.position = pos.type as CSSProperties['position'];

    // For relative, no directional properties needed (element stays in flow)
    // For sticky, only apply top
    if (pos.type === 'sticky') {
      if (pos.top !== undefined && pos.top !== null) {
        if (featureFlags.enableLogicalProperties) {
          (css as Record<string, unknown>).insetBlockStart = `${pos.top}px`;
        } else {
          css.top = `${pos.top}px`;
        }
      }
    }
    // For absolute and fixed, apply all directional properties
    else if (pos.type === 'absolute' || pos.type === 'fixed') {
      if (pos.top !== undefined && pos.top !== null) {
        if (featureFlags.enableLogicalProperties) {
          (css as Record<string, unknown>).insetBlockStart = `${pos.top}px`;
        } else {
          css.top = `${pos.top}px`;
        }
      }
      if (pos.right !== undefined && pos.right !== null) {
        if (featureFlags.enableLogicalProperties) {
          (css as Record<string, unknown>).insetInlineEnd = `${pos.right}px`;
        } else {
          css.right = `${pos.right}px`;
        }
      }
      if (pos.bottom !== undefined && pos.bottom !== null) {
        if (featureFlags.enableLogicalProperties) {
          (css as Record<string, unknown>).insetBlockEnd = `${pos.bottom}px`;
        } else {
          css.bottom = `${pos.bottom}px`;
        }
      }
      if (pos.left !== undefined && pos.left !== null) {
        if (featureFlags.enableLogicalProperties) {
          (css as Record<string, unknown>).insetInlineStart = `${pos.left}px`;
        } else {
          css.left = `${pos.left}px`;
        }
      }
    }
  }

  return css;
}

function resolveSpacing(spacing?: FrameSpacing): CSSProperties {
  const css: CSSProperties = {};
  if (!spacing) return css;

  // Handle structured padding (legacy support for spacing domain)
  if (spacing.padding) {
    applyPaddingValueToCSS(spacing.padding, css);
  }

  return css;
}

/**
 * Applies a PaddingValue object into a CSS properties object
 */
function applyPaddingValueToCSS(padding: PaddingValue, css: CSSProperties): void {
  const { top = 0, right = 0, bottom = 0, left = 0 } = padding;

  if (featureFlags.enableLogicalProperties) {
    css.paddingBlockStart = `${top}px`;
    css.paddingInlineEnd = `${right}px`;
    css.paddingBlockEnd = `${bottom}px`;
    css.paddingInlineStart = `${left}px`;
  } else {
    // Optimize output
    if (top === right && right === bottom && bottom === left) {
      css.padding = `${top}px`;
    } else if (top === bottom && right === left) {
      css.padding = `${top}px ${right}px`;
    } else {
      css.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    }
  }
}

function resolveStyle(style?: FrameStyle): CSSProperties {
  const css: CSSProperties = {};
  if (!style) return css;

  // Note: Fill is now handled separately by resolveFillToCSS in FrameRenderer
  // Note: Border is now handled separately by resolveBorderToCSS
  // This keeps the resolver focused on layout/spacing/borders

  // Handle visibility
  if (style.visible === false) {
    css.display = 'none';
  }

  if (style.borderRadius !== undefined && style.borderRadius > 0) {
    css.borderRadius = `${style.borderRadius}px`;
  }

  if (style.opacity !== undefined) css.opacity = style.opacity;
  if (style.overflow && style.overflow !== '')
    css.overflow = style.overflow as CSSProperties['overflow'];

  if (style.zIndex !== undefined) css.zIndex = style.zIndex;

  return css;
}
