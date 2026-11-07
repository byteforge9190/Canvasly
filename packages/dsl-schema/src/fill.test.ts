import { describe, it, expect } from 'vitest';
import {
  DEFAULT_FILLS,
  isSolidFill,
  isLinearGradientFill,
  isRadialGradientFill,
  isImageFill,
  type Fill,
} from './fill.types';

describe('Fill System', () => {
  describe('DEFAULT_FILLS', () => {
    it('should create a none fill', () => {
      const fill = DEFAULT_FILLS.none;
      expect(fill.type).toBe('none');
    });

    it('should create a solid fill', () => {
      const fill = DEFAULT_FILLS.solid('#ff0000');
      expect(fill.type).toBe('solid');
      expect(fill.color).toBe('#ff0000');
    });

    it('should create a linear gradient fill', () => {
      const stops = [
        { color: '#ff0000', position: 0 },
        { color: '#00ff00', position: 100 },
      ];
      const fill = DEFAULT_FILLS.linearGradient(90, stops);
      expect(fill.type).toBe('linear-gradient');
      expect(fill.angle).toBe(90);
      expect(fill.stops).toEqual(stops);
    });

    it('should create a radial gradient fill', () => {
      const stops = [
        { color: '#ff0000', position: 0 },
        { color: '#00ff00', position: 100 },
      ];
      const fill = DEFAULT_FILLS.radialGradient('circle', 'center', stops);
      expect(fill.type).toBe('radial-gradient');
      expect(fill.shape).toBe('circle');
      expect(fill.position).toBe('center');
      expect(fill.stops).toEqual(stops);
    });

    it('should create an image fill', () => {
      const fill = DEFAULT_FILLS.image('https://example.com/image.jpg', 'Test image');
      expect(fill.type).toBe('image');
      expect(fill.src).toBe('https://example.com/image.jpg');
      expect(fill.alt).toBe('Test image');
      expect(fill.fit).toBe('crop');
      expect(fill.position).toBe('center');
      expect(fill.resolution).toBe('auto');
    });
  });

  describe('Type Guards', () => {
    it('should identify solid fill', () => {
      const fill: Fill = { type: 'solid', color: '#ff0000' };
      expect(isSolidFill(fill)).toBe(true);
      expect(isLinearGradientFill(fill)).toBe(false);
      expect(isRadialGradientFill(fill)).toBe(false);
      expect(isImageFill(fill)).toBe(false);
    });

    it('should identify linear gradient fill', () => {
      const fill: Fill = {
        type: 'linear-gradient',
        angle: 90,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#00ff00', position: 100 },
        ],
      };
      expect(isSolidFill(fill)).toBe(false);
      expect(isLinearGradientFill(fill)).toBe(true);
      expect(isRadialGradientFill(fill)).toBe(false);
      expect(isImageFill(fill)).toBe(false);
    });

    it('should identify radial gradient fill', () => {
      const fill: Fill = {
        type: 'radial-gradient',
        shape: 'circle',
        position: 'center',
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#00ff00', position: 100 },
        ],
      };
      expect(isSolidFill(fill)).toBe(false);
      expect(isLinearGradientFill(fill)).toBe(false);
      expect(isRadialGradientFill(fill)).toBe(true);
      expect(isImageFill(fill)).toBe(false);
    });

    it('should identify image fill', () => {
      const fill: Fill = {
        type: 'image',
        src: 'https://example.com/image.jpg',
        fit: 'crop',
        position: 'center',
        resolution: 'auto',
      };
      expect(isSolidFill(fill)).toBe(false);
      expect(isLinearGradientFill(fill)).toBe(false);
      expect(isRadialGradientFill(fill)).toBe(false);
      expect(isImageFill(fill)).toBe(true);
    });
  });
});
