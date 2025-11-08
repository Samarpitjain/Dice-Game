/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f212e',
        'card-bg': '#1a2c38',
        'text-primary': '#FFFFFF',
        'text-secondary': '#b1bad3',
        'accent-green': '#00e701',
        'accent-blue': '#2f4553',
        'border-color': '#2f4553',
        'error': '#ff3b30',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Roboto Mono', 'monospace'],
      },
      borderRadius: {
        'card': '8px',
        'control': '20px',
        'input': '6px',
      },
      animation: {
        'roll-sweep': 'rollSweep 0.4s ease-out',
        'number-flicker': 'numberFlicker 0.25s ease-in-out',
        'glow': 'glow 0.18s ease',
      },
      keyframes: {
        rollSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' }
        },
        numberFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' }
        },
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgba(26, 159, 255, 0)' },
          '100%': { boxShadow: '0 0 0 4px rgba(26, 159, 255, 0.3)' }
        }
      }
    },
  },
  plugins: [],
}