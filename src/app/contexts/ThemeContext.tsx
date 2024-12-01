'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Load initial state
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme !== null) {
            setDarkMode(JSON.parse(savedTheme));
        }
    }, []);

    useEffect(() => {
        // Update document class when darkMode changes
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const value = {
        darkMode,
        setDarkMode,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
