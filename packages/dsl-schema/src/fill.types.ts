/**
 * Fill System - Unified background/image/gradient system
 * Inspired by Framer's fill approach
 */

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'image' | 'none';

export interface GradientStop {
  color: string;
  position: number; // 0-100
  opacity?: number; // 0-1
}

export interface SolidFill {
  type: 'solid';
  color: string;
}

export interface LinearGradientFill {
  type: 'linear-gradient';
  angle: number; // 0-360
  stops: GradientStop[];
}

export interface RadialGradientFill {
  type: 'radial-gradient';
  shape: 'circle' | 'ellipse';
  position: string;
  stops: GradientStop[];
}

export interface ImageFill {
  type: 'image';
  src: string;
  alt?: string;
  fit: 'fill' | 'fit' | 'crop' | 'tile';
  position: string;
  resolution: 'auto' | 'small' | 'medium' | 'large' | 'original';
  tint?: string;
  tintOpacity?: number;
}

export type Fill =
  | { type: 'none' }
  | SolidFill
  | LinearGradientFill
  | RadialGradientFill
  | ImageFill;

// Helper to create default fills
export const DEFAULT_FILLS = {
  none: { type: 'none' } as Fill,
  solid: (color: string): SolidFill => ({ type: 'solid', color }),
  linearGradient: (angle: number, stops: GradientStop[]): LinearGradientFill => ({
    type: 'linear-gradient',
    angle,
    stops,
  }),
  radialGradient: (
    shape: 'circle' | 'ellipse',
    position: string,
    stops: GradientStop[],
  ): RadialGradientFill => ({
    type: 'radial-gradient',
    shape,
    position,
    stops,
  }),
  image: (src: string, alt?: string): ImageFill => ({
    type: 'image',
    src,
    alt,
    fit: 'crop',
    position: 'center',
    resolution: 'auto',
  }),
};

// Type guards
export function isSolidFill(fill: Fill): fill is SolidFill {
  return fill.type === 'solid';
}

export function isLinearGradientFill(fill: Fill): fill is LinearGradientFill {
  return fill.type === 'linear-gradient';
}

export function isRadialGradientFill(fill: Fill): fill is RadialGradientFill {
  return fill.type === 'radial-gradient';
}

export function isImageFill(fill: Fill): fill is ImageFill {
  return fill.type === 'image';
}
