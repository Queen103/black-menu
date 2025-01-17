"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Import từ React Toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS của Toastify
import { CustomToast } from "../components/CustomToast";
import Loading from "../components/Loading";
import { useTheme } from "../context/ThemeContext";
import { useFullScreen } from '../context/FullScreenContext';
import InputTime2Number from '../components/InputTime2Number';
import { fetchReportSettings, updateReportTime, TimeSlot } from '@/services/api/report';
import { useLanguage } from '../context/LanguageContext';
import messages from "@/messages";

const ReportPage = () => {
    const { language } = useLanguage();
    const t = messages[language].report;
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const { isDark } = useTheme();
    const { isFullScreen } = useFullScreen();
    // State for hours and minutes
    const [editedHours, setEditedHours] = useState<{ [key: number]: string }>({});
    const [editedMinutes, setEditedMinutes] = useState<{ [key: number]: string }>({});

    const handleHourChange = (slotId: number, value: string) => {
        if (!value) {
            setEditedHours(prev => ({ ...prev, [slotId]: value }));
            return;
        }

        const numValue = parseInt(value);
        if (numValue < 0) {
            setEditedHours(prev => ({ ...prev, [slotId]: "0" }));
        } else if (numValue > 23) {
            setEditedHours(prev => ({ ...prev, [slotId]: "23" }));
        } else {
            setEditedHours(prev => ({ ...prev, [slotId]: value }));
        }
    };

    const handleMinuteChange = (slotId: number, value: string) => {
        if (!value) {
            setEditedMinutes(prev => ({ ...prev, [slotId]: value }));
            return;
        }

        const numValue = parseInt(value);
        if (numValue < 0) {
            setEditedMinutes(prev => ({ ...prev, [slotId]: "0" }));
        } else if (numValue > 59) {
            setEditedMinutes(prev => ({ ...prev, [slotId]: "59" }));
        } else {
            setEditedMinutes(prev => ({ ...prev, [slotId]: value }));
        }
    };

    const handleTimeUpdate = async (slotId: number) => {
        console.log('Updating time for slot:', slotId);
        const hours = editedHours[slotId] || "";
        const minutes = editedMinutes[slotId] || "";

        // Tìm slot hiện tại và log để debug
        const currentSlot = timeSlots.find(slot => slot.index === slotId);
        console.log('Current slot:', currentSlot);
        console.log('All slots:', timeSlots);

        // Kiểm tra nếu không có time hiện tại và không có input mới
        if (!currentSlot?.time && !hours && !minutes) {
            toast.error(t.error.cannotDelete);
            return;
        }

        // Nếu cả hai input đều rỗng thì gửi time rỗng
        const newTime = !hours && !minutes ? "" : `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

        try {
            // Sử dụng index từ slot hiện tại
            const updatedSlot = await updateReportTime(slotId, newTime);
            console.log('Updated slot response:', updatedSlot);

            setTimeSlots((prevSlots) => {
                const newSlots = prevSlots.map((slot) =>
                    slot.index === slotId ? { ...slot, time: newTime } : slot
                );
                console.log('New slots state:', newSlots);
                return newSlots;
            });

            // Reset input fields
            setEditedHours(prev => ({ ...prev, [slotId]: "" }));
            setEditedMinutes(prev => ({ ...prev, [slotId]: "" }));

            toast.success(newTime ? `${t.success.timeUpdated} ${newTime}` : t.success.timeDeleted);
        } catch (error: any) {
            console.error("Lỗi:", error);
            toast.error(error.message || t.error[newTime ? 'updateFailed' : 'deleteFailed']);
        }
    };

    // Lấy dữ liệu từ API
    const getReportSettings = async () => {
        try {
            if (isFirstLoad) {
                setIsLoading(true);
            }
            const data = await fetchReportSettings();
            console.log('API Response:', data);
            setTimeSlots(data);
            if (isFirstLoad) {
                setIsFirstLoad(false);
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error('Error in getReportSettings:', error);
            setError(error.message);
            if (isFirstLoad) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        getReportSettings();
    }, []);

    const INTERVAL_TIME = 1000; // 1 second

    // Thiết lập các hiệu ứng
    useEffect(() => {
        const intervals = [
            setInterval(() => {
                getReportSettings();
            }, INTERVAL_TIME)
        ];

        // Cleanup
        return () => {
            intervals.forEach(clearInterval);
        };
    }, []);

    return (
        <div className={`min-h-screen ${isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
            {isFirstLoad && isLoading && <Loading isDarkMode={isDark} />}
            <CustomToast isDarkMode={isDark} />
            {error && (
                <div className="text-center text-xl text-error p-4">
                    Lỗi: {error}
                </div>
            )}
            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 py-2 px-4">
                {Array.isArray(timeSlots) && timeSlots.length > 0 ? (
                    timeSlots.map((slot) => {
                        console.log('Rendering slot:', slot);
                        return (
                            <div
                                key={slot.index}
                                className={`border h-[21vh] border-report border-8 shadow-[0px_4px_6px_rgba(0,0,0,0.5)] rounded-lg py-0 text-center ${isDark ? 'bg-secondary text-text-dark' : 'bg-gray-300 text-text-light'}`}
                            >
                                <div className="bg-report">
                                    <h2 className={`text-2xl font-semibold mb-2 p-2 border-t-lg ${isFullScreen ? "py-5" : "py-2"}`}>
                                        {t.timePoint} {slot.index + 1}
                                    </h2>
                                </div>

                                <div className={`py-0 flex flex-col items-center justify-center `}>
                                    <span className="font-semibold text-center mb-2 py-3 text-3xl">
                                        {/* Hiển thị thởi gian hoặc thông báo chưa cài đặt */}
                                        {slot.time ? (
                                            <>
                                                <span>{slot.time}</span>
                                            </>
                                        ) : (
                                            <div className="w-full text-transparent">
                                                .
                                            </div>
                                        )}
                                    </span>

                                    {/* Input chỉnh sửa thởi gian */}
                                    <div className="bg-bg-light py-3 w-full h-full flex items-end justify-center bottom-0">
                                        <InputTime2Number
                                            hours={editedHours[slot.index]?.toString() || ""}
                                            minutes={editedMinutes[slot.index]?.toString() || ""}
                                            onHourChange={(value) => handleHourChange(slot.index, value)}
                                            onMinuteChange={(value) => handleMinuteChange(slot.index, value)}
                                            onEnter={() => handleTimeUpdate(slot.index)}

                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : null}
            </div>
        </div>
    );
};

export default ReportPage;
