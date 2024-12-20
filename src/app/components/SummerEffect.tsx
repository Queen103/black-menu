'use client';

import { useSettings } from '../context/SettingsContext';
import React, { useEffect, useState } from 'react';

const SummerEffect: React.FC = () => {
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [flowers, setFlowers] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !settings.effect) return;

    // Tạo hoa phượng ban đầu
    const initialFlowers = Array.from({ length: 30 }, (_, index) => createFlower(index));
    setFlowers(initialFlowers);

    // Tạo hoa phượng mới mỗi 200ms
    const interval = setInterval(() => {
      setFlowers(prev => [...prev, createFlower(prev.length)]);
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [mounted, settings.effect]);

  // Hàm tạo một bông hoa phường
  const createFlower = (index: number) => {
    const flowerChars = ['🍍','🍉','🍋','🍎','🍐'];
    const randomChar = flowerChars[Math.floor(Math.random() * flowerChars.length)];
    const size = Math.random() * 1 + 0.3;
    const duration = Math.random() * 5 + 8; // 8-13s
    const startPosition = Math.random() * 100;
    const swayAmount = Math.random() * 100 + 50; // 50-150px

    return (
      <div
        key={`flower-${index}-${Date.now()}`}
        style={{
          position: 'fixed',
          fontSize: `${size}rem`,
          left: `${startPosition}%`,
          top: '-20px',
          opacity: Math.random() * 0.7 + 0.3,
          animation: `flowerfall ${duration}s linear`,
          zIndex: 1000,
          pointerEvents: 'none',
          filter: 'hue-rotate(330deg)', // Điều chỉnh màu đỏ cho hoa phượng
        }}
        onAnimationEnd={(e) => {
          // Xóa hoa khi animation kết thúc
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
        @keyframes flowerfall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(50px);
          }
          100% {
            transform: translateY(100vh) rotate(360deg) translateX(0);
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
        {flowers}
      </div>
    </>
  );
};

export default SummerEffect;
