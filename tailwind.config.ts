import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      scrollbarWidth: {
        none: 'none',
      },
      colors: {
        'connect': '#00964d',
        'notConnect': '#c40005',
        'bg-light': '#e6e6e6',
      },
    },
  },
  plugins: [],
};
export default config;
