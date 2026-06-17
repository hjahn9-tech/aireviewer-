/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crex: {
          go: '#10b981',
          caution: '#f59e0b',
          pass: '#ef4444',
          dark: '#1a1a2e',
          card: '#16213e',
          accent: '#0f3460',
        }
      }
    },
  },
  plugins: [],
}
