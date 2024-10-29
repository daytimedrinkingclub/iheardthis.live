/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#ff2d55',
        'neon-blue': '#0ff',
        'dark': '#121212',
        'dark-card': 'rgba(16, 16, 16, 0.6)',
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
        }
      },
      animation: {
        soundwave: 'soundwave ease-in-out infinite',
      }
    },
  },
  plugins: [],
} 