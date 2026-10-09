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
        linkedin: {
          blue: "#0a66c2",
          hover: "#004182",
          light: "#e8f3fc",
          canvas: "#f3f2ef",
          card: "#ffffff",
          border: "#e0e0e0",
          text: "#191919",
          muted: "#666666",
        },
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
          primary: "#0a66c2",
          vibrant: "#0284c7",
          neon: "#38bdf8",
          light: "#f0f9ff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
