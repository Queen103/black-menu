"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Import từ React Toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS của Toastify
import { CustomToast } from "../components/CustomToast";
import Loading from "../components/Loading";

interface TimeSlot {
    id: number;
    time?: string | null; // Sử dụng kiểu Date
}

const ReportPage = () => {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

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
        const hours = editedHours[slotId] || "";
        const minutes = editedMinutes[slotId] || "";

        // Nếu cả hai input đều rỗng thì gửi time rỗng
        const newTime = !hours && !minutes ? "" : `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

        try {
            const response = await fetch("/api/report-settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: slotId, time: newTime }),
            });

            if (response.ok) {
                const updatedSlot = await response.json();
                setTimeSlots((prevSlots) =>
                    prevSlots.map((slot) =>
                        slot.id === updatedSlot.id ? { ...slot, time: updatedSlot.time } : slot
                    )
                );
                setEditedHours(prev => ({ ...prev, [slotId]: "" }));
                setEditedMinutes(prev => ({ ...prev, [slotId]: "" }));
                toast.success(newTime ? `Cập nhật thởi gian thành công: ${updatedSlot.time}` : "Đã xóa thởi gian thành công");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || `Lỗi khi ${newTime ? "cập nhật" : "xóa"} thởi gian`);
            }
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error(`Có lỗi xảy ra trong quá trình ${newTime ? "cập nhật" : "xóa"}`);
        }
    };

    // Lấy dữ liệu từ API
    const fetchReportSettings = async () => {
        try {
            if (isFirstLoad) {
                setIsLoading(true);
            }
            const response = await fetch("/api/report-settings");
            if (!response.ok) {
                throw new Error("Không thể tải dữ liệu từ API");
            }
            const data = await response.json();
            setTimeSlots(data);
            if (isFirstLoad) {
                setIsFirstLoad(false);
                setIsLoading(false);
            }
        } catch (error: any) {
            setError(error.message);
            if (isFirstLoad) {
                setIsLoading(false);
            }
        }
    };

    const checkFullScreen = () => {
        const isFullScreenNow = window.innerHeight === screen.height;
        setIsFullScreen(isFullScreenNow);
    };

    // Khởi tạo chế độ giao diện
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    };

    const INTERVAL_TIME = 1000; // 1 second

    // Thiết lập các hiệu ứng
    useEffect(() => {
        // Initial setup
        initializeTheme();
        document.addEventListener("fullscreenchange", checkFullScreen);
        checkFullScreen();
        fetchReportSettings();

        // Set up intervals
        const intervals = [
            setInterval(() => {
                document.addEventListener("fullscreenchange", checkFullScreen);
                checkFullScreen();

                const savedTheme = localStorage.getItem("theme");
                if (savedTheme) {
                    setIsDarkMode(savedTheme === "dark");
                } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setIsDarkMode(prefersDark);
                }

                fetchReportSettings();
            }, INTERVAL_TIME)
        ];

        // Cleanup
        return () => {
            document.removeEventListener("fullscreenchange", checkFullScreen);
            intervals.forEach(clearInterval);
        };
    }, []);

    if (error) {
        return <div className="text-center text-xl text-error">{error}</div>;
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-bg-dark' : 'bg-bg-light'}`}>
            {isFirstLoad && isLoading && <Loading isDarkMode={isDarkMode} />}
            <CustomToast isDarkMode={isDarkMode} />
            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-5">
                {timeSlots.map((slot) => (
                    <div
                        key={slot.id}
                        className={`border border-connect border-8 shadow-[0px_4px_6px_rgba(0,0,0,0.5)] rounded-lg py-0 text-center ${isDarkMode ? 'bg-bg-dark text-text-dark' : 'bg-bg-light text-text-light'}`}
                    >
                        <div className="bg-connect">
                            <h2 className={`text-2xl font-semibold mb-2 p-3 border-t-lg ${isFullScreen ? "py-5" : "py-2"}`}>
                                THỜI ĐIỂM THỨ {slot.id}
                            </h2>
                        </div>

                        <div className={`py-0 flex flex-col items-center`}>
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
                            <div className="bg-bg-light py-1 w-full">
                                <div className="flex items-center justify-center space-x-1 text-text-light">
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={editedHours[slot.id] || ''}
                                        onChange={(e) => handleHourChange(slot.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleTimeUpdate(slot.id);
                                            }
                                        }}
                                        className={`w-16 h-[4vh] text-text-light text-2xl ${isFullScreen ? "py-3" : "py-1"} border-b-2 border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-accent bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        disabled={!slot.id}
                                    />
                                    <span className="text-2xl font-bold">:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={editedMinutes[slot.id] || ''}
                                        onChange={(e) => handleMinuteChange(slot.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleTimeUpdate(slot.id);
                                            }
                                        }}
                                        className={`w-16 h-[4vh] text-text-light text-2xl ${isFullScreen ? "py-3" : "py-1"} border-b-2 border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-accent bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        disabled={!slot.id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportPage;
