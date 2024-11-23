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

    const enabledCount = machines.filter((machine) => machine.enable || (!machine.isConnect)).length;
    const idCount = machines.filter((machine) => machine.id).length;

    return (
        <div className="text-black px-5">
            <div
                className={`text-[#333333] text-2xl font-semibold flex items-center space-x-4 justify-between px-2 ${isFullScreen ? "py-8" : "py-3"
                    }`}
            >
                <div>
                    Số Line đang hoạt động: {enabledCount}/{idCount}
                </div>
                <div className="text-[#333333] text-2xl font-semibold flex items-center space-x-4 justify-start gap-x-10">
                    <div className="flex items-center space-x-2">
                        <div>Có Kết Nối</div>
                        <div className={`h-5 w-5 rounded-lg bg-[#00c264]`} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div>Không Hoạt Động</div>
                        <div className={`h-5 w-5 rounded-lg bg-gray-400`} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div>Mất Kết Nối</div>
                        <div className={`h-5 w-5 rounded-lg bg-[#f42429]`} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 select-none">
                {machines.length === 0 ? (
                    <div className="text-center col-span-5">Không có dữ liệu máy</div>
                ) : (
                    machines.map((machine) => {
                        // Xác định màu nền cho máy dựa trên trạng thái
                        let bgColor = "bg-gray-400 "; // Mặc định là màu xám
                        if (!machine.isConnect) {
                            bgColor = "bg-[#f42429]"; // Màu đỏ khi mất kết nối
                        } else if (machine.enable) {
                            bgColor = "bg-[#00c264]"; // Màu xanh dương khi máy hoạt động
                        }
                        let borderCol = "border-gray-400 opacity-20"; // Mặc định là màu xám
                        if (!machine.isConnect) {
                            borderCol = "border-[#f42429] shadow-[0px_4px_4px_rgba(0,0,0,0.7)]"; // Màu đỏ khi mất kết nối
                        } else if (machine.enable) {
                            borderCol = "border-[#00c264] shadow-[0px_4px_4px_rgba(0,0,0,0.7)]"; // Màu xanh dương khi máy hoạt động
                        }

                        return (
                            <div
                                key={machine.id}
                                className={`${isFullScreen ? "py-5" : ""
                                    } text-center border-4 bg-white rounded-lg transition-transform hover:scale-[102%] ${borderCol} `}
                            >
                                <h3
                                    className={`text-2xl py-2 rounded-t-sm font-semibold justify-center ${bgColor} ${isFullScreen ? "mb-4" : "mb-2"
                                        }`}
                                >
                                    {machine.name}
                                </h3>

                                <div className="mb-3 grid grid-cols-2 gap-y-2 p-1 item-center px-3">
                                    <strong className="text-start text-xl">Mục Tiêu Ngày</strong>
                                    <span className="text-3xl text-end">{machine.dailyTarget}</span>

                                    <strong className="text-start text-xl">Mục Tiêu Giờ</strong>
                                    <span className="text-3xl text-end">{machine.hourTarget}</span>

                                    <strong className="text-start text-xl">Thực Hiện</strong>
                                    <span className="text-3xl text-end">{machine.actual}</span>

                                    <strong className="text-start text-xl">Hiệu Suất</strong>
                                    <span className="text-3xl text-end">{machine.performance}</span>
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
