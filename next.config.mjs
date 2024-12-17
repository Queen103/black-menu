/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Kích hoạt React Strict Mode để giúp phát hiện lỗi trong ứng dụng
    swcMinify: true, // Tối ưu hóa mã nguồn bằng SW
    output: 'export',
    images: {
        unoptimized: true
    },
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_API_GET_CPU_INFO: process.env.NEXT_PUBLIC_API_GET_CPU_INFO,
        NEXT_PUBLIC_API_GET_DEVICES_INFO: process.env.NEXT_PUBLIC_API_GET_DEVICES_INFO,
        NEXT_PUBLIC_API_GET_REPORTS_CONFIG: process.env.NEXT_PUBLIC_API_GET_REPORTS_CONFIG,
        NEXT_PUBLIC_API_SET_REPORTS_CONFIG: process.env.NEXT_PUBLIC_API_SET_REPORTS_CONFIG,
        NEXT_PUBLIC_API_SET_DEVICE_ENABLE: process.env.NEXT_PUBLIC_API_SET_DEVICE_ENABLE,
        NEXT_PUBLIC_API_SET_DEVICE_NAME: process.env.NEXT_PUBLIC_API_SET_DEVICE_NAME,
        NEXT_PUBLIC_API_SET_DEVICE_TARGET: process.env.NEXT_PUBLIC_API_SET_DEVICE_TARGET,
        NEXT_PUBLIC_API_SET_DEVICE_START_SHIFT_1: process.env.NEXT_PUBLIC_API_SET_DEVICE_START_SHIFT_1,
        NEXT_PUBLIC_API_SET_DEVICE_START_SHIFT_2: process.env.NEXT_PUBLIC_API_SET_DEVICE_START_SHIFT_2,
        NEXT_PUBLIC_API_SET_DEVICE_ACTUAL: process.env.NEXT_PUBLIC_API_SET_DEVICE_ACTUAL,
        NEXT_PUBLIC_API_SET_DEVICE_TOTAL_MIN: process.env.NEXT_PUBLIC_API_SET_DEVICE_TOTAL_MIN
    }
};

export default nextConfig;
