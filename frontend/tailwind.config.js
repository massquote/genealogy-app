/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fb',
          100: '#e6edf6',
          200: '#c8d6ea',
          300: '#9ab4d7',
          400: '#658cbf',
          500: '#426ca8',
          600: '#33558c',
          700: '#2b4571',
          800: '#283c5e',
          900: '#253451',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
