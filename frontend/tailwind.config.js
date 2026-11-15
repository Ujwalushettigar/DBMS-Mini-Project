/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#eef3fa',
          100: '#d9e4f3',
          200: '#b3c8e6',
          300: '#85a6d3',
          400: '#4f7bb8',
          500: '#2c5a9c',
          600: '#1f4780',
          700: '#183a6a',
          800: '#122d54',
          900: '#0c203d',
          navy: '#183a6a',
          blue: '#1f4780',
          dark: '#0c203d',
          light: '#f4f6fa',
          gold: '#e8730c',
          slate: '#334155',
          border: '#d5dbe5'
        },
        saffron: {
          500: '#e8730c',
          600: '#c85f06'
        },
        india: {
          green: '#138808'
        },
        surface: '#f4f6fa',
        line: '#d5dbe5'
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)'
      }
    }
  },
  plugins: []
};
