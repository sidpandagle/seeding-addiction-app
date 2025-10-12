/**
 * Main theme export
 * Combines colors, typography, shadows, transitions and theme utilities
 */

export * from './colors';
export * from './typography';

import { colors, ColorScheme, getThemeColors, transitions, shadows } from './colors';
import { typography } from './typography';

export const theme = {
  colors,
  typography,
  transitions,
  shadows,
  getThemeColors,
};

export type Theme = typeof theme;

// Spacing scale for consistent margins and padding
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
} as const;

// Border radius scale for consistent roundness
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;
