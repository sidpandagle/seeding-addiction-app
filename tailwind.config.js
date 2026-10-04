// Theme colors are CSS variables from global.css (light in :root, dark in .dark:root)
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  // font-bold etc. pick a Nunito file by name (see fontFamily below). Tailwind would also set
  // fontWeight, and on Android a weight of 700+ makes React Native look for a bold variant of
  // that file, find none, and fall back to Roboto.
  corePlugins: {
    fontWeight: false,
  },
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        subtle: token('subtle'),
        border: {
          DEFAULT: token('border'),
          strong: token('border-strong'),
        },
        fg: token('fg'),
        body: token('body'),
        muted: token('muted'),
        faint: token('faint'),
        primary: {
          DEFAULT: token('primary'),
          ink: token('primary-ink'),
          soft: token('primary-soft'),
          on: token('on-primary'),
        },
        relapse: {
          DEFAULT: token('relapse'),
          ink: token('relapse-ink'),
          soft: token('relapse-soft'),
        },
        gold: {
          DEFAULT: token('gold'),
          ink: token('gold-ink'),
          soft: token('gold-soft'),
        },
        info: {
          DEFAULT: token('info'),
          soft: token('info-soft'),
        },
        plum: {
          DEFAULT: token('plum'),
          soft: token('plum-soft'),
        },
        urge: {
          DEFAULT: token('urge'),
          soft: token('urge-soft'),
        },
        tab: token('tab'),
      },
      fontFamily: {
        sans: ['Nunito_400Regular'],
        regular: ['Nunito_400Regular'],
        medium: ['Nunito_500Medium'],
        semibold: ['Nunito_700Bold'],
        bold: ['Nunito_800ExtraBold'],
        extrabold: ['Nunito_800ExtraBold'],
      },
      // NativeWind sets 1rem = 14px on native, which made text-sm 12.25px and text-xs 10.5px.
      // Body sizes are pinned to px here so they read at Tailwind's usual sizes; spacing stays rem.
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '23px' }],
        lg: ['18px', { lineHeight: '26px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
      },
      // leading-* is rem-based too, so pin it to match the text sizes above
      lineHeight: {
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
}
