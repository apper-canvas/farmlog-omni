/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7e8',
          100: '#d9ebc4',
          200: '#bfdd9c',
          300: '#a4cf74',
          400: '#8ec456',
          500: '#7CB342',
          600: '#6b9c3a',
          700: '#578230',
          800: '#446828',
          900: '#2D5016',
        },
        secondary: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffcc02',
          500: '#FFA726',
          600: '#ff9800',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100',
        },
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}