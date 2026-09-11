/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Onyx black base - the "mission control at midnight" backdrop
        base: "#07070A",
        surface: "#12110C",
        onyx: {
          DEFAULT: "#0B0A08",
          light: "#181611",
        },
        // Gold - the hero metal of the TechAstra'26 wordmark
        gold: {
          DEFAULT: "#D9A840",
          light: "#F2D48A",
          dim: "#8A6A24",
          glow: "#FFE9A8",
        },
        // Kept for compatibility with existing components/pages
        cyan: {
          DEFAULT: "#3DD9EB",
          dim: "#2AA9B8",
        },
        violet: {
          DEFAULT: "#8B5CF6",
        },
        // The four-color glowing ring from the logo
        ring: {
          red: "#E5473A",
          blue: "#3B82F6",
          green: "#22C55E",
          yellow: "#F2C230",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(61, 217, 235, 0.15)",
        gold: "0 0 30px rgba(217, 168, 64, 0.35)",
        "gold-lg": "0 0 60px rgba(217, 168, 64, 0.4), 0 0 120px rgba(217, 168, 64, 0.15)",
        ring: "0 0 40px rgba(242, 194, 48, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "circuit": "linear-gradient(rgba(217,168,64,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(217,168,64,0.06) 1px, transparent 1px)",
        "gold-gradient": "linear-gradient(135deg, #F2D48A 0%, #D9A840 45%, #8A6A24 100%)",
      },
      backgroundSize: {
        circuit: "42px 42px",
      },
    },
  },
  plugins: [],
};
