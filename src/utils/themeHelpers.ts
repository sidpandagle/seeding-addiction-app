/**
 * Theme helper utilities
 * Provides functions for consistent color scheme handling across the app
 */

export type ColorScheme = 'light' | 'dark';

/**
 * Get themed background color
 * @param lightColor - Color to use in light mode (hex format)
 * @param darkColor - Color to use in dark mode (hex format)
 * @param colorScheme - Current color scheme
 */
export function getThemedBackgroundColor(
  lightColor: string,
  darkColor: string,
  colorScheme: ColorScheme
): string {
  return colorScheme === 'dark' ? darkColor : lightColor;
}

/**
 * Get themed text color
 * @param lightColor - Color to use in light mode (hex format)
 * @param darkColor - Color to use in dark mode (hex format)
 * @param colorScheme - Current color scheme
 */
export function getThemedTextColor(
  lightColor: string,
  darkColor: string,
  colorScheme: ColorScheme
): string {
  return colorScheme === 'dark' ? darkColor : lightColor;
}

/**
 * Common background colors used across the app
 */
export const BACKGROUND_COLORS = {
  primary: {
    light: '#ffffff',
    dark: '#111827',
  },
  secondary: {
    light: '#f9fafb',
    dark: '#1f2937',
  },
  card: {
    light: '#ffffff',
    dark: '#1f2937',
  },
} as const;

/**
 * Common text colors used across the app
 */
export const TEXT_COLORS = {
  primary: {
    light: '#111827',
    dark: '#f9fafb',
  },
  secondary: {
    light: '#6b7280',
    dark: '#9ca3af',
  },
  muted: {
    light: '#9ca3af',
    dark: '#6b7280',
  },
} as const;

/**
 * Get primary background color based on color scheme
 */
export function getPrimaryBackgroundColor(colorScheme: ColorScheme): string {
  return getThemedBackgroundColor(
    BACKGROUND_COLORS.primary.light,
    BACKGROUND_COLORS.primary.dark,
    colorScheme
  );
}

/**
 * Get card background color based on color scheme
 */
export function getCardBackgroundColor(colorScheme: ColorScheme): string {
  return getThemedBackgroundColor(
    BACKGROUND_COLORS.card.light,
    BACKGROUND_COLORS.card.dark,
    colorScheme
  );
}

/**
 * Get primary text color based on color scheme
 */
export function getPrimaryTextColor(colorScheme: ColorScheme): string {
  return getThemedTextColor(
    TEXT_COLORS.primary.light,
    TEXT_COLORS.primary.dark,
    colorScheme
  );
}

/**
 * Get secondary text color based on color scheme
 */
export function getSecondaryTextColor(colorScheme: ColorScheme): string {
  return getThemedTextColor(
    TEXT_COLORS.secondary.light,
    TEXT_COLORS.secondary.dark,
    colorScheme
  );
}
