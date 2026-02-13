'use client';

/**
 * Composant pour initialiser le système de stockage IndexedDB
 * Exécuté une seule fois au chargement initial
 */

import { useEffect } from 'react';
import { initializeStorage } from '@/lib/storageAdapter';

export default function StorageInit() {
  useEffect(() => {
    const initStorage = async () => {
      try {
        await initializeStorage();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du stockage:', error);
      }
    };

    initStorage();
  }, []);

  // Ce composant n'affiche rien
  return null;
}
