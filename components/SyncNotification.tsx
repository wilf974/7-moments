'use client';

import { useState, useEffect } from 'react';
import { syncStorageData } from '@/lib/storage';

/**
 * Composant de notification de synchronisation
 * Affiche un message discret quand la synchronisation se produit
 */
export default function SyncNotification() {
  const [showSync, setShowSync] = useState(false);

  useEffect(() => {
    // Synchronisation périodique avec notification
    const syncInterval = setInterval(() => {
      syncStorageData();
      setShowSync(true);
      
      // Masquer la notification après 2 secondes
      setTimeout(() => {
        setShowSync(false);
      }, 2000);
    }, 60000); // Toutes les minutes

    // Synchronisation lors du focus
    const handleFocus = () => {
      syncStorageData();
      setShowSync(true);
      
      setTimeout(() => {
        setShowSync(false);
      }, 2000);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (!showSync) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in-right">
        <span className="text-sm">🔄</span>
        <span className="text-sm font-medium">Données synchronisées</span>
      </div>
    </div>
  );
}
