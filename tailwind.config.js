/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sol: {
          primary: '#16a34a', // Emerald 600 - High Contrast Green
          'primary-dark': '#15803d',
          'primary-light': '#bbf7d0',
          listening: '#dc2626', // Bright Crimson - Clear Visual Recording Cue
          speaking: '#2563eb', // Royal Blue
          thinking: '#d97706', // Amber
          background: '#090d16', // Deep Night Black/Navy for Maximum Contrast
          surface: '#131b2e',
          text: '#f8fafc',
          accent: '#facc15', // Vibrant Gold
        },
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s linear infinite',
        'wave': 'wave 1.4s ease-in-out infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)' },
          '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 35px rgba(220, 38, 38, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0)' },
        },
        wave: {
          '0%, 100%': { height: '16px' },
          '50%': { height: '48px' },
        },
      },
      fontFamily: {
        tamil: ['"Noto Sans Tamil"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
