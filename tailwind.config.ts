import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./apps/**/*.{ts,tsx,js,jsx,html}", "./packages/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#020617",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.15), 0 20px 80px rgba(2, 6, 23, 0.55)",
      },
    },
  },
  plugins: [],
} satisfies Config;
