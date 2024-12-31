"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Loading from "../components/Loading";
import CardDetail from '../components/CardDetail';
import { useTheme } from "../context/ThemeContext";
import { useFullScreen } from '../context/FullScreenContext';
import { Machine, fetchMachines } from '@/services/api/machines';
import { useLanguage } from '../context/LanguageContext';
import messages from '@/messages';

// Component chính của trang chi tiết
const DetailPage = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { isDark } = useTheme();
    const { isFullScreen } = useFullScreen();
    const { language } = useLanguage();
    const t = messages[language].home;

    // Hàm lấy dữ liệu máy từ API
    const fetchMachineData = useCallback(async () => {
        try {
            if (isFirstLoad) {
                setIsLoading(true);
            }
            const data = await fetchMachines();
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

    // Thiết lập các hiệu ứng
    useEffect(() => {
        fetchMachineData(); // Gọi lần đầu ngay lập tức
        const interval = setInterval(fetchMachineData, 1000); // Cập nhật mỗi 1 giây

        return () => {
            clearInterval(interval);
        };
    }, [fetchMachineData]);

    // Tính toán số lượng máy hoạt động và tổng số máy
    const { enabledCount, totalCount } = useMemo(() => ({
        enabledCount: machines.filter((machine) => machine.enable).length,
        totalCount: machines.filter((machine) => machine.device_id).length
    }), [machines]);

    // Nếu đang tải lần đầu, hiển thị loading
    if (isFirstLoad) {
        return (
            <div className={`px-5 h-[100vh] ${isDark ? 'text-white bg-bg-dark' : 'text-[#333333] bg-bg-light'}`}>
                <Loading isDarkMode={isDark} />
            </div>
        );
    }

    return (
        <div className={`px-5 h-[100vh] ${isFullScreen ? "py-1" : ""} ${isDark ? 'text-white bg-bg-dark' : 'text-[#333333] bg-bg-light'}`}>
            {isLoading && <Loading isDarkMode={isDark} />}
            <div className={`${isDark ? 'text-white' : 'text-[#333333]'} text-2xl font-semibold flex items-center space-x-4 justify-between px-2 ${isFullScreen ? "py-8" : "py-3"}`}>
                <div>
                    {t.footer.line_count} {enabledCount}/{totalCount}
                </div>
                <div className="text-2xl font-semibold flex items-center space-x-4 justify-start gap-x-10">
                    <StatusIndicator label={t.footer.connected} color="bg-connect" />
                    <StatusIndicator label={t.footer.not_operating} color="bg-gray-400" />
                    <StatusIndicator label={t.footer.disconnected} color="bg-notConnect" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 select-none">
                {machines.length === 0 ? (
                    <div className="text-center col-span-5">Không có dữ liệu máy</div>
                ) : (
                    machines.map((machine) => (
                        <CardDetail
                            key={machine.device_id}
                            machine={machine}
                            isDarkMode={isDark}
                            isFullScreen={isFullScreen}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Component hiển thị trạng thái kết nối
const StatusIndicator = ({ label, color }: { label: string; color: string }) => (
    <div className="flex items-center space-x-2">
        <div>{label}</div>
        <div className={`h-5 w-5 rounded-lg ${color}`} />
    </div>
);

export default DetailPage;
