/**
 * Système de stockage IndexedDB robuste pour 7 Rendez-vous de Prière
 * Utilise idb-keyval pour une API simple et fiable
 * Stockage local persistant asynchrone, idéal pour mobile
 */

import { get, set, del, clear, keys, entries } from 'idb-keyval';

/**
 * Interface pour les données de stockage
 */
export interface StorageData {
  [key: string]: unknown;
}

/**
 * Vérifie si IndexedDB est disponible
 */
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Récupère une valeur de IndexedDB
 */
export async function getFromIndexedDB<T>(key: string, defaultValue?: T): Promise<T | undefined> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, returning default value');
      return defaultValue;
    }
    
    const value = await get(key);
    return value !== undefined ? (value as T) : defaultValue;
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${key} depuis IndexedDB:`, error);
    return defaultValue;
  }
}

/**
 * Sauvegarde une valeur dans IndexedDB
 */
export async function setInIndexedDB<T>(key: string, value: T): Promise<void> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, cannot save:', key);
      return;
    }
    
    await set(key, value);
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de ${key} dans IndexedDB:`, error);
  }
}

/**
 * Supprime une clé de IndexedDB
 */
export async function deleteFromIndexedDB(key: string): Promise<void> {
  try {
    if (!isIndexedDBAvailable()) return;
    await del(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression de ${key} depuis IndexedDB:`, error);
  }
}

/**
 * Vide complètement IndexedDB
 */
export async function clearIndexedDB(): Promise<void> {
  try {
    if (!isIndexedDBAvailable()) return;
    await clear();
  } catch (error) {
    console.error('Erreur lors du vidage de IndexedDB:', error);
  }
}

/**
 * Récupère toutes les clés de IndexedDB
 */
export async function getAllKeysFromIndexedDB(): Promise<string[]> {
  try {
    if (!isIndexedDBAvailable()) return [];
    const allKeys = await keys();
    return allKeys.map(k => String(k));
  } catch (error) {
    console.error('Erreur lors de la récupération des clés:', error);
    return [];
  }
}

/**
 * Récupère tous les entrypoint (clé-valeur) de IndexedDB
 */
export async function getAllEntriesFromIndexedDB(): Promise<Array<[string, unknown]>> {
  try {
    if (!isIndexedDBAvailable()) return [];
    const allEntries = await entries();
    return allEntries.map(([k, v]) => [String(k), v]);
  } catch (error) {
    console.error('Erreur lors de la récupération des entrées:', error);
    return [];
  }
}

/**
 * Effectue une migration localStorage → IndexedDB
 * Appelée une seule fois au démarrage
 */
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, cannot migrate');
      return;
    }

    if (typeof window === 'undefined' || !localStorage) return;

    // Vérifier si la migration a déjà été effectuée
    const migrationDone = await getFromIndexedDB('__migration_done__');
    if (migrationDone) return;

    console.log('🔄 Migration localStorage → IndexedDB en cours...');

    // Copier toutes les données de localStorage vers IndexedDB
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('__')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            // Essayer de parser comme JSON, sinon stocker comme string
            try {
              const parsed = JSON.parse(value);
              await setInIndexedDB(key, parsed);
            } catch {
              await setInIndexedDB(key, value);
            }
          }
        } catch (err) {
          console.error(`Erreur lors de la migration de la clé ${key}:`, err);
        }
      }
    }

    // Marquer la migration comme effectuée
    await setInIndexedDB('__migration_done__', true);
    console.log('✅ Migration localStorage → IndexedDB terminée');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  }
}
