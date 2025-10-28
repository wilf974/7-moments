/**
 * Adaptateur de stockage hybride
 * Utilise IndexedDB en priorité (pour Android), fallback sur localStorage
 * Gère la persistance asynchrone et la synchronisation
 */

import { getFromIndexedDB, setInIndexedDB, deleteFromIndexedDB, migrateFromLocalStorage } from './indexedDBStorage';

let idbReady = false;

/**
 * Initialise le système de stockage (migration + prêt)
 */
export async function initializeStorage(): Promise<void> {
  try {
    // Effectuer la migration localStorage → IndexedDB une seule fois
    await migrateFromLocalStorage();
    idbReady = true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du stockage:', error);
  }
}

/**
 * Récupère une valeur du stockage (IndexedDB prioritaire)
 */
export async function getFromStorage<T>(key: string, defaultValue?: T): Promise<T | undefined> {
  try {
    // Essayer IndexedDB d'abord
    if (idbReady) {
      const idbValue = await getFromIndexedDB<T>(key);
      if (idbValue !== undefined) {
        return idbValue;
      }
    }

    // Fallback sur localStorage
    if (typeof window !== 'undefined' && localStorage) {
      const localValue = localStorage.getItem(key);
      if (localValue) {
        try {
          return JSON.parse(localValue) as T;
        } catch {
          return localValue as unknown as T;
        }
      }
    }

    return defaultValue;
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Sauvegarde une valeur dans le stockage (IndexedDB + localStorage)
 */
export async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    // Sauvegarder dans localStorage d'abord (synchrone)
    if (typeof window !== 'undefined' && localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn(`Impossible de sauvegarder dans localStorage: ${key}`, e);
      }
    }

    // Sauvegarder dans IndexedDB (asynchrone, non-bloquant)
    if (idbReady) {
      await setInIndexedDB(key, value);
    }
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
  }
}

/**
 * Supprime une clé du stockage
 */
export async function removeFromStorage(key: string): Promise<void> {
  try {
    // Supprimer de localStorage
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem(key);
    }

    // Supprimer d'IndexedDB
    if (idbReady) {
      await deleteFromIndexedDB(key);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de ${key}:`, error);
  }
}

/**
 * Synchrone wrapper pour compatibilité avec le code existant
 * NOTE: Utiliser avec prudence, les données peuvent être légèrement retardées sur IndexedDB
 */
export function getFromStorageSync(key: string, defaultValue?: unknown): unknown {
  try {
    if (typeof window !== 'undefined' && localStorage) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
    }
    return defaultValue;
  } catch (error) {
    console.error(`Erreur lors de la lecture synchrone de ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Synchrone wrapper pour compatibilité avec le code existant
 * NOTE: Appel asynchrone en arrière-plan pour IndexedDB
 */
export function saveToStorageSync<T>(key: string, value: T): void {
  try {
    // Sauvegarder immédiatement dans localStorage
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    // Sauvegarder en arrière-plan dans IndexedDB (non-bloquant)
    if (idbReady) {
      setInIndexedDB(key, value).catch(err => 
        console.error(`Erreur async lors de la sauvegarde de ${key}:`, err)
      );
    }
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde synchrone de ${key}:`, error);
  }
}
