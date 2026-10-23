/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Paleta Hora Azul
        'hora-azul': {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b9fd',
          400: '#8093fa',
          500: '#5c6af5',
          600: '#3f48e8',
          700: '#2f36cc',
          800: '#272fa5',
          900: '#262e83',
          950: '#161852',
        },
        'hora-accent': {
          DEFAULT: '#e8c96b',
          light: '#f5e299',
          dark: '#c9a43e',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
