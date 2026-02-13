/**
 * Système de stockage local pour l'application 7 Rendez-vous de Prière
 * Utilise uniquement localStorage (plus fiable et simple sur mobile)
 * Gère plusieurs jours pour la synchronisation entre plateformes
 */

import { PrayerMoment, DayData, MonthData, Platform } from '@/types';
import { formatDate, getTodayString, getMonthDates, parseDate } from './utils';

/**
 * Clés de stockage
 */
const STORAGE_KEYS = {
  PRAYER_DATA: 'prayer_data',
  PLATFORM_INFO: 'platform_info',
  APP_CONFIG: 'app_config',
} as const;

/**
 * Configuration par défaut de l'application
 */
const DEFAULT_CONFIG = {
  maxMomentsPerDay: 7,
  timerDuration: 60, // 1 minute en secondes
  timezone: 'Europe/Paris',
};

/**
 * Structure des données stockées (tous les jours)
 */
interface StoredData {
  [date: string]: DayData; // Clé: YYYY-MM-DD, Valeur: DayData
}

/**
 * Sauvegarde un moment de prière
 */
export function savePrayerMoment(platform: Platform): void {
  try {
    const today = getTodayString();
    const allData = getAllStoredData();
    const dayData = allData[today] || {
      date: today,
      moments: [],
      completed: false,
      count: 0,
    };
    
    // Vérifier si on n'a pas déjà atteint la limite
    if (dayData.count >= DEFAULT_CONFIG.maxMomentsPerDay) {
      console.warn('Limite de 7 moments par jour atteinte');
      return;
    }
    
    const newMoment: PrayerMoment = {
      timestamp: Date.now(),
      platform,
      duration: DEFAULT_CONFIG.timerDuration,
    };
    
    dayData.moments.push(newMoment);
    dayData.count = dayData.moments.length;
    dayData.completed = dayData.count >= DEFAULT_CONFIG.maxMomentsPerDay;
    
    // Mettre à jour toutes les données
    allData[today] = dayData;
    
    // Sauvegarder UNIQUEMENT dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRAYER_DATA, JSON.stringify(allData));
    }
    

  } catch (error) {
    console.error('Erreur lors de la sauvegarde du moment de prière:', error);
  }
}

/**
 * Récupère toutes les données stockées depuis localStorage
 */
export function getAllStoredData(): StoredData {
  try {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(STORAGE_KEYS.PRAYER_DATA);
      if (localData) {
        return JSON.parse(localData) as StoredData;
      }
    }
    
    return {};
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return {};
  }
}

/**
 * Récupère les données d'un jour spécifique
 */
export function getDayData(date: string): DayData {
  try {
    const allData = getAllStoredData();
    const dayData = allData[date];
    
    if (dayData) {
      return dayData;
    }
    
    // Retourner des données vides pour ce jour
    return {
      date,
      moments: [],
      completed: false,
      count: 0,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données du jour:', error);
    return {
      date,
      moments: [],
      completed: false,
      count: 0,
    };
  }
}

/**
 * Récupère les données d'un mois complet
 * Optimisé: une seule lecture localStorage au lieu de 42 appels getDayData
 */
export function getMonthData(year: number, month: number): MonthData {
  const dates = getMonthDates(year, month);
  const allData = getAllStoredData();

  const uniqueDaysMap = new Map<string, DayData>();

  dates.forEach(date => {
    const dateStr = formatDate(date);
    if (!uniqueDaysMap.has(dateStr)) {
      uniqueDaysMap.set(dateStr, allData[dateStr] || {
        date: dateStr,
        moments: [],
        completed: false,
        count: 0,
      });
    }
  });

  const days = Array.from(uniqueDaysMap.values());

  return {
    year,
    month,
    days,
  };
}

/**
 * Récupère le nombre de moments d'aujourd'hui
 */
export function getTodayCount(): number {
  const today = getTodayString();
  const dayData = getDayData(today);
  return dayData.count;
}

/**
 * Vérifie si aujourd'hui est complété (7/7 moments)
 */
export function isTodayCompleted(): boolean {
  const today = getTodayString();
  const dayData = getDayData(today);
  return dayData.completed;
}

/**
 * Sauvegarde les informations de plateforme
 */
export function savePlatformInfo(platform: Platform): void {
  try {
    const platformData = {
      platform,
      detectedAt: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PLATFORM_INFO, JSON.stringify(platformData));
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des infos de plateforme:', error);
  }
}

/**
 * Récupère les informations de plateforme
 */
export function getPlatformInfo(): { platform: Platform; detectedAt: number } | null {
  try {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(STORAGE_KEYS.PLATFORM_INFO);
      if (localData) {
        return JSON.parse(localData);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des infos de plateforme:', error);
    return null;
  }
}

/**
 * Efface toutes les données (pour les tests ou reset)
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRAYER_DATA);
    localStorage.removeItem(STORAGE_KEYS.PLATFORM_INFO);
    localStorage.removeItem(STORAGE_KEYS.APP_CONFIG);
    

  } catch (error) {
    console.error('Erreur lors de l\'effacement des données:', error);
  }
}

/**
 * Obtient les statistiques de l'utilisateur
 * Optimisé: une seule lecture localStorage, itère sur les données existantes
 */
export function getUserStats(): {
  totalMoments: number;
  currentStreak: number;
  daysCompleted: number;
  lastActivity: string | null;
} {
  try {
    const allData = getAllStoredData();
    const today = new Date();
    let totalMoments = 0;
    let currentStreak = 0;
    let daysCompleted = 0;
    let lastActivity: string | null = null;

    // Calculer totalMoments et daysCompleted depuis les données existantes
    for (const [dateStr, dayData] of Object.entries(allData)) {
      if (dayData.count > 0) {
        totalMoments += dayData.count;
        if (dayData.completed) daysCompleted++;
        if (!lastActivity || dateStr > lastActivity) lastActivity = dateStr;
      }
    }

    // Calculer la série actuelle en remontant depuis aujourd'hui
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = formatDate(date);
      const dayData = allData[dateString];

      if (dayData?.completed) {
        if (i === currentStreak) {
          currentStreak++;
        } else if (currentStreak > 0) {
          break;
        }
      } else if (currentStreak === 0 && i < 10) {
        continue;
      } else if (currentStreak > 0) {
        break;
      }
    }

    return {
      totalMoments,
      currentStreak,
      daysCompleted,
      lastActivity,
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalMoments: 0,
      currentStreak: 0,
      daysCompleted: 0,
      lastActivity: null,
    };
  }
}

/**
 * Synchronise les données entre localStorage
 * Utile pour s'assurer que les données sont cohérentes
 */
export function syncStorageData(): void {
  try {
    const localData = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PRAYER_DATA) : null;

    // Vérifier que localData est une string
    const localDataString = typeof localData === 'string' ? localData : null;

    // Vérifier la cohérence des données localStorage
    if (!localDataString) {
      return;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des données:', error);
  }
}

/**
 * Calculate current consecutive completed days streak going backwards from today
 */
export function getCurrentStreak(): number {
  const allData = getAllStoredData();
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = formatDate(date);
    const dayData = allData[dateString];

    if (dayData?.completed) {
      streak++;
    } else if (i === 0) {
      // Today not completed yet is OK, keep checking yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Find longest consecutive completed streak ever
 */
export function getBestStreak(): number {
  const allData = getAllStoredData();
  const sortedDates = Object.keys(allData).sort();

  if (sortedDates.length === 0) return 0;

  let bestStreak = 0;
  let currentStreak = 0;

  // Iterate through all dates from earliest to latest
  const firstDate = parseDate(sortedDates[0]);
  const lastDate = parseDate(sortedDates[sortedDates.length - 1]);

  const current = new Date(firstDate);
  while (current <= lastDate) {
    const dateString = formatDate(current);
    if (allData[dateString]?.completed) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
    current.setDate(current.getDate() + 1);
  }

  return bestStreak;
}

/**
 * Return array of 7 counts for last 7 days (index 0 = 6 days ago, index 6 = today)
 */
export function getWeekSummary(): number[] {
  const allData = getAllStoredData();
  const today = new Date();
  const counts: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = formatDate(date);
    counts.push(allData[dateString]?.count || 0);
  }

  return counts;
}
