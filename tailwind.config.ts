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
        canvas: "#FAF9F6",
        ink: {
          DEFAULT: "#18181B",
          secondary: "#52525B",
          muted: "#71717A",
          subtle: "#A1A1AA",
        },
        brand: {
          50: "#F4F4F5",
          100: "#E4E4E7",
          200: "#D4D4D8",
          300: "#A1A1AA",
          400: "#71717A",
          500: "#27272A",
          600: "#18181B",
          700: "#09090B",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F4F4F5",
          border: "#E4E4E7",
        },
        // Archival paper tones for the Passport, Guild Exam, and Guided Practice sheets
        paper: {
          DEFAULT: "#FAF8F5",
          warm: "#F4F1EB",
          deep: "#F2EFE9",
        },
        // Muted category tones for the landing page skill deck
        deck: {
          music: "#A0522D",
          languages: "#1E3A8A",
          life: "#27272A",
          tech: "#1F4E4A",
        },
        accent: {
          emerald: "#10B981",
          amber: "#D97706",
          lapis: "#1E3A8A",
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
        "2xs": "0 1px 0 0 rgb(24 24 27 / 0.04)",
        xs: "0 1px 2px 0 rgb(24 24 27 / 0.05)",
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
