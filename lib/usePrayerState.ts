'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getDayData } from './storage';
import { getTodayString } from './utils';

/**
 * Hook centralisé pour l'état de prière du jour, lu dans le localStorage.
 *
 * useSyncExternalStore : un composant qui (re)monte affiche tout de suite la bonne
 * valeur. Avant, chaque retour du minuteur recréait le compteur à 0 puis le corrigeait
 * une fraction de seconde plus tard, d'où un « 0/7 » fugace après chaque bougie.
 * Le rendu serveur (et la toute première hydratation) utilise 0, puis la vraie valeur.
 */
const REFRESH_EVENT = 'prayer-state-refresh';

function subscribe(onChange: () => void): () => void {
  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange();
  };
  // Changement de jour pendant que l'app reste ouverte : relecture chaque minute
  const interval = setInterval(onChange, 60 * 1000);
  // Moment enregistré ici, données fusionnées depuis un autre appareil, retour au premier plan
  const events = ['prayer-moment-saved', 'prayer-data-updated', 'pageshow', REFRESH_EVENT];
  events.forEach((name) => window.addEventListener(name, onChange));
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    clearInterval(interval);
    events.forEach((name) => window.removeEventListener(name, onChange));
    document.removeEventListener('visibilitychange', onVisible);
  };
}

/** Instantané sous forme de texte : React compare les valeurs, une chaîne identique ne relance rien. */
function getSnapshot(): string {
  const day = getDayData(getTodayString());
  return `${day.count}|${day.completed ? 1 : 0}`;
}

function getServerSnapshot(): string {
  return '0|0';
}

export function usePrayerState() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [count, completed] = snapshot.split('|');

  const refresh = useCallback(() => {
    window.dispatchEvent(new Event(REFRESH_EVENT));
  }, []);

  return { todayCount: Number(count), isCompleted: completed === '1', refresh };
}
