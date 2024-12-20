"use client";
import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Switch } from "../components/Switch";
import { showSuccessToast, showErrorToast } from "../components/CustomToast";
import { Settings, updateSettings } from "@/services/api/settings";

const SettingsPage = () => {
    const { isDark, toggleTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const { settings, updateSettings: updateContextSettings, isLoading, error } = useSettings();

    const handleTimeChange = (value: string) => {
        const numValue = parseInt(value);
        const newTime = numValue < 1 ? 1 : numValue > 60 ? 60 : numValue;
        const newSettings = { ...settings, change_time: newTime };
        updateContextSettings(newSettings);
    };

    const handleTimeUpdate = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            try {
                await updateSettings(settings);
                showSuccessToast("Cập nhật thởi gian thành công");
            } catch (error) {
                showErrorToast("Có lỗi xảy ra khi cập nhật thởi gian");
            }
        }
    };

    const handleSettingChange = async (newSettings: Settings) => {
        try {
            updateContextSettings(newSettings);
            await updateSettings(newSettings);
            showSuccessToast("Cập nhật cài đặt thành công");
        } catch (error) {
            showErrorToast("Có lỗi xảy ra khi cập nhật cài đặt");
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={`min-h-screen bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white p-6`}>
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-sm space-y-6">
                    {/* Hiệu ứng tuyết rơi */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">Hiệu ứng tuyết rơi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bật/tắt hiệu ứng tuyết rơi trên giao diện</p>
                        </div>
                        <Switch
                            checked={settings.effect}
                            onChange={(checked: boolean) => {
                                const newSettings = { ...settings, effect: checked };
                                handleSettingChange(newSettings);
                            }}
                        />
                    </div>

                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">Dark Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bật/tắt chế độ tối</p>
                        </div>
                        <Switch
                            checked={isDark}
                            onChange={async (checked: boolean) => {
                                // First update the theme in context and localStorage
                                toggleTheme();
                                // Then update the backend settings
                                try {
                                    const newSettings = { ...settings, dark_mode: !settings.dark_mode };
                                    await updateSettings(newSettings);
                                    updateContextSettings(newSettings);
                                    showSuccessToast("Cập nhật giao diện thành công");
                                } catch (error) {
                                    showErrorToast("Có lỗi xảy ra khi cập nhật giao diện");
                                    // Revert theme if settings update fails
                                    toggleTheme();
                                }
                            }}
                        />
                    </div>

                    {/* Ngôn ngữ */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">Ngôn ngữ</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Chọn ngôn ngữ hiển thị</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm ${language === 'vi' ? 'text-blue-500 font-medium' : ''}`}>Tiếng Việt</span>
                            <Switch
                                checked={language === 'vi'}
                                onChange={async (checked: boolean) => {
                                    const newLang = checked ? 'vi' : 'en';
                                    setLanguage(newLang);
                                    try {
                                        const newSettings = {
                                            ...settings,
                                            is_vietnamese: checked,
                                            is_english: !checked
                                        };
                                        await updateSettings(newSettings);
                                        updateContextSettings(newSettings);
                                        showSuccessToast("Cập nhật ngôn ngữ thành công");
                                    } catch (error) {
                                        showErrorToast("Có lỗi xảy ra khi cập nhật ngôn ngữ");
                                        // Revert language if settings update fails
                                        setLanguage(language);
                                    }
                                }}
                            />
                            <span className={`text-sm ${language === 'en' ? 'text-blue-500 font-medium' : ''}`}>English</span>
                        </div>
                    </div>

                    {/* Thời gian cập nhật */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">Thời gian cập nhật</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian cập nhật dữ liệu (giây)</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={settings.change_time}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                onKeyDown={handleTimeUpdate}
                                className="w-20 px-3 py-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">giây</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;