/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4a90e2',
          dark: '#357abd',
          light: '#e8f1fb',
        },
        secondary: '#ff9800',
        accent: '#f19716',
        sidebar: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          active: '#1e3a5f',
          text: '#94a3b8',
          'text-active': '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
}
