/**
 * Border System - Unified border styling system
 * Provides type-safe border configuration with width, style, and color
 */

export interface Border {
  width: number | BorderWidthSides; // Border width in pixels (uniform or per-side)
  style: BorderStyle; // Border style
  color: string; // Border color (hex)
}

export type BorderStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset'
  | 'none';

// Per-side border widths
export interface BorderWidthSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Default helpers
export const DEFAULT_BORDER: Border = {
  width: 1,
  style: 'solid',
  color: '#000000',
};

// Type guards
export function isBorder(value: unknown): value is Border {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'width' in value &&
    'style' in value &&
    'color' in value &&
    (typeof (value as Border).width === 'number' || isBorderWidthSides((value as Border).width)) &&
    typeof (value as Border).style === 'string' &&
    typeof (value as Border).color === 'string'
  );
}

export function isBorderWidthSides(value: unknown): value is BorderWidthSides {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'top' in value &&
    'right' in value &&
    'bottom' in value &&
    'left' in value &&
    typeof (value as BorderWidthSides).top === 'number' &&
    typeof (value as BorderWidthSides).right === 'number' &&
    typeof (value as BorderWidthSides).bottom === 'number' &&
    typeof (value as BorderWidthSides).left === 'number'
  );
}

// Helper to check if all sides are equal
export function isUniformWidth(width: number | BorderWidthSides): boolean {
  if (typeof width === 'number') return true;
  return width.top === width.right && width.right === width.bottom && width.bottom === width.left;
}

// Helper to get uniform width value
export function getUniformWidth(width: number | BorderWidthSides): number {
  if (typeof width === 'number') return width;
  return width.top; // Return first value if uniform
}
