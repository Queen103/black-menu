'use client';

import { useSettings } from '../context/SettingsContext';
import React, { useEffect, useState } from 'react';

const SpringEffect: React.FC = () => {
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [petals, setPetals] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !settings.effect) return;

    // Tạo cánh hoa đào ban đầu
    const initialPetals = Array.from({ length: 30 }, (_, index) => createPetal(index));
    setPetals(initialPetals);

    // Tạo cánh hoa đào mới mỗi 200ms
    const interval = setInterval(() => {
      setPetals(prev => [...prev, createPetal(prev.length)]);
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [mounted, settings.effect]);

  // Hàm tạo một cánh hoa đào
  const createPetal = (index: number) => {
    const petalChars = ['🌸', '🍀'];
    const randomChar = petalChars[Math.floor(Math.random() * petalChars.length)];
    const size = Math.random() * 0.8 + 0.3;
    const duration = Math.random() * 5 + 10; // 10-15s
    const startPosition = Math.random() * 100;
    const rotationAmount = Math.random() * 720 - 360; // -360 to 360 degrees

    return (
      <div
        key={`petal-${index}-${Date.now()}`}
        style={{
          position: 'fixed',
          fontSize: `${size}rem`,
          left: `${startPosition}%`,
          top: '-20px',
          opacity: Math.random() * 0.7 + 0.3,
          animation: `petalfall ${duration}s linear`,
          zIndex: 1000,
          pointerEvents: 'none',
          filter: 'hue-rotate(350deg)',
        }}
        onAnimationEnd={(e) => {
          // Xóa cánh hoa khi animation kết thúc
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
        @keyframes petalfall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
          }
          25% {
            transform: translateY(25vh) rotate(90deg) translateX(50px);
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(0);
          }
          75% {
            transform: translateY(75vh) rotate(270deg) translateX(-50px);
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
        {petals}
      </div>
    </>
  );
};

export default SpringEffect;
