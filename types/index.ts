/**
 * Types TypeScript pour l'application 7 Rendez-vous de Prière
 */

/**
 * Représente un moment de prière individuel
 */
export type PrayerMoment = {
  timestamp: number;
  platform: string;
  duration?: number; // Durée en secondes (optionnel)
};

/**
 * Données d'un jour spécifique
 */
export type DayData = {
  date: string; // Format YYYY-MM-DD
  moments: PrayerMoment[];
  completed: boolean; // true si 7 moments complétés
  count: number; // Nombre de moments (0-7)
};

/**
 * Données d'un mois complet
 */
export type MonthData = {
  year: number;
  month: number; // 0-11 (JavaScript Date format)
  days: DayData[];
};

/**
 * Plateforme de détection
 */
export type Platform = 'telegram' | 'ios' | 'android' | 'web' | 'unknown';

/**
 * État du timer
 */
export type TimerState = 'idle' | 'running' | 'completed' | 'paused';

/**
 * Configuration de l'application
 */
export type AppConfig = {
  maxMomentsPerDay: number;
  timerDuration: number; // en secondes
  timezone: string;
};

/**
 * Statistiques de l'utilisateur
 */
export type UserStats = {
  totalMoments: number;
  currentStreak: number;
  longestStreak: number;
  daysCompleted: number;
  lastActivity: string | null;
};

