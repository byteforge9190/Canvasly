import type { Fill } from '@canvasly/dsl-schema';
import type { CSSProperties } from 'react';

/**
 * Resolve a Fill object to CSS properties
 */
export function resolveFillToCSS(fill: Fill | undefined): CSSProperties {
  if (!fill || fill.type === 'none') {
    return {};
  }

  switch (fill.type) {
    case 'solid':
      return {
        backgroundColor: fill.color,
      };

    case 'linear-gradient': {
      const stops = fill.stops
        .map((stop) => {
          const opacity = stop.opacity !== undefined ? stop.opacity : 1;
          if (opacity < 1) {
            // Convert hex to rgba if opacity is set
            const color = hexToRgba(stop.color, opacity);
            return `${color} ${stop.position}%`;
          }
          return `${stop.color} ${stop.position}%`;
        })
        .join(', ');
      return {
        background: `linear-gradient(${fill.angle}deg, ${stops})`,
      };
    }

    case 'radial-gradient': {
      const stops = fill.stops
        .map((stop) => {
          const opacity = stop.opacity !== undefined ? stop.opacity : 1;
          if (opacity < 1) {
            const color = hexToRgba(stop.color, opacity);
            return `${color} ${stop.position}%`;
          }
          return `${stop.color} ${stop.position}%`;
        })
        .join(', ');
      return {
        background: `radial-gradient(${fill.shape} at ${fill.position}, ${stops})`,
      };
    }

    case 'image': {
      const fitMap = {
        fill: 'cover',
        fit: 'contain',
        crop: 'cover',
        tile: 'auto',
      };

      const styles: CSSProperties = {
        backgroundImage: `url(${getOptimizedImageUrl(fill.src, fill.resolution)})`,
        backgroundSize: fill.fit === 'tile' ? 'auto' : fitMap[fill.fit],
        backgroundPosition: fill.position,
        backgroundRepeat: fill.fit === 'tile' ? 'repeat' : 'no-repeat',
      };

      // Add tint overlay if specified
      if (fill.tint && fill.tintOpacity) {
        const tintColor = hexToRgba(fill.tint, fill.tintOpacity);
        // Use a linear gradient overlay for tint
        styles.backgroundImage = `linear-gradient(${tintColor}, ${tintColor}), url(${getOptimizedImageUrl(fill.src, fill.resolution)})`;
      }

      return styles;
    }

    default:
      return {};
  }
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get optimized image URL based on resolution setting
 * In the future, this can integrate with an image CDN
 */
function getOptimizedImageUrl(src: string, _resolution: string): string {
  // For now, return the source as-is
  // TODO: Integrate with image optimization service
  // Could add query parameters like ?w=800 for different resolutions
  return src;
}
