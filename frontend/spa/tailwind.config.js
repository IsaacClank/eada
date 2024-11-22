/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#29343D",
          200: "#415362",
        },
        pink: {
          600: "#DA6C8F",
        },
        yellow: {
          600: "#F7BC50",
        },
      },
    },
  },
  plugins: [],
};
