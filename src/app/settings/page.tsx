"use client"
import React, { useEffect, useState, useRef } from 'react';
import * as echarts from 'echarts';

// Định nghĩa kiểu dữ liệu của một máy
interface Machine {
    id: number;
    name: string;
    dailyTarget: number;
    hourTarget: number;
    actual: number;
    isConnect: boolean;
    enable: boolean;
    is_Blink: boolean;
    performance: number;
}

const BarChart = () => {
    const [machines, setMachines] = useState<Machine[]>([]); // Xác định kiểu dữ liệu của machines
    const chartRef = useRef<HTMLDivElement | null>(null);

    // Gọi API để lấy dữ liệu machines
    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await fetch('/api/machines');
                if (!response.ok) {
                    throw new Error('Failed to fetch machines');
                }
                const data: Machine[] = await response.json(); // Gán kiểu dữ liệu cho dữ liệu trả về
                setMachines(data);
            } catch (error) {
                console.error('Error fetching machines:', error);
            }
        };

        fetchMachines();
    }, []);

    // Vẽ biểu đồ khi dữ liệu machines thay đổi
    useEffect(() => {
        if (chartRef.current && machines.length > 0) {
            const chartInstance = echarts.init(chartRef.current);

            // Lọc dữ liệu
            const filteredMachines = machines.filter((machine) => machine.hourTarget !== 0);

            const names = filteredMachines.map((machine) => machine.name);
            const hourTargets = filteredMachines.map((machine) => machine.hourTarget);
            const barColors = filteredMachines.map((machine) =>
                machine.hourTarget < 0 ? '#ff6347' : '#34d089'
            );

            const options = {
                title: {
                    text: 'Biểu Đồ Thể Hiện Mục Tiêu Giờ Của Từng Chuyền',
                    left: 'center',
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: '{b}: {c} PCS',
                },
                xAxis: {
                    type: 'category',
                    data: names,
                    axisLabel: {
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: '#333333',
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Mục Tiêu (PCS)',
                    nameTextStyle: {
                        fontSize: 14,
                        fontWeight: 'bold',
                    },
                    axisLabel: {
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: '#333333',
                    },
                    min: Math.floor(Math.min(0, ...hourTargets) * 1.2 / 5) * 5, // Bao gồm giá trị âm
                    max: Math.ceil(Math.max(...hourTargets) * 1.2 / 5) * 5,
                },
                series: [
                    {
                        name: 'Mục Tiêu Giờ',
                        type: 'bar',
                        data: hourTargets,
                        barWidth: 30,
                        itemStyle: {
                            color: (params: any) => (params.value < 0 ? '#ff6347' : '#34d089'), // Cột đỏ cho giá trị âm, xanh cho dương
                        },
                        label: {
                            show: true,
                            position: (params: any) =>
                                params.value < 0 ? 'outsideBottom' : 'insideTop', // Dương trên hẳn cột, âm dưới hẳn cột
                            distance: 10, // Khoảng cách giữa nhãn và cột
                            formatter: '{c}', // Hiển thị giá trị
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: '#000', // Màu chữ nhãn
                        },
                    },
                ],
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    containLabel: true,
                },
            };


            chartInstance.setOption(options);

            // Cleanup chart instance on unmount
            return () => {
                chartInstance.dispose();
            };
        }
    }, [machines]);

    return (
        <div
            ref={chartRef}
            style={{
                width: '100%',
                height: '400px',
                background: '#ffffff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.8)',
            }}
        />
    );
};

export default BarChart;
