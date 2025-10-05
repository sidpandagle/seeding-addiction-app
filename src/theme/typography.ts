/**
 * Typography configuration for Seeding app
 * Using Poppins font family with defined scale
 */

export const typography = {
  // Font family
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Typography scale
  styles: {
    h1: {
      fontSize: 36,
      lineHeight: 1.2,
      fontFamily: 'Poppins_700Bold',
    },
    h2: {
      fontSize: 30,
      lineHeight: 1.2,
      fontFamily: 'Poppins_700Bold',
    },
    h3: {
      fontSize: 24,
      lineHeight: 1.3,
      fontFamily: 'Poppins_600SemiBold',
    },
    h4: {
      fontSize: 20,
      lineHeight: 1.4,
      fontFamily: 'Poppins_600SemiBold',
    },
    h5: {
      fontSize: 18,
      lineHeight: 1.4,
      fontFamily: 'Poppins_500Medium',
    },
    h6: {
      fontSize: 16,
      lineHeight: 1.5,
      fontFamily: 'Poppins_500Medium',
    },
    body: {
      fontSize: 16,
      lineHeight: 1.5,
      fontFamily: 'Poppins_400Regular',
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 1.5,
      fontFamily: 'Poppins_400Regular',
    },
    caption: {
      fontSize: 12,
      lineHeight: 1.5,
      fontFamily: 'Poppins_400Regular',
    },
    button: {
      fontSize: 16,
      lineHeight: 1.5,
      fontFamily: 'Poppins_600SemiBold',
    },
  },
} as const;
