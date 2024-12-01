'use client';

import React, { useEffect, useState } from 'react';

const SnowEffect: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Load initial state from localStorage
    const checkSnowEnabled = () => {
      const savedState = localStorage.getItem('snowEnabled');
      setIsEnabled(savedState === null ? true : JSON.parse(savedState));
    };

    // Check initial state
    checkSnowEnabled();

    // Listen for changes from settings page
    const handleSettingChange = () => {
      checkSnowEnabled();
    };

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'snowEnabled') {
        checkSnowEnabled();
      }
    };

    window.addEventListener('snowSettingChanged', handleSettingChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('snowSettingChanged', handleSettingChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!isEnabled) return null;

  // Tạo mảng các ký tự bông tuyết khác nhau
  const snowflakeChars = ['', '❆', '❄'];

  const snowflakes = Array.from({ length: 80 }, (_, index) => {
    const randomChar = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
    const size = Math.random() * 0.6 + 0.3; // 0.3rem to 0.9rem
    const duration = Math.random() * 5 + 8; // 8s to 13s
    const swayAmount = Math.random() * 30 + 20; // 20px to 50px sway

    return (
      <div
        key={index}
        className="snowflake"
        style={{
          '--size': `${size}rem`,
          '--left': `${Math.random() * 100}%`,
          '--opacity': Math.random() * 0.3 + 0.3, // 0.3 to 0.6
          '--duration': `${duration}s`,
          '--delay': `${Math.random() * 3}s`, // giảm delay để tuyết xuất hiện nhanh hơn
          '--sway-amount': `${swayAmount}px`,
        } as React.CSSProperties}
      >
        {randomChar}
      </div>
    );
  });

  return <div className="snow-container">{snowflakes}</div>;
};

export default SnowEffect;
