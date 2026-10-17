import type { Config } from "tailwindcss";

/** A colour backed by a CSS variable holding "R G B" channels. */
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;
const states = (name: string) => ({
  DEFAULT: v(name),
  hover: v(`${name}-hover`),
  strong: v(`${name}-strong`),
  light: v(`${name}-light`),
  soft: v(`${name}-soft`),
  border: v(`${name}-border`),
});

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Every colour reads a CSS variable (see globals.css) so dark mode can
        // swap the palette. Values are "R G B" so opacity modifiers still work.
        white: v("white"),
        canvas: v("canvas"),
        // Text colours. All pass WCAG AA (4.5:1) on canvas and surface, in both themes.
        ink: {
          DEFAULT: v("ink"),
          secondary: v("ink-secondary"),
          muted: v("ink-muted"),
          subtle: v("ink-subtle"), // smallest allowed text colour
        },
        brand: {
          50: v("brand-50"),
          100: v("brand-100"),
          200: v("brand-200"),
          300: v("brand-300"),
          400: v("brand-400"),
          500: v("brand-500"),
          600: v("brand-600"),
          700: v("brand-700"),
          800: v("brand-800"),
          900: v("brand-900"),
        },
        surface: {
          DEFAULT: v("surface"),
          subtle: v("surface-subtle"),
          muted: v("surface-muted"),
          border: v("surface-border"),
        },
        paper: {
          DEFAULT: v("paper"),
          warm: v("paper-warm"),
          deep: v("paper-deep"),
        },
        deck: {
          music: v("deck-music"),
          languages: v("deck-languages"),
          life: v("deck-life"),
          tech: v("deck-tech"),
        },
        accent: {
          vermilion: v("accent-vermilion"),
          "vermilion-hover": v("accent-vermilion-hover"),
          "vermilion-light": v("accent-vermilion-light"),
          "vermilion-border": v("accent-vermilion-border"),
          emerald: v("accent-emerald"),
          "emerald-light": v("accent-emerald-light"),
          "emerald-border": v("accent-emerald-border"),
          amber: v("accent-amber"),
          "amber-light": v("accent-amber-light"),
        },
        // Semantic states — use these instead of Tailwind's rose/emerald/amber/indigo.
        success: states("success"),
        warning: states("warning"),
        danger: states("danger"),
        info: states("info"),
        // Dark surfaces (video player, code terminal). The same in both themes.
        night: {
          DEFAULT: "#121110",
          raised: "#1A1917",
          line: "#2E2C29",
          hover: "#3A3733",
          text: "#F0ECE3",
          bright: "#FFFFFF",
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
