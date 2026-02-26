/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Southside Gang Style - Dunkle, urbane Farben
        'street': {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
        // Akzentfarben
        'neon': {
          red: '#1a4d1a',
          orange: '#ff6b35',
          yellow: '#ffd93d',
          green: '#6bcb77',
          blue: '#4d96ff',
          purple: '#9b5de5',
        },
        // Primärfarben für den Shop
        'primary': '#1a4d1a',
        'secondary': '#ff6b35',
        'accent': '#ffd93d',
      },
      fontFamily: {
        'street': ['Bebas Neue', 'Impact', 'sans-serif'],
        'graffiti': ['Permanent Marker', 'cursive'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'graffiti-pattern': "url('/images/graffiti-bg.png')",
        'concrete': "url('/images/concrete-texture.png')",
        'gradient-street': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(26, 77, 26, 0.5)',
        'neon-orange': '0 0 20px rgba(255, 107, 53, 0.5)',
        'street': '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(26, 77, 26, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(26, 77, 26, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
