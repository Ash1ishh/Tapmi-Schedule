/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        tapmi: {
          red:    '#9B1B1B',
          redlt:  '#C0392B',
          gold:   '#B8960C',
          goldlt: '#D4AC0D',
          cream:  '#FDF6E3',
          green:  '#1A6B3C',
          greenlt:'#27AE60',
        }
      }
    },
  },
  plugins: [],
}
