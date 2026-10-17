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
        canvas: "#F7F5F0",
        // Text colours. All pass WCAG AA (4.5:1) on canvas and white.
        ink: {
          DEFAULT: "#1A1917",
          secondary: "#4A4640", // 8.9:1 on canvas
          muted: "#625D55", // 6.0:1 on canvas
          subtle: "#736E66", // 4.6:1 on canvas — smallest allowed text colour
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
          subtle: "#EFECE4",
          muted: "#E8E4DA",
          border: "#E2DDD4",
        },
        paper: {
          DEFAULT: "#FAF8F4",
          warm: "#F1EDE4",
          deep: "#E8E4DA",
        },
        deck: {
          music: "#8C4A28",
          languages: "#1E3A8A",
          life: "#2E2C29",
          tech: "#1F4E4A",
        },
        accent: {
          vermilion: "#B4420F", // 5.2:1 on canvas
          "vermilion-hover": "#9E390C",
          "vermilion-light": "#FBF2ED",
          "vermilion-border": "#F3D2C4",
          emerald: "#2D5A43",  
          "emerald-light": "#EBF2EE",
          "emerald-border": "#C9DEC7",
          amber: "#7A6129",
          "amber-light": "#F7F2E7",
        },
        // Semantic states — use these instead of Tailwind's rose/emerald/amber/indigo.
        success: {
          DEFAULT: "#2D5A43",
          hover: "#234A36",
          strong: "#1D3B2C",
          light: "#EBF2EE",
          soft: "#DCE9E1",
          border: "#C9DEC7",
        },
        warning: {
          DEFAULT: "#7A6129",
          hover: "#654F20",
          strong: "#4F3F1A",
          light: "#F7F2E7",
          soft: "#EFE3C6",
          border: "#E6D8B5",
        },
        danger: {
          DEFAULT: "#A63826",
          hover: "#8E2F20",
          strong: "#6E2418",
          light: "#FDF0ED",
          soft: "#F9E1DA",
          border: "#F5D0C7",
        },
        info: {
          DEFAULT: "#1E3A8A",
          hover: "#182F70",
          strong: "#142659",
          light: "#EEF1F8",
          soft: "#DDE3F1",
          border: "#C7D0E6",
        },
        // Dark surfaces (video player, code terminal).
        night: {
          DEFAULT: "#121110",
          raised: "#1A1917",
          line: "#2E2C29",
          hover: "#3A3733",
          text: "#F0ECE3",
          muted: "#B5AFA5",
          subtle: "#8F897F",
          green: "#8FCFA6",
          blue: "#94BDEB",
          amber: "#E3B65C",
          red: "#EB9A88",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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
