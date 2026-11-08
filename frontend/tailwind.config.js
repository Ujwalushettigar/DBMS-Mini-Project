/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#1e3a8a',       // Deep navy blue
          dark: '#0f172a',       // Slate 900
          light: '#f8fafc',      // Clean slate background
          gold: '#b45309',       // Seal/accent amber
          blue: '#1d4ed8',       // Primary action blue
          slate: '#334155',      // Text slate
          border: '#e2e8f0'      // Border slate
        }
      }
    },
  },
  plugins: [],
}

