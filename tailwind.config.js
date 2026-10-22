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
        dutch: {
          orange: '#FF6B00',
          'orange-glow': '#FF8A3D',
          blue: '#0A2540',
          'blue-light': '#1E3A8A',
          navy: '#061325',
          gold: '#F59E0B',
          teal: '#0D9488',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 107, 0, 0.4), 0 0 10px rgba(255, 107, 0, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.8), 0 0 30px rgba(255, 107, 0, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}

