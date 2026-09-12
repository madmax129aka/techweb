/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep warm-charcoal base (not flat black) - a Vision/Iron-Man
        // "power core" backdrop rather than a plain onyx void
        base: "#120508",
        surface: "#1B0A0E",
        onyx: {
          DEFAULT: "#0B0A08",
          light: "#181611",
        },
        // Crimson - Vision's cloak / Iron Man's armor red, now the hero accent
        crimson: {
          DEFAULT: "#C81E3A",
          light: "#FF4D6A",
          dim: "#7A1220",
          glow: "#FF8FA3",
        },
        // Arc reactor blue - the energy-core glow accent
        arc: {
          DEFAULT: "#22D3EE",
          light: "#7DE8FA",
          dim: "#0E7490",
        },
        // Gold - kept as a trim/accent metal (the real TechAstra'26 logo
        // artwork is genuinely gold), used sparingly rather than as the
        // dominant theme color
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
        // VISION - one signature color per pillar, used across the theme
        // V-irtual Intelligence · I-nformation Security · S-ustainable Innovation
        // I-ntelligent Healthcare · O-ptimization & Automation · N-ext-gen Networks
        vision: {
          v: "#8B5CF6", // Virtual Intelligence - violet (AI / neural)
          i1: "#3DD9EB", // Information Security - cyan (shield / encryption)
          s: "#34D399", // Sustainable Innovation - emerald (eco)
          i2: "#F472B6", // Intelligent Healthcare - rose (care / vitality)
          o: "#F2C230", // Optimization & Automation - amber gold (precision)
          n: "#3B82F6", // Next-gen Networks - electric blue (connectivity)
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(61, 217, 235, 0.15)",
        gold: "0 0 30px rgba(217, 168, 64, 0.35)",
        "gold-lg": "0 0 60px rgba(217, 168, 64, 0.4), 0 0 120px rgba(217, 168, 64, 0.15)",
        ring: "0 0 40px rgba(242, 194, 48, 0.25)",
        "3d": "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(217, 168, 64, 0.1)",
        crimson: "0 0 30px rgba(200, 30, 58, 0.45)",
        "crimson-lg": "0 0 60px rgba(200, 30, 58, 0.45), 0 0 120px rgba(217, 168, 64, 0.2)",
        arc: "0 0 35px rgba(34, 211, 238, 0.45)",
        "vision-v": "0 0 35px rgba(139, 92, 246, 0.35)",
        "vision-i1": "0 0 35px rgba(61, 217, 235, 0.35)",
        "vision-s": "0 0 35px rgba(52, 211, 153, 0.35)",
        "vision-i2": "0 0 35px rgba(244, 114, 182, 0.35)",
        "vision-o": "0 0 35px rgba(242, 194, 48, 0.35)",
        "vision-n": "0 0 35px rgba(59, 130, 246, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "circuit": "linear-gradient(rgba(217,168,64,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(217,168,64,0.06) 1px, transparent 1px)",
        "gold-gradient": "linear-gradient(135deg, #F2D48A 0%, #D9A840 45%, #8A6A24 100%)",
        "vision-gradient": "linear-gradient(120deg, #8B5CF6 0%, #3DD9EB 20%, #34D399 40%, #F472B6 60%, #F2C230 80%, #3B82F6 100%)",
        "hero-gradient": "linear-gradient(135deg, #C81E3A 0%, #D9A840 50%, #22D3EE 100%)",
        "cta-gradient": "linear-gradient(135deg, #FF4D6A 0%, #C81E3A 55%, #7A1220 100%)",
        "core-gradient": "radial-gradient(circle, #FFE9A8 0%, #D9A840 25%, #C81E3A 60%, #7A1220 100%)",
      },
      backgroundSize: {
        circuit: "42px 42px",
      },
    },
  },
  plugins: [],
};
