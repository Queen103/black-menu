"use client";
import React, { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomToast } from "../components/CustomToast";
import Loading from "../components/Loading";
import { useTheme } from "../context/ThemeContext";
import { useFullScreen } from '../context/FullScreenContext';
import { fetchGmailSettings, updateGmailSettings, EmailSlot } from '@/services/api/gmail';

const GmailSettingsPage = () => {
    const [emailSlots, setEmailSlots] = useState<EmailSlot[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const { isDark } = useTheme();
    const { isFullScreen } = useFullScreen();
    const [editedEmails, setEditedEmails] = useState<{ [key: number]: string }>({});

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (slotId: number, value: string) => {
        setEditedEmails(prev => ({ ...prev, [slotId]: value }));
    };

    const handleEmailUpdate = async (slotId: number) => {
        const email = editedEmails[slotId] || "";
        const currentSlot = emailSlots.find(slot => slot.index === slotId);

        // Kiểm tra nếu không có email hiện tại và không có input mới
        if (!currentSlot?.email && !email) {
            toast.error("Không thể xóa email không tồn tại");
            return;
        }

        // Kiểm tra định dạng email nếu có nhập email mới
        if (email && !validateEmail(email)) {
            toast.error("Email không hợp lệ");
            return;
        }

        try {
            const updatedSlot = await updateGmailSettings(slotId, email);
            setEmailSlots((prevSlots) =>
                prevSlots.map((slot) =>
                    slot.index === updatedSlot.index ? { ...slot, email: updatedSlot.email } : slot
                )
            );
            setEditedEmails(prev => ({ ...prev, [slotId]: "" }));
            toast.success(email ? `Cập nhật email thành công: ${email}` : "Đã xóa email thành công");
        } catch (error: any) {
            console.error("Lỗi:", error);
            toast.error(error.message || `Có lỗi xảy ra trong quá trình ${email ? "cập nhật" : "xóa"}`);
        }
    };

    const getGmailSettings = async () => {
        try {
            if (isFirstLoad) {
                setIsLoading(true);
            }
            const data = await fetchGmailSettings();
            setEmailSlots(data);
            if (isFirstLoad) {
                setIsFirstLoad(false);
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error('Error in getGmailSettings:', error);
            setError(error.message);
            if (isFirstLoad) {
                setIsFirstLoad(false);
                setIsLoading(false);
            }
        }
    };
    useEffect(() => {
        getGmailSettings();
    }, []);
    useEffect(() => {
        const interval = [
            setInterval(() => {
                getGmailSettings();
            }, 1000)
        ]
        return () => {
            interval.forEach(clearInterval);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-5 px-4">
                {Array.isArray(emailSlots) && emailSlots.length > 0 ? (
                    emailSlots.map((slot) => (
                        <div
                            key={slot.index}
                            className={`border h-[21vh] border-report border-8 shadow-[0px_4px_6px_rgba(0,0,0,0.5)] rounded-lg py-0 text-center ${isDark ? 'bg-secondary text-text-dark' : 'bg-gray-300 text-text-light'} h-[20vh] min-h-[180px] flex flex-col`}
                        >
                            <div className="bg-report">
                                <h2 className={`text-2xl w-full font-semibold mb-2 p-3 border-t-lg ${isFullScreen ? "py-5" : "py-2"} truncate`}>
                                    EMAIL {typeof slot.index === 'number' ? slot.index + 1 : 1}
                                </h2>
                            </div>

                            <div className={`py-0 flex flex-col items-center flex-grow justify-between`}>
                                <span className="font-semibold text-center mb-2 py-6 text-xl px-2 truncate w-full">
                                    {slot.email || (
                                        <div className="w-full text-transparent">
                                            .
                                        </div>
                                    )}
                                </span>

                                <div className="bg-bg-light w-full h-full flex items-center justify-center">
                                    <input
                                        type="text"
                                        value={editedEmails[slot.index] || ''}
                                        onChange={(e) => handleEmailChange(slot.index, e.target.value)}
                                        placeholder="Nhập email mới"
                                        className={`w-full h-full px-4 py-2 text-black text-lg ${
                                            isDark
                                                ? 'bg-dark-input border-gray-600'
                                                : 'bg-white border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleEmailUpdate(slot.index);
                                            }
                                        }}
                                        
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-xl text-error p-4 justify-center">
                        Không có dữ liệu
                    </div>
                )}
            </div>
        </div>
    );
};

export default GmailSettingsPage;
