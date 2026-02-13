'use client';

/**
 * Composant de synchronisation automatique des données
 * Écoute les changements de stockage depuis d'autres onglets
 */

import { useEffect } from 'react';

export default function StorageSync() {
  useEffect(() => {
    // Écouter les changements de localStorage depuis d'autres onglets
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'prayer_data') {
        // Déclencher un re-render des composants qui lisent le storage
        window.dispatchEvent(new CustomEvent('prayer-data-updated'));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return null;
}
