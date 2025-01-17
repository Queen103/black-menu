'use client';

import { useSettings } from '../context/SettingsContext';
import React, { useEffect, useState } from 'react';

const SnowEffect: React.FC = () => {
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [snowflakes, setSnowflakes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !settings.effect) return;

    // Tạo bông tuyết ban đầu
    const initialFlakes = Array.from({ length: 30 }, (_, index) => createSnowflake(index));
    setSnowflakes(initialFlakes);

    // Tạo bông tuyết mới mỗi 200ms
    const interval = setInterval(() => {
      setSnowflakes(prev => [...prev, createSnowflake(prev.length)]);
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [mounted, settings.effect]);

  // Hàm tạo một bông tuyết
  const createSnowflake = (index: number) => {
    const snowflakeChars = ['❆', '❄','☃️'];
    const randomChar = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
    const size = Math.random() * 1 + 0.3;
    const duration = Math.random() * 5 + 10; // 10-15s
    const startPosition = Math.random() * 100;

    return (
      <div
        key={`snow-${index}-${Date.now()}`}
        style={{
          position: 'fixed',
          color: 'white',
          fontSize: `${size}rem`,
          left: `${startPosition}%`,
          top: '-20px',
          opacity: Math.random() * 0.7 + 0.3,
          animation: `snowfall ${duration}s linear`,
          textShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
        onAnimationEnd={(e) => {
          // Xóa bông tuyết khi animation kết thúc
          if (e.currentTarget.parentNode) {
            e.currentTarget.parentNode.removeChild(e.currentTarget);
          }
        }}
      >
        {randomChar}
      </div>
    );
  };

  if (!mounted || !settings.effect) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 100,
        overflow: 'hidden',
      }}>
        {snowflakes}
      </div>
    </>
  );
};

export default SnowEffect;
