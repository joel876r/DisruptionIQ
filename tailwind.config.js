/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0a0b0e',
          900: '#101116',
          850: '#15161c',
          800: '#1b1c23',
          750: '#22232c',
          700: '#2b2c37',
          600: '#383a48',
        },
        lime: {
          400: '#e5fd38',
          DEFAULT: '#dcf836',
          500: '#c8f11c',
          600: '#b0d80c',
          glow: 'rgba(220, 248, 54, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
