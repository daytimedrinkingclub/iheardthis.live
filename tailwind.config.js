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
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 