/**
 * Réglages de l'application propres à cet appareil.
 */

/** Durées proposées pour la bougie, en secondes. */
export const TIMER_CHOICES = [15, 30, 60] as const;
const TIMER_KEY = 'timer_duration';
const DEFAULT_TIMER = 30;

export function getTimerDuration(): number {
  if (typeof window === 'undefined') return DEFAULT_TIMER;
  try {
    const value = Number(localStorage.getItem(TIMER_KEY));
    return (TIMER_CHOICES as readonly number[]).includes(value) ? value : DEFAULT_TIMER;
  } catch {
    return DEFAULT_TIMER;
  }
}

export function setTimerDuration(seconds: number): void {
  if (!(TIMER_CHOICES as readonly number[]).includes(seconds)) return;
  try {
    localStorage.setItem(TIMER_KEY, String(seconds));
  } catch {
    // stockage indisponible : on garde la valeur par défaut
  }
}

export function formatTimerChoice(seconds: number): string {
  return seconds >= 60 ? `${seconds / 60} min` : `${seconds} s`;
}
