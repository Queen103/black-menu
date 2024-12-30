'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

interface ScreenContextType {
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
}

const ScreenContext = createContext<ScreenContextType | undefined>(undefined);

export function ScreenProvider({ children }: { children: ReactNode }) {
    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
        <ScreenContext.Provider value={{ isFullScreen, setIsFullScreen }}>
            {children}
        </ScreenContext.Provider>
    );
}

export function useScreen() {
    const context = useContext(ScreenContext);
    if (context === undefined) {
        throw new Error('useScreen must be used within a ScreenProvider');
    }
    return context;
}
