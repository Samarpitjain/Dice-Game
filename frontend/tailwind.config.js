/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F12',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8F9BA8',
        'accent-green': '#00C74D',
        'accent-blue': '#1A9FFF',
        'border-color': '#1E1E23',
        'error': '#FF3B30',
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