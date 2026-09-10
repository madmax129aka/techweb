/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0F1424",
        surface: "#161B2E",
        cyan: {
          DEFAULT: "#3DD9EB",
          dim: "#2AA9B8",
        },
        violet: {
          DEFAULT: "#8B5CF6",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(61, 217, 235, 0.15)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
