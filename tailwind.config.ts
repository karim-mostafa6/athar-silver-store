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
        background: "var(--background)",
        foreground: "var(--foreground)",
        ivory: {
          50: "#fdfbf7",
          100: "#f9f6f0",
          200: "#f3ede2",
          300: "#e9dfd0",
          400: "#d9cbbb",
          500: "#c4b19e",
          600: "#9e8b77",
          700: "#7b6b5a",
          800: "#4e4338",
          900: "#2d261f",
        },
        champagne: {
          50: "#faf7f2",
          100: "#f4ede2",
          200: "#eadcc6",
          300: "#ddc6a5",
          400: "#cdae83",
          500: "#b89565",
          600: "#9e7a4f",
          700: "#7a5c3b",
          800: "#574029",
          900: "#38291a",
        },
        charcoal: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#2d2926",
          900: "#1a1715",
          950: "#0e0c0b",
        },
        athar: {
          gold: "#c5a880",
          silver: "#c0c4cc",
          platinum: "#e2e5eb",
          beige: "#f5f0e8",
          cream: "#faf8f5",
          sand: "#ede5d8",
          border: "#e7ded2",
          dark: "#1c1815",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        alexandria: ["var(--font-alexandria)", "sans-serif"],
      },
      animation: {
        "shimmer": "shimmer 2.5s infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "sheen": "sheen 1.2s ease-in-out forwards",
        "pop": "pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        sheen: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        pop: {
          "0%": { transform: "scale(0.95)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
