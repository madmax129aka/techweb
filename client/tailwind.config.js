/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Near-black base, deliberately blended toward the requested
        // #AA0505 blood-red rather than a flat neutral charcoal - this is
        // the "deep, moody" cinematic backdrop the whole site sits on.
        //
        // NAMED "void" NOT "base": Tailwind ships a BUILT-IN utility
        // called `text-base` that means font-size: 1rem. A custom color
        // named `base` silently overrides that utility's *meaning* for
        // `text-base` (Tailwind can't tell "font-size" and "color" apart
        // by name alone - it just resolves the last matching rule), which
        // is exactly why buttons/paragraphs across the site rendered with
        // invisible near-black text instead of the font-size bump they
        // were written for. Renaming this color avoids the collision
        // entirely; every `text-base`/`bg-base`/`border-base` usage below
        // was swapped to `text-void`/`bg-void`/`border-void`.
        void: "#0D0303",
        surface: "#1A0505",
        onyx: {
          DEFAULT: "#0B0A08",
          light: "#181611",
        },
        // Crimson - the exact #AA0505 requested as the dominant background
        // wash, which also happens to be Vision's (Avengers) skin tone and
        // Iron Man's armor red - ties the palette directly to the cursor
        // and theme concept below.
        crimson: {
          DEFAULT: "#AA0505",
          light: "#E23B3B",
          dim: "#4D0202",
          glow: "#FF8080",
        },
        // Off-white body/heading text on dark hero imagery, per the
        // cinematic/luxury brief (not pure #fff, easier on the eyes)
        offwhite: "#F5F3F0",
        // Arc reactor / Mind Stone cyan - the ONE accent color used
        // sparingly for links, CTAs, and status highlights against the
        // dark base (mirrors Vision's glowing cyan Mind Stone against his
        // red body - the same red/cyan pairing as the palette above)
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

        /*
         * Standard shadcn/ui token names, wired to the CSS custom
         * properties defined in index.css's `:root` (which themselves
         * point at colors already used elsewhere in this app - see the
         * comment there for the full rationale). These exist ONLY so
         * the shadcn-style primitives (components/ui/button.jsx,
         * badge.jsx, card.jsx - lowercase, a separate thing from this
         * file's own PascalCase-consuming design system below) resolve
         * bg-background/text-foreground/bg-primary/etc. to real colors.
         *
         * NOTE: `ring` is NOT added here - this file already has a
         * `colors.ring` object above (the four-color logo ring:
         * red/blue/green/yellow) with a completely different meaning,
         * and overwriting it with a single hex string would break every
         * existing `ring-red`/`ring-blue`/etc. usage referencing that
         * object. The shadcn convention's separate "focus ring" concept
         * is wired via Tailwind's dedicated `ringColor` key instead
         * (see theme.extend.ringColor below), which does not collide.
         */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
      },
      ringColor: {
        DEFAULT: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius, 0.75rem)",
        md: "calc(var(--radius, 0.75rem) - 2px)",
        sm: "calc(var(--radius, 0.75rem) - 4px)",
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
        crimson: "0 0 30px rgba(170, 5, 5, 0.5)",
        "crimson-lg": "0 0 60px rgba(170, 5, 5, 0.5), 0 0 120px rgba(34, 211, 238, 0.15)",
        arc: "0 0 35px rgba(34, 211, 238, 0.45)",
        cinematic: "0 40px 80px -20px rgba(0, 0, 0, 0.85)",
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
        "hero-gradient": "linear-gradient(135deg, #AA0505 0%, #D9A840 50%, #22D3EE 100%)",
        "cta-gradient": "linear-gradient(135deg, #E23B3B 0%, #AA0505 55%, #4D0202 100%)",
        "core-gradient": "radial-gradient(circle, #FFE9A8 0%, #D9A840 25%, #AA0505 60%, #4D0202 100%)",
        // Full-bleed cinematic hero overlay - a deep crimson-to-black
        // vignette laid over hero photography/video so headline text
        // stays legible without needing a solid dark panel behind it.
        "cinematic-overlay":
          "linear-gradient(180deg, rgba(13,3,3,0.15) 0%, rgba(13,3,3,0.55) 55%, rgba(13,3,3,0.95) 100%), radial-gradient(ellipse at 50% 30%, rgba(170,5,5,0.25) 0%, transparent 60%)",
      },
      backgroundSize: {
        circuit: "42px 42px",
      },
      letterSpacing: {
        cinematic: "0.28em",
      },
    },
  },
  plugins: [],
};
