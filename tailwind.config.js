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
        'metal-silver': '#C9CDD3',
        'danger-red': '#FF3B4E',
        'success-green': '#2ED67B',
      },
      fontFamily: {
        display: ['Anton', 'Bebas Neue', 'Impact', 'sans-serif'],
        body: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(30, 167, 255, 0.4), 0 0 30px rgba(30, 167, 255, 0.2)',
        'glow-blue-lg': '0 0 25px rgba(79, 195, 255, 0.6), 0 0 50px rgba(30, 167, 255, 0.3)',
        'glow-red': '0 0 15px rgba(255, 59, 78, 0.4), 0 0 30px rgba(255, 59, 78, 0.2)',
        'glow-green': '0 0 15px rgba(46, 214, 123, 0.4), 0 0 30px rgba(46, 214, 123, 0.2)',
      },
    },
  },
  plugins: [],
}
