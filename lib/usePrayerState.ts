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

  // Intervalle horaire unique pour détecter le changement de jour
  useEffect(() => {
    const interval = setInterval(refresh, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Écouter les mises à jour depuis StorageSync (autres onglets)
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('prayer-data-updated', handler);
    return () => window.removeEventListener('prayer-data-updated', handler);
  }, [refresh]);

  return { todayCount, isCompleted, refresh };
}
