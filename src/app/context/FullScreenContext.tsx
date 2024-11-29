'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface FullScreenContextType {
  isFullScreen: boolean;
  checkFullScreen: () => void;
  toggleFullScreen: () => void;
}

const FullScreenContext = createContext<FullScreenContextType | undefined>(undefined);

export function FullScreenProvider({ children }: { children: React.ReactNode }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const checkFullScreen = () => {
    const isFullScreenNow = document.fullscreenElement !== null;
    setIsFullScreen(isFullScreenNow);
  };

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Error attempting to toggle full-screen:', err);
    }
  };

  useEffect(() => {
    // Initial check
    checkFullScreen();

    // Add event listeners for fullscreen changes
    document.addEventListener("fullscreenchange", checkFullScreen);

    // Handle F11 key
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullScreen();
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener("fullscreenchange", checkFullScreen);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <FullScreenContext.Provider value={{ isFullScreen, checkFullScreen, toggleFullScreen }}>
      {children}
    </FullScreenContext.Provider>
  );
}

export function useFullScreen() {
  const context = useContext(FullScreenContext);
  if (context === undefined) {
    throw new Error('useFullScreen must be used within a FullScreenProvider');
  }
  return context;
}
