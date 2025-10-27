/**
 * Système de stockage local pour l'application 7 Rendez-vous de Prière
 * Utilise cookies-next et localStorage comme fallback
 * Gère plusieurs jours pour la synchronisation entre plateformes
 */

import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { PrayerMoment, DayData, MonthData, Platform } from '@/types';
import { formatDate, getTodayString, getMonthDates } from './utils';

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
    
    // Sauvegarder dans les cookies
    setCookie(STORAGE_KEYS.PRAYER_DATA, JSON.stringify(allData), {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      path: '/',
      secure: false, // Permettre HTTP pour Telegram et développement
      sameSite: 'lax',
    });
    
    // Fallback localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRAYER_DATA, JSON.stringify(allData));
    }
    
    console.log(`Moment de prière sauvegardé: ${dayData.count}/7`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du moment de prière:', error);
  }
}

/**
 * Récupère toutes les données stockées
 */
export function getAllStoredData(): StoredData {
  try {
    // Essayer d'abord les cookies
    const cookieData = getCookie(STORAGE_KEYS.PRAYER_DATA);
    if (cookieData && typeof cookieData === 'string') {
      return JSON.parse(cookieData) as StoredData;
    }
    
    // Fallback localStorage
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
 */
export function getMonthData(year: number, month: number): MonthData {
  const dates = getMonthDates(year, month);
  const days: DayData[] = dates.map(date => getDayData(formatDate(date)));
  
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
    
    setCookie(STORAGE_KEYS.PLATFORM_INFO, JSON.stringify(platformData), {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      path: '/',
      secure: false, // Permettre HTTP pour Telegram et développement
      sameSite: 'lax',
    });
    
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
    const cookieData = getCookie(STORAGE_KEYS.PLATFORM_INFO);
    if (cookieData && typeof cookieData === 'string') {
      return JSON.parse(cookieData);
    }
    
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
    deleteCookie(STORAGE_KEYS.PRAYER_DATA);
    deleteCookie(STORAGE_KEYS.PLATFORM_INFO);
    deleteCookie(STORAGE_KEYS.APP_CONFIG);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.PRAYER_DATA);
      localStorage.removeItem(STORAGE_KEYS.PLATFORM_INFO);
      localStorage.removeItem(STORAGE_KEYS.APP_CONFIG);
    }
    
    console.log('Toutes les données ont été effacées');
  } catch (error) {
    console.error('Erreur lors de l\'effacement des données:', error);
  }
}

/**
 * Obtient les statistiques de l'utilisateur
 */
export function getUserStats(): {
  totalMoments: number;
  currentStreak: number;
  daysCompleted: number;
  lastActivity: string | null;
} {
  try {
    const today = new Date();
    let totalMoments = 0;
    let currentStreak = 0;
    let daysCompleted = 0;
    let lastActivity: string | null = null;
    
    // Analyser les 365 derniers jours pour un compte plus exact
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = formatDate(date);
      const dayData = getDayData(dateString);
      
      totalMoments += dayData.count;
      
      if (dayData.completed) {
        daysCompleted++;
        // La série actuelle commence à partir d'aujourd'hui
        if (i === currentStreak) {
          currentStreak++;
        } else if (currentStreak > 0) {
          // La série s'arrête si on trouve un jour non complété
          break;
        }
      } else if (currentStreak === 0 && i < 10) {
        // Si on n'a pas commencé la série, continuer à chercher
        continue;
      } else if (currentStreak > 0) {
        // La série s'arrête
        break;
      }
      
      if (dayData.count > 0 && !lastActivity) {
        lastActivity = dateString;
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
 * Synchronise les données entre cookies et localStorage
 * Utile pour s'assurer que les données sont cohérentes
 */
export function syncStorageData(): void {
  try {
    const cookieData = getCookie(STORAGE_KEYS.PRAYER_DATA);
    const localData = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PRAYER_DATA) : null;
    
    // Vérifier que cookieData est une string
    const cookieDataString = typeof cookieData === 'string' ? cookieData : null;
    
    console.log('🔄 Synchronisation des données:', {
      hasCookie: !!cookieDataString,
      hasLocal: !!localData,
      cookieLength: cookieDataString?.length || 0,
      localLength: localData?.length || 0
    });
    
    if (cookieDataString && localData) {
      // Les deux existent, vérifier s'ils sont identiques
      if (cookieDataString !== localData) {
        console.log('📱 Synchronisation: fusion des données entre cookies et localStorage');
        
        try {
          const cookieObj = JSON.parse(cookieDataString);
          const localObj = JSON.parse(localData);
          
          // Fusionner les données (privilégier les plus récentes)
          const mergedData = { ...localObj, ...cookieObj };
          
          // Mettre à jour les deux stockages
          const mergedString = JSON.stringify(mergedData);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.PRAYER_DATA, mergedString);
          }
          
          setCookie(STORAGE_KEYS.PRAYER_DATA, mergedString, {
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            path: '/',
            secure: false,
            sameSite: 'lax',
          });
          
          console.log('✅ Données fusionnées avec succès');
        } catch (parseError) {
          console.error('Erreur lors du parsing des données:', parseError);
          // En cas d'erreur, privilégier les cookies
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.PRAYER_DATA, cookieDataString);
          }
        }
      } else {
        console.log('✅ Données déjà synchronisées');
      }
    } else if (cookieDataString && !localData) {
      // Seuls les cookies existent, copier vers localStorage
      console.log('📱 Synchronisation: copie des cookies vers localStorage');
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PRAYER_DATA, cookieDataString);
      }
    } else if (!cookieDataString && localData) {
      // Seul localStorage existe, copier vers cookies
      console.log('📱 Synchronisation: copie du localStorage vers cookies');
      setCookie(STORAGE_KEYS.PRAYER_DATA, localData, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        path: '/',
        secure: false,
        sameSite: 'lax',
      });
    } else {
      console.log('ℹ️ Aucune donnée à synchroniser');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des données:', error);
  }
}
