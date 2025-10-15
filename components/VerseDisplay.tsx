'use client';

/**
 * Composant VerseDisplay pour afficher un verset biblique avec animations
 * S'affiche pendant 30 secondes avec des animations fluides
 */

import { useState, useEffect } from 'react';
import { BibleVerse } from '@/lib/verses';

interface VerseDisplayProps {
  verse: BibleVerse;
  onClose: () => void;
  duration?: number; // Durée d'affichage en millisecondes
}

/**
 * Composant VerseDisplay
 */
export default function VerseDisplay({ 
  verse, 
  onClose, 
  duration = 30000 
}: VerseDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  /**
   * Effet pour gérer l'affichage et la fermeture automatique
   */
  useEffect(() => {
    // Délai pour l'animation d'entrée
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Timer pour la barre de progression
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    // Timer pour la fermeture automatique
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Délai pour l'animation de sortie
    }, duration);

    // Cleanup
    return () => {
      clearTimeout(showTimer);
      clearInterval(progressInterval);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  /**
   * Gestionnaire de fermeture manuelle
   */
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay avec animation */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Contenu du verset */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 transform transition-all duration-500 ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl"
        >
          ×
        </button>

        {/* Icône biblique */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2 animate-bounce-in">📖</div>
        </div>

        {/* Verset */}
        <div className="text-center mb-6">
          <blockquote className="text-lg md:text-xl text-gray-800 leading-relaxed italic mb-4 animate-fade-in-up">
            &ldquo;{verse.text}&rdquo;
          </blockquote>
          
          <cite className="text-sm text-purple-600 font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
            — {verse.reference}
            {verse.translation && (
              <span className="text-gray-500 ml-2">({verse.translation})</span>
            )}
          </cite>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Message d'encouragement */}
        <div className="text-center text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          Cliquez n&apos;importe où pour fermer
        </div>
      </div>
    </div>
  );
}
