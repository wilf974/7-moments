'use client';

/**
 * Chef d'orchestre invisible, monté une fois dans le layout :
 * - installe le service worker, pour que l'app s'ouvre même sans connexion ;
 * - demande au navigateur de ne pas effacer les données de l'app ;
 * - synchronise le carnet à l'ouverture, au retour sur l'app, au retour du réseau
 *   et après chaque moment enregistré ;
 * - garde ouverte, quand l'app est affichée, la connexion de synchronisation instantanée.
 */
import { useEffect } from 'react';
import { syncNow, SYNC_STATUS_EVENT } from '@/lib/sync';
import { ensureLive, stopLive } from '@/lib/liveSync';

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
    // Visible : on synchronise et on rouvre le direct. Masquée : ensureLive ferme la connexion.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') sync();
      ensureLive();
    };
    const onOnline = () => {
      sync();
      ensureLive();
    };

    sync();
    ensureLive();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    window.addEventListener('prayer-moment-saved', sync);
    // Appareil relié ou délié : ouvrir ou fermer le direct en conséquence
    window.addEventListener(SYNC_STATUS_EVENT, ensureLive);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('prayer-moment-saved', sync);
      window.removeEventListener(SYNC_STATUS_EVENT, ensureLive);
      stopLive();
    };
  }, []);

  return null;
}
