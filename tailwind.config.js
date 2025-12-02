/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#008ECC',
          'blue-light': '#00A8E6',
        },
        background: {
          light: '#F8FAFC',
        },
        text: {
          dark: '#1A1A1A',
          light: '#64748b',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'premium-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}