import type { FrameProps } from '@canvasly/dsl-schema';

/**
 * Resolves the z-index for an overlay based on precedence rules:
 * 1. User-set zIndex (if non-zero) - absolute override
 * 2. Overlay priority (if overlay enabled)
 * 3. Default priority by type (inferred from modal flag)
 * 4. Add open order offset
 */
export function resolveOverlayZIndex(
  frame: FrameProps,
  _overlayId: string,
  openOrder: number, // Position in open sequence
): number {
  // 1. User-set zIndex (if non-zero) - absolute override
  if (frame.style?.zIndex && frame.style.zIndex !== 0) {
    return frame.style.zIndex;
  }

  // 2. Overlay priority (if overlay enabled)
  if (frame.overlay?.enabled && frame.overlay.priority) {
    return frame.overlay.priority + openOrder; // Stack by open order
  }

  // 3. Default priority by type (inferred from modal flag)
  const baseZIndex = frame.overlay?.modal ? 700 : 800;

  // 4. Add open order offset
  return baseZIndex + openOrder;
}
