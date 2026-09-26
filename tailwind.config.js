/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#050506',
          elevated: '#0d0f14',
          card: '#12151d',
          border: '#1f2430'
        },
        accent: {
          blue: '#1EA7FF',
          blueGlow: '#4FC3FF',
        },
        text: {
          primary: '#F2F3F5',
          secondary: '#9AA1AC',
          muted: '#626875'
        },
        danger: {
          red: '#FF3B4E',
          redGlow: 'rgba(255, 59, 78, 0.2)'
        },
        success: {
          green: '#2ED67B',
          greenGlow: 'rgba(46, 214, 123, 0.2)'
        },
        warning: {
          yellow: '#FFB800'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Anton', 'Bebas Neue', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -3px rgba(30, 167, 255, 0.35)',
        'glow-blue-lg': '0 0 35px 2px rgba(30, 167, 255, 0.45)',
        'glow-red': '0 0 20px -3px rgba(255, 59, 78, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
