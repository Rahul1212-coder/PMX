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
        brand: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#8b5cf6",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#3b0764",
          950: "#220556",
        },
        pmverse: {
          deep: "#230554",
          dark: "#1c053a",
          primary: "#7c3aed",
          vibrant: "#9333ea",
          neon: "#a855f7",
          light: "#f5f3ff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
