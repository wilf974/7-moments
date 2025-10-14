'use client';

import { useEffect } from 'react';
import { syncStorageData } from '@/lib/storage';

/**
 * Composant de synchronisation automatique des données
 * Synchronise les données entre cookies et localStorage
 * Se déclenche automatiquement et périodiquement
 */
export default function StorageSync() {
  useEffect(() => {
    // Synchronisation immédiate au montage
    syncStorageData();

    // Synchronisation périodique toutes les 30 secondes
    const syncInterval = setInterval(() => {
      syncStorageData();
    }, 30000);

    // Synchronisation lors du focus de la fenêtre (retour d'un autre onglet)
    const handleFocus = () => {
      syncStorageData();
    };

    // Synchronisation lors du changement de visibilité (retour d'un autre app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncStorageData();
      }
    };

    // Ajouter les event listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
