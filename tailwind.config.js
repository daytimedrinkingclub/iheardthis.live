/* global module */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#ff2d55',
        'neon-blue': '#0ff',
        'amber': '#f59e0b',
        'dark': '#0e0e10',
        'dark-card': 'rgba(16, 16, 16, 0.6)',
        'dark-elevated': 'rgba(24, 24, 28, 0.8)',
      },
      keyframes: {
        soundwave: {
          '0%, 100%': { 
            height: '8px',
            opacity: '0.5'
          },
          '50%': { 
            height: '24px',
            opacity: '1'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
      animation: {
        soundwave: 'soundwave ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 