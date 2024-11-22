"use client";
import { useEffect, useState } from "react";

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

const DetailPage = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const fetchMachineData = async () => {
        try {
            const response = await fetch("/api/machines");
            if (!response.ok) {
                throw new Error("API response not ok");
            }
            const data = await response.json();
            setMachines(data);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    };

    const checkFullScreen = () => {
        const isFullScreenNow = window.innerHeight === screen.height;
        setIsFullScreen(isFullScreenNow);
    };

    useEffect(() => {
        fetchMachineData();
        const interval = setInterval(() => {
            fetchMachineData();
            document.addEventListener("fullscreenchange", checkFullScreen);
            checkFullScreen();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const enabledCount = machines.filter((machine) => machine.enable).length;
    const idCount = machines.filter((machine) => machine.id).length;

    return (
        <div className="text-black p-2">
            <div
                className={`text-[#333333] text-2xl font-semibold flex items-center space-x-4 justify-between px-2 ${isFullScreen ? "py-5" : "py-2"
                    }`}
            >
                <div>
                    Số Line đang hoạt động: {enabledCount}/{idCount}
                </div>
                <div className="text-[#333333] text-2xl font-semibold flex items-center space-x-4 justify-start gap-x-10">
                    <div className="flex items-center space-x-2">
                        <div>Kết nối</div>
                        <div className={`h-5 w-5 rounded-lg bg-[#24c0cd]`} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div>Không hoạt động</div>
                        <div className={`h-5 w-5 rounded-lg bg-gray-400`} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div>Không kết nối</div>
                        <div className={`h-5 w-5 rounded-lg bg-[#f77052]`} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 select-none">
                {machines.length === 0 ? (
                    <div className="text-center col-span-5">Không có dữ liệu máy</div>
                ) : (
                    machines.map((machine) => {
                        // Xác định màu nền cho máy dựa trên trạng thái
                        let bgColor = "bg-gray-400"; // Mặc định là màu xám
                        if (!machine.isConnect) {
                            bgColor = "bg-[#f77052]"; // Màu đỏ khi mất kết nối
                        } else if (machine.enable) {
                            bgColor = "bg-[#24c0cd]"; // Màu xanh dương khi máy hoạt động
                        }

                        return (
                            <div
                                key={machine.id}
                                className={`${isFullScreen ? "py-3" : "py-1"
                                    } border-2 border-black  text-center rounded-2xl shadow-[0px_4px_4px_rgba(0,0,0,0.5)] transition-transform hover:scale-[102%] ${bgColor}`}
                            >
                                <h3
                                    className={`text-xl font-semibold justify-center   ${isFullScreen ? "mb-4" : "mb-2"
                                        }`}
                                >
                                    {machine.name}
                                </h3>

                                <div className="mb-3 grid grid-cols-2 gap-y-1 border-t-2 border-b-2 border-black py-1">
                                    <strong className="text-center">Mục Tiêu Hằng Ngày:</strong>
                                    <span>{machine.dailyTarget}</span>

                                    <strong className="text-center">Mục Tiêu Giờ:</strong>
                                    <span>{machine.hourTarget}</span>

                                    <strong className="text-center">Thực Hiện:</strong>
                                    <span>{machine.actual}</span>

                                    <strong className="text-center">Hiệu Suất:</strong>
                                    <span>{machine.performance}</span>
                                </div>

                                <div className="space-y-1">
                                    <p>
                                        <strong>Trạng Thái Kết Nối: </strong>
                                        <span
                                            className={`font-semibold ${machine.isConnect ? "text-green-800" : "text-red-100"
                                                }`}
                                        >
                                            {machine.isConnect ? "Kết Nối" : "Mất Kết Nối"}
                                        </span>
                                    </p>

                                    <p>
                                        <strong>Trạng Thái Bật: </strong>
                                        <span
                                            className={`font-semibold ${machine.enable ? "text-blue-700" : "text-gray-700"
                                                }`}
                                        >
                                            {machine.enable ? "Đang Hoạt Động" : "Tắt"}
                                        </span>
                                    </p>

                                    <p>
                                        <strong>Chế Độ Nhấp Nháy: </strong>
                                        <span
                                            className={`font-semibold ${machine.is_Blink ? "text-[#FFFF99]" : "text-gray-700"
                                                }`}
                                        >
                                            {machine.is_Blink ? "Bật" : "Tắt"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DetailPage;
