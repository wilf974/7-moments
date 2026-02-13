'use client';

/**
 * Composant VerseDisplay pour afficher un verset biblique avec animations
 * S'affiche pendant 30 secondes avec des animations fluides
 * Thème: Chapelle Dorée (amber/gold)
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

    // Timer pour la barre de progression (2 updates/sec)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 500));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 500);

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
      {/* Overlay avec animation - thème amber/gold */}
      <div
        className={`absolute inset-0 bg-amber-950/70 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Contenu du verset - thème Chapelle Dorée */}
      <div
        className={`relative bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl shadow-2xl shadow-amber-900/20 p-8 max-w-2xl w-full mx-4 transform transition-all duration-500 ${
          isVisible
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Bouton de fermeture - couleurs amber */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#D97706] hover:text-[#78350F] transition-colors text-2xl"
        >
          ×
        </button>

        {/* Icône biblique */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2 animate-bounce-in">📖</div>
        </div>

        {/* Verset - police Playfair et couleurs chaudes */}
        <div className="text-center mb-6">
          <blockquote className="text-lg md:text-xl text-[#78350F] font-[family-name:var(--font-playfair)] leading-relaxed italic mb-4 animate-fade-in-up">
            &ldquo;{verse.text}&rdquo;
          </blockquote>

          <cite className="text-sm text-[#D97706] font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
            — {verse.reference}
            {verse.translation && (
              <span className="text-[#92400E] ml-2">({verse.translation})</span>
            )}
          </cite>
        </div>

        {/* Barre de progression - gradient amber/gold */}
        <div className="w-full bg-amber-100 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-amber-500 to-[#F59E0B] h-2 rounded-full transition-all duration-500 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Message d'encouragement - texte secondaire */}
        <div className="text-center text-sm text-[#92400E] animate-fade-in" style={{ animationDelay: '0.6s' }}>
          Cliquez n&apos;importe où pour fermer
        </div>
      </div>
    </div>
  );
}
