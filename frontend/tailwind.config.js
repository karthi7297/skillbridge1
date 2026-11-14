/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        }
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, #5b21b6 0%, #4c1d95 50%, #3b1282 100%)',
        'hero-gradient': 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)',
        'card-gradient': 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      }
    },
  },
  plugins: [],
}
