/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary - Soft sage
        primary: {
          50: '#F4F7F5',
          100: '#E8F0EB',
          200: '#D1E1D7',
          300: '#B0CCBA',
          400: '#8FB79C',
          500: '#6B9A7F',
          600: '#587F68',
          700: '#456551',
          800: '#334B3D',
          900: '#1F2E25',
          DEFAULT: '#6B9A7F',
        },
        // Accent - Soft lavender
        accent: {
          50: '#F7F6FB',
          100: '#EFEDF8',
          200: '#DDD9F0',
          300: '#C7C0E5',
          400: '#AFA6D9',
          500: '#948ACD',
          600: '#7A6FB8',
          700: '#625894',
          800: '#4A4270',
          900: '#2F2A47',
          DEFAULT: '#948ACD',
        },
        // Warm - Soft peach
        warm: {
          50: '#FEF8F5',
          100: '#FDEEE6',
          200: '#FADCC9',
          300: '#F6C4A3',
          400: '#F2AB7D',
          500: '#E89463',
          600: '#D77D4E',
          700: '#B6643B',
          800: '#8D4D2D',
          900: '#5D3320',
          DEFAULT: '#E89463',
        },
        // Cool - Soft blue
        cool: {
          50: '#F5F9FB',
          100: '#E8F3F8',
          200: '#D0E6F0',
          300: '#B0D5E5',
          400: '#8FC4D9',
          500: '#6AAFC9',
          600: '#5598B3',
          700: '#447A94',
          800: '#345D70',
          900: '#233F4A',
          DEFAULT: '#6AAFC9',
        },
        // Neutral grays
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      fontFamily: {
        sans: ['Poppins_400Regular'],
        regular: ['Poppins_400Regular'],
        medium: ['Poppins_500Medium'],
        semibold: ['Poppins_600SemiBold'],
        bold: ['Poppins_700Bold'],
      },
      fontSize: {
        xs: '11px',
        sm: '13px',
        base: '15px',
        lg: '17px',
        xl: '19px',
        '2xl': '22px',
        '3xl': '26px',
        '4xl': '32px',
        '5xl': '40px',
        '6xl': '52px',
      },
      spacing: {
        18: '4.5rem',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

