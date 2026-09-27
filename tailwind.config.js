/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#050506',
        'bg-elevated': '#0d0f14',
        'accent-blue': '#1EA7FF',
        'accent-blue-glow': '#4FC3FF',
        'text-primary': '#F2F3F5',
        'text-secondary': '#9AA1AC',
        'danger-red': '#FF3B4E',
        'success-green': '#2ED67B',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Staatliches', 'Anton', 'sans-serif'],
        body: ['Inter', '"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 10px #4FC3FF',
        'glow-red': '0 0 10px #FF3B4E',
      }
    },
  },
  plugins: [],
}
