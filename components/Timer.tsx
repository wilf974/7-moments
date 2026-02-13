'use client';

/**
 * Composant Timer pour le moment de prière
 * Compte à rebours d'1 minute avec animations
 * Thème "Chapelle Dorée" - Prière dans une chapelle sombre éclairée par une bougie
 */

import { useState, useEffect, useCallback } from 'react';
import { TimerState } from '@/types';
import { formatDuration } from '@/lib/utils';

interface TimerProps {
  duration?: number; // Durée en secondes, par défaut 60
  onComplete?: () => void;
  onStart?: () => void;
  onNext?: () => void; // Nouveau callback pour passer au moment suivant
  autoStart?: boolean;
  className?: string;
}

/**
 * Composant Timer
 */
export default function Timer({
  duration = 60,
  onComplete,
  onStart,
  onNext,
  autoStart = false,
  className = '',
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [state, setState] = useState<TimerState>('idle');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  /**
   * Démarre le timer
   */
  const startTimer = useCallback(() => {
    if (state === 'running') return;

    setState('running');
    onStart?.();

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setState('completed');
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  }, [state, onStart, onComplete]);

  /**
   * Passe au moment suivant
   * Arrête l'intervalle complètement et réinitialise l'état
   */
  const handleNext = useCallback(() => {
    // Arrêter l'intervalle immédiatement
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // Réinitialiser complètement l'état du timer
    setState('idle');
    setTimeLeft(duration);

    // Appeler le callback du parent
    onNext?.();
  }, [intervalId, duration, onNext]);

  // Suppression des fonctions pauseTimer, resumeTimer et resetTimer non utilisées
  // Le bouton "Suivant" remplace tous ces contrôles

  /**
   * Auto-start si demandé
   */
  useEffect(() => {
    if (autoStart && state === 'idle') {
      startTimer();
    }
  }, [autoStart, state, startTimer]);

  /**
   * Nettoyage à la destruction du composant
   */
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  /**
   * Calcule le pourcentage de progression
   */
  const progress = ((duration - timeLeft) / duration) * 100;

  /**
   * Obtient la couleur selon l'état (thème dorée/chapelle)
   */
  const getStateColor = () => {
    switch (state) {
      case 'running':
        return 'text-[#F59E0B]'; // Gold
      case 'paused':
        return 'text-[#D97706]'; // Amber
      case 'completed':
        return 'text-[#FBBF24]'; // Bright gold
      default:
        return 'text-amber-800';
    }
  };

  /**
   * Obtient l'icône selon l'état (thème bougie/chapelle)
   */
  const getStateIcon = () => {
    switch (state) {
      case 'running':
        return '🕯️'; // Bougie allumée
      case 'paused':
        return '⏸️';
      case 'completed':
        return '✨'; // Lumière spirituelle
      default:
        return '🕯️'; // Bougie prête
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Affichage du temps */}
      <div className="relative animate-fade-in-up">
        {/* Cercle de progression - taille agrandie */}
        <div className="w-40 h-40 relative">
          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 40 40">
            {/* Cercle de fond - warm brown subtil */}
            <path
              d="M20 2.5
                a 17.5 17.5 0 0 1 0 35
                a 17.5 17.5 0 0 1 0 -35"
              fill="none"
              stroke="#78350F"
              strokeWidth="2.5"
              opacity="0.3"
            />
            {/* Cercle de progression - gold */}
            <path
              d="M20 2.5
                a 17.5 17.5 0 0 1 0 35
                a 17.5 17.5 0 0 1 0 -35"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray={`${progress}, 100`}
              className="transition-all duration-1000"
            />
          </svg>

          {/* Temps au centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-[family-name:var(--font-playfair)] font-bold ${getStateColor()} animate-count-up`}>
                {formatDuration(timeLeft)}
              </div>
              <div className="text-xs text-[#D97706] mt-1 animate-fade-in font-[family-name:var(--font-inter)]">
                {getStateIcon()} {state === 'running' ? 'En cours' :
                 state === 'paused' ? 'En pause' :
                 state === 'completed' ? 'Terminé' : 'Prêt'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex space-x-2 animate-fade-in">
        {state === 'idle' && (
          <button
            onClick={startTimer}
            className="px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-300 font-medium hover:scale-105 shadow-lg shadow-amber-900/30 font-[family-name:var(--font-inter)]"
          >
            Démarrer
          </button>
        )}

        {state === 'running' && (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-medium hover:scale-105 animate-bounce-in shadow-lg shadow-amber-900/30 font-[family-name:var(--font-inter)]"
          >
            Suivant
          </button>
        )}

        {state === 'paused' && (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-medium hover:scale-105 shadow-lg shadow-amber-900/30 font-[family-name:var(--font-inter)]"
          >
            Suivant
          </button>
        )}

        {state === 'completed' && (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-medium hover:scale-105 animate-bounce-in shadow-lg shadow-amber-900/30 font-[family-name:var(--font-inter)]"
          >
            Suivant
          </button>
        )}
      </div>

      {/* Message de motivation */}
      {state === 'running' && (
        <div className="text-center text-sm text-amber-300 max-w-xs">
          <p className="italic font-[family-name:var(--font-playfair)]">Laissez la lumière de la prière vous envelopper...</p>
        </div>
      )}

      {state === 'completed' && (
        <div className="text-center text-sm text-[#FBBF24] max-w-xs">
          <p className="font-[family-name:var(--font-playfair)]">✨ Votre bougie a fini de brûler</p>
        </div>
      )}
    </div>
  );
}
