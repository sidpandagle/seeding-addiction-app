/**
 * Color theme configuration for Seeding app
 * "Track your growth. Cultivate your strength."
 * 
 * Calm, minimalist palette designed for emotional support and clarity
 */

export const colors = {
  // Primary palette - Soft sage and muted greens for growth and tranquility
  primary: {
    50: '#F4F7F5',      // Whisper white
    100: '#E8F0EB',     // Soft mint
    200: '#D1E1D7',     // Gentle sage
    300: '#B0CCBA',     // Calm sage
    400: '#8FB79C',     // Muted sage
    500: '#6B9A7F',     // Balanced sage (main)
    600: '#587F68',     // Grounded sage
    700: '#456551',     // Deep sage
    800: '#334B3D',     // Forest shadow
    900: '#1F2E25',     // Earth dark
  },

  // Accent palette - Soft lavender for calm and mindfulness
  accent: {
    50: '#F7F6FB',      // Lavender mist
    100: '#EFEDF8',     // Soft lavender
    200: '#DDD9F0',     // Gentle lavender
    300: '#C7C0E5',     // Calm lavender
    400: '#AFA6D9',     // Muted lavender
    500: '#948ACD',     // Balanced lavender (main)
    600: '#7A6FB8',     // Grounded lavender
    700: '#625894',     // Deep lavender
    800: '#4A4270',     // Twilight
    900: '#2F2A47',     // Evening shadow
  },

  // Neutral palette - Soft grays for balance
  neutral: {
    50: '#FAFAFA',      // Pure whisper
    100: '#F5F5F5',     // Cloud white
    200: '#EEEEEE',     // Soft gray
    300: '#E0E0E0',     // Gentle gray
    400: '#BDBDBD',     // Calm gray
    500: '#9E9E9E',     // Balanced gray
    600: '#757575',     // Muted gray
    700: '#616161',     // Deep gray
    800: '#424242',     // Shadow gray
    900: '#212121',     // Charcoal
  },

  // Warm accent - Soft peach for encouragement
  warm: {
    50: '#FEF8F5',      // Warm whisper
    100: '#FDEEE6',     // Soft peach
    200: '#FADCC9',     // Gentle peach
    300: '#F6C4A3',     // Calm peach
    400: '#F2AB7D',     // Muted peach
    500: '#E89463',     // Balanced peach (main)
    600: '#D77D4E',     // Grounded peach
    700: '#B6643B',     // Deep peach
    800: '#8D4D2D',     // Earth tone
    900: '#5D3320',     // Warm shadow
  },

  // Cool accent - Soft blue for clarity and calm
  cool: {
    50: '#F5F9FB',      // Sky whisper
    100: '#E8F3F8',     // Soft sky
    200: '#D0E6F0',     // Gentle sky
    300: '#B0D5E5',     // Calm sky
    400: '#8FC4D9',     // Muted sky
    500: '#6AAFC9',     // Balanced sky (main)
    600: '#5598B3',     // Grounded sky
    700: '#447A94',     // Deep sky
    800: '#345D70',     // Ocean shadow
    900: '#233F4A',     // Deep ocean
  },

  // Light theme - Soft and airy
  light: {
    background: '#FDFCFB',     // Warm off-white
    surface: '#FFFFFF',        // Pure white
    surfaceElevated: '#FAFAFA', // Elevated surface
    text: {
      primary: '#2F2A47',      // Soft dark
      secondary: '#6B6B78',    // Muted text
      tertiary: '#9E9E9E',     // Subtle text
      disabled: '#BDBDBD',     // Faded text
    },
    border: {
      light: '#F5F5F5',        // Subtle border
      main: '#EEEEEE',         // Main border
      dark: '#E0E0E0',         // Defined border
    },
    divider: '#F5F5F5',        // Subtle divider
  },

  // Dark theme - Calm and restful
  dark: {
    background: '#1A1825',     // Deep calm
    surface: '#252336',        // Elevated calm
    surfaceElevated: '#2F2D42', // Higher elevation
    text: {
      primary: '#F5F5F5',      // Soft white
      secondary: '#BDBDBD',    // Muted light
      tertiary: '#9E9E9E',     // Subtle light
      disabled: '#757575',     // Faded light
    },
    border: {
      light: '#2F2D42',        // Subtle border
      main: '#3D3A52',         // Main border
      dark: '#4A4770',         // Defined border
    },
    divider: '#2F2D42',        // Subtle divider
  },

  // Semantic colors - Soft and supportive
  semantic: {
    success: {
      light: '#D1E1D7',        // Soft success
      main: '#6B9A7F',         // Calm success
      dark: '#456551',         // Deep success
    },
    warning: {
      light: '#FADCC9',        // Soft warning
      main: '#E89463',         // Calm warning
      dark: '#B6643B',         // Deep warning
    },
    error: {
      light: '#F8D7DA',        // Soft error
      main: '#D88B8F',         // Calm error
      dark: '#B85E63',         // Deep error
    },
    info: {
      light: '#D0E6F0',        // Soft info
      main: '#6AAFC9',         // Calm info
      dark: '#447A94',         // Deep info
    },
  },

  // Glass effects for modern feel
  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    medium: 'rgba(255, 255, 255, 0.5)',
    heavy: 'rgba(255, 255, 255, 0.3)',
    dark: 'rgba(26, 24, 37, 0.7)',
  },
} as const;


export type ColorScheme = 'light' | 'dark';

export const getThemeColors = (scheme: ColorScheme) => {
  return scheme === 'dark' ? colors.dark : colors.light;
};

// Animation timing for smooth transitions
export const transitions = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
} as const;

// Shadow configurations for depth
export const shadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;
