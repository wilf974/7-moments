/**
 * Types pour l'application 7 Rendez-vous de Prière
 */

export type Platform = 'ios' | 'android' | 'telegram' | 'web' | 'unknown';

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface PrayerMoment {
  timestamp: number;
  platform: Platform;
  duration: number;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  moments: PrayerMoment[];
  count: number;
  completed: boolean;
}

export interface MonthData {
  year: number;
  month: number;
  days: DayData[];
}

export interface UserStats {
  [month: string]: MonthData; // Key is YYYY-MM
}
