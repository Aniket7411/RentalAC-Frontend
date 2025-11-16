/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563eb',
          'blue-light': '#60a5fa',
        },
        background: {
          light: '#f0f9ff',
        },
        text: {
          dark: '#1e293b',
          light: '#64748b',
        },
      },
    },
  },
  plugins: [],
}