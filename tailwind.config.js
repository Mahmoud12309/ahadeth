/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
        hadith: ['Amiri', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1a7a4a',
          dark: '#145e38',
          light: '#e8f5ee',
        },
        gold: {
          DEFAULT: '#c9a227',
          light: '#fdf6e3',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
