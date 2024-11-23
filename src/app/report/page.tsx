"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import từ React Toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS của Toastify

interface TimeSlot {
    id: number;
    time?: Date; // Sử dụng kiểu Date
}

const ReportPage = () => {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlotId, setCurrentSlotId] = useState<number | null>(null);
    const [newTime, setNewTime] = useState<string>(""); // Lưu trữ giá trị từ input

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
                    time: slot.time ? new Date(slot.time) : undefined, // Chuyển dữ liệu thành Date
                }))
            );
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportSettings();
    }, []);

    const handleOpenModal = (id: number) => {
        setCurrentSlotId(id);
        setNewTime("");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSlotId(null);
        setNewTime("");
    };

    const handleSaveTime = async () => {
        if (!newTime) {
            toast.error("Vui lòng chọn giờ.");
            return;
        }

        const [hours, minutes] = newTime.split(":").map(Number); // Lấy giờ và phút
        const updatedTime = new Date();
        updatedTime.setHours(hours, minutes, 0, 0); // Đặt giờ, phút, giây

        const response = await fetch("/api/report-settings", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: currentSlotId,
                time: updatedTime.toISOString(),
            }),
        });

        if (response.ok) {
            setTimeSlots((prev) =>
                prev.map((slot) =>
                    slot.id === currentSlotId ? { ...slot, time: updatedTime } : slot
                )
            );
            toast.success(`Đã cập nhật thời điểm thứ ${currentSlotId}`);
            handleCloseModal();
        } else {
            const errorData = await response.json();
            toast.error(errorData.error || "Lỗi khi cập nhật thời điểm.");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa thời điểm này?")) {
            const response = await fetch(`/api/report-settings?id=${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
                toast.success(`Đã xóa thời điểm thứ ${id}`);
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Lỗi khi xóa thời điểm.");
            }
        }
    };

    if (loading) {
        return <div className="text-center text-xl">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="text-center text-xl text-red-500">{error}</div>;
    }

    return (
        <div className="p-5">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-2">
                {timeSlots.map((slot) => (
                    <div
                        key={slot.id}
                        className="border border-[#00c264] border-8 shadow-[0px_4px_6px_rgba(0,0,0,0.5)] rounded-lg p-0 text-center bg-white hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            if (!slot.time) { // Chỉ mở modal khi chưa có thời gian
                                handleOpenModal(slot.id);
                            }
                        }}
                    >
                        <div className="bg-[#00c264]">
                            <h2 className="text-xl font-semibold mb-2 text-black p-3 border-t-lg">
                                THỜI ĐIỂM THỨ {slot.id}
                            </h2>
                        </div>

                        <div className="py-4">
                            {slot.time ? (
                                <>
                                    <p className="text-2xl text-gray-700 mb-5">
                                        Giờ:{" "}
                                        <strong>
                                            {slot.time.getHours().toString().padStart(2, "0")}:
                                            {slot.time.getMinutes().toString().padStart(2, "0")}
                                        </strong>
                                    </p>
                                    <div className="flex justify-center space-x-8">
                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Ngăn chặn sự kiện onClick của card
                                                handleOpenModal(slot.id);
                                            }}
                                        >
                                            Cập nhật
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Ngăn chặn sự kiện onClick của card
                                                handleDelete(slot.id);
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <p className="text-gray-500 italic">Chưa được cài đặt (Nhấp để thêm)</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))
                }
            </div >


            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-9 rounded-md shadow-lg w-96 text-center">
                            <h2 className="text-xl font-semibold mb-8 text-black">
                                Cài đặt giờ cho thời điểm thứ {currentSlotId}
                            </h2>
                            <input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="border border-gray-300 p-2 rounded w-1/2 mb-8 text-black text-center"
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    onClick={handleSaveTime}
                                >
                                    Lưu
                                </button>
                                <button
                                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                                    onClick={handleCloseModal}
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Thêm ToastContainer vào dưới */}
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div >
    );
};

export default ReportPage;
