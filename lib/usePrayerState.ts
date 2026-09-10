'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDayData } from './storage';
import { getTodayString } from './utils';

/**
 * Hook centralisé pour l'état de prière quotidien.
 * Une seule lecture localStorage, un seul setInterval horaire.
 * Utilisé par page.tsx et PrayerButton au lieu de dupliquer la logique.
 */
export function usePrayerState() {
  const [todayCount, setTodayCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const refresh = useCallback(() => {
    const today = getTodayString();
    const dayData = getDayData(today);
    setTodayCount(dayData.count);
    setIsCompleted(dayData.completed);
  }, []);

  // Lecture initiale
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Changement de jour pendant que l'app reste ouverte : relecture chaque minute
  useEffect(() => {
    const interval = setInterval(refresh, 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Relecture quand l'app revient au premier plan (téléphone déverrouillé, onglet repris)
  // et quand d'autres onglets ou d'autres appareils (synchronisation) ont écrit
  useEffect(() => {
    const handler = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('prayer-data-updated', handler);
    window.addEventListener('pageshow', handler);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('prayer-data-updated', handler);
      window.removeEventListener('pageshow', handler);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return { todayCount, isCompleted, refresh };
}
