/**
 * Main theme export
 * Combines colors, typography, and theme utilities
 */

export * from './colors';
export * from './typography';

import { colors, ColorScheme, getThemeColors } from './colors';
import { typography } from './typography';

export const theme = {
  colors,
  typography,
  getThemeColors,
};

export type Theme = typeof theme;
