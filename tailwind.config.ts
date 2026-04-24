// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        cm: {
          bg:       "var(--cm-bg)",
          surface:  "var(--cm-surface)",
          surface2: "var(--cm-surface2)",
          text:     "var(--cm-text)",
          text2:    "var(--cm-text2)",
          text3:    "var(--cm-text3)",
          border:   "var(--cm-border)",
          accent:   "var(--cm-accent)",
          blue:     "var(--cm-blue)",
        },
      },
      boxShadow: {
        card:    "0 4px 24px rgba(15,23,42,0.07)",
        "card-lg": "0 12px 40px rgba(15,23,42,0.10)",
        float:   "0 8px 24px rgba(15,23,42,0.10)",
        accent:  "0 4px 14px var(--cm-accent-b)",
        blue:    "0 4px 14px rgba(0,68,188,0.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "fade-up":   "fadeUp 0.24s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":   "fadeIn 0.18s ease-out both",
        "slide-up":  "slideUp 0.28s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":  "scaleIn 0.20s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        fadeUp:  { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};

export default config;