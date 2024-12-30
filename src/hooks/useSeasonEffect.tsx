'use client';

import { useState, useEffect } from 'react';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonEffectHook {
  currentSeason: Season;
  setEffect: (enabled: boolean) => void;
}

export const useSeasonEffect = (): SeasonEffectHook => {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [effectEnabled, setEffectEnabled] = useState(true);

  useEffect(() => {
    // Load effect state from localStorage
    const savedEffect = localStorage.getItem('effect');
    if (savedEffect !== null) {
      setEffectEnabled(savedEffect === 'true');
    }
  }, []);

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

    setCurrentSeason(getCurrentSeason());
  }, []);

  const setEffect = (enabled: boolean) => {
    setEffectEnabled(enabled);
    localStorage.setItem('effect', enabled.toString());
  };

  return {
    currentSeason: effectEnabled ? currentSeason : 'spring',
    setEffect
  };
};
