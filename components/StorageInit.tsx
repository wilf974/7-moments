'use client';

/**
 * Composant pour initialiser le système de stockage IndexedDB
 * Exécuté une seule fois au chargement initial
 */

import { useEffect } from 'react';
import { initializeStorage } from '@/lib/storageAdapter';

export default function StorageInit() {
  useEffect(() => {
    // Initialiser le stockage une seule fois au démarrage
    const initStorage = async () => {
      try {
        console.log('🔄 Initialisation du système de stockage...');
        await initializeStorage();
        console.log('✅ Système de stockage prêt (IndexedDB + localStorage)');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du stockage:', error);
      }
    };

    initStorage();
  }, []);

  // Ce composant n'affiche rien
  return null;
}
