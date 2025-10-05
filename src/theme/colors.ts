/**
 * Color theme configuration for Seeding app
 * "Track your growth. Cultivate your strength."
 */

export const colors = {
  // Primary palette
  primary: {
    dark: '#1B5E20',    // Deep emerald green
    main: '#2E7D32',
    light: '#4CAF50',
  },

  // Accent palette
  accent: {
    dark: '#81C784',
    main: '#A5D6A7',    // Fresh lime
    light: '#C8E6C9',
  },

  // Support palette
  support: {
    dark: '#FFC107',
    main: '#FFD54F',    // Golden glow
    light: '#FFE082',
  },

  // Light theme
  light: {
    background: '#FAFAFA',     // Off-white
    surface: '#FFFFFF',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
    },
    border: '#E0E0E0',
  },

  // Dark theme
  dark: {
    background: '#1C1C1E',     // Deep charcoal
    surface: '#2C2C2E',
    text: {
      primary: '#FFFFFF',
      secondary: '#ABABAB',
      disabled: '#6E6E73',
    },
    border: '#38383A',
  },

  // Semantic colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
} as const;

export type ColorScheme = 'light' | 'dark';

export const getThemeColors = (scheme: ColorScheme) => {
  return scheme === 'dark' ? colors.dark : colors.light;
};
