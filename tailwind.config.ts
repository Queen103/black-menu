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
        'bg-dark': '#121C33',
        'table': '#20335d',
        'tableIn': '#041847',
        'sideBar-dark': '#0E1626',
        'sideBar-light': '#f5f5f5',
      },
    },
  },
  plugins: [],
};
export default config;
