/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        abn: {
          green: '#009488',
          'green-dark': '#007066',
          'green-light': '#00B3A4',
          'green-glow': '#00D1C0',
          yellow: '#F9BD20',
          'yellow-dark': '#D69E10',
          'yellow-light': '#FCD34D',
          grey: '#878787',
          'grey-light': '#B0B0B0',
          'grey-dark': '#4A4A4A',
          dark: '#031917',
          darker: '#011210',
          card: '#082523',
          border: '#0F3B37',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shake': 'shake 0.4s ease-in-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 148, 136, 0.4), 0 0 10px rgba(249, 189, 32, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 148, 136, 0.8), 0 0 30px rgba(249, 189, 32, 0.4)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        }
      }
    },
  },
  plugins: [],
}
