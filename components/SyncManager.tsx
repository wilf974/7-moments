'use client';

/**
 * Chef d'orchestre invisible, monté une fois dans le layout :
 * - installe le service worker, pour que l'app s'ouvre même sans connexion ;
 * - demande au navigateur de ne pas effacer les données de l'app ;
 * - synchronise le carnet à l'ouverture, au retour sur l'app, au retour du réseau
 *   et après chaque moment enregistré.
 */
import { useEffect } from 'react';
import { syncNow } from '@/lib/sync';

export default function SyncManager() {
  useEffect(() => {
    // En développement, le service worker garderait en cache des fichiers qui changent sans cesse
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch((error) => {
        console.warn('Service worker non installé :', error);
      });
    }

    navigator.storage?.persist?.().catch(() => undefined);

    const sync = () => {
      void syncNow();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };

    sync();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', sync);
    window.addEventListener('prayer-moment-saved', sync);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', sync);
      window.removeEventListener('prayer-moment-saved', sync);
    };
  }, []);

  return null;
}
