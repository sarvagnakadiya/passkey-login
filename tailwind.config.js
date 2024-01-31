/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        backgroundTint: "#141217",
        // backgroundTint: "#f0e9fc",
        shade: "#331070",
      },
      borderColor: {
        mainColor: "#8247e5",
        default: "#1f0a43",
      },
    },
  },
  plugins: [],
};
