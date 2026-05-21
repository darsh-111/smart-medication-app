/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Tajawal', 'sans-serif'],
        display: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}