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
    const messages = require(`@/messages/${language}.json`);

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
                showSuccessToast(messages.settings.messages.time_update_success);
            } catch (error) {
                showErrorToast(messages.settings.messages.time_update_error);
            }
        }
    };

    const handleSettingChange = async (newSettings: Settings) => {
        try {
            updateContextSettings(newSettings);
            await updateSettings(newSettings);
            showSuccessToast(messages.settings.messages.update_success);
        } catch (error) {
            showErrorToast(messages.settings.messages.update_error);
        }
    };

    if (isLoading) return <div>{messages.settings.loading}</div>;
    if (error) return <div>{messages.settings.error.replace("{0}", error)}</div>;

    return (
        <div className={`min-h-screen bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white p-6`}>
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-sm space-y-6">
                    {/* Hiệu ứng tuyết rơi */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages.settings.snow_effect.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages.settings.snow_effect.description}</p>
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
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages.settings.dark_mode.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages.settings.dark_mode.description}</p>
                        </div>
                        <Switch
                            checked={isDark}
                            onChange={async (checked: boolean) => {
                                toggleTheme();
                                try {
                                    const newSettings = { ...settings, dark_mode: !settings.dark_mode };
                                    await updateSettings(newSettings);
                                    updateContextSettings(newSettings);
                                    showSuccessToast(messages.settings.messages.theme_update_success);
                                } catch (error) {
                                    showErrorToast(messages.settings.messages.theme_update_error);
                                    toggleTheme();
                                }
                            }}
                        />
                    </div>

                    {/* Ngôn ngữ */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages.settings.language.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages.settings.language.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm ${language === 'vi' ? 'text-blue-500 font-medium' : ''}`}>{messages.settings.language.vietnamese}</span>
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
                                        showSuccessToast(messages.settings.messages.language_update_success);
                                    } catch (error) {
                                        showErrorToast(messages.settings.messages.language_update_error);
                                        setLanguage(language);
                                    }
                                }}
                            />
                            <span className={`text-sm ${language === 'en' ? 'text-blue-500 font-medium' : ''}`}>{messages.settings.language.english}</span>
                        </div>
                    </div>

                    {/* Thời gian cập nhật */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">{messages.settings.time_update.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{messages.settings.time_update.description}</p>
                        </div>
                        <input
                            type="number"
                            min={messages.settings.time_update.min}
                            max={messages.settings.time_update.max}
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