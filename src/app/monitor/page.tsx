'use client'
import { useEffect, useState, useCallback } from 'react';
import { fetchMachines, type Machine } from '@/services/api/machines';
import messages from '@/messages';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const MonitorPage = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const t = messages[language]?.table?.item || {};

    // Thời gian làm việc theo từng khung giờ
    const timeSlots = [
        "07:30-08:30", "08:30-09:30", "09:30-10:30", "10:30-11:30", "11:30-12:30",
        "13:30-14:30", "14:30-15:30", "15:30-16:30", "16:30-17:30"
    ];

    const checkFullScreen = useCallback(() => {
        const isFullScreenNow = window.innerHeight === screen.height;
        setIsFullScreen(isFullScreenNow);
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchMachines();
                setMachines(data);
            } catch (error) {
                console.error('Error fetching machines:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Initial setup
        document.addEventListener("fullscreenchange", checkFullScreen);
        checkFullScreen();

        // Set up interval for UI updates
        const intervaldevice_id = setInterval(() => {
            document.addEventListener("fullscreenchange", checkFullScreen);
            checkFullScreen();
        }, 1000);

        // Cleanup
        return () => {
            document.removeEventListener("fullscreenchange", checkFullScreen);
            clearInterval(intervaldevice_id);
        };
    }, [checkFullScreen]);

    // Tính tổng giá trị của các khung giờ
    const calculateTotal = (hourlyValues: number[]) => {
        return hourlyValues.reduce((acc, curr) => acc + curr, 0);
    };

    // Tính hiệu suất
    const calculateEfficiency = (actual: number, target: number) => {
        if (target === 0) return 0;
        return (actual / target) * 100;
    };

    return (
        <div className={`${isDark ? 'text-text-dark bg-bg-dark' : 'text-text-light bg-bg-light'} h-full ${isFullScreen ? "py-2 px-4" : "py-1 px-2"}`}>

            <div className="overflow-x-auto shadow-[0px_0px_8px_rgba(0,0,0,0.8)]">
                <table className={`table-auto w-full border-collapse border-2 ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                    <thead>
                        <tr className={`w-full ${isDark ? 'border-border-dark bg-bg-table' : 'border-border-light bg-gray-400'}`}>
                            <th className={`border-2 w-[2%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>ID</th>
                            <th className={`border-2 w-[6%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.Name}</th>
                            <th className={`border-2 w-[6%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.productedCode}</th>
                            <th className={`border-2 w-[6%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.totalProducted}</th>
                            <th className={`border-2 w-[8%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.timeStart}</th>
                            <th className={`border-2 w-[8%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.timeEnd}</th>
                            <th className={`border-2 w-[6%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.actualProducted}</th>
                            <th className={`border-2 w-[6%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.remainingProducted}</th>
                            <th className={`border-2 w-[5%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.workers}</th>
                            {timeSlots.map((slot, index) => (
                                <th key={index} className={`border-2 w-[4%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                    {slot}
                                </th>
                            ))}
                            <th className={`border-2 w-[6%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.total}</th>
                            <th className={`border-2 w-[6%] text-md ${isDark ? 'border-border-dark' : 'border-border-light'}`}>{t.efficiency}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machines.filter(machine => machine.enable).map((machine) => {
                            // Giả lập dữ liệu cho các khung giờ (sẽ thay thế bằng dữ liệu thực từ API)
                            const hourlyTargets = Array(9).fill(Math.floor(machine.target / 9));
                            const hourlyActuals = Array(9).fill(Math.floor(machine.actual / 9));
                            const totalActual = calculateTotal(hourlyActuals);
                            const totalTarget = calculateTotal(hourlyTargets);
                            const efficiency = calculateEfficiency(totalActual, totalTarget);

                            return (
                                <tr key={machine.device_id} className={` ${machine.connection ? "" : "opacity-80 blink"} ${isDark ? 'bg-bg-dark text-white' : 'bg-bg-light text-black'}`}>
                                    <td className={`border-2 ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        {machine.device_id}
                                    </td>
                                    <td className={`border-2 ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        <span className="font-semibold truncate" title={machine.name}>{machine.name}</span>
                                    </td>
                                    <td className={`border-2 ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        <span className="font-semibold truncate" title={machine.code}>{machine.code}</span>
                                    </td>
                                    <td className={`border-2 font-semibold ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        {machine.total_production}
                                    </td>
                                    <td className={`border-2 font-semibold ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        {machine.time_start}
                                    </td>
                                    <td className={`border-2 font-semibold ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        {machine.time_end}
                                    </td>
                                    <td className={`border-2 font-semibold ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        {machine.actual_production}
                                    </td>
                                    <td className={`border-2 font-semibold ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        {machine.total_production - machine.actual_production || 0}
                                    </td>
                                    <td className={`border-2 font-semibold ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        {machine.worker || 0}
                                    </td>
                                    {hourlyTargets.map((target, index) => (
                                        <td key={index} className={`border-2 ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                            <div className="flex flex-col">
                                                <span className={`font-semibold ${isDark ? ' text-orange-100' : ' text-blue-500'}`}>{target}</span>
                                                <span className={hourlyActuals[index] >= target ? "text-green-500" : "text-text-table"}>
                                                    {hourlyActuals[index]}
                                                </span>
                                            </div>
                                        </td>
                                    ))}
                                    <td className={`border-2 ${isFullScreen ? "px-1 py-1 text-md" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        <div className="flex flex-col">
                                            <span className={`font-semibold ${isDark ? ' text-orange-100' : ' text-blue-500'}`}>{totalTarget}</span>
                                            <span className={totalActual >= totalTarget ? "text-green-500" : "text-text-table"}>
                                                {totalActual}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={`border-2 font-bold ${isFullScreen ? "px-1 py-1 text-2xl" : "px-1  text-md"} text-center ${isDark ? 'border-border-dark' : 'border-border-light'}`}>
                                        <span className={efficiency >= 100 ? "text-green-500" : "text-text-table"}>
                                            {efficiency.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonitorPage;
