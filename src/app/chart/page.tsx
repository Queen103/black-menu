'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import React, { useEffect, useState } from 'react';

// Định nghĩa kiểu dữ liệu cho máy
interface Machine {
    id: number;
    name: string;
    dailyTarget: number;
    hourTarget: number;
    actual: number;
    isConnect: boolean;
    enable: boolean;
}

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const TargetChart: React.FC = () => {
    const [machines, setMachines] = useState<Machine[]>([]);

    // Lấy dữ liệu máy từ API
    useEffect(() => {
        const fetchMachines = async () => {
            const response = await fetch('/api/machines');
            const data = await response.json();
            setMachines(data);
        };

        fetchMachines();
        const interval = setInterval(fetchMachines, 500); // Cập nhật mỗi 500ms
        return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
    }, []);

    // Tạo dữ liệu cho biểu đồ
    const chartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return context.dataset.label + ': ' + context.raw;
                    }
                }
            }
        }
    };

    return (
        <div className="flex justify-start gap-10 px-10 py-6">
            {/* Biểu đồ Mục Tiêu Giờ */}
            <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center mb-4">Mục Tiêu Giờ</h2>
                <div className="h-96">
                    <Line
                        data={{
                            labels: machines.map(machine => machine.name), // Tên máy làm nhãn
                            datasets: [
                                {
                                    label: 'Mục Tiêu Giờ',
                                    data: machines.map(machine => machine.hourTarget), // Giá trị mục tiêu giờ
                                    borderColor: 'rgba(54, 162, 235, 1)', // Màu đường
                                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // Màu nền
                                    fill: true, // Điền màu dưới đường
                                    tension: 0, // Độ cong của đường
                                    borderWidth: 2
                                }
                            ]
                        }}
                        options={chartOptions}
                    />
                </div>
            </div>

            {/* Biểu đồ Sản Lượng Thực Tế */}
            <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center mb-4">Thực Thi</h2>
                <div className="h-96">
                    <Line
                        data={{
                            labels: machines.map(machine => machine.name), // Tên máy làm nhãn
                            datasets: [
                                {
                                    label: 'Sản Lượng Thực Tế',
                                    data: machines.map(machine => machine.actual), // Giá trị sản lượng thực tế
                                    borderColor: 'rgba(255, 99, 132, 1)', // Màu đường
                                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Màu nền
                                    fill: true, // Điền màu dưới đường
                                    tension: 0, // Độ cong của đường
                                    borderWidth: 2
                                }
                            ]
                        }}
                        options={chartOptions}
                    />
                </div>
            </div>
        </div>
    );
};

export default TargetChart;
