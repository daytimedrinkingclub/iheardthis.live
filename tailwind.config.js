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
    },
  },
  plugins: [],
} 