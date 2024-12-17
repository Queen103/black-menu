"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings, fetchSettings } from '@/services/api/settings';

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Settings) => void;
    isLoading: boolean;
    error: string | null;
}

const defaultSettings: Settings = {
    change_time: 10,
    dark_mode: false,
    effect: true,
    is_vietnamese: true,
    is_english: false,
    client_ip: ""
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    updateSettings: () => {},
    isLoading: true,
    error: null
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSettings = async () => {
        try {
            const data = await fetchSettings();
            setSettings(data);
            setError(null);
        } catch (error: any) {
            console.error('Error loading settings:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const updateSettings = (newSettings: Settings) => {
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoading, error }}>
            {children}
        </SettingsContext.Provider>
    );
}
