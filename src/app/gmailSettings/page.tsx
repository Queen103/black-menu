"use client";
import React, { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomToast } from "../components/CustomToast";
import Loading from "../components/Loading";
import { useTheme } from "../context/ThemeContext";
import { useFullScreen } from '../context/FullScreenContext';
import { useLanguage } from '../context/LanguageContext';
import messages from "@/messages";
import { fetchGmailSettings, updateGmailSettings, EmailSlot } from '@/services/api/gmail';

const GmailSettingsPage = () => {
    const [emailSlots, setEmailSlots] = useState<EmailSlot[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const { isDark } = useTheme();
    const { isFullScreen } = useFullScreen();
    const { language } = useLanguage();
    const t = messages[language].gmail;
    const [editedEmails, setEditedEmails] = useState<{ [key: number]: string }>({});

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (slotId: number, value: string) => {
        setEditedEmails(prev => ({ ...prev, [slotId]: value }));
    };

    const handleEmailUpdate = async (slotId: number) => {
        console.log('Updating email for slot:', slotId);
        const email = editedEmails[slotId] || "";
        const currentSlot = emailSlots.find(slot => slot.index === slotId);

        console.log('Current slot:', currentSlot);
        console.log('All slots:', emailSlots);

        // Kiểm tra nếu không có email hiện tại và không có input mới
        if (!currentSlot?.email && !email) {
            toast.error(t.error.cannotDelete);
            return;
        }

        // Kiểm tra định dạng email nếu có nhập email mới
        if (email && !validateEmail(email)) {
            toast.error(t.error.invalidEmail);
            return;
        }

        try {
            // Điều chỉnh index trước khi gửi đến API
            const apiIndex = slotId - 1;
            console.log('Sending to API with index:', apiIndex);

            const updatedSlot = await updateGmailSettings(apiIndex, email);
            console.log('API response:', updatedSlot);

            setEmailSlots((prevSlots) => {
                const newSlots = prevSlots.map((slot) =>
                    slot.index === slotId ? { ...slot, email } : slot
                );
                console.log('New email slots:', newSlots);
                return newSlots;
            });

            setEditedEmails(prev => ({ ...prev, [slotId]: "" }));
            toast.success(email ? `${t.success.emailUpdated} ${email}` : t.success.emailDeleted);
        } catch (error: any) {
            console.error("Lỗi:", error);
            toast.error(error.message || t.error[email ? 'updateFailed' : 'deleteFailed']);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 py-1 px-4">
                {Array.isArray(emailSlots) && emailSlots.length > 0 ? (
                    emailSlots.map((slot) => (
                        <div
                            key={slot.index}
                            className={`border h-[21vh] border-report border-8 shadow-[0px_4px_6px_rgba(0,0,0,0.5)] rounded-lg py-0 text-center ${isDark ? 'bg-secondary text-text-dark' : 'bg-gray-300 text-text-light'} h-[20vh] min-h-[180px] flex flex-col`}
                        >
                            <div className="bg-report">
                                <h2 className={`text-2xl w-full font-semibold mb-2 p-3 border-t-lg ${isFullScreen ? "py-5" : "py-2"} truncate`}>
                                    {t.emailSlot} {slot.index}
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
                                        placeholder={t.placeholder}
                                        autoComplete="off"
                                        className={`w-full h-full px-4 py-2 text-black text-lg ${isDark
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
                ) : null}
            </div>
        </div>
    );
};

export default GmailSettingsPage;
