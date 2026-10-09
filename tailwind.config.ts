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
        pmx: {
          bg: "#f3f2f2",
          surface: "#eae9e9",
          text: "#201e1d",
          accent: "#ec3013",
          accentHover: "#dd2b0f",
          accentDark: "#ae1800",
          accentLight: "#fff2ef",
          accent2: "#e15b47",
          divider: "rgba(32, 30, 29, 0.15)",
          neutral100: "#f8f4f4",
          neutral200: "#eae7e7",
          neutral300: "#d7d3d3",
          neutral400: "#bab6b6",
          neutral500: "#9b9797",
          neutral600: "#7d7979",
          neutral700: "#605d5d",
          neutral800: "#444141",
          neutral900: "#2d2b2b",
        },
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "sans-serif"],
        heading: ["Archivo", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
