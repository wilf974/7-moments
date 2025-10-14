'use client';

import { useState, useEffect } from 'react';
import { getAllStoredData } from '@/lib/storage';

/**
 * Composant de debug pour afficher les données stockées
 * Utile pour le développement et le dépannage
 */
export default function StorageDebug() {
  const [storedData, setStoredData] = useState<Record<string, unknown> | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Récupérer les données stockées
    const data = getAllStoredData();
    setStoredData(data);
  }, []);

  // Afficher seulement en mode développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-mono"
      >
        Debug Storage
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
          <h3 className="text-sm font-bold mb-2">Données Stockées:</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(storedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
