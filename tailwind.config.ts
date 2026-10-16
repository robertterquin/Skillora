import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F5F0", // Warm Oat Linen (editorial paper backdrop)
        ink: {
          DEFAULT: "#1A1917", // Deep Warm Obsidian
          secondary: "#5A564F",
          muted: "#7A756D",
          subtle: "#9E988F",
        },
        brand: {
          50: "#F7F5F0",
          100: "#F0ECE3",
          200: "#E2DDD4",
          300: "#C5BFB4",
          400: "#9E988F",
          500: "#5A564F",
          600: "#2E2C29",
          700: "#1A1917",
          800: "#121110",
          900: "#0A0A09",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#EFECE4", // recessed warm stone container
          muted: "#E8E4DA",
          border: "#E2DDD4", // warm hairline limestone
        },
        // Archival paper tones for Passport, Guild Exam, and Guided Practice sheets
        paper: {
          DEFAULT: "#FAF8F4",
          warm: "#F1EDE4",
          deep: "#E8E4DA",
        },
        // Muted category tones for the landing page skill deck
        deck: {
          music: "#8C4A28",
          languages: "#1E3A8A",
          life: "#2E2C29",
          tech: "#1F4E4A",
        },
        accent: {
          vermilion: "#C84B15", // Dieter Rams Signal Vermilion
          "vermilion-hover": "#B33F0F",
          "vermilion-light": "#FBF2ED",
          "vermilion-border": "#F3D2C4",
          emerald: "#2D5A43",   // Deep Alpine Pine
          "emerald-light": "#EBF2EE",
          "emerald-border": "#C9DEC7",
          amber: "#8A6F32",     // Muted Ochre
          "amber-light": "#F7F2E7",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      // Smallest steps of the type scale. 3xs is reserved for uppercase mono labels.
      fontSize: {
        "2xs": "11px",
        "3xs": "10px",
      },
      boxShadow: {
        "2xs": "0 1px 0 0 rgb(26 25 23 / 0.04)",
        xs: "0 1px 2px 0 rgb(26 25 23 / 0.04)",
        card: "0 1px 3px 0 rgb(26 25 23 / 0.04), 0 1px 2px -1px rgb(26 25 23 / 0.04)",
        elevated: "0 4px 12px 0 rgb(26 25 23 / 0.06), 0 2px 4px -2px rgb(26 25 23 / 0.04)",
      },
      borderRadius: {
        xs: "2px",
      },
      backdropBlur: {
        xs: "4px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
