import { describe, it, expect } from 'vitest';
import { resolveBorderToCSS } from './border-resolver';
import type { Border } from '@canvasly/dsl-schema';

describe('resolveBorderToCSS', () => {
  it('should return empty object for undefined border', () => {
    const result = resolveBorderToCSS(undefined);
    expect(result).toEqual({});
  });

  it('should return empty object for border with style "none"', () => {
    const border: Border = {
      width: 1,
      style: 'none',
      color: '#000000',
    };
    const result = resolveBorderToCSS(border);
    expect(result).toEqual({});
  });

  it('should handle uniform border width', () => {
    const border: Border = {
      width: 2,
      style: 'solid',
      color: '#ff0000',
    };
    const result = resolveBorderToCSS(border);
    expect(result).toEqual({
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#ff0000',
    });
  });

  it('should return empty object for uniform border with zero width', () => {
    const border: Border = {
      width: 0,
      style: 'solid',
      color: '#000000',
    };
    const result = resolveBorderToCSS(border);
    expect(result).toEqual({});
  });

  it('should handle per-side border widths', () => {
    const border: Border = {
      width: {
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      },
      style: 'dashed',
      color: '#00ff00',
    };
    const result = resolveBorderToCSS(border);
    expect(result).toEqual({
      borderBlockStartWidth: '1px',
      borderInlineEndWidth: '2px',
      borderBlockEndWidth: '3px',
      borderInlineStartWidth: '4px',
      borderStyle: 'dashed',
      borderColor: '#00ff00',
    });
  });

  it('should return empty object for per-side border with all zero widths', () => {
    const border: Border = {
      width: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      style: 'solid',
      color: '#000000',
    };
    const result = resolveBorderToCSS(border);
    expect(result).toEqual({});
  });

  it('should handle per-side border with some zero widths', () => {
    const border: Border = {
      width: {
        top: 2,
        right: 0,
        bottom: 2,
        left: 0,
      },
      style: 'dotted',
      color: '#0000ff',
    };
    const result = resolveBorderToCSS(border);
    expect(result).toEqual({
      borderBlockStartWidth: '2px',
      borderInlineEndWidth: '0px',
      borderBlockEndWidth: '2px',
      borderInlineStartWidth: '0px',
      borderStyle: 'dotted',
      borderColor: '#0000ff',
    });
  });

  it('should handle different border styles', () => {
    const styles = [
      'solid',
      'dashed',
      'dotted',
      'double',
      'groove',
      'ridge',
      'inset',
      'outset',
    ] as const;

    styles.forEach((style) => {
      const border: Border = {
        width: 1,
        style,
        color: '#000000',
      };
      const result = resolveBorderToCSS(border);
      expect(result.borderStyle).toBe(style);
    });
  });
});
