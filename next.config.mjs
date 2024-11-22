/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Kích hoạt React Strict Mode để giúp phát hiện lỗi trong ứng dụng
    swcMinify: true, // Tối ưu hóa mã nguồn bằng SW
    // output: 'export',
    images: {
        unoptimized: true
    }
};

export default nextConfig;
