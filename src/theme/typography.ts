/**
 * Typography configuration for Seeding app
 * Using Inter font family for clarity and calm readability
 * Refined scale for minimalist, breathable design
 */

export const typography = {
  // Font family - Inter for modern, calm readability
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },

  // Font sizes - Refined scale for better hierarchy
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
    '5xl': 40,
    '6xl': 52,
  },

  // Line heights - Generous for readability
  lineHeight: {
    tight: 1.25,
    snug: 1.4,
    normal: 1.6,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter spacing - Subtle for clarity
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Typography scale - Calm and balanced
  styles: {
    // Display - For hero moments
    display: {
      fontSize: 52,
      lineHeight: 1.15,
      letterSpacing: -0.5,
      fontFamily: 'Poppins_700Bold',
    },
    
    // Headings
    h1: {
      fontSize: 32,
      lineHeight: 1.25,
      letterSpacing: -0.25,
      fontFamily: 'Poppins_600SemiBold',
    },
    h2: {
      fontSize: 26,
      lineHeight: 1.3,
      letterSpacing: -0.25,
      fontFamily: 'Poppins_600SemiBold',
    },
    h3: {
      fontSize: 22,
      lineHeight: 1.4,
      letterSpacing: 0,
      fontFamily: 'Poppins_600SemiBold',
    },
    h4: {
      fontSize: 19,
      lineHeight: 1.4,
      letterSpacing: 0,
      fontFamily: 'Poppins_600SemiBold',
    },
    h5: {
      fontSize: 17,
      lineHeight: 1.5,
      letterSpacing: 0,
      fontFamily: 'Poppins_500Medium',
    },
    h6: {
      fontSize: 15,
      lineHeight: 1.5,
      letterSpacing: 0,
      fontFamily: 'Poppins_500Medium',
    },
    
    // Body text
    body: {
      fontSize: 15,
      lineHeight: 1.6,
      letterSpacing: 0,
      fontFamily: 'Poppins_400Regular',
    },
    bodyLarge: {
      fontSize: 17,
      lineHeight: 1.6,
      letterSpacing: 0,
      fontFamily: 'Poppins_400Regular',
    },
    bodySmall: {
      fontSize: 13,
      lineHeight: 1.5,
      letterSpacing: 0,
      fontFamily: 'Poppins_400Regular',
    },
    
    // UI elements
    caption: {
      fontSize: 11,
      lineHeight: 1.4,
      letterSpacing: 0.25,
      fontFamily: 'Poppins_400Regular',
    },
    overline: {
      fontSize: 11,
      lineHeight: 1.4,
      letterSpacing: 1,
      fontFamily: 'Poppins_600SemiBold',
    },
    button: {
      fontSize: 15,
      lineHeight: 1.5,
      letterSpacing: 0.25,
      fontFamily: 'Poppins_600SemiBold',
    },
    buttonLarge: {
      fontSize: 17,
      lineHeight: 1.5,
      letterSpacing: 0.25,
      fontFamily: 'Poppins_600SemiBold',
    },
    
    // Special
    quote: {
      fontSize: 17,
      lineHeight: 1.75,
      letterSpacing: 0,
      fontFamily: 'Poppins_500Medium',
      fontStyle: 'italic' as const,
    },
    label: {
      fontSize: 13,
      lineHeight: 1.4,
      letterSpacing: 0.25,
      fontFamily: 'Poppins_500Medium',
    },
  },
} as const;
