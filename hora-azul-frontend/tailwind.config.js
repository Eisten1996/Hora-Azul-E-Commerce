/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Paleta Hora Azul, tomada del catálogo 2026:
        // celeste #c6f0ff (100), cian #00aeef (500), azul #1b75bc (700) y marino #262262 (900).
        // Contraste AA: el texto blanco sobre cian no alcanza 4.5:1; sobre cian usar texto 900.
        'hora-azul': {
          50: '#eefaff',
          100: '#c6f0ff',
          200: '#9de4fc',
          300: '#5fd0f6',
          400: '#22bdf2',
          500: '#00aeef',
          600: '#1b8fd4',
          700: '#1b75bc',
          800: '#1d4e94',
          900: '#262262',
          950: '#191645',
        },
      },
      fontFamily: {
        // Tipografías del catálogo: Poppins para el texto, League Spartan para títulos
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"League Spartan"', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
