import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#f8fafc",
        card: "#0f172a",
        "card-foreground": "#e2e8f0",
        popover: "#0f172a",
        "popover-foreground": "#e2e8f0",
        primary: "#8b5cf6",
        "primary-foreground": "#fdf4ff",
        secondary: "#14b8a6",
        "secondary-foreground": "#ecfeff",
        muted: "#111827",
        "muted-foreground": "#94a3b8",
        accent: "#22d3ee",
        "accent-foreground": "#0f172a",
        border: "#1f2937",
        ring: "#7c3aed",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top left, rgba(124,58,237,0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(14,165,233,0.25), transparent 60%)",
      },
      boxShadow: {
        "glow-primary": "0 15px 60px -15px rgba(124,58,237,0.45)",
      },
    },
  },
  plugins: [],
}

export default config

