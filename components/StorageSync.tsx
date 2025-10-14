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
    console.log('🚀 Initialisation de la synchronisation des données');
    syncStorageData();

    // Synchronisation périodique toutes les 10 secondes (plus fréquent)
    const syncInterval = setInterval(() => {
      console.log('⏰ Synchronisation périodique');
      syncStorageData();
    }, 10000);

    // Synchronisation lors du focus de la fenêtre (retour d'un autre onglet)
    const handleFocus = () => {
      console.log('👁️ Focus de la fenêtre - synchronisation');
      syncStorageData();
    };

    // Synchronisation lors du changement de visibilité (retour d'un autre app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👀 Visibilité restaurée - synchronisation');
        syncStorageData();
      }
    };

    // Synchronisation lors du retour en ligne
    const handleOnline = () => {
      console.log('🌐 Connexion restaurée - synchronisation');
      syncStorageData();
    };

    // Ajouter les event listeners
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
