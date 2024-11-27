"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import từ React Toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS của Toastify

interface TimeSlot {
    id: number;
    time?: string | null; // Sử dụng kiểu Date
}

const ReportPage = () => {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    // Lưu trữ giá trị đã chỉnh sửa cho từng slot
    const [editedTimes, setEditedTimes] = useState<{ [key: number]: string }>({});

    // Lấy dữ liệu từ API
    const fetchReportSettings = async () => {
        try {
            const response = await fetch("/api/report-settings");
            if (!response.ok) {
                throw new Error("Không thể tải dữ liệu từ API");
            }
            const data = await response.json();
            setTimeSlots(
                data.map((slot: TimeSlot) => ({
                    ...slot,
                    time: slot.time ? slot.time : undefined, // Chuyển dữ liệu thành Date
                }))
            );
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkFullScreen = () => {
        const isFullScreenNow = window.innerHeight === screen.height;
        setIsFullScreen(isFullScreenNow);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme"); // Lấy giá trị từ localStorage
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            // Nếu không có giá trị, kiểm tra hệ thống của người dùng
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
        const interval = setInterval(() => {
            const savedTheme = localStorage.getItem("theme"); // Lấy giá trị từ localStorage
            if (savedTheme) {
                setIsDarkMode(savedTheme === "dark");
            } else {
                // Nếu không có giá trị, kiểm tra hệ thống của người dùng
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDarkMode(prefersDark);
            }

            fetchReportSettings();
            document.addEventListener("fullscreenchange", checkFullScreen);
            checkFullScreen();
        }, 1000);

        return () => clearInterval(interval);

    }, []);

    const handleTimeChange = (slotId: number, newTime: string) => {
        setEditedTimes((prev) => ({ ...prev, [slotId]: newTime })); // Lưu giá trị riêng biệt cho từng slot
    };

    // Hàm cập nhật thời gian qua API
    const handleTimeUpdate = async (slotId: number, newTime: string) => {
        if (!newTime) {
            newTime = "";
        }

        // Kiểm tra định dạng thời gian
        const timeRegex = /^(?:[01]?\d|2[0-3]):([0-5]?\d)$/;
        if (newTime && !(timeRegex.test(newTime) || newTime === "")) {
            alert("Thời gian phải có định dạng HH:mm.");
            return;
        }


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
                // Cập nhật thời gian trong state
                setTimeSlots((prevSlots) =>
                    prevSlots.map((slot) =>
                        slot.id === updatedSlot.id ? { ...slot, time: updatedSlot.time } : slot
                    )
                );
                alert(`Cập nhật thời gian thành công: ${updatedSlot.time}`);
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Lỗi khi cập nhật thời gian.");
            }
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Có lỗi xảy ra trong quá trình cập nhật.");
        }
    };



    if (loading) {
        return <div className="text-center text-xl">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="text-center text-xl text-red-500">{error}</div>;
    }

    return (
        <div className={`p-4 ${isDarkMode ? 'text-white bg-bg-dark' : 'text-[#333333] bg-bg-light'}`}>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-5">
                {timeSlots.map((slot) => (
                    <div
                        key={slot.id}
                        className={`border border-connect border-8 shadow-[0px_4px_6px_rgba(0,0,0,0.5)] rounded-lg py-0 text-center ${isDarkMode ? 'bg-bg-dark text-white' : 'bg-bg-light text-black'}`}
                    >
                        <div className="bg-connect">
                            <h2 className={`text-2xl font-semibold mb-2 p-3 border-t-lg ${isFullScreen ? "py-5" : "py-2"
                                }`}>
                                THỜI ĐIỂM THỨ {slot.id}
                            </h2>
                        </div>

                        <div className={`py-0  flex flex-col items-center`}>
                            <span className="font-semibold text-center mb-2 py-3 text-3xl">
                                {/* Hiển thị thời gian hoặc thông báo chưa cài đặt */}
                                {slot.time ? (
                                    <>
                                        <span>{slot.time}</span>
                                        {/* Dấu "X" để xóa */}

                                    </>
                                ) : (
                                    <div className="w-full text-transparent">
                                        .
                                    </div>

                                )}
                            </span>

                            {/* Input chỉnh sửa thời gian */}
                            <input
                                type="text"
                                value={editedTimes[slot.id] || ''} // Hiển thị giá trị từ editedTimes hoặc rỗng nếu không có giá trị
                                onChange={(e) => handleTimeChange(slot.id, e.target.value)} // Cập nhật giá trị khi thay đổi
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleTimeUpdate(slot.id, editedTimes[slot.id] || ''); // Cập nhật thời gian khi nhấn Enter
                                    }
                                }}
                                className={`w-full h-[5vh] text-black item-end text-2xl px-2 ${isFullScreen ? "py-3" : "py-1"} border-t border-b border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                disabled={!slot.id}
                            />
                        </div>


                    </div>
                ))}
            </div>

            {/* Thêm ToastContainer vào dưới */}
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default ReportPage;
