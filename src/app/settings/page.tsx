"use client";
import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Switch } from "../components/Switch";
import { showSuccessToast, showErrorToast } from "../components/CustomToast";
import { Settings, updateSettings } from "@/services/api/settings";
import messages from "@/messages";
import { useSeasonEffect } from "@/hooks/useSeasonEffect";

const SettingsPage = () => {
    const { isDark, toggleTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const { settings, updateSettings: updateContextSettings, isLoading, error } = useSettings();
    const { currentSeason, setMode, setManualSeason, mode } = useSeasonEffect();
    type Season = 'spring' | 'summer' | 'autumn' | 'winter';


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
                showSuccessToast(messages[language].settings.messages.time_update_success);
            } catch (error) {
                showErrorToast(messages[language].settings.messages.time_update_error);
            }
        }
    };

    const handleSettingChange = async (newSettings: Settings) => {
        try {
            updateContextSettings(newSettings);
            await updateSettings(newSettings);
            showSuccessToast(messages[language].settings.messages.update_success);
        } catch (error) {
            showErrorToast(messages[language].settings.messages.update_error);
        }
    };

    if (isLoading) return <div>{messages[language].settings.loading}</div>;
    if (error) return <div>{messages[language].settings.error.replace("{0}", error)}</div>;

    return (
        <div className={`min-h-screen bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white p-6`}>
            <div className="flex items-start justify-center max-w-2xl mx-auto mt-[16vh]">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-sm space-y-6">
                    {/* Hiệu ứng tuyết rơi */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages[language].settings.snow_effect.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages[language].settings.snow_effect.description}</p>
                        </div>
                        <Switch
                            checked={settings.effect}
                            onChange={(checked: boolean) => {
                                const newSettings = { ...settings, effect: checked };
                                handleSettingChange(newSettings);
                            }}
                        />
                    </div>
                    {/* Chế độ hiệu ứng mùa */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages[language].settings.season_mode.title}  {(mode === "auto") ? 'Tự Động' : 'Tùy Chỉnh'}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages[language].settings.season_mode.description}</p>
                        </div>
                        <Switch
                            checked={mode === "auto"}
                            onChange={(checked: boolean) => {
                                if (checked) {
                                    setMode('auto');
                                }
                                else {
                                    setMode('manual');
                                }
                            }}
                        />
                    </div>

                    {/* Chọn mùa (hiển thị khi chế độ manual được bật) */}
                    {mode === "manual" && (
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages[language].settings.manual_season.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages[language].settings.manual_season.description}</p>

                            {/* Danh sách các checkbox */}
                            <div className="grid grid-cols-2 gap-2">
                                {["spring", "summer", "autumn", "winter"].map((season) => (
                                    <label key={season} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={currentSeason === season}
                                            onChange={() => {
                                                if (currentSeason !== season) {
                                                    setManualSeason(season as Season); // Cập nhật mùa
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {messages[language].settings.manual_season[season]}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages[language].settings.dark_mode.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages[language].settings.dark_mode.description}</p>
                        </div>
                        <Switch
                            checked={isDark}
                            onChange={async (checked: boolean) => {
                                toggleTheme();
                                try {
                                    const newSettings = { ...settings, dark_mode: !settings.dark_mode };
                                    await updateSettings(newSettings);
                                    updateContextSettings(newSettings);
                                    showSuccessToast(messages[language].settings.messages.theme_update_success);
                                } catch (error) {
                                    showErrorToast(messages[language].settings.messages.theme_update_error);
                                    toggleTheme();
                                }
                            }}
                        />
                    </div>

                    {/* Ngôn ngữ */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages[language].settings.language.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages[language].settings.language.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm ${language === 'vi' ? 'text-blue-500 font-medium' : ''}`}>{messages[language].settings.language.vietnamese}</span>
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
                                        showSuccessToast(messages[language].settings.messages.language_update_success);
                                    } catch (error) {
                                        showErrorToast(messages[language].settings.messages.language_update_error);
                                        setLanguage(language);
                                    }
                                }}
                            />
                            <span className={`text-sm ${language === 'en' ? 'text-blue-500 font-medium' : ''}`}>{messages[language].settings.language.english}</span>
                        </div>
                    </div>

                    {/* Thời gian cập nhật */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages[language].settings.time_update.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages[language].settings.time_update.description}</p>
                        </div>
                        <input
                            type="number"
                            min={messages[language].settings.time_update.min}
                            max={messages[language].settings.time_update.max}
                            value={settings.change_time}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            onKeyDown={handleTimeUpdate}
                            className="w-20 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;