'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
    const [snowEnabled, setSnowEnabled] = useState(true);
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        // Load initial state from localStorage
        const savedState = localStorage.getItem('snowEnabled');
        if (savedState !== null) {
            setSnowEnabled(JSON.parse(savedState));
        }
    }, []);

    const handleSnowToggle = (checked: boolean) => {
        setSnowEnabled(checked);
        localStorage.setItem('snowEnabled', JSON.stringify(checked));
        // Dispatch a custom event to notify other components
        const event = new Event('snowSettingChanged');
        window.dispatchEvent(event);
    };


    return (
        <div className={`min-h-screen bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white p-6`}>
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">Hiệu ứng tuyết rơi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Bật tắt hiệu ứng tuyết rơi
                            </p>
                        </div>
                        <Switch
                            checked={snowEnabled}
                            onChange={handleSnowToggle}
                            className={`${snowEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                        >
                            <span className="sr-only">Bật tắt hiệu ứng tuyết rơi</span>
                            <span
                                className={`${snowEnabled ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium dark:text-gray-100">Dark Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Bật tắt chế độ tối
                            </p>
                        </div>
                        <Switch
                            checked={isDark}
                            onChange={toggleTheme}
                            className={`${isDark ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                        >
                            <span className="sr-only">Bật tắt chế độ tối</span>
                            <span
                                className={`${isDark ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;