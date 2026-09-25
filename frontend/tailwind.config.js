/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        climate: {
          900: '#070d1e',
          800: '#0b1528',
          700: '#112240',
          600: '#1b325f',
          500: '#274b87',
          400: '#3b82f6',
          300: '#60a5fa',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      }
    },
  },
  plugins: [],
}