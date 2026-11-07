/**
 * Feature flags for the component system
 */

// Check if we're in a build environment with process.env available
const hasProcessEnv = typeof process !== 'undefined' && process.env;

export const OVERLAYS_ENABLED = hasProcessEnv
  ? process.env.ENABLE_OVERLAYS === 'true' || process.env.NODE_ENV === 'development'
  : true; // Default to enabled in browser
