import { describe, it, expect } from 'vitest';
import { resolveFillToCSS } from './fill-resolver';
import type { Fill } from '@canvasly/dsl-schema';

describe('Fill Resolver', () => {
  it('should return empty object for undefined fill', () => {
    const result = resolveFillToCSS(undefined);
    expect(result).toEqual({});
  });

  it('should return empty object for none fill', () => {
    const fill: Fill = { type: 'none' };
    const result = resolveFillToCSS(fill);
    expect(result).toEqual({});
  });

  it('should resolve solid fill', () => {
    const fill: Fill = { type: 'solid', color: '#ff0000' };
    const result = resolveFillToCSS(fill);
    expect(result).toEqual({
      backgroundColor: '#ff0000',
    });
  });

  it('should resolve solid fill without opacity', () => {
    const fill: Fill = { type: 'solid', color: '#ff0000' };
    const result = resolveFillToCSS(fill);
    expect(result).toEqual({
      backgroundColor: '#ff0000',
    });
  });

  it('should resolve linear gradient fill', () => {
    const fill: Fill = {
      type: 'linear-gradient',
      angle: 90,
      stops: [
        { color: '#ff0000', position: 0 },
        { color: '#00ff00', position: 100 },
      ],
    };
    const result = resolveFillToCSS(fill);
    expect(result).toHaveProperty('background');
    expect(result.background).toContain('linear-gradient');
    expect(result.background).toContain('90deg');
    expect(result.background).toContain('#ff0000 0%');
    expect(result.background).toContain('#00ff00 100%');
  });

  it('should resolve radial gradient fill', () => {
    const fill: Fill = {
      type: 'radial-gradient',
      shape: 'circle',
      position: 'center',
      stops: [
        { color: '#ff0000', position: 0 },
        { color: '#00ff00', position: 100 },
      ],
    };
    const result = resolveFillToCSS(fill);
    expect(result).toHaveProperty('background');
    expect(result.background).toContain('radial-gradient');
    expect(result.background).toContain('circle');
    expect(result.background).toContain('center');
    expect(result.background).toContain('#ff0000 0%');
    expect(result.background).toContain('#00ff00 100%');
  });

  it('should resolve image fill with crop', () => {
    const fill: Fill = {
      type: 'image',
      src: 'https://example.com/image.jpg',
      fit: 'crop',
      position: 'center',
      resolution: 'auto',
    };
    const result = resolveFillToCSS(fill);
    expect(result).toHaveProperty('backgroundImage');
    expect(result.backgroundImage).toContain('url(https://example.com/image.jpg)');
    expect(result.backgroundSize).toBe('cover');
    expect(result.backgroundPosition).toBe('center');
    expect(result.backgroundRepeat).toBe('no-repeat');
  });

  it('should resolve image fill with tile', () => {
    const fill: Fill = {
      type: 'image',
      src: 'https://example.com/image.jpg',
      fit: 'tile',
      position: 'center',
      resolution: 'auto',
    };
    const result = resolveFillToCSS(fill);
    expect(result.backgroundSize).toBe('auto');
    expect(result.backgroundRepeat).toBe('repeat');
  });

  it('should resolve image fill with tint', () => {
    const fill: Fill = {
      type: 'image',
      src: 'https://example.com/image.jpg',
      fit: 'crop',
      position: 'center',
      resolution: 'auto',
      tint: '#ff0000',
      tintOpacity: 0.5,
    };
    const result = resolveFillToCSS(fill);
    expect(result).toHaveProperty('backgroundImage');
    expect(result.backgroundImage).toContain('linear-gradient');
    expect(result.backgroundImage).toContain('rgba(255, 0, 0, 0.5)');
    expect(result.backgroundImage).toContain('url(https://example.com/image.jpg)');
  });

  it('should handle gradient stops with opacity', () => {
    const fill: Fill = {
      type: 'linear-gradient',
      angle: 90,
      stops: [
        { color: '#ff0000', position: 0, opacity: 0.5 },
        { color: '#00ff00', position: 100, opacity: 0.8 },
      ],
    };
    const result = resolveFillToCSS(fill);
    expect(result.background).toContain('rgba(255, 0, 0, 0.5)');
    expect(result.background).toContain('rgba(0, 255, 0, 0.8)');
  });
});
