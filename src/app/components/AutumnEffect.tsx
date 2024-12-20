'use client';

import { useSettings } from '../context/SettingsContext';
import React, { useEffect, useState } from 'react';

const AutumnEffect: React.FC = () => {
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [leaves, setLeaves] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !settings.effect) return;

    // Tạo lá phong ban đầu
    const initialLeaves = Array.from({ length: 30 }, (_, index) => createLeaf(index));
    setLeaves(initialLeaves);

    // Tạo lá phong mới mỗi 200ms
    const interval = setInterval(() => {
      setLeaves(prev => [...prev, createLeaf(prev.length)]);
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [mounted, settings.effect]);

  // Hàm tạo một chiếc lá phong
  const createLeaf = (index: number) => {
    const leafChars = ['🍁', '🍂'];
    const randomChar = leafChars[Math.floor(Math.random() * leafChars.length)];
    const size = Math.random() * 1.2 + 0.3;
    const duration = Math.random() * 6 + 12; // 12-18s
    const startPosition = Math.random() * 100;
    const swayAmount = Math.random() * 200 + 100; // 100-300px

    return (
      <div
        key={`leaf-${index}-${Date.now()}`}
        style={{
          position: 'fixed',
          fontSize: `${size}rem`,
          left: `${startPosition}%`,
          top: '-20px',
          opacity: Math.random() * 0.7 + 0.3,
          animation: `leaffall ${duration}s linear`,
          zIndex: 1000,
          pointerEvents: 'none',
        }}
        onAnimationEnd={(e) => {
          // Xóa lá khi animation kết thúc
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
        @keyframes leaffall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
          }
          25% {
            transform: translateY(25vh) rotate(90deg) translateX(100px);
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(0);
          }
          75% {
            transform: translateY(75vh) rotate(270deg) translateX(-100px);
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
        {leaves}
      </div>
    </>
  );
};

export default AutumnEffect;
