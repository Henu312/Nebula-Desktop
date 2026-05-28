/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Segoe UI Variable",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        nebula: {
          bg: "#101214",
          panel: "#1f2428",
          line: "#3c454d",
          accent: "#68d8c2",
          warm: "#f3b562",
        },
      },
    },
  },
  plugins: [],
};
