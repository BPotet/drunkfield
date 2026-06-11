/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        festival: {
          green: '#16a34a',
          dark: '#052e16',
        },
      },
    },
  },
  plugins: [],
}
