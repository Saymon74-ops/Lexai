/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d0f14',
        accent: '#c9a84c',
        card: '#1a1d24',
        border: '#2a2f3a',
        text: '#e2e8f0',
        muted: '#94a3b8'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
