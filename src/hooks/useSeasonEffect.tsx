'use client';

import { useState, useEffect } from 'react';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export const useSeasonEffect = () => {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');

  useEffect(() => {
    const getCurrentSeason = (): Season => {
      const month = new Date().getMonth() + 1; // getMonth() trả về 0-11
      
      if (month >= 1 && month <= 3) {
        return 'spring';
      } else if (month >= 4 && month <= 6) {
        return 'summer';
      } else if (month >= 7 && month <= 9) {
        return 'autumn';
      } else {
        return 'winter';
      }
    };

    // Cập nhật lần đầu
    setCurrentSeason(getCurrentSeason());

    // Cập nhật mỗi giờ
    const interval = setInterval(() => {
      setCurrentSeason(getCurrentSeason());
    }, 24*60 * 60 * 1000); // 1 giờ

    return () => clearInterval(interval);
  }, []);

  return currentSeason;
};
