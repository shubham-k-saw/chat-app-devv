/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      scrollbar: ["rounded"], // If you're using a custom scrollbar plugin
    },
  },
  plugins: [],
};
