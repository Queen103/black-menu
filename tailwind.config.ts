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
        // Màu chính
        'primary': '#00964d',      // Xanh lá cây chính
        'secondary': '#1F2836',    // Xám đậm
        'accent': '#2196F3',       // Xanh dương

        // Màu trạng thái
        'connect': '#00964d',      // Xanh lá - kết nối
        'notConnect': '#c40005',   // Đỏ - mất kết nối
        'warning': '#ff9800',      // Cam - cảnh báo
        'error': '#f44336',        // Đỏ - lỗi

        // Màu nền
        'bg-dark': '#121C33',      // Nền tối
        'bg-light': '#e6e6e6',     // Nền sáng
        'bg-table': '#041847',     // Nền bảng
        'bg-tableIn': '#20335d',   // Nền ô trong bảng
        'bg-tableOut': '#163374',  // Nền ô ngoại bảng
        'report': '#00964d',

        // Màu sidebar
        'sideBar-dark': '#0E1626', // Sidebar tối
        'sideBar-light': '#f5f5f5',// Sidebar sáng

        // Màu text
        'text-dark': '#ffffff',    // Text trên nền tối
        'text-light': '#333333',   // Text trên nền sáng
        'text-table': '#D4AF37',   // Text trên nền bảng

        // Màu border
        'border-dark': '#ffffff',  // Viền trên nền tối
        'border-light': '#000000', // Viền trên nền sáng
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
