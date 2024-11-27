"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Loading from "../components/Loading";
import CardDetail from '../components/CardDetail';

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

// Component chính của trang chi tiết
const DetailPage = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(true);

    // Hàm lấy dữ liệu máy từ API
    const fetchMachineData = useCallback(async () => {
        try {
            if (isFirstLoad) {
                setIsLoading(true);
            }
            const response = await fetch("/api/machines");
            if (!response.ok) {
                throw new Error("Lỗi kết nối API");
            }
            const data = await response.json();
            setMachines(data);
            if (isFirstLoad) {
                setIsFirstLoad(false);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            if (isFirstLoad) {
                setIsLoading(false);
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
            {isLoading && <Loading isDarkMode={isDarkMode} />}
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
                        <CardDetail
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
