/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        nunito: ['Nunito Sans', 'sans-serif'],
      }
    }
  },
  plugins: [],
}