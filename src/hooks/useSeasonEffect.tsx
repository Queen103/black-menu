'use client';

import { useState, useEffect } from 'react';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
type Mode = 'auto' | 'manual';

interface SeasonEffectHook {
  currentSeason: Season;
  setEffect: (enabled: boolean) => void;
  setMode: (mode: Mode) => void;
  setManualSeason: (season: Season) => void;
  mode: Mode;
}

export const useSeasonEffect = (): SeasonEffectHook => {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [effectEnabled, setEffectEnabled] = useState(true);
  const [mode, setMode] = useState<Mode>('auto'); // 'auto' or 'manual'
  const [manualSeason, setManualSeason] = useState<Season>('spring');

  useEffect(() => {
    // Load settings from localStorage
    const savedEffect = localStorage.getItem('effect');
    const savedMode = localStorage.getItem('mode');
    const savedManualSeason = localStorage.getItem('manualSeason');

    if (savedEffect !== null) {
      setEffectEnabled(savedEffect === 'true');
    }
    if (savedMode === 'manual' || savedMode === 'auto') {
      setMode(savedMode);
    }
    if (savedManualSeason && ['spring', 'summer', 'autumn', 'winter'].includes(savedManualSeason)) {
      setManualSeason(savedManualSeason as Season);
    }
  }, []);

  useEffect(() => {
    if (mode === 'auto') {
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
    } else if (mode === 'manual') {
      setCurrentSeason(manualSeason);
    }
  }, [mode, manualSeason]);

  const setEffect = (enabled: boolean) => {
    setEffectEnabled(enabled);
    localStorage.setItem('effect', enabled.toString());
  };

  const updateMode = (newMode: Mode) => {
    setMode(newMode);
    localStorage.setItem('mode', newMode);
  };

  const updateManualSeason = (season: Season) => {
    setManualSeason(season);
    localStorage.setItem('manualSeason', season);
  };

  return {
    currentSeason: effectEnabled ? currentSeason : 'spring',
    setEffect,
    setMode: updateMode,
    setManualSeason: updateManualSeason,
    mode,
  };
};
