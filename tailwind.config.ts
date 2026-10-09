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
          active: "#094987",
          light: "#ebf4fd",
          canvas: "#f3f2ef",
          card: "#ffffff",
          border: "#e0dfdc",
          text: "#191919",
          secondary: "#666666",
          tertiary: "#8c8c8c",
          accent: "#70b5f9",
          badge: "#01754f",
          gold: "#b24020",
        },
        brand: {
          50: "#f0f7fe",
          100: "#e0effd",
          200: "#badffb",
          300: "#7ec4f7",
          400: "#3aa3f1",
          500: "#0a66c2",
          600: "#004182",
          700: "#094987",
          800: "#0d3b66",
          900: "#0a2e50",
          950: "#061c33",
        },
      },
    },
  },
  plugins: [],
};
export default config;
