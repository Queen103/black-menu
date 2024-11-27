"use client";
import { useEffect, useState, useCallback, useMemo } from "react";

// Định nghĩa kiểu dữ liệu cho máy
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

// Props cho component chỉ thị trạng thái
interface StatusIndicatorProps {
    label: string;
    color: string;
}

// Component loading spinner
const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-300 rounded-full"></div>
            <div className="w-20 h-20 border-t-4 border-blue-500 animate-spin rounded-full absolute left-0 top-0"></div>
        </div>
        <div className="ml-4 text-xl font-semibold">Đang tải dữ liệu...</div>
    </div>
);

// Component hiển thị trạng thái kết nối
const StatusIndicator = ({ label, color }: StatusIndicatorProps) => (
    <div className="flex items-center space-x-2">
        <div>{label}</div>
        <div className={`h-5 w-5 rounded-lg ${color}`} />
    </div>
);

// Component hiển thị thông tin của một máy
const MachineCard = ({ machine, isDarkMode, isFullScreen }: { machine: Machine; isDarkMode: boolean; isFullScreen: boolean }) => {
    // Tính toán màu nền dựa trên trạng thái máy
    const bgColor = useMemo(() => {
        if (!machine.isConnect) {
            return "bg-notConnect"; // Màu đỏ khi mất kết nối
        } else if (machine.enable) {
            return "bg-connect"; // Màu xanh dương khi máy hoạt động
        }
        return "bg-gray-400"; // Mặc định là màu xám
    }, [machine.isConnect, machine.enable]);

    // Tính toán màu viền dựa trên trạng thái máy
    const borderColor = useMemo(() => {
        if (!machine.isConnect) {
            return "border-notConnect shadow-[0px_0px_8px_rgba(255,255,255,0.9)]"; // Màu đỏ khi mất kết nối
        } else if (machine.enable) {
            return "border-connect shadow-[0px_0px_8px_rgba(255,255,255,0.9)]"; // Màu xanh dương khi máy hoạt động
        }
        return "border-gray-400 opacity-20"; // Mặc định là màu xám
    }, [machine.isConnect, machine.enable]);

    return (
        <div className={`text-center border-4 ${isDarkMode ? 'bg-bg-dark' : 'bg-bg-light'} rounded-lg transition-transform hover:scale-[102%] ${borderColor}`}>
            <h3 className={`text-white ${isFullScreen ? "py-3 text-3xl" : "py-2 text-2xl"} rounded-t-sm font-semibold justify-center ${bgColor} ${isFullScreen ? "mb-4" : "mb-2"}`}>
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
};

// Component chính của trang chi tiết
const DetailPage = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

    // Hàm lấy dữ liệu máy từ API
    const fetchMachineData = useCallback(async () => {
        try {
            const response = await fetch("/api/machines");
            if (!response.ok) {
                throw new Error("Lỗi kết nối API");
            }
            const data = await response.json();
            setMachines(data);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        } finally {
            if (isFirstLoad) {
                setIsFirstLoad(false);
            }
        }
    }, [isFirstLoad]);

    // Kiểm tra trạng thái màn hình đầy
    const checkFullScreen = useCallback(() => {
        const isFullScreenNow = window.innerHeight === screen.height;
        setIsFullScreen(isFullScreenNow);
    }, []);

    // Khởi tạo chế độ giao diện
    const initializeTheme = useCallback(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    // Thiết lập các hiệu ứng
    useEffect(() => {
        initializeTheme();
        document.addEventListener("fullscreenchange", checkFullScreen);
        checkFullScreen();
        fetchMachineData(); // Gọi lần đầu ngay lập tức

        const interval = setInterval(() => {
            initializeTheme();
            fetchMachineData();
            checkFullScreen();
        }, 1000); // Cập nhật mỗi 1 giây

        return () => {
            clearInterval(interval);
            document.removeEventListener("fullscreenchange", checkFullScreen);
        };
    }, [checkFullScreen, fetchMachineData, initializeTheme]);

    // Tính toán số lượng máy hoạt động và tổng số máy
    const { enabledCount, totalCount } = useMemo(() => ({
        enabledCount: machines.filter((machine) => machine.enable || (!machine.isConnect)).length,
        totalCount: machines.filter((machine) => machine.id).length
    }), [machines]);

    // Nếu đang tải lần đầu, hiển thị loading
    if (isFirstLoad) {
        return (
            <div className={`px-5 h-[100vh] ${isDarkMode ? 'text-white bg-gradient-to-b from-bg-dark to-gray-700' : 'text-[#333333] bg-gradient-to-b from-bg-light to-gray-400'}`}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className={`px-5 h-[100vh] ${isDarkMode ? 'text-white bg-gradient-to-b from-bg-dark to-gray-700' : 'text-[#333333] bg-gradient-to-b from-bg-light to-gray-400'}`}>
            <div className={`${isDarkMode ? 'text-white' : 'text-[#333333]'} text-2xl font-semibold flex items-center space-x-4 justify-between px-2 ${isFullScreen ? "py-8" : "py-3"}`}>
                <div>
                    Số Line đang hoạt động: {enabledCount}/{totalCount}
                </div>
                <div className="text-2xl font-semibold flex items-center space-x-4 justify-start gap-x-10">
                    <StatusIndicator label="Có Kết Nối" color="bg-connect" />
                    <StatusIndicator label="Không Hoạt Động" color="bg-gray-400" />
                    <StatusIndicator label="Mất Kết Nối" color="bg-notConnect" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 select-none">
                {machines.length === 0 ? (
                    <div className="text-center col-span-5">Không có dữ liệu máy</div>
                ) : (
                    machines.map((machine) => (
                        <MachineCard
                            key={machine.id}
                            machine={machine}
                            isDarkMode={isDarkMode}
                            isFullScreen={isFullScreen}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default DetailPage;
