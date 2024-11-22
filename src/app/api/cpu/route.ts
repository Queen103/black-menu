// app/api/cpu/route.ts
import { NextResponse } from 'next/server';

// Giả lập dữ liệu CPU
interface CpuData {
    fps: number;
    connection: boolean;
}

// Hàm giả lập lấy dữ liệu CPU
const getCpuData = (): CpuData => {
    // Giả lập FPS (giá trị ngẫu nhiên từ 30 đến 120)
    const fps = Math.floor(Math.random() * (120 - 30 + 1)) + 30;

    // Giả lập trạng thái kết nối CPU (True = connected, False = disconnected)
    const connection = Math.random() > 0.2; // 80% xác suất kết nối

    return { fps, connection };
};

export async function GET() {
    // Lấy dữ liệu CPU giả lập
    const cpuData = getCpuData();
    return NextResponse.json(cpuData); // Trả về dữ liệu JSON
}
