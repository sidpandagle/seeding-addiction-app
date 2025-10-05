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
        primary: {
          dark: '#1B5E20',
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
        },
        accent: {
          dark: '#81C784',
          DEFAULT: '#A5D6A7',
          light: '#C8E6C9',
        },
        support: {
          dark: '#FFC107',
          DEFAULT: '#FFD54F',
          light: '#FFE082',
        },
      },
      fontFamily: {
        sans: ['Poppins_400Regular'],
        regular: ['Poppins_400Regular'],
        medium: ['Poppins_500Medium'],
        semibold: ['Poppins_600SemiBold'],
        bold: ['Poppins_700Bold'],
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
}
