/**
 * tailwind.config.js — Hora Azul E-Commerce
 *
 * NOTA: Este proyecto usa Tailwind CSS v4, que configura el tema directamente
 * en CSS mediante la directiva `@theme` (ver src/tailwind.css).
 * Este archivo está presente como referencia semántica de la paleta de colores
 * y para compatibilidad con herramientas que lo requieran (IntelliSense, etc.).
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        /**
         * Primary — Azul crepuscular / navy (el "hora azul")
         * Representa el instante mágico entre el día y la noche.
         * Base 500: #1e3a8a (azul profundo)
         */
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#1e3a8a', // BASE
          600: '#1e3374',
          700: '#172b61',
          800: '#112250',
          900: '#0b1a3f',
          950: '#060f27',
        },

        /**
         * Secondary — Dorado / crema cálido
         * Evoca el papel artesanal y los acabados metálicos de las tarjetas pop-up.
         * Base 500: #d4a017 (dorado artesanal)
         */
        secondary: {
          50: '#fefdf7',
          100: '#fdf8e1',
          200: '#fbefc3',
          300: '#f7e09a',
          400: '#f2cc6a',
          500: '#d4a017', // BASE
          600: '#b8890f',
          700: '#9a710c',
          800: '#7c5a09',
          900: '#5e4406',
        },

        /**
         * Neutral — Grises para texto, fondos y bordes
         */
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },

        /**
         * Semánticos — Feedback de UI
         */
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        btn: '0.5rem',
      },
    },
  },
  plugins: [],
};
