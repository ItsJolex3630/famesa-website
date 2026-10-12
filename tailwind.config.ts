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
        famesa: {
          navy: "#0A1A3A",
          blue: "#00299F",
          electric: "#003AD7",
          surface: "#F8FAFC",
          silver: "#E5E5E5",
          silverDark: "#C8D2E0",
          ink: "#12203A",
          muted: "#5B6A85",
          orange: "#FF8A1F",
          alertRed: "#DC2626",
        },
        // Tokens semánticos del panel FAMESA SUITE (/admin).
        // Definidos con hex literal para que Tailwind 3 permita modificadores de opacidad.
        background: "#F8FAFC",
        foreground: "#12203A",
        primary: {
          DEFAULT: "#00299F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F8FAFC",
          foreground: "#12203A",
        },
        accent: {
          DEFAULT: "#EDF2FC",
          foreground: "#12203A",
        },
        surface: "#FFFFFF",
        navy: "#0A1A3A",
        electric: "#003AD7",
        orange: "#FF8A1F",
        input: "#C8D2E0",
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        heading: ["var(--font-barlow)", "'Barlow Condensed'", "sans-serif"],
        body: ["var(--font-inter)", "'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: {
        shell: "1280px",
      },
      letterSpacing: {
        caps: "0.05em",
        widecaps: "0.16em",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "scroll-cue": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateY(10px)", opacity: "0" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2.4s ease-in-out infinite",
        "scroll-cue": "scroll-cue 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
